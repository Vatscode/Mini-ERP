# Mini ERP Backend

The backend implementation of our Mini ERP system, designed to mimic NetSuite's architecture and SuiteScript capabilities. This API layer serves as the foundation for manufacturing operations with a focus on demonstrating NetSuite-like patterns.

## NetSuite Architecture Mapping

| NetSuite Concept | Our Implementation |
|------------------|-------------------|
| SuiteScript | Express middleware that provides similar context and APIs |
| Record Types | Prisma models with validation rules |
| User Event Scripts | Controller hooks (beforeSubmit/afterSubmit) |
| RESTlets | Express route handlers |
| Scheduled Scripts | Node-cron background jobs |
| Saved Searches | Query builder functions |
| Script Governance | Usage monitoring middleware |
| Role-based Permission | JWT auth with role verification |

## Directory Structure

```
backend/
├── controllers/         # Business logic (like SuiteScript files)
├── middleware/          # Authentication, logging, governance
├── routes/              # API endpoints definition
├── models/              # Data models with Prisma
├── services/            # Shared business logic
├── utils/               # Helper functions
├── jobs/                # Scheduled scripts
├── prisma/              # Database schema and migrations
├── app.js               # Main application file
└── db.js                # Database connection
```

## Key Components

### SuiteScript-like Context

```javascript
// This middleware creates a context similar to NetSuite's N/runtime module
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
```

### Custom Forms

Similar to NetSuite's custom forms, we define form configurations that specify fields, validations, and default values:

```javascript
// Example form definition (similar to NetSuite custom forms)
const batchForm = {
  id: 'custform_batch_manufacturing',
  name: 'Manufacturing Batch Form',
  fields: [
    {
      id: 'custfield_batch_number',
      label: 'Batch Number',
      type: 'text',
      mandatory: true,
      validation: /^B\d{4}-\d{3}$/
    },
    {
      id: 'custfield_quantity',
      label: 'Planned Quantity',
      type: 'integer',
      mandatory: true,
      min: 1
    }
  ]
};
```

### Middleware Implementation

#### Authentication (auth.js)

Similar to NetSuite's user session management:

```javascript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
```

#### Script Logging (logging.js)

Similar to NetSuite's script logging system:

```javascript
const scriptLogger = (req, res, next) => {
  const startTime = Date.now();
  const requestId = uuidv4();
  
  // Log request
  console.log(`[${requestId}] ${req.method} ${req.path} - Start`);
  
  // Capture response
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - startTime;
    console.log(`[${requestId}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    return originalSend.call(this, body);
  };
  
  next();
};
```

### User Event Scripts Pattern

Similar to NetSuite's beforeSubmit and afterSubmit:

```javascript
// Example batch creation with beforeSubmit and afterSubmit hooks
const createBatch = async (req, res) => {
  try {
    let batchData = req.body;
    
    // BeforeSubmit hook (similar to NetSuite user event)
    batchData = await beforeSubmitBatch(batchData, req.context);
    
    // Create record
    const batch = await prisma.batch.create({
      data: batchData
    });
    
    // AfterSubmit hook (similar to NetSuite user event)
    await afterSubmitBatch(batch, req.context);
    
    res.status(201).json(batch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Saved Searches

Similar to NetSuite's saved search functionality:

```javascript
// Example saved search for low inventory items
const lowInventorySearch = {
  id: 'customsearch_low_inventory',
  title: 'Low Inventory Items',
  execute: async () => {
    return prisma.inventoryItem.findMany({
      where: {
        quantityOnHand: {
          lt: prisma.raw('reorderPoint')
        }
      },
      include: {
        product: true,
        location: true
      }
    });
  }
};
```

### Scheduled Scripts

Similar to NetSuite's scheduled scripts:

```javascript
// Scheduled script for inventory auditing
const auditInventory = cron.schedule('0 0 * * *', async () => {
  console.log('Running inventory audit script');
  
  try {
    // Get all inventory items
    const items = await prisma.inventoryItem.findMany({
      include: {
        product: true
      }
    });
    
    // Check for low stock items
    const lowStockItems = items.filter(item => 
      item.quantityOnHand <= item.reorderPoint
    );
    
    // Generate report
    if (lowStockItems.length > 0) {
      await generateLowStockReport(lowStockItems);
    }
    
    console.log('Inventory audit completed successfully');
  } catch (error) {
    console.error('Inventory audit failed:', error);
  }
});
```

## API Routes

The API follows RESTful conventions while mimicking NetSuite's access patterns:

- **Products**: `/api/products` - CRUD operations for products
- **Recipes**: `/api/recipes` - Recipe management with versioning
- **Batches**: `/api/batches` - Batch creation and status management
- **Inventory**: `/api/inventory` - Inventory level tracking

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

## Dependencies

- **express**: Web framework
- **prisma**: ORM for database operations
- **jsonwebtoken**: Authentication
- **bcryptjs**: Password hashing
- **node-cron**: Scheduled jobs
- **dotenv**: Environment configuration 