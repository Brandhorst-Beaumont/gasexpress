import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Data } from './services/DataInitializer'; 
import { AuthProvider } from './Context/AuthContext';
import { ToastProvider } from './Context/ToastContext';
import { ConfirmProvider } from './Context/ConfirmContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UsuarioDashboard from './pages/users/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ConductorDashboard from './pages/drivers/DriverDashboard';

function App() {
  useEffect(() => {
    Data(); 
  }, []);

  return (

    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <BrowserRouter>
            <Routes>
              
            
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/usuario/dashboard" element={<UsuarioDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/conductor/dashboard" element={<ConductorDashboard />} />

            </Routes>
          </BrowserRouter>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;