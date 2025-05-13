# Mini ERP System for NetSuite Integration

A demonstration project showcasing my understanding of NetSuite's architecture and SuiteScript capabilities, implemented as a standalone manufacturing ERP system. This project serves as a portfolio piece for positions that build on top of NetSuite.

## NetSuite Knowledge Demonstrated

This project implements several key NetSuite concepts:

- **SuiteScript Architecture**: Custom middleware that mimics SuiteScript 2.0/2.1 patterns
- **Record Types & Forms**: Custom forms with field validation similar to NetSuite
- **Saved Searches**: Implementation of search functionality similar to NetSuite's saved searches
- **Script Governance**: Monitoring of resource usage similar to NetSuite's governance limits
- **User Event Scripts**: beforeSubmit/afterSubmit hooks for data processing
- **Scheduled Scripts**: Background tasks for inventory auditing and reporting

## Technology Stack

- **Backend**: Node.js + Express serving a RESTful API
- **Database**: PostgreSQL with Prisma ORM for data modeling
- **Frontend**: React with TailwindCSS for responsive UI
- **Authentication**: JWT-based with role-based permissions (similar to NetSuite roles)
- **Infrastructure**: Express middleware for SuiteScript-like functionality

## Core Implementation Details

### Backend Structure
- **Controllers**: Handle HTTP requests (like RESTlets and Suitelets)
- **Middleware**: 
  - `auth.js`: Authentication and role-based access (like NetSuite roles)
  - `governance.js`: Tracks execution usage (like NetSuite script governance)
  - `logging.js`: Records script execution (like NetSuite script logs)
- **Models**: Prisma schema for database entities
- **Routes**: API endpoints for each record type
- **Jobs**: Scheduled scripts for background processing

### Front-End Features
- Dashboard with KPIs and alerts
- Product and recipe management
- Batch processing workflow
- Inventory tracking
- Work order management

## Getting Started

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Configure environment
cd ../backend
cp .env.example .env

# Run migrations and seed data
npx prisma migrate dev
npx prisma db seed

# Start servers
npm run dev     # Backend
cd ../frontend && npm run dev  # Frontend
```

## NetSuite Parallels

### Record Types Implemented
- **Products** (Similar to NetSuite Items)
- **Recipes** (Similar to NetSuite Bill of Materials)
- **Batches** (Similar to NetSuite Work Orders)
- **Inventory** (Similar to NetSuite Inventory Item)

### SuiteScript-Like Features
```javascript
// Example of SuiteScript-like middleware usage
app.use((req, res, next) => {
  req.context = {
    user: req.user,
    runtime: {
      getCurrentUser: () => req.user,
      getCurrentScript: () => ({
        id: 'customscript_api',
        deploymentId: 'customdeploy_api'
      })
    }
  };
  next();
});
```

## Project Structure

```
mini-erp/
├── backend/         # Node.js + Express API with NetSuite-like patterns
├── frontend/        # React UI with NetSuite-inspired layouts
```

## Screenshot

[Insert screenshot of dashboard here]

## License

MIT License 