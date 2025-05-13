import { useState, useEffect } from 'react';

const mockRecipes = [
  { 
    id: 1, 
    name: 'Dark Chocolate Bar Recipe', 
    version: '1.0',
    productId: 1,
    productName: 'Dark Chocolate Bar',
    ingredients: [
      { ingredientId: 4, ingredientName: 'Cocoa Powder', quantity: 250, unit: 'g' },
      { ingredientId: 5, ingredientName: 'Sugar', quantity: 100, unit: 'g' }
    ]
  },
  { 
    id: 2, 
    name: 'Milk Chocolate Bar Recipe', 
    version: '1.2',
    productId: 2,
    productName: 'Milk Chocolate Bar',
    ingredients: [
      { ingredientId: 4, ingredientName: 'Cocoa Powder', quantity: 180, unit: 'g' },
      { ingredientId: 5, ingredientName: 'Sugar', quantity: 150, unit: 'g' },
      { ingredientId: 6, ingredientName: 'Milk Powder', quantity: 120, unit: 'g' }
    ]
  },
  { 
    id: 3, 
    name: 'White Chocolate Bar Recipe', 
    version: '1.1',
    productId: 3,
    productName: 'White Chocolate Bar',
    ingredients: [
      { ingredientId: 5, ingredientName: 'Sugar', quantity: 200, unit: 'g' },
      { ingredientId: 6, ingredientName: 'Milk Powder', quantity: 250, unit: 'g' }
    ]
  }
];

export default function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRecipe, setExpandedRecipe] = useState(null);
  
  useEffect(() => {
    // In a real app, we would fetch from API
    setTimeout(() => {
      setRecipes(mockRecipes);
      setLoading(false);
    }, 500);
  }, []);
  
  const toggleRecipe = (id) => {
    if (expandedRecipe === id) {
      setExpandedRecipe(null);
    } else {
      setExpandedRecipe(id);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recipes</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Add Recipe
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-10">Loading recipes...</div>
      ) : (
        <div className="space-y-4">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                onClick={() => toggleRecipe(recipe.id)}
              >
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{recipe.name}</h3>
                  <p className="text-sm text-gray-500">
                    Version: {recipe.version} | Product: {recipe.productName}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-4">
                    {recipe.ingredients.length} ingredients
                  </span>
                  <svg 
                    className={`w-5 h-5 text-gray-500 transform ${expandedRecipe === recipe.id ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {expandedRecipe === recipe.id && (
                <div className="px-4 pb-4 border-t">
                  <h4 className="text-md font-medium mt-3 mb-2">Ingredients:</h4>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ingredient
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recipe.ingredients.map((ingredient) => (
                        <tr key={ingredient.ingredientId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{ingredient.ingredientName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{ingredient.quantity} {ingredient.unit}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 flex justify-end">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                    <button className="text-green-600 hover:text-green-900 mr-4">New Version</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 