/**
 * Scales recipe ingredients based on desired batch size
 * @param {Object} recipe - Recipe object with items array
 * @param {number} desiredQuantity - Desired batch size
 * @returns {Array} Scaled recipe items
 */
const scaleRecipe = (recipe, desiredQuantity) => {
  const scalingFactor = desiredQuantity / recipe.quantity;
  
  return recipe.items.map(item => ({
    ...item,
    quantity: item.quantity * scalingFactor
  }));
};

module.exports = {
  scaleRecipe
}; 