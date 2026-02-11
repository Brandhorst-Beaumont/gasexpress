import { Link } from "react-router-dom";
import logo from '/logo1.svg';
import { Shield, CalendarCheck, UserCheck } from 'lucide-react';

function Home() {
  return (
  
    <div 
      className="min-h-screen bg-cover bg-center relative bg-gray-900"
      style={{ backgroundImage: "url('/pdvsa_1.jpg.jpeg')" }} 
    >
      
      <div className="absolute inset-0 bg-black/60"></div>

      
      <nav className="relative z-10 flex flex-col md:flex-row justify-between items-center px-8 py-6 gap-4">
        
      
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-32 h-auto" />
          </div>

        <div className="flex gap-4">
          
          <Link 
            to="/login" 
            className="text-white font-medium px-5 py-2 hover:text-gray-300 transition-colors border border-transparent hover:border-white rounded-lg"
          >
            Iniciar Sesión
          </Link>

          <Link 
            to="/register" 
            className="bg-[#1117ce] hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg shadow-lg"
          >
            Registrarse
          </Link>

        </div>
      </nav>

      <div className="relative z-10 flex flex-col items-center justify-center h-[70vh] text-center px-4 animate-fade-in-up">
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-xl">
          Soberanía Energética
        </h1>
        
        <div className="text-xl md:text-2xl text-gray-200 max-w-2xl mb-10 leading-tight">
          <p>
            Lideramos el suministro de gas doméstico en el país, apoyándose en una amplia
            infraestructura nacional para asegurar entregas confiables
            y continuidad del servicio.
          </p>

          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 flex flex-col md:flex-row gap-4 items-start">
            <div className="flex items-center gap-3 w-full md:w-1/3">
              <div className="w-12 h-12 flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium text-white">Seguridad garantizada</div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-1/3">
              <div className="w-12 h-12 flex items-center justify-center">
                <CalendarCheck className="w-10 h-10 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium text-white">Servicio 24/7</div>

              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-1/3">
              <div className="w-12 h-12 flex items-center justify-center">
                <UserCheck className="w-10 h-10 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium text-white">Conductores verificados</div>
              </div>
            </div>
          </div>
        </div>

        <Link 
          to="/login"
          className="bg-white text-gray-900 text-lg font-bold px-10 py-4 rounded-full shadow-2xl hover:bg-gray-100 transition-all transform hover:-translate-y-1 hover:shadow-white/20"
        >
          Ingresar al Sistema
        </Link>

      </div>

      <div className="absolute bottom-4 w-full text-center text-gray-400 text-sm z-10">
        © 2026 PDVSA Gas Comunal. Todos los derechos reservados.
      </div>

    </div>
  );
}

export default Home;