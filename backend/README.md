# Mini ERP Backend

A Node.js-based Mini ERP system backend with Express and Prisma ORM.

## Features

- Product management
- Ingredient inventory
- Recipe management
- Batch production tracking
- Recipe scaling functionality

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn package manager

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your database configuration:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/mini_erp?schema=public"
   PORT=5000
   ```
4. Initialize the database:
   ```bash
   npx prisma migrate dev
   ```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Products
- GET /api/products - Get all products
- GET /api/products/:id - Get single product
- POST /api/products - Create product
- PUT /api/products/:id - Update product
- DELETE /api/products/:id - Delete product

### Ingredients
- GET /api/ingredients - Get all ingredients
- GET /api/ingredients/:id - Get single ingredient
- POST /api/ingredients - Create ingredient
- PUT /api/ingredients/:id - Update ingredient
- DELETE /api/ingredients/:id - Delete ingredient

### Recipes
- GET /api/recipes - Get all recipes
- GET /api/recipes/:id - Get single recipe
- POST /api/recipes - Create recipe
- PUT /api/recipes/:id - Update recipe
- DELETE /api/recipes/:id - Delete recipe

### Batches
- GET /api/batches - Get all batches
- GET /api/batches/:id - Get single batch
- POST /api/batches - Create batch
- PUT /api/batches/:id - Update batch
- DELETE /api/batches/:id - Delete batch 