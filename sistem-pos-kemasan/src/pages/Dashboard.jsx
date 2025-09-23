// src/pages/Dashboard.jsx
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">
        Selamat Datang, {user ? user.name : 'Pengguna'}!
      </h1>
      {user && (
        <p className="mt-2 text-gray-600">
          Anda login sebagai <span className="font-bold capitalize">{user.role}</span>.
        </p>
      )}
    </div>
  );
}

export default Dashboard;