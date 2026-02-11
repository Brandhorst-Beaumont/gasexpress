import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../Context/ToastContext";
import { registerUser } from "../services/AuthService";

function Register() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  
 
  const [form, setForm] = useState({
    nombre: "", email: "", password: "", cedula: "", telefono: "", direccion: ""
  });

 
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    
    const result = await registerUser(form);
    setLoading(false);
    
    if (result.success) {
      toast("¡Usuario creado en la base de datos! Ahora inicia sesión.", "success");
      navigate("/login");
    } else {
      toast(result.message, "error");
    }
  };

  return (
    
    <div 
      className="min-h-screen w-full bg-cover bg-center flex flex-col items-center justify-center p-4 py-10 relative"
      style={{ backgroundImage: "url('/pdvsa_1.jpg.jpeg')" }}
    >
      
     
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">

        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white drop-shadow-md">Sistema de Gas</h1>
          <p className="text-gray-200 text-lg">Portal Ciudadano</p>
        </div>

        
        <div className="bg-white rounded-2xl shadow-2xl w-full p-8">
          
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800">Crear Cuenta</h2>
            <p className="text-gray-500 text-sm">Completa tus datos para registrarte</p>
          </div>

          <div className="bg-gray-100 p-1 rounded-lg flex mb-6">
            <Link to="/login" className="flex-1 text-gray-500 hover:text-gray-700 font-medium py-2 rounded-md text-sm text-center transition-all">
              Iniciar Sesión
            </Link>
            <button className="flex-1 bg-white shadow-sm text-gray-900 font-bold py-2 rounded-md text-sm transition-all">
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
          
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Completo</label>
              <input name="nombre" onChange={handleChange} placeholder="Ej: Juan Pérez" required
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-2 focus:ring-black outline-none block p-2.5" />
            </div>

           
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Correo Electrónico</label>
              <input name="email" type="email" onChange={handleChange} placeholder="ejemplo@correo.com" required
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-2 focus:ring-black outline-none block p-2.5" />
            </div>

            
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Contraseña</label>
              <input name="password" type="password" onChange={handleChange} placeholder="••••••••" required
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-2 focus:ring-black outline-none block p-2.5" />
            </div>

            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Cédula</label>
                <input name="cedula" onChange={handleChange} placeholder="V-12345678" required
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-2 focus:ring-black outline-none block p-2.5" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono</label>
                <input name="telefono" onChange={handleChange} placeholder="0414-1234567" required
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-2 focus:ring-black outline-none block p-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Dirección</label>
              <input name="direccion" onChange={handleChange} placeholder="Av. Principal, Casa #12..." required
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-2 focus:ring-black outline-none block p-2.5" />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full mt-2 text-white font-bold rounded-lg text-sm px-5 py-3 text-center transition-transform hover:scale-[1.02] shadow-lg ${loading ? "bg-gray-400" : "bg-black hover:bg-gray-900"}`}
            >
              {loading ? "Creando cuenta..." : "Registrarse"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
              ← Volver a inicio
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Register;