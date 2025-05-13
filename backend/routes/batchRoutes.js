const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const batchController = require('../controllers/batchController');
const { validateForm } = require('../middleware/formValidation');
const { checkPermission } = require('../middleware/permissions');

// Custom form validation middleware
const batchFormValidation = validateForm('custform_batch_manufacturing');

// Permission middleware
const canCreateBatch = checkPermission(['ADMINISTRATOR', 'MANUFACTURING_USER']);
const canUpdateBatch = checkPermission(['ADMINISTRATOR', 'MANUFACTURING_USER']);
const canViewBatch = checkPermission(['ADMINISTRATOR', 'MANUFACTURING_USER', 'INVENTORY_MANAGER']);

// Get all batches
router.get('/', async (req, res) => {
  try {
    const batches = await prisma.batch.findMany({
      include: {
        recipe: true,
        workOrders: true
      }
    });
    res.json(batches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
});

// Get batch by ID
router.get('/:id', async (req, res) => {
  try {
    const batch = await prisma.batch.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        recipe: true,
        workOrders: true
      }
    });
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    res.json(batch);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch batch' });
  }
});

// Create new batch
router.post('/', async (req, res) => {
  try {
    const { recipeId, batchNumber, plannedQuantity, status } = req.body;
    const batch = await prisma.batch.create({
      data: {
        recipeId,
        batchNumber,
        plannedQuantity,
        status: status || 'PLANNED'
      },
      include: {
        recipe: true
      }
    });
    res.status(201).json(batch);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create batch' });
  }
});

// Update batch
router.put('/:id', async (req, res) => {
  try {
    const { plannedQuantity, actualQuantity, status } = req.body;
    const batch = await prisma.batch.update({
      where: { id: parseInt(req.params.id) },
      data: {
        plannedQuantity,
        actualQuantity,
        status
      },
      include: {
        recipe: true,
        workOrders: true
      }
    });
    res.json(batch);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update batch' });
  }
});

// Delete batch
router.delete('/:id', async (req, res) => {
  try {
    await prisma.batch.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete batch' });
  }
});

// List batches with filters
router.get('/',
  canViewBatch,
  batchController.list
);

module.exports = router; 