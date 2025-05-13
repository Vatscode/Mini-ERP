const cron = require('node-cron');
const prisma = require('../db');

// Scheduled Script equivalent - runs every Monday at midnight
cron.schedule('0 0 * * 1', async () => {
  try {
    console.log('🔍 Running weekly inventory audit...');

    // Find ingredients with stock below minimum level
    const lowStock = await prisma.ingredient.findMany({
      where: {
        stock: {
          lt: prisma.ingredient.minStock
        }
      }
    });

    if (lowStock.length > 0) {
      console.log('⚠️ Low stock alert:');
      lowStock.forEach(ingredient => {
        console.log(`${ingredient.name}: ${ingredient.stock} ${ingredient.unit} (Min: ${ingredient.minStock})`);
      });
      // Here you could add email notifications or integrate with other systems
    } else {
      console.log('✅ All ingredients above minimum stock levels');
    }

    // Additional audit tasks could be added here
    // - Check for stale batches
    // - Generate usage reports
    // - Archive old records
    
  } catch (error) {
    console.error('❌ Inventory audit failed:', error);
  }
});

console.log('📅 Weekly inventory audit scheduled for Mondays at midnight'); 