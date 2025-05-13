const prisma = require('../db');

// Mimicking NetSuite's N/search module functionality
class Search {
  constructor(type) {
    this.type = type;
    this.filters = [];
    this.columns = [];
    this.sortBy = {};
  }

  // Similar to Search.createFilter
  createFilter(field, operator, value) {
    this.filters.push({ field, operator, value });
    return this;
  }

  // Similar to Search.createColumn
  createColumn(field, sort = null) {
    this.columns.push(field);
    if (sort) {
      this.sortBy[field] = sort;
    }
    return this;
  }

  // Similar to Search.run().each
  async run() {
    try {
      let query = {
        where: {},
        orderBy: [],
        include: {}
      };

      // Convert filters to Prisma query
      this.filters.forEach(filter => {
        switch (filter.operator) {
          case 'equals':
            query.where[filter.field] = filter.value;
            break;
          case 'contains':
            query.where[filter.field] = { contains: filter.value };
            break;
          case 'greaterThan':
            query.where[filter.field] = { gt: filter.value };
            break;
          case 'lessThan':
            query.where[filter.field] = { lt: filter.value };
            break;
          // Add more operators as needed
        }
      });

      // Handle sorting
      Object.entries(this.sortBy).forEach(([field, direction]) => {
        query.orderBy.push({ [field]: direction });
      });

      // Execute search based on type
      switch (this.type) {
        case 'batch':
          query.include = {
            recipe: {
              include: {
                product: true,
                items: {
                  include: { ingredient: true }
                }
              }
            }
          };
          return await prisma.batch.findMany(query);

        case 'recipe':
          query.include = {
            product: true,
            items: {
              include: { ingredient: true }
            }
          };
          return await prisma.recipe.findMany(query);

        case 'ingredient':
          query.include = {
            recipeItems: {
              include: { recipe: true }
            }
          };
          return await prisma.ingredient.findMany(query);

        default:
          throw new Error(`Search type ${this.type} not supported`);
      }
    } catch (error) {
      console.error('Search execution failed:', error);
      throw error;
    }
  }
}

// Example usage:
// const search = new Search('batch')
//   .createFilter('status', 'equals', 'pending')
//   .createColumn('createdAt', 'desc')
//   .run();

module.exports = Search; 