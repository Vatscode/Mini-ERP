const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Search = require('../utils/searchUtils');
const { isScriptActive, validateScriptContext } = require('../config/scriptDeployment');
const netsuiteService = require('../services/netsuiteService');

const allowedTransitions = {
  pending: ['processing', 'cancelled'],
  processing: ['completed', 'qc_failed'],
  qc_failed: ['reprocessing', 'cancelled'],
  reprocessing: ['completed', 'qc_failed'],
  completed: [],
  cancelled: []
};

// NetSuite-like error handling
class NetSuiteError extends Error {
  constructor(message, type = 'USER_ERROR') {
    super(message);
    this.type = type;
    this.name = 'NetSuiteError';
  }
}

// Mimicking NetSuite's beforeSubmit user event
const beforeSubmit = async (context, newRecord) => {
  // Validate batch number format
  if (!newRecord.batchNumber.match(/^BATCH-\d{8}-\d{4}$/)) {
    throw new NetSuiteError('Invalid batch number format. Must be BATCH-YYYYMMDD-XXXX');
  }

  // Check if recipe exists and is active
  const recipe = await prisma.recipe.findUnique({
    where: { id: newRecord.recipeId },
    include: { items: true }
  });

  if (!recipe) {
    throw new NetSuiteError('Recipe not found');
  }

  if (!recipe.isActive) {
    throw new NetSuiteError('Cannot create batch with inactive recipe');
  }

  // Validate ingredient availability
  for (const item of recipe.items) {
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: item.ingredientId }
    });

    const requiredQty = (item.quantity * newRecord.plannedQty) / recipe.yield;
    if (ingredient.stock < requiredQty) {
      throw new NetSuiteError(
        `Insufficient stock for ingredient ${ingredient.name}. ` +
        `Required: ${requiredQty}${item.unit}, Available: ${ingredient.stock}${ingredient.unit}`
      );
    }
  }

  return newRecord;
};

// Mimicking NetSuite's afterSubmit user event
const afterSubmit = async (context, record) => {
  // Create inventory transactions for ingredients
  const recipe = await prisma.recipe.findUnique({
    where: { id: record.recipeId },
    include: { items: true }
  });

  const transactions = recipe.items.map(item => ({
    type: 'production_input',
    ingredientId: item.ingredientId,
    batchId: record.id,
    quantity: -(item.quantity * record.plannedQty) / recipe.yield,
    unit: item.unit,
    reference: record.batchNumber
  }));

  await prisma.inventoryTransaction.createMany({
    data: transactions
  });

  // Update ingredient stock levels
  for (const item of recipe.items) {
    const requiredQty = (item.quantity * record.plannedQty) / recipe.yield;
    await prisma.ingredient.update({
      where: { id: item.ingredientId },
      data: {
        stock: {
          decrement: requiredQty
        }
      }
    });
  }
};

