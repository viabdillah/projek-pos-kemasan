// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    // Jika ada token, coba ambil data user (untuk sekarang dummy)
    if (token) {
      // Nanti di sini kita akan verifikasi token ke backend
      // Untuk sekarang, kita set user dummy jika ada token
      setUser({ name: 'Admin Utama', role: 'admin' });
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal login');
      }

      // Simpan token dan data user
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);

      // Arahkan ke dashboard
      navigate('/');

    } catch (error) {
      alert(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const value = {
    isAuthenticated: !!token,
    user,
    token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}