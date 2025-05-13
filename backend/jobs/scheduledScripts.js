const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mimicking NetSuite's script runtime context
const runtime = {
  getCurrentScript: () => ({
    id: 'customscript_inventory_audit',
    deploymentId: 'customdeploy_inventory_audit_daily',
    type: 'SCHEDULED'
  })
};

// Inventory Audit Scheduled Script
const runInventoryAudit = async () => {
  console.log('Starting Inventory Audit Script...');
  const script = runtime.getCurrentScript();
  
  try {
    // Get all ingredients below minimum stock level
    const lowStockItems = await prisma.ingredient.findMany({
      where: {
        stock: {
          lt: prisma.ingredient.minStock
        }
      }
    });

    // Create inventory audit records
    for (const item of lowStockItems) {
      await prisma.inventoryTransaction.create({
        data: {
          type: 'audit',
          ingredientId: item.id,
          quantity: item.stock,
          unit: item.unit,
          reference: `AUDIT_${script.id}_${new Date().toISOString()}`,
          notes: `Low stock alert: Current stock (${item.stock}) below minimum (${item.minStock})`
        }
      });
    }

    console.log(`Inventory Audit completed. Found ${lowStockItems.length} items below minimum stock.`);
  } catch (error) {
    console.error('Error in Inventory Audit Script:', error);
    throw error;
  }
};

// Batch Status Update Script
const updateStaleBatches = async () => {
  console.log('Starting Batch Status Update Script...');
  
  try {
    const staleBatches = await prisma.batch.findMany({
      where: {
        status: 'processing',
        startDate: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // More than 24 hours old
        }
      }
    });

    for (const batch of staleBatches) {
      await prisma.batch.update({
        where: { id: batch.id },
        data: {
          status: 'qc_failed',
          notes: `${batch.notes ? batch.notes + '\n' : ''}Automatically marked as QC failed due to processing timeout.`
        }
      });
    }

    console.log(`Batch Status Update completed. Updated ${staleBatches.length} stale batches.`);
  } catch (error) {
    console.error('Error in Batch Status Update Script:', error);
    throw error;
  }
};

// Work Order Scheduling Script
const scheduleWorkOrders = async () => {
  console.log('Starting Work Order Scheduling Script...');
  
  try {
    const pendingBatches = await prisma.batch.findMany({
      where: {
        status: 'pending',
        workOrder: null
      }
    });

    for (const batch of pendingBatches) {
      await prisma.workOrder.create({
        data: {
          orderNumber: `WO${Date.now()}${batch.id}`,
          batchId: batch.id,
          status: 'planned',
          startDate: new Date(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
          notes: 'Automatically created by scheduling script'
        }
      });
    }

    console.log(`Work Order Scheduling completed. Created ${pendingBatches.length} work orders.`);
  } catch (error) {
    console.error('Error in Work Order Scheduling Script:', error);
    throw error;
  }
};

// Schedule scripts to run at specific times
// Inventory Audit - Run daily at 1 AM
cron.schedule('0 1 * * *', runInventoryAudit);

// Batch Status Update - Run every 6 hours
cron.schedule('0 */6 * * *', updateStaleBatches);

// Work Order Scheduling - Run every 2 hours during business hours
cron.schedule('0 9-17/2 * * 1-5', scheduleWorkOrders);

module.exports = {
  runInventoryAudit,
  updateStaleBatches,
  scheduleWorkOrders
}; 