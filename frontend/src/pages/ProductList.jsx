import { useState, useEffect } from 'react';

const mockProducts = [
  { id: 1, name: 'Dark Chocolate Bar', sku: 'CHOC-001', type: 'FINISHED_GOOD', cost: 2.50, price: 5.99 },
  { id: 2, name: 'Milk Chocolate Bar', sku: 'CHOC-002', type: 'FINISHED_GOOD', cost: 2.25, price: 4.99 },
  { id: 3, name: 'White Chocolate Bar', sku: 'CHOC-003', type: 'FINISHED_GOOD', cost: 2.75, price: 5.49 },
  { id: 4, name: 'Cocoa Powder', sku: 'ING-001', type: 'RAW_MATERIAL', cost: 12.00, price: 0 },
  { id: 5, name: 'Sugar', sku: 'ING-002', type: 'RAW_MATERIAL', cost: 1.50, price: 0 },
  { id: 6, name: 'Milk Powder', sku: 'ING-003', type: 'RAW_MATERIAL', cost: 8.75, price: 0 }
];

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('ALL');
  
  useEffect(() => {
    // In a real app, we would fetch from API
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 500);
  }, []);
  
  const filteredProducts = selectedType === 'ALL' 
    ? products 
    : products.filter(product => product.type === selectedType);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Add Product
        </button>
      </div>
      
      <div className="mb-4">
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 rounded ${selectedType === 'ALL' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            onClick={() => setSelectedType('ALL')}
          >
            All
          </button>
          <button 
            className={`px-3 py-1 rounded ${selectedType === 'FINISHED_GOOD' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            onClick={() => setSelectedType('FINISHED_GOOD')}
          >
            Finished Goods
          </button>
          <button 
            className={`px-3 py-1 rounded ${selectedType === 'RAW_MATERIAL' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            onClick={() => setSelectedType('RAW_MATERIAL')}
          >
            Raw Materials
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10">Loading products...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{product.sku}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.type === 'FINISHED_GOOD' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {product.type === 'FINISHED_GOOD' ? 'Finished Good' : 'Raw Material'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${product.cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.price > 0 ? `$${product.price.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 