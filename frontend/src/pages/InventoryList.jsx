import { useState, useEffect } from 'react';

const mockInventory = [
  { 
    id: 1, 
    productId: 1,
    productName: 'Dark Chocolate Bar',
    sku: 'CHOC-001',
    locationId: 1,
    locationName: 'Finished Goods Warehouse',
    quantityOnHand: 750,
    reorderPoint: 200,
    lastUpdated: '2023-09-20'
  },
  { 
    id: 2, 
    productId: 2,
    productName: 'Milk Chocolate Bar',
    sku: 'CHOC-002',
    locationId: 1,
    locationName: 'Finished Goods Warehouse',
    quantityOnHand: 500,
    reorderPoint: 200,
    lastUpdated: '2023-09-20'
  },
  { 
    id: 3, 
    productId: 3,
    productName: 'White Chocolate Bar',
    sku: 'CHOC-003',
    locationId: 1,
    locationName: 'Finished Goods Warehouse',
    quantityOnHand: 350,
    reorderPoint: 200,
    lastUpdated: '2023-09-18'
  },
  { 
    id: 4, 
    productId: 4,
    productName: 'Cocoa Powder',
    sku: 'ING-001',
    locationId: 2,
    locationName: 'Raw Materials Warehouse',
    quantityOnHand: 50,
    reorderPoint: 100,
    lastUpdated: '2023-09-19'
  },
  { 
    id: 5, 
    productId: 5,
    productName: 'Sugar',
    sku: 'ING-002',
    locationId: 2,
    locationName: 'Raw Materials Warehouse',
    quantityOnHand: 200,
    reorderPoint: 100,
    lastUpdated: '2023-09-15'
  },
  { 
    id: 6, 
    productId: 6,
    productName: 'Milk Powder',
    sku: 'ING-003',
    locationId: 2,
    locationName: 'Raw Materials Warehouse',
    quantityOnHand: 180,
    reorderPoint: 100,
    lastUpdated: '2023-09-17'
  }
];

export default function InventoryList() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [showReorderItems, setShowReorderItems] = useState(false);
  
  useEffect(() => {
    // In a real app, we would fetch from API
    setTimeout(() => {
      setInventory(mockInventory);
      setLoading(false);
    }, 500);
  }, []);
  
  // Apply filters
  const filteredInventory = inventory.filter(item => {
    // Location filter
    if (locationFilter !== 'ALL' && item.locationId !== parseInt(locationFilter)) {
      return false;
    }
    
    // Reorder filter
    if (showReorderItems && item.quantityOnHand > item.reorderPoint) {
      return false;
    }
    
    return true;
  });
  
  const getStockLevelClass = (item) => {
    if (item.quantityOnHand <= item.reorderPoint * 0.5) {
      return 'bg-red-100 text-red-800'; // Critical
    } else if (item.quantityOnHand <= item.reorderPoint) {
      return 'bg-yellow-100 text-yellow-800'; // Low
    } else {
      return 'bg-green-100 text-green-800'; // Sufficient
    }
  };
  
  const getStockLevelText = (item) => {
    if (item.quantityOnHand <= item.reorderPoint * 0.5) {
      return 'Critical';
    } else if (item.quantityOnHand <= item.reorderPoint) {
      return 'Low';
    } else {
      return 'Sufficient';
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <div className="space-x-2">
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Receive Items
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Transfer Items
          </button>
        </div>
      </div>
      
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <select 
            className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="ALL">All Locations</option>
            <option value="1">Finished Goods Warehouse</option>
            <option value="2">Raw Materials Warehouse</option>
          </select>
        </div>
        
        <div className="flex items-center ml-4 mt-6">
          <input 
            type="checkbox" 
            id="reorderItems" 
            className="h-4 w-4 text-blue-600"
            checked={showReorderItems}
            onChange={(e) => setShowReorderItems(e.target.checked)}
          />
          <label htmlFor="reorderItems" className="ml-2 text-sm text-gray-700">
            Show only items needing reorder
          </label>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10">Loading inventory...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Level
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                    <div className="text-xs text-gray-500">{item.sku}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.locationName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.quantityOnHand} units</div>
                    <div className="text-xs text-gray-500">Reorder at: {item.reorderPoint}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockLevelClass(item)}`}>
                      {getStockLevelText(item)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.lastUpdated}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-2">Adjust</button>
                    <button className="text-blue-600 hover:text-blue-900">History</button>
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