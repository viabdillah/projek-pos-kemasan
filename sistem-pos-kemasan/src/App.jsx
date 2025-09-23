// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ManageUsers from './pages/ManageUsers';
import NewOrder from './pages/NewOrder';
import OrderList from './pages/OrderList';
import DesignTasks from './pages/DesignTasks';
import OrderDetail from './pages/OrderDetail';
import ProductionTasks from './pages/ProductionTasks';
import PendingPickup from './pages/PendingPickup';
import Receipt from './pages/Receipt';
import FinanceDashboard from './pages/FinanceDashboard';
import SalesReports from './pages/SalesReports';
import CashActivity from './pages/CashActivity';
import StockManagement from './pages/StockManagement';
import ManageMaterialCategories from './pages/ManageMaterialCategories';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/receipt/:id" element={<Receipt />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        {/* Halaman terproteksi lainnya di sini */}
        <Route path="manage-users" element={<ManageUsers />} />
        <Route path="new-order" element={<NewOrder />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="order/:id" element={<OrderDetail />} />
        <Route path="design-tasks" element={<DesignTasks />} />
        <Route path="production-tasks" element={<ProductionTasks />} />
        <Route path="pending-pickup" element={<PendingPickup />} />
        <Route path="reports/sales" element={<SalesReports />} />
        <Route path="finance" element={<FinanceDashboard />} />
        <Route path="cash-activity" element={<CashActivity />} />
        <Route path="stock-management" element={<StockManagement />} />
        <Route path="material-categories" element={<ManageMaterialCategories />} />
      </Route>
    </Routes>
  );
}
export default App;