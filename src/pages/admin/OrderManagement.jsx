import { useState, useEffect } from "react";
import TrackingModal from "../../components/TrackingModal";
import { useToast } from "../../Context/ToastContext";
import { useConfirm } from "../../Context/ConfirmContext";
import { API_BASE_URL } from "../../config/network";
import { CircleCheck, Printer, Trash2, Flame, MapPin, X } from "lucide-react";

function GestionPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const toast = useToast();
  const confirmar = useConfirm();
  const [conductores, setConductores] = useState([]);
  const [seleccionConductor, setSeleccionConductor] = useState({});
  const [modalSeguimiento, setModalSeguimiento] = useState({ abierto: false, pedidoActivo: null });




  useEffect(() => {
    cargarDatos();
    const intervalo = setInterval(cargarDatos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const cargarDatos = () => {
    fetch(`${API_BASE_URL}/pedidos`)
      .then(res => res.json())
      .then(data => {
        const ordenados = data.sort((a, b) => b.id.localeCompare(a.id));
        setPedidos(ordenados);

        setModalSeguimiento(prev => {
          if (!prev.abierto || !prev.pedidoActivo) return prev;
          const actualizado = data.find(p => p.id === prev.pedidoActivo.id);
          return { ...prev, pedidoActivo: actualizado || prev.pedidoActivo };
        });
      });

    fetch(`${API_BASE_URL}/conductores?estado=Disponible`)
      .then(res => res.json())
      .then(data => setConductores(data));
  };

  const handleSelectConductor = (pedidoId, conductorId) => {
    setSeleccionConductor({ ...seleccionConductor, [pedidoId]: conductorId });
  };

  const aprobarPedido = async (pedido) => {
    const conductorId = seleccionConductor[pedido.id];
    if (!conductorId) return toast("Asigna un conductor primero.", "warning");
    const ok = await confirmar("¿Aprobar pedido?");
    if (!ok) return;

    const conductorDatos = conductores.find(c => c.id === conductorId);

    const updateData = {
      statusAprobacion: "Aprobado",
      statusGlobal: "cargando",
      conductor: conductorDatos.nombre,
      telefonoConductor: conductorDatos.telefono
    };

    await actualizarPedido(pedido.id, updateData);
  };

  const actualizarPedido = async (id, data) => {
    await fetch(`${API_BASE_URL}/pedidos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    cargarDatos();
  };


  const eliminarPedido = async (id) => {
    const ok = await confirmar("¿Seguro que quieres eliminar este pedido del historial?");
    if (!ok) return;
    try {
      await fetch(`${API_BASE_URL}/pedidos/${id}`, { method: "DELETE" });
      cargarDatos();
      toast("Pedido eliminado.", "success");
    } catch (error) {
      toast("Error al eliminar", "error");
    }
  };


  const handleImprimir = () => {
    window.print();
  };

  const abrirSeguimiento = (pedido) => { setModalSeguimiento({ abierto: true, pedidoActivo: pedido }); };



  return (
    <div className="space-y-6 animate-fade-in-up pb-10">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Pedidos</h2>
        <button
          onClick={handleImprimir}
          className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm shadow-lg transition-transform hover:scale-105"
        >
          <Printer className="w-4 h-4" /> Imprimir Reporte
        </button>
      </div>


      <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
        <h1 className="text-3xl font-bold uppercase text-black">Reporte de Pedidos</h1>
        <p className="text-sm text-gray-600 mt-2">Fecha de emisión: {new Date().toLocaleDateString()}</p>
      </div>

      {pedidos.length === 0 && <div className="bg-white p-10 text-center rounded-xl text-gray-500 border border-gray-200">No hay pedidos registrados.</div>}


      <div className="space-y-4 print:space-y-6">
        {pedidos.map((pedido) => (
          <div key={pedido.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 relative flex flex-col gap-4 break-inside-avoid print:shadow-none print:border-black print:border">


            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  #{pedido.id.toString().slice(-4)} <span className="text-sm font-normal text-gray-500">| {pedido.nombreCliente}</span>
                </h3>
                <p className="text-xs text-gray-400 print:text-gray-600">{pedido.fecha}</p>
              </div>
              <span className={`px-2 py-1 rounded text-[10px] md:text-xs font-bold uppercase print:border print:border-black print:bg-transparent print:text-black ${pedido.statusGlobal === "entregado" ? "bg-green-100 text-green-700" :
                  pedido.statusGlobal === "cancelado" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-700"
                }`}>
                {pedido.statusGlobal ? pedido.statusGlobal.replace("_", " ") : "Pendiente"}
              </span>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-3 print:border-gray-300">
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase print:text-black">Dirección</p>
                  <p className="text-sm text-gray-700 font-medium leading-tight print:text-black">{pedido.direccion}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase print:text-black">Detalle</p>
                  <span className="bg-orange-50 text-orange-800 px-2 py-1 rounded text-xs font-bold inline-block mt-1 print:bg-transparent print:text-black print:border print:border-black">
                    <Flame className="w-4 h-4 inline-block mr-1 text-orange-700" /> {pedido.tipo} (x{pedido.cantidad})
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 print:text-black">Conductor</p>
                {pedido.conductor ? (
                  <div>
                    <p className="text-sm text-gray-700 font-bold print:text-black">{pedido.conductor}</p>

                    {pedido.statusGlobal !== "cancelado" && (
                      <button
                        onClick={() => abrirSeguimiento(pedido)}
                        className="w-full md:w-auto text-xs bg-blue-50 text-blue-600 font-bold px-3 py-2 rounded-lg border border-blue-100 hover:bg-blue-100 flex items-center justify-center gap-2 mt-2 print:hidden"
                      >
                        <MapPin className="w-4 h-4 inline-block mr-1" /> Ver Seguimiento
                      </button>
                    )}
                  </div>
                ) : (

                  (!pedido.statusAprobacion || pedido.statusAprobacion === "Pendiente") && (
                    <div className="flex gap-2 print:hidden">
                      <select
                        className="w-full p-2 bg-white border border-gray-300 rounded text-sm"
                        onChange={(e) => handleSelectConductor(pedido.id, e.target.value)}
                      >
                        <option value="">Asignar conductor...</option>
                        {conductores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>
                    </div>
                  )
                )}
              </div>
            </div>


            <div className="print:hidden">
              {(!pedido.statusAprobacion || pedido.statusAprobacion === "Pendiente") ? (
                <div className="flex gap-2 mt-2 pt-2 border-t border-gray-50">
                  <button onClick={() => aprobarPedido(pedido)} className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-bold text-sm hover:bg-green-700"><CircleCheck className="w-4 h-4 inline-block mr-1" /> Aprobar</button>
                  <button onClick={() => actualizarPedido(pedido.id, { statusAprobacion: "Rechazado", statusGlobal: "cancelado" })} className="flex-1 bg-red-100 text-red-600 px-4 py-3 rounded-lg font-bold text-sm hover:bg-red-200"><X className="w-4 h-4 inline-block mr-1" /> Rechazar</button>
                </div>
              ) : (

                <div className="mt-2 pt-2 border-t border-gray-50 flex justify-end">
                  <button
                    onClick={() => eliminarPedido(pedido.id)}
                    className="text-gray-400 hover:text-red-600 text-xs font-bold flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" /> Eliminar del Historial
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>


      {modalSeguimiento.abierto && modalSeguimiento.pedidoActivo && (
        <TrackingModal
          pedido={modalSeguimiento.pedidoActivo}
          onClose={() => setModalSeguimiento({ abierto: false, pedidoActivo: null })}
          isAdmin
        />
      )}
    </div>
  );
}

export default GestionPedidos;
