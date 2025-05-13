// Mimicking NetSuite's record type functionality
const RecordType = {
  BATCH: 'batch',
  RECIPE: 'recipe',
  INGREDIENT: 'ingredient',
  PRODUCT: 'product'
};

// Middleware to validate and transform record data
const recordTypeMiddleware = (recordType) => {
  return (req, res, next) => {
    req.recordType = recordType;
    
    // Add NetSuite-like record methods to req
    req.getNewRecord = () => {
      return req.body;
    };

    req.getOldRecord = async () => {
      const { id } = req.params;
      if (!id) return null;

      try {
        switch (recordType) {
          case RecordType.BATCH:
            return await prisma.batch.findUnique({ where: { id: parseInt(id) } });
          case RecordType.RECIPE:
            return await prisma.recipe.findUnique({ where: { id: parseInt(id) } });
          case RecordType.INGREDIENT:
            return await prisma.ingredient.findUnique({ where: { id: parseInt(id) } });
          case RecordType.PRODUCT:
            return await prisma.product.findUnique({ where: { id: parseInt(id) } });
          default:
            return null;
        }
      } catch (error) {
        console.error(`Error fetching old record: ${error}`);
        return null;
      }
    };

    // Add NetSuite-like field changed check
    req.isFieldChanged = (fieldId) => {
      const oldValue = req.oldRecord ? req.oldRecord[fieldId] : undefined;
      const newValue = req.body[fieldId];
      return oldValue !== newValue;
    };

    next();
  };
};

module.exports = {
  RecordType,
  recordTypeMiddleware
}; 