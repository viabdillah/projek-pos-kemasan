// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ManageUsers from './pages/ManageUsers';
import NewOrder from './pages/NewOrder';
import OrderList from './pages/OrderList';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
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
      </Route>
    </Routes>
  );
}
export default App;