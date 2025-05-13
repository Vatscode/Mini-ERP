require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// Import route handlers
const productRoutes = require('./routes/productRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const batchRoutes = require('./routes/batchRoutes');
const workOrderRoutes = require('./routes/workOrderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

// Import custom middleware
const { authMiddleware } = require('./middleware/auth');
const { scriptLogger } = require('./middleware/logging');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(scriptLogger);
app.use(authMiddleware);

// NetSuite-like script execution context
app.use((req, res, next) => {
  req.context = {
    user: req.user,
    runtime: {
      getCurrentUser: () => req.user,
      getCurrentScript: () => ({
        id: 'customscript_erp_api',
        deploymentId: 'customdeploy_erp_api',
        type: 'RESTLET'
      })
    },
    search: require('./config/savedSearches'),
    form: require('./config/customForms')
  };
  next();
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/workorders', workOrderRoutes);
app.use('/api/inventory', inventoryRoutes);

// Error handling
app.use(errorHandler);

// Initialize scheduled scripts
require('./jobs/scheduledScripts');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mini ERP server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server and database connections...');
  await prisma.$disconnect();
  process.exit(0);
}); 