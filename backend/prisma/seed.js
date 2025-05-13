const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'System Administrator',
        role: 'ADMINISTRATOR',
        password: hashedPassword
      }
    });

    console.log('Created admin user:', admin);

    // Create test products
    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: 'Premium Chocolate Bar',
          description: 'High-quality dark chocolate bar',
          sku: 'CHOC-001',
          price: 5.99,
          minStock: 100,
          stock: 150
        }
      }),
      prisma.product.create({
        data: {
          name: 'Milk Chocolate Bar',
          description: 'Creamy milk chocolate bar',
          sku: 'CHOC-002',
          price: 4.99,
          minStock: 100,
          stock: 200
        }
      })
    ]);

    console.log('Created products:', products);

    // Create test ingredients
    const ingredients = await Promise.all([
      prisma.ingredient.create({
        data: {
          name: 'Cocoa Beans',
          description: 'Premium cocoa beans',
          sku: 'ING-001',
          unit: 'kg',
          stock: 500,
          minStock: 100,
          cost: 15.99
        }
      }),
      prisma.ingredient.create({
        data: {
          name: 'Sugar',
          description: 'Refined white sugar',
          sku: 'ING-002',
          unit: 'kg',
          stock: 1000,
          minStock: 200,
          cost: 2.99
        }
      }),
      prisma.ingredient.create({
        data: {
          name: 'Milk Powder',
          description: 'Full cream milk powder',
          sku: 'ING-003',
          unit: 'kg',
          stock: 300,
          minStock: 50,
          cost: 8.99
        }
      })
    ]);

    console.log('Created ingredients:', ingredients);

    // Create test recipes
    const recipes = await Promise.all([
      prisma.recipe.create({
        data: {
          name: 'Dark Chocolate Recipe',
          description: '70% Dark Chocolate',
          productId: products[0].id,
          yield: 100,
          version: '1.0',
          isActive: true,
          items: {
            create: [
              {
                ingredientId: ingredients[0].id,
                quantity: 0.7,
                unit: 'kg',
                notes: 'Premium cocoa beans only'
              },
              {
                ingredientId: ingredients[1].id,
                quantity: 0.3,
                unit: 'kg',
                notes: 'Fine sugar recommended'
              }
            ]
          }
        }
      }),
      prisma.recipe.create({
        data: {
          name: 'Milk Chocolate Recipe',
          description: 'Creamy Milk Chocolate',
          productId: products[1].id,
          yield: 100,
          version: '1.0',
          isActive: true,
          items: {
            create: [
              {
                ingredientId: ingredients[0].id,
                quantity: 0.5,
                unit: 'kg'
              },
              {
                ingredientId: ingredients[1].id,
                quantity: 0.3,
                unit: 'kg'
              },
              {
                ingredientId: ingredients[2].id,
                quantity: 0.2,
                unit: 'kg'
              }
            ]
          }
        }
      })
    ]);

    console.log('Created recipes:', recipes);

    // Create test batch
    const batch = await prisma.batch.create({
      data: {
        batchNumber: 'BATCH-20240315-0001',
        recipeId: recipes[0].id,
        plannedQty: 100,
        status: 'pending',
        qcStatus: 'pending',
        notes: 'Test batch for dark chocolate'
      }
    });

    console.log('Created batch:', batch);

    // Create test work order
    const workOrder = await prisma.workOrder.create({
      data: {
        orderNumber: 'WO-20240315-0001',
        batchId: batch.id,
        status: 'planned',
        priority: 1,
        startDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        notes: 'Test work order for dark chocolate batch'
      }
    });

    console.log('Created work order:', workOrder);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 