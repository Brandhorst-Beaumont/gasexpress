import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";
import { useToast } from "../../Context/ToastContext";
import { API_BASE_URL } from "../../config/network";
import UserManagement from "./UserManagement";
import OrderManagement from "./OrderManagement";
import CylindersAdmin from "./Cylinders";
import ComplaintManagement from "./ComplaintManagement";
import TruckManagement from "./TruckManagement";
import { User, Users, Truck, Package as PackageIcon, Flame, AlertCircle, LogOut, X } from "lucide-react";
import logo1 from '/logo1.svg';

function AdminDashboard() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("perfil");


  const [sidebarOpen, setSidebarOpen] = useState(false);


  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});


  const [adminData, setAdminData] = useState({
    nombre: "Cargando...", email: "", telefono: "", cedula: ""
  });


  useEffect(() => {
    if (user && user.id) {
      setAdminData(user);
    } else {
      fetch(`${API_BASE_URL}/usuarios?rol=admin`)
        .then(res => res.json())
        .then(data => {
          if (data.length > 0) {
            setAdminData(data[0]);
            setUser(data[0]);
          }
        });
    }
  }, [user, setUser]);


  const handleStartEdit = () => {
    setFormData(adminData);
    setIsEditing(true);
  };


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSave = async () => {
    if (!adminData || !adminData.id) {
      toast("Error: No se encuentra el ID del administrador", "error");
      return;
    }

    const { id, ...datosParaEnviar } = formData;

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/${adminData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosParaEnviar),
      });

      if (response.ok) {
        const adminActualizado = await response.json();
        setAdminData(adminActualizado);
        setUser(adminActualizado);
        localStorage.setItem("sesionActiva", JSON.stringify(adminActualizado));
        setIsEditing(false);
        toast("Datos actualizados correctamente.", "success");
      } else {
        toast(`Error al guardar: El servidor respondió con código ${response.status}`, "error");
      }
    } catch (error) {
      console.error(error);
      toast("Error de conexión con el servidor.", "error");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("sesionActiva");
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6] overflow-hidden relative">


      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}


      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#1E3A8A] text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 flex items-center gap-3 border-b border-blue-800">
            <div>
              <img src={logo1} alt="Pdvsa" className="w-35 h-15 mt-1" />
              <span className="text-xs text-blue-200 uppercase tracking-widest block mt-1">Administrador</span>
            </div>

          <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-auto text-blue-200 text-xl"><X className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
          <BotonMenu icono={<User className="w-5 h-5" />} texto="Perfil" tab="perfil" active={activeTab} setTab={(t) => { setActiveTab(t); setSidebarOpen(false); }} />
          
          <BotonMenu icono={<Truck className="w-5 h-5" />} texto="Conductores" tab="conductores" active={activeTab} setTab={(t) => { setActiveTab(t); setSidebarOpen(false); }} />
          <BotonMenu icono={<Users className="w-5 h-5" />} texto="Usuarios" tab="usuarios" active={activeTab} setTab={(t) => { setActiveTab(t); setSidebarOpen(false); }} />
          <BotonMenu icono={<PackageIcon className="w-5 h-5" />} texto="Pedidos" tab="pedidos" active={activeTab} setTab={(t) => { setActiveTab(t); setSidebarOpen(false); }} />
          <BotonMenu icono={<Flame className="w-5 h-5" />} texto="Bombonas" tab="bombonas" active={activeTab} setTab={(t) => { setActiveTab(t); setSidebarOpen(false); }} />
          <BotonMenu icono={<AlertCircle className="w-5 h-5" />} texto="Reclamos" tab="reclamos" active={activeTab} setTab={(t) => { setActiveTab(t); setSidebarOpen(false); }} />
        </nav>

        <div className="px-4 py-3">
          <div className="h-0.5 bg-white w-full"></div>
          <div className="pt-2">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:text-white hover:bg-[#3B82F6] transition-all">
              <span className="text-xl"><LogOut className="w-5 h-5" /></span>
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>


      <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full relative">
        <header className="flex justify-between items-center mb-6 md:mb-8">
          <div className="flex items-center gap-4">

            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-700 text-3xl">☰</button>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Hola, {adminData.nombre.split(" ")[0]}</h1>
              <p className="text-sm text-gray-500 hidden md:block">Panel de Administración</p>
            </div>
          </div>
        </header>


        {activeTab === "perfil" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 animate-fade-in-up">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-100 pb-4 gap-4">
              <h2 className="text-xl font-bold text-gray-800">Información del Perfil</h2>
              {!isEditing ? (
                <button onClick={handleStartEdit} className="w-full md:w-auto text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100">
                  Editar Perfil
                </button>
              ) : (
                <div className="flex gap-2 w-full md:w-auto">
                  <button onClick={handleCancel} className="flex-1 text-gray-500 font-bold px-3 border rounded-lg">Cancelar</button>
                  <button onClick={handleSave} className="flex-1 bg-green-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-green-700 shadow-lg">
                    Guardar
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nombre</label>
                {isEditing ? (
                  <input name="nombre" value={formData.nombre || ""} onChange={handleChange} className="w-full p-3 md:p-4 border rounded-xl" />
                ) : (
                  <div className="w-full p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-medium truncate">{adminData.nombre}</div>
                )}
              </div>


              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email</label>
                <div className="w-full p-3 md:p-4 bg-gray-100 rounded-xl border border-gray-200 text-gray-500 font-medium truncate">{adminData.email}</div>
              </div>


              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Teléfono</label>
                {isEditing ? (
                  <input name="telefono" value={formData.telefono || ""} onChange={handleChange} className="w-full p-3 md:p-4 border rounded-xl" />
                ) : (
                  <div className="w-full p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-medium">{adminData.telefono}</div>
                )}
              </div>


              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Cédula</label>
                {isEditing ? (
                  <input name="cedula" value={formData.cedula || ""} onChange={handleChange} className="w-full p-3 md:p-4 border rounded-xl" />
                ) : (
                  <div className="w-full p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-medium">{adminData.cedula}</div>
                )}
              </div>
            </div>
          </div>
        )}


        {activeTab === "conductores" && <TruckManagement />}
        {activeTab === "usuarios" && <UserManagement />}
        {activeTab === "pedidos" && <OrderManagement />}
        {activeTab === "bombonas" && <CylindersAdmin />}
        {activeTab === "reclamos" && <ComplaintManagement />}

      </main>
    </div>
  );
}


function BotonMenu({ icono, texto, tab, active, setTab }) {
  const isActive = active === tab;
  return (
    <button
      onClick={() => setTab(tab)}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? "bg-[#3B82F6] text-white shadow-lg border-l-4 border-white" : "text-blue-200 hover:text-white hover:bg-[#3B82F6]"}`}
    >
      <span className="text-xl">{icono}</span>
      <span className="font-medium">{texto}</span>
    </button>
  );
}

export default AdminDashboard;