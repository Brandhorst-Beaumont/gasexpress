import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";
import { useToast } from "../../Context/ToastContext";
import { API_BASE_URL } from "../../config/network";
import { User, Package as PackageIcon, Flame, AlertCircle, LogOut, MapPin, X } from "lucide-react";
import logo from '/logo1.svg';


import CreateOrder from "./CreateOrder";
import UserComplaints from "./UserComplaints";
import Cylinders from "./Cylinders";
import SelectOrderType from "./SelectOrderType";
import FillCylinders from "./FillCylinders";
import TrackingModal from "../../components/TrackingModal";

function UsuarioDashboard() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("perfil");


  const [sidebarOpen, setSidebarOpen] = useState(false);


  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const userData = user || { nombre: "Cargando...", email: "", telefono: "", cedula: "", direccion: "" };


  const [pedidos, setPedidos] = useState([]);


  const [modalSeguimiento, setModalSeguimiento] = useState({
    abierto: false,
    pedidoActivo: null
  });




  useEffect(() => {
    if (user && user.email) {
      cargarPedidos();
      const intervalo = setInterval(() => {
        cargarPedidos(true);
      }, 5000);
      return () => clearInterval(intervalo);
    }
  }, [user, activeTab]);

  const cargarPedidos = (silencioso = false) => {
    fetch(`${API_BASE_URL}/pedidos?email=${user.email}`)
      .then(res => res.json())
      .then(data => {
        const ordenados = data.sort((a, b) => b.id.localeCompare(a.id));
        setPedidos(ordenados);
        setModalSeguimiento(prev => {
          if (!prev.abierto || !prev.pedidoActivo) return prev;
          const actualizado = data.find(p => p.id === prev.pedidoActivo.id);
          return { ...prev, pedidoActivo: actualizado || prev.pedidoActivo };
        });
      })
      .catch(error => {
        if (!silencioso) console.error("Error cargando pedidos:", error);
      });
  };


  const handleStartEdit = () => { setFormData(userData); setIsEditing(true); };
  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const handleSave = async () => {
    if (!user || !user.id) return;
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const actualizado = await response.json();
        setUser(actualizado);
        localStorage.setItem("sesionActiva", JSON.stringify(actualizado));
        setIsEditing(false);
        toast("Perfil actualizado", "success");
      }
    } catch (error) { toast("Error de conexión", "error"); }
  };

  const handleCancel = () => { setIsEditing(false); setFormData({}); };
  const handleLogout = () => { setUser(null); localStorage.removeItem("sesionActiva"); navigate("/"); };

  const abrirSeguimiento = (pedido) => { setModalSeguimiento({ abierto: true, pedidoActivo: pedido }); };



  return (
    <div className="flex h-screen bg-[#F3F4F6] overflow-hidden relative">


      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}


      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#1F2937] text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 flex items-center gap-3 border-b border-gray-700">
          <div>
            <img src={logo} alt="Pdvsa" className="w-35 h-15 mt-1" />
            <span className="text-xs text-gray-400 uppercase tracking-widest block mt-1">Usuario</span>
          </div>

          <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-auto text-gray-400 text-xl"><X className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
          <BotonMenu icono={<User className="w-5 h-5" />} texto="Perfil" tab="perfil" active={activeTab} setTab={(t) => { setActiveTab(t); setSidebarOpen(false); }} />
          <BotonMenu icono={<PackageIcon className="w-5 h-5" />} texto="Pedidos" tab="pedidos" active={activeTab} setTab={(t) => { setActiveTab(t); setSidebarOpen(false); }} />
          <BotonMenu icono={<Flame className="w-5 h-5" />} texto="Bombonas" tab="bombonas" active={activeTab} setTab={(t) => { setActiveTab(t); setSidebarOpen(false); }} />
          <BotonMenu icono={<AlertCircle className="w-5 h-5" />} texto="Reclamos" tab="reclamos" active={activeTab} setTab={(t) => { setActiveTab(t); setSidebarOpen(false); }} />
        </nav>

        <div className="px-4 py-3">
          <div className="h-0.5 bg-white w-full"></div>
          <div className="pt-2">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-[#2563EB] transition-all">
              <span className="text-xl"><LogOut className="w-5 h-5" /></span> Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>


      <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full relative z-0">


        <header className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">

            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-700 text-3xl p-1 rounded hover:bg-gray-200">☰</button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Hola, <span className="text-blue-600">{userData.nombre.split(" ")[0]}</span></h1>
              <p className="text-sm text-gray-500 hidden md:block">Panel de Control</p>
            </div>
          </div>
        </header>

        {activeTab === "perfil" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-100 pb-4 gap-4">
              <h2 className="text-xl font-bold text-gray-800">Información del Perfil</h2>
              {!isEditing ? (
                <button onClick={handleStartEdit} className="w-full md:w-auto text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100">Editar Perfil</button>
              ) : (
                <div className="flex gap-2 w-full md:w-auto">
                  <button onClick={handleCancel} className="flex-1 text-red-500 font-bold px-3 border border-red-100 rounded-lg">Cancelar</button>
                  <button onClick={handleSave} className="flex-1 bg-green-600 text-white font-bold px-4 py-2 rounded-lg">Guardar</button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Nombre</label>
                {isEditing ? (
                  <input name="nombre" value={formData.nombre || ""} onChange={handleChange} className="w-full p-3 md:p-4 border rounded-xl" />
                ) : (
                  <div className="w-full p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-medium truncate">{userData.nombre}</div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Email</label>
                {isEditing ? (
                  <input name="email" value={formData.email || ""} onChange={handleChange} className="w-full p-3 md:p-4 border rounded-xl bg-yellow-50" disabled />
                ) : (
                  <div className="w-full p-3 md:p-4 bg-gray-100 rounded-xl border border-gray-200 text-gray-500 font-medium truncate">{userData.email}</div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Teléfono</label>
                {isEditing ? (
                  <input name="telefono" value={formData.telefono || ""} onChange={handleChange} className="w-full p-3 md:p-4 border rounded-xl" />
                ) : (
                  <div className="w-full p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-medium">{userData.telefono}</div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Cédula</label>
                {isEditing ? (
                  <input name="cedula" value={formData.cedula || ""} onChange={handleChange} className="w-full p-3 md:p-4 border rounded-xl" />
                ) : (
                  <div className="w-full p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-medium">{userData.cedula}</div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 mb-1">Dirección</label>
                {isEditing ? (
                  <input name="direccion" value={formData.direccion || ""} onChange={handleChange} className="w-full p-3 md:p-4 border rounded-xl" />
                ) : (
                  <div className="w-full p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-medium">{userData.direccion}</div>
                )}
              </div>
            </div>
          </div>
        )}


        {activeTab === "pedidos" && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-800">Mis Pedidos</h2>
              <button onClick={() => setActiveTab("seleccion-tipo-pedido")} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2">
                <span className="text-xl">+</span>
                Nuevo Pedido
              </button>
            </div>

            {pedidos.length === 0 ? (
              <div className="bg-white rounded-xl p-10 text-center"><h3 className="text-gray-500">No tienes pedidos activos</h3></div>
            ) : (
              pedidos.map((p) => (
                <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-gray-900 text-lg">#{p.id.toString().slice(-4)}</h3>

                      <span className={`md:hidden px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${p.statusGlobal === "en_ruta" ? "bg-blue-100 text-blue-700 animate-pulse" :
                        p.statusGlobal === "entregado" ? "bg-green-100 text-green-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                        {p.statusGlobal ? p.statusGlobal.replace("_", " ") : "Pendiente"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{p.fecha}</p>
                        <div className="flex flex-wrap gap-2">

                        <span className={`px-2 py-1 rounded text-xs font-bold border ${p.modalidad === "llenado" ? "bg-green-50 text-green-700 border-green-100" : "bg-blue-50 text-blue-700 border-blue-100"}`}>
                          {p.modalidad === "llenado" ? "Llenado" : "Nueva"}
                        </span>

                        <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs font-bold border border-orange-100">
                          <Flame className="w-4 h-4 inline-block mr-1 text-orange-700" /> {p.tipo} <span className="text-black ml-1">(x{p.cantidad})</span>
                        </span>
                        
                        <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded text-xs truncate max-w-200px">{p.direccion}</span>
                    </div>
                  </div>

                  <div className="w-full md:w-auto flex flex-row md:flex-col justify-between items-center gap-3 border-t md:border-t-0 pt-3 md:pt-0 mt-2 md:mt-0">
                    <span className={`hidden md:block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${p.statusGlobal === "en_ruta" ? "bg-blue-100 text-blue-700 animate-pulse" :
                      p.statusGlobal === "cargando" ? "bg-orange-100 text-orange-700" :
                        p.statusGlobal === "entregado" ? "bg-green-100 text-green-700" :
                          p.statusGlobal === "cancelado" ? "bg-red-100 text-red-700" :
                            "bg-yellow-100 text-yellow-700"
                      }`}>
                      {p.statusGlobal ? p.statusGlobal.replace("_", " ") : (p.statusAprobacion || "Pendiente")}
                    </span>

                        {p.statusGlobal !== "cancelado" && (
                      <button
                        onClick={() => abrirSeguimiento(p)}
                        className="w-full md:w-auto text-xs bg-blue-50 text-blue-600 font-bold px-4 py-3 md:py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 flex items-center justify-center gap-2"
                      >
                        <MapPin className="w-4 h-4 inline-block mr-1" /> Rastrear
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "seleccion-tipo-pedido" && <SelectOrderType onNueva={() => setActiveTab("crear-pedido")} onLlenar={() => setActiveTab("llenar-bombonas")} onVolver={() => setActiveTab("pedidos")} />}
        {activeTab === "crear-pedido" && <CreateOrder alGuardar={() => setActiveTab("pedidos")} alVolver={() => setActiveTab("seleccion-tipo-pedido")} />}
        {activeTab === "llenar-bombonas" && <FillCylinders alGuardar={() => setActiveTab("pedidos")} alVolver={() => setActiveTab("seleccion-tipo-pedido")} />}
        {activeTab === "reclamos" && <UserComplaints />}
        {activeTab === "bombonas" && <Cylinders />}

      </main>


      {modalSeguimiento.abierto && modalSeguimiento.pedidoActivo && (
        <TrackingModal
          pedido={modalSeguimiento.pedidoActivo}
          onClose={() => setModalSeguimiento({ abierto: false, pedidoActivo: null })}
        />
      )}

    </div>
  );
}

function BotonMenu({ icono, texto, tab, active, setTab }) {
  const isActive = active === tab;
  return (
    <button
      onClick={() => setTab(tab)}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive ? "bg-[#2563EB] text-white shadow-lg border-l-4 border-white" : "text-gray-400 hover:text-white hover:bg-[#2563EB]"}`}
    >
      <span className="text-xl">{icono}</span>
      <span className="font-medium">{texto}</span>
    </button>
  );
}

export default UsuarioDashboard;