const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all work orders
router.get('/', async (req, res) => {
  try {
    const workOrders = await prisma.workOrder.findMany({
      include: {
        batch: {
          include: {
            recipe: true
          }
        }
      }
    });
    res.json(workOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch work orders' });
  }
});

// Get work order by ID
router.get('/:id', async (req, res) => {
  try {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        batch: {
          include: {
            recipe: true
          }
        }
      }
    });
    if (!workOrder) {
      return res.status(404).json({ error: 'Work order not found' });
    }
    res.json(workOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch work order' });
  }
});

// Create new work order
router.post('/', async (req, res) => {
  try {
    const { batchId, scheduledDate, assignedTo, status } = req.body;
    const workOrder = await prisma.workOrder.create({
      data: {
        batchId,
        scheduledDate,
        assignedTo,
        status: status || 'PLANNED'
      },
      include: {
        batch: true
      }
    });
    res.status(201).json(workOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create work order' });
  }
});

// Update work order
router.put('/:id', async (req, res) => {
  try {
    const { scheduledDate, actualDate, assignedTo, status } = req.body;
    const workOrder = await prisma.workOrder.update({
      where: { id: parseInt(req.params.id) },
      data: {
        scheduledDate,
        actualDate,
        assignedTo,
        status
      },
      include: {
        batch: true
      }
    });
    res.json(workOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update work order' });
  }
});

// Delete work order
router.delete('/:id', async (req, res) => {
  try {
    await prisma.workOrder.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete work order' });
  }
});

module.exports = router; 