// User Event Script equivalent - beforeSubmit and afterSubmit logic
const batchController = {
  // Search batches using NetSuite-like search
  searchBatches: async (req, res) => {
    try {
      const { status, startDate, endDate, sortBy } = req.query;
      
      const search = new Search('batch');
      
      if (status) {
        search.createFilter('status', 'equals', status);
      }
      
      if (startDate) {
        search.createFilter('startDate', 'greaterThan', new Date(startDate));
      }
      
      if (endDate) {
        search.createFilter('endDate', 'lessThan', new Date(endDate));
      }

      if (sortBy) {
        search.createColumn(sortBy, 'DESC');
      }

      const results = await search.run();
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all batches
  getAllBatches: async (req, res) => {
    try {
      const batches = await prisma.batch.findMany({
        include: {
          recipe: {
            include: {
              product: true,
              items: {
                include: {
                  ingredient: true
                }
              }
            }
          }
        }
      });
      res.json(batches);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get single batch
  getBatch: async (req, res) => {
    try {
      const { id } = req.params;
      const batch = await prisma.batch.findUnique({
        where: { id: parseInt(id) },
        include: {
          recipe: {
            include: {
              product: true,
              items: {
                include: {
                  ingredient: true
                }
              }
            }
          }
        }
      });
      
      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }
      
      res.json(batch);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create batch with "beforeSubmit" and "afterSubmit" logic
  createBatch: async (req, res) => {
    try {
      // Check if the batch processing script is active
      if (!isScriptActive('customscript_batch_processing')) {
        return res.status(503).json({ error: 'Batch processing is currently disabled' });
      }

      // Validate script context
      if (!validateScriptContext('customscript_batch_processing', 'beforeSubmit')) {
        return res.status(403).json({ error: 'Invalid script context' });
      }

      const { recipeId, quantity, notes } = req.body;

      // "BeforeSubmit" validation
      const recipe = await prisma.recipe.findUnique({
        where: { id: parseInt(recipeId) },
        include: { 
          items: { 
            include: { ingredient: true } 
          } 
        }
      });

      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      // Check ingredient inventory levels in NetSuite
      const skus = recipe.items.map(item => item.ingredient.sku);
      const nsInventory = await netsuiteService.getItemAvailability(skus);

      // Check ingredient inventory levels
      const insufficientIngredients = recipe.items.filter(item => {
        const requiredQuantity = item.quantity * quantity;
        const nsAvailable = nsInventory[item.ingredient.sku] || 0;
        return nsAvailable < requiredQuantity;
      });

      if (insufficientIngredients.length > 0) {
        return res.status(400).json({
          error: 'Insufficient ingredients in NetSuite',
          details: insufficientIngredients.map(item => ({
            ingredient: item.ingredient.name,
            required: item.quantity * quantity,
            available: nsInventory[item.ingredient.sku] || 0
          }))
        });
      }

      // Create the batch
      const batch = await prisma.batch.create({
        data: {
          recipeId: parseInt(recipeId),
          quantity,
          notes,
          status: 'pending',
          qcStatus: 'pending'
        }
      });

      // Create Work Order in NetSuite
      const workOrder = await netsuiteService.createWorkOrder({
        quantity,
        recipe: {
          product: { sku: recipe.product.sku },
          items: recipe.items
        }
      });

      // Validate afterSubmit context
      if (!validateScriptContext('customscript_batch_processing', 'afterSubmit')) {
        return res.status(201).json({ ...batch, workOrder });
      }

      // "AfterSubmit" logic - Update ingredient inventory in both systems
      await Promise.all(recipe.items.map(item => 
        prisma.ingredient.update({
          where: { id: item.ingredient.id },
          data: {
            stock: item.ingredient.stock - (item.quantity * quantity)
          }
        })
      ));

      // Sync inventory with NetSuite
      await netsuiteService.syncInventory(recipe.items.map(item => ({
        sku: item.ingredient.sku,
        quantity: item.ingredient.stock - (item.quantity * quantity)
      })));

      // Return created batch with related data
      const createdBatch = await prisma.batch.findUnique({
        where: { id: batch.id },
        include: {
          recipe: {
            include: {
              product: true,
              items: {
                include: {
                  ingredient: true
                }
              }
            }
          }
        }
      });

      res.status(201).json({ ...createdBatch, workOrder });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update batch status with workflow validation
  updateBatchStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, qcStatus, notes } = req.body;

      const batch = await prisma.batch.findUnique({
        where: { id: parseInt(id) },
        include: {
          recipe: true
        }
      });

      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }

      // Validate status transition
      if (status && !allowedTransitions[batch.status].includes(status)) {
        return res.status(400).json({
          error: 'Invalid status transition',
          current: batch.status,
          attempted: status,
          allowed: allowedTransitions[batch.status]
        });
      }

      // Update batch
      const updatedBatch = await prisma.batch.update({
        where: { id: parseInt(id) },
        data: {
          ...(status && { status }),
          ...(qcStatus && { qcStatus }),
          ...(notes && { notes }),
          ...(status === 'completed' && { endDate: new Date() })
        },
        include: {
          recipe: {
            include: {
              product: true,
              items: {
                include: {
                  ingredient: true
                }
              }
            }
          }
        }
      });

      // Update Work Order status in NetSuite
      if (status) {
        await netsuiteService.updateWorkOrderStatus(batch.netsuiteWorkOrderId, status);
      }

      res.json(updatedBatch);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete batch with inventory adjustment
  deleteBatch: async (req, res) => {
    try {
      const { id } = req.params;
      
      const batch = await prisma.batch.findUnique({
        where: { id: parseInt(id) },
        include: {
          recipe: {
            include: {
              items: {
                include: {
                  ingredient: true
                }
              }
            }
          }
        }
      });

      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }

      // Only restore ingredients if batch was pending or processing
      if (['pending', 'processing'].includes(batch.status)) {
        // Restore ingredient quantities in both systems
        const updatedIngredients = await Promise.all(batch.recipe.items.map(item =>
          prisma.ingredient.update({
            where: { id: item.ingredient.id },
            data: {
              stock: item.ingredient.stock + (item.quantity * batch.quantity)
            }
          })
        ));

        // Sync restored quantities with NetSuite
        await netsuiteService.syncInventory(updatedIngredients.map(ingredient => ({
          sku: ingredient.sku,
          quantity: ingredient.stock
        })));
      }

      await prisma.batch.delete({
        where: { id: parseInt(id) }
      });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new batch
  create: async (req, res) => {
    try {
      const newBatch = await beforeSubmit(req.context, req.body);
      
      const batch = await prisma.batch.create({
        data: newBatch
      });

      await afterSubmit(req.context, batch);

      res.status(201).json(batch);
    } catch (error) {
      if (error instanceof NetSuiteError) {
        res.status(400).json({ error: error.message, type: error.type });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  },

  // Update batch status
  updateStatus: async (req, res) => {
    const { id } = req.params;
    const { status, qcStatus, actualQty } = req.body;

    try {
      const batch = await prisma.batch.findUnique({
        where: { id: parseInt(id) },
        include: { recipe: true }
      });

      if (!batch) {
        throw new NetSuiteError('Batch not found');
      }

      // Validate status transition
      const validTransitions = {
        pending: ['processing'],
        processing: ['completed', 'qc_failed'],
        qc_failed: ['processing', 'cancelled'],
        completed: ['qc_failed'],
        cancelled: []
      };

      if (!validTransitions[batch.status].includes(status)) {
        throw new NetSuiteError(
          `Invalid status transition from ${batch.status} to ${status}`
        );
      }

      // Update batch
      const updatedBatch = await prisma.batch.update({
        where: { id: parseInt(id) },
        data: {
          status,
          qcStatus: qcStatus || batch.qcStatus,
          actualQty: actualQty || batch.actualQty,
          endDate: status === 'completed' ? new Date() : batch.endDate
        }
      });

      // If completed, create output transaction
      if (status === 'completed' && actualQty) {
        await prisma.inventoryTransaction.create({
          data: {
            type: 'production_output',
            batchId: batch.id,
            quantity: actualQty,
            unit: 'units',
            reference: batch.batchNumber
          }
        });

        // Update product stock
        await prisma.product.update({
          where: { id: batch.recipe.productId },
          data: {
            stock: {
              increment: actualQty
            }
          }
        });
      }

      res.json(updatedBatch);
    } catch (error) {
      if (error instanceof NetSuiteError) {
        res.status(400).json({ error: error.message, type: error.type });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  },

  // Get batch details with related data
  get: async (req, res) => {
    try {
      const batch = await prisma.batch.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          recipe: {
            include: {
              items: {
                include: {
                  ingredient: true
                }
              },
              product: true
            }
          },
          transactions: true,
          workOrder: true
        }
      });

      if (!batch) {
        throw new NetSuiteError('Batch not found');
      }

      res.json(batch);
    } catch (error) {
      if (error instanceof NetSuiteError) {
        res.status(400).json({ error: error.message, type: error.type });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  },

  // List batches with filtering and sorting
  list: async (req, res) => {
    try {
      const {
        status,
        recipeId,
        startDate,
        endDate,
        page = 1,
        limit = 10
      } = req.query;

      const where = {};
      
      if (status) where.status = status;
      if (recipeId) where.recipeId = parseInt(recipeId);
      if (startDate || endDate) {
        where.startDate = {};
        if (startDate) where.startDate.gte = new Date(startDate);
        if (endDate) where.startDate.lte = new Date(endDate);
      }

      const batches = await prisma.batch.findMany({
        where,
        include: {
          recipe: {
            include: {
              product: true
            }
          },
          workOrder: true
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          startDate: 'desc'
        }
      });

      const total = await prisma.batch.count({ where });

      res.json({
        data: batches,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = batchController; 