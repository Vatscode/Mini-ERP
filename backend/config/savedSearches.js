// Mimicking NetSuite's saved search configuration
const Search = require('../utils/searchUtils');

const SavedSearchType = {
  BATCH: 'batch',
  RECIPE: 'recipe',
  INGREDIENT: 'ingredient',
  PRODUCT: 'product'
};

const savedSearches = {
  // Pending Batches Search
  pendingBatches: {
    id: 'customsearch_pending_batches',
    name: 'Pending Batches',
    type: SavedSearchType.BATCH,
    filters: [
      {
        fieldId: 'status',
        operator: 'equals',
        value: 'pending'
      }
    ],
    columns: [
      { fieldId: 'id', label: 'ID' },
      { fieldId: 'recipe.name', label: 'Recipe' },
      { fieldId: 'quantity', label: 'Quantity' },
      { fieldId: 'startDate', label: 'Start Date', sort: 'DESC' }
    ],
    roles: ['ADMINISTRATOR', 'MANUFACTURING_USER']
  },

  // Low Stock Ingredients
  lowStockIngredients: {
    id: 'customsearch_low_stock_ingredients',
    name: 'Low Stock Ingredients',
    type: SavedSearchType.INGREDIENT,
    filters: [
      {
        fieldId: 'stock',
        operator: 'lessThan',
        value: 'minStock' // Dynamic value referencing another field
      }
    ],
    columns: [
      { fieldId: 'name', label: 'Name' },
      { fieldId: 'stock', label: 'Current Stock' },
      { fieldId: 'minStock', label: 'Minimum Stock' },
      { fieldId: 'unit', label: 'Unit' }
    ],
    roles: ['ADMINISTRATOR', 'INVENTORY_MANAGER']
  },

  // Recipe Usage Analysis
  recipeUsage: {
    id: 'customsearch_recipe_usage',
    name: 'Recipe Usage Analysis',
    type: SavedSearchType.RECIPE,
    filters: [
      {
        fieldId: 'batches.startDate',
        operator: 'within',
        value: 'lastMonth'
      }
    ],
    columns: [
      { fieldId: 'name', label: 'Recipe Name' },
      { 
        fieldId: 'batches.length', 
        label: 'Total Batches',
        formula: 'COUNT'
      },
      {
        fieldId: 'batches.quantity',
        label: 'Total Quantity',
        formula: 'SUM'
      }
    ],
    roles: ['ADMINISTRATOR', 'MANUFACTURING_MANAGER']
  }
};

// Function to execute a saved search
const executeSavedSearch = async (searchId, context = {}) => {
  const savedSearch = savedSearches[searchId];
  if (!savedSearch) {
    throw new Error(`Saved search ${searchId} not found`);
  }

  // Create a new search instance
  const search = new Search(savedSearch.type);

  // Apply filters
  savedSearch.filters.forEach(filter => {
    let value = filter.value;
    
    // Handle dynamic values
    if (typeof value === 'string' && value.startsWith('last')) {
      value = calculateDynamicDate(value);
    }
    
    search.createFilter(filter.fieldId, filter.operator, value);
  });

  // Apply columns and sorting
  savedSearch.columns.forEach(column => {
    if (column.sort) {
      search.createColumn(column.fieldId, column.sort);
    } else {
      search.createColumn(column.fieldId);
    }
  });

  // Execute search
  return await search.run();
};

// Helper function to calculate dynamic dates
const calculateDynamicDate = (period) => {
  const now = new Date();
  switch (period) {
    case 'lastWeek':
      return new Date(now.setDate(now.getDate() - 7));
    case 'lastMonth':
      return new Date(now.setMonth(now.getMonth() - 1));
    case 'lastQuarter':
      return new Date(now.setMonth(now.getMonth() - 3));
    default:
      return now;
  }
};

// Function to check if user has access to saved search
const hasSearchAccess = (searchId, userRoles) => {
  const search = savedSearches[searchId];
  if (!search) return false;
  
  return search.roles.some(role => userRoles.includes(role));
};

module.exports = {
  SavedSearchType,
  savedSearches,
  executeSavedSearch,
  hasSearchAccess
}; 