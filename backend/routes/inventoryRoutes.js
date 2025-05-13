const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get inventory levels
router.get('/', async (req, res) => {
  try {
    const inventory = await prisma.inventoryItem.findMany({
      include: {
        product: true
      }
    });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Get inventory item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        product: true
      }
    });
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory item' });
  }
});

// Add inventory transaction
router.post('/transaction', async (req, res) => {
  try {
    const { productId, quantity, type, notes, locationId } = req.body;
    
    // Create the transaction
    const transaction = await prisma.inventoryTransaction.create({
      data: {
        productId,
        quantity,
        type,
        notes,
        locationId
      }
    });
    
    // Update inventory levels
    let inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        productId,
        locationId
      }
    });
    
    if (inventoryItem) {
      // Update existing inventory item
      const newQuantity = type === 'RECEIPT' ? 
        inventoryItem.quantityOnHand + quantity : 
        inventoryItem.quantityOnHand - quantity;
        
      await prisma.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: { quantityOnHand: newQuantity }
      });
    } else {
      // Create new inventory item
      inventoryItem = await prisma.inventoryItem.create({
        data: {
          productId,
          locationId,
          quantityOnHand: type === 'RECEIPT' ? quantity : -quantity
        }
      });
    }
    
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process inventory transaction' });
  }
});

// Get inventory transaction history
router.get('/transactions/:productId', async (req, res) => {
  try {
    const transactions = await prisma.inventoryTransaction.findMany({
      where: {
        productId: parseInt(req.params.productId)
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

module.exports = router; 