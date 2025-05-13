import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Layout from './components/layout/Layout'
import ProductList from './pages/ProductList'
import RecipeList from './pages/RecipeList'
import BatchList from './pages/BatchList'
import InventoryList from './pages/InventoryList'
import './App.css'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/recipes" element={<RecipeList />} />
          <Route path="/batches" element={<BatchList />} />
          <Route path="/inventory" element={<InventoryList />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
