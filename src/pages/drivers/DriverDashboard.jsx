import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";
import { useToast } from "../../Context/ToastContext";
import { API_BASE_URL } from "../../config/network";
import DeliveryStatus from "./DeliveryStatus";
import { User, Package as PackageIcon, LogOut, X } from "lucide-react";
import logo from '/logo.svg';
import logo1 from '/logo1.svg';

function ConductorDashboard() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("perfil");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || "",
        email: user.email || "",
        telefono: user.telefono || "",
        cedula: user.cedula || "",
        placa: user.placa || "",
        modelo: user.modelo || ""
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/conductores/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const usuarioActualizado = await response.json();
        const usuarioFinal = { ...usuarioActualizado, rol: "conductor" };

        setUser(usuarioFinal);
        localStorage.setItem("sesionActiva", JSON.stringify(usuarioFinal));

        setIsEditing(false);
        toast("Perfil actualizado correctamente", "success");
      } else {
        toast("Error al guardar cambios", "error");
      }
    } catch (error) {
      console.error(error);
      toast("Error de conexión", "error");
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
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
        fixed inset-y-0 left-0 z-50 w-64 bg-[#15803d] text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 flex items-center gap-3 border-b border-green-700">
          <div>
            <img src={logo1} alt="Pdvsa" className="w-35 h-15 mt-1" />
            <span className="text-xs text-green-200 uppercase tracking-widest block mt-1">Conductor</span>
          </div>
          <div>

          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-auto text-green-200 text-xl font-bold"><X className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          <button
            onClick={() => { setActiveTab("perfil"); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeTab === "perfil" ? "bg-[#166534] shadow-lg border-l-4 border-white" : "hover:bg-[#166534]"
              }`}
          >
            <span className="text-xl"><User className="w-5 h-5" /></span> <span className="font-medium">Perfil</span>
          </button>

          <button
            onClick={() => { setActiveTab("pedidos"); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeTab === "pedidos" ? "bg-[#166534] shadow-lg border-l-4 border-white" : "hover:bg-[#166534]"
              }`}
          >
            <span className="text-xl"><PackageIcon className="w-5 h-5" /></span> <span className="font-medium">Pedidos</span>
          </button>
        </nav>

        <div className="px-4 py-3">
          <div className="h-0.5 bg-white w-full"></div>
          <div className="pt-2">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-green-100 hover:text-white hover:bg-[#166534] transition-all">
              <span className="text-xl"><LogOut className="w-5 h-5" /></span> Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>


      <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full relative z-0">

        <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-700 text-3xl">☰</button>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Hola, <span className="text-green-700">{user?.nombre.split(" ")[0]}</span>
              </h1>
              <p className="text-sm text-gray-500 hidden md:block">Panel de control de unidad</p>
            </div>
          </div>
        </header>


        {activeTab === "perfil" && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 animate-fade-in-up mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-100 pb-4 gap-4">
                <h2 className="text-xl font-bold text-gray-800">Información del Perfil</h2>
                {!isEditing ? (
                  <button onClick={() => { setIsEditing(true); }} className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold">Editar Perfil</button>
                ) : (
                  <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={handleCancel} className="flex-1 text-gray-500 font-bold px-3 border rounded-lg">Cancelar</button>
                    <button onClick={handleSave} className="flex-1 bg-green-600 text-white font-bold px-4 py-2 rounded-lg">Guardar</button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Nombre</label>
                  {isEditing ? (
                    <input name="nombre" value={formData.nombre} onChange={handleChange} className="w-full p-3 md:p-4 border rounded-xl" />
                  ) : (
                    <div className="w-full p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-medium">{formData.nombre}</div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Email</label>
                  <div className="w-full p-3 md:p-4 bg-gray-100 rounded-xl border border-gray-200 text-gray-500 font-medium truncate">{formData.email}</div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Teléfono</label>
                  {isEditing ? (
                    <input name="telefono" value={formData.telefono} onChange={handleChange} className="w-full p-3 md:p-4 border rounded-xl" />
                  ) : (
                    <div className="w-full p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-medium">{formData.telefono}</div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Cédula</label>
                  {isEditing ? (
                    <input name="cedula" value={formData.cedula} onChange={handleChange} className="w-full p-3 md:p-4 border rounded-xl" />
                  ) : (
                    <div className="w-full p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-medium">{formData.cedula}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 animate-fade-in-up">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Información del Vehículo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Placa</label>
                  {isEditing ? (
                    <input name="placa" value={formData.placa} onChange={handleChange} className="w-full p-3 md:p-4 border rounded-xl" />
                  ) : (
                    <div className="w-full p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-medium">{formData.placa}</div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Modelo</label>
                  {isEditing ? (
                    <input name="modelo" value={formData.modelo} onChange={handleChange} className="w-full p-3 md:p-4 border rounded-xl" />
                  ) : (
                    <div className="w-full p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-medium">{formData.modelo}</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}


        {activeTab === "pedidos" && (
          <DeliveryStatus />
        )}

      </main>
    </div>
  );
}

export default ConductorDashboard;