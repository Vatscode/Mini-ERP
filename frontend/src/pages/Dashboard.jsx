import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    recipes: 0,
    batches: 0,
    inventory: 0
  });
  
  useEffect(() => {
    // In a real application, we would fetch actual data
    // This is just demo data
    setStats({
      products: 12,
      recipes: 8,
      batches: 5,
      inventory: 20
    });
  }, []);
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Products" value={stats.products} link="/products" color="blue" />
        <StatCard title="Recipes" value={stats.recipes} link="/recipes" color="purple" />
        <StatCard title="Active Batches" value={stats.batches} link="/batches" color="green" />
        <StatCard title="Inventory Items" value={stats.inventory} link="/inventory" color="amber" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 pb-2 border-b">Recent Batches</h2>
          <div className="space-y-3">
            <BatchItem 
              number="B2023-005" 
              status="IN_PROGRESS" 
              statusText="In Progress" 
              statusColor="yellow" 
            />
            <BatchItem 
              number="B2023-004" 
              status="COMPLETED" 
              statusText="Completed" 
              statusColor="green" 
            />
            <BatchItem 
              number="B2023-003" 
              status="COMPLETED" 
              statusText="Completed" 
              statusColor="green" 
            />
          </div>
          <div className="mt-4 text-right">
            <Link to="/batches" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all batches →
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 pb-2 border-b">Inventory Alerts</h2>
          <div className="space-y-3">
            <AlertItem 
              name="Cocoa Powder" 
              status="CRITICAL" 
              statusText="Low Stock" 
              statusColor="red" 
            />
            <AlertItem 
              name="Milk Powder" 
              status="WARNING" 
              statusText="Reorder Soon" 
              statusColor="yellow" 
            />
            <AlertItem 
              name="Sugar" 
              status="OK" 
              statusText="Sufficient" 
              statusColor="green" 
            />
          </div>
          <div className="mt-4 text-right">
            <Link to="/inventory" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all inventory →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, link, color }) {
  const getColorClasses = () => {
    switch (color) {
      case 'blue': return 'bg-blue-50 text-blue-700';
      case 'purple': return 'bg-purple-50 text-purple-700';
      case 'green': return 'bg-green-50 text-green-700';
      case 'amber': return 'bg-amber-50 text-amber-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <Link to={link} className={`${getColorClasses()} p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow`}>
      <h3 className="font-medium opacity-80">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </Link>
  );
}

function BatchItem({ number, status, statusText, statusColor }) {
  const getStatusClass = () => {
    switch (statusColor) {
      case 'green': return 'bg-green-100 text-green-800';
      case 'yellow': return 'bg-yellow-100 text-yellow-800';
      case 'red': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-3 border rounded-md flex justify-between items-center hover:bg-gray-50">
      <span className="font-medium text-gray-800">{number}</span>
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass()}`}>
        {statusText}
      </span>
    </div>
  );
}

function AlertItem({ name, status, statusText, statusColor }) {
  const getStatusClass = () => {
    switch (statusColor) {
      case 'green': return 'bg-green-100 text-green-800';
      case 'yellow': return 'bg-yellow-100 text-yellow-800';
      case 'red': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-3 border rounded-md flex justify-between items-center hover:bg-gray-50">
      <span className="font-medium text-gray-800">{name}</span>
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass()}`}>
        {statusText}
      </span>
    </div>
  );
} 