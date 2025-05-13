import { useState, useEffect } from 'react';

const mockBatches = [
  { 
    id: 1, 
    batchNumber: 'B2023-001', 
    status: 'COMPLETED',
    plannedQuantity: 500,
    actualQuantity: 495,
    recipeId: 1,
    recipeName: 'Dark Chocolate Bar Recipe',
    productName: 'Dark Chocolate Bar',
    startDate: '2023-09-15',
    endDate: '2023-09-16'
  },
  { 
    id: 2, 
    batchNumber: 'B2023-002', 
    status: 'IN_PROGRESS',
    plannedQuantity: 300,
    actualQuantity: 0,
    recipeId: 2,
    recipeName: 'Milk Chocolate Bar Recipe',
    productName: 'Milk Chocolate Bar',
    startDate: '2023-09-18',
    endDate: null
  },
  { 
    id: 3, 
    batchNumber: 'B2023-003', 
    status: 'PLANNED',
    plannedQuantity: 400,
    actualQuantity: 0,
    recipeId: 3,
    recipeName: 'White Chocolate Bar Recipe',
    productName: 'White Chocolate Bar',
    startDate: '2023-09-25',
    endDate: null
  }
];

export default function BatchList() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  useEffect(() => {
    // In a real app, we would fetch from API
    setTimeout(() => {
      setBatches(mockBatches);
      setLoading(false);
    }, 500);
  }, []);
  
  const filteredBatches = statusFilter === 'ALL' 
    ? batches 
    : batches.filter(batch => batch.status === statusFilter);
    
  const getStatusClass = (status) => {
    switch(status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'PLANNED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Production Batches</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Create Batch
        </button>
      </div>
      
      <div className="mb-4">
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 rounded ${statusFilter === 'ALL' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            onClick={() => setStatusFilter('ALL')}
          >
            All
          </button>
          <button 
            className={`px-3 py-1 rounded ${statusFilter === 'PLANNED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            onClick={() => setStatusFilter('PLANNED')}
          >
            Planned
          </button>
          <button 
            className={`px-3 py-1 rounded ${statusFilter === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            onClick={() => setStatusFilter('IN_PROGRESS')}
          >
            In Progress
          </button>
          <button 
            className={`px-3 py-1 rounded ${statusFilter === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            onClick={() => setStatusFilter('COMPLETED')}
          >
            Completed
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10">Loading batches...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch Number
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timeline
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBatches.map((batch) => (
                <tr key={batch.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{batch.batchNumber}</div>
                    <div className="text-xs text-gray-500">{batch.recipeName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{batch.productName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(batch.status)}`}>
                      {batch.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Plan: {batch.plannedQuantity} units
                    </div>
                    {batch.actualQuantity > 0 && (
                      <div className="text-xs text-gray-500">
                        Actual: {batch.actualQuantity} units
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Start: {batch.startDate || 'Not started'}
                    </div>
                    <div className="text-xs text-gray-500">
                      End: {batch.endDate || 'In progress'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-2">View</button>
                    <button className="text-green-600 hover:text-green-900 mr-2">Update</button>
                    <button className="text-red-600 hover:text-red-900">Cancel</button>
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