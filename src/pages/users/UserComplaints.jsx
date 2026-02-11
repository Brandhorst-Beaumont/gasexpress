import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { useToast } from "../../Context/ToastContext";
import { API_BASE_URL } from "../../config/network";
import { Package as PackageIcon, MessageSquare } from "lucide-react";

function ReclamosUsuarios() {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [reclamos, setReclamos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);


  const [nuevoReclamo, setNuevoReclamo] = useState({
    asunto: "",
    pedidoId: "",
    descripcion: ""
  });

  const [pedidos, setPedidos] = useState([]);


  useEffect(() => {
    if (user && user.id) {
      cargarReclamos();
    }
  }, [user]);

  const cargarReclamos = async () => {
    try {
      const [resReclamos, resPedidos] = await Promise.all([
        fetch(`${API_BASE_URL}/reclamos?usuarioId=${user.id}`),
        fetch(`${API_BASE_URL}/pedidos?clienteId=${user.id}`)
      ]);
      const dataReclamos = await resReclamos.json();
      const dataPedidos = await resPedidos.json();
      setReclamos(dataReclamos);
      setPedidos(dataPedidos.sort((a, b) => b.id.localeCompare(a.id)));
    } catch (error) { console.error("Error cargando reclamos:", error); }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const datosAGuardar = {
      id: "rec-" + Date.now().toString().slice(-6),
      usuarioId: user.id,
      nombreUsuario: user.nombre,
      asunto: nuevoReclamo.asunto,
      pedidoId: nuevoReclamo.pedidoId || "General",
      descripcion: nuevoReclamo.descripcion,
      fecha: new Date().toLocaleDateString(),
      estado: "En Revisión",
      respuestaAdmin: ""
    };

    try {
      const response = await fetch(`${API_BASE_URL}/reclamos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosAGuardar),
      });

      if (response.ok) {
        toast("Reclamo enviado correctamente.", "success");
        setMostrarFormulario(false);
        setNuevoReclamo({ asunto: "", pedidoId: "", descripcion: "" });
        cargarReclamos();
      } else { toast("Error al enviar.", "error"); }
    } catch (error) { console.error(error); }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">


      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Mis Reclamos</h2>
        {!mostrarFormulario && (
          <button
            onClick={() => setMostrarFormulario(true)}
            className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span> Nuevo Reclamo
          </button>
        )}
      </div>


      {mostrarFormulario && (
        <div className="bg-red-50 p-6 rounded-xl border border-red-100 mb-6 shadow-inner animate-fade-in">
          <h3 className="font-bold text-red-800 mb-4">Redactar Reclamo</h3>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Asunto / Motivo</label>
                <select
                  required
                  value={nuevoReclamo.asunto}
                  onChange={(e) => setNuevoReclamo({ ...nuevoReclamo, asunto: e.target.value })}
                  className="w-full p-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                >
                  <option value="">Selecciona un motivo...</option>
                  <option value="Retraso en entrega">Retraso en entrega</option>
                  <option value="Bombona defectuosa">Bombona defectuosa</option>
                  <option value="Cobro indebido">Cobro indebido</option>
                  <option value="Mala atención">Mala atención</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Pedido Relacionado</label>
                <select
                  value={nuevoReclamo.pedidoId}
                  onChange={(e) => setNuevoReclamo({ ...nuevoReclamo, pedidoId: e.target.value })}
                  className="w-full p-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                >
                  <option value="">Sin pedido específico</option>
                  {pedidos.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id.toString().slice(-4)} — {p.modalidad === "llenado" ? "Llenado" : "Nueva"} {p.tipo} ({p.fecha})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Descripción Detallada</label>
              <textarea
                required
                rows="3"
                placeholder="Explica qué sucedió..."
                value={nuevoReclamo.descripcion}
                onChange={(e) => setNuevoReclamo({ ...nuevoReclamo, descripcion: e.target.value })}
                className="w-full p-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              ></textarea>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="flex-1 md:flex-none bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 md:flex-none bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 shadow-md transition-colors"
              >
                Enviar Reclamo
              </button>
            </div>
          </form>
        </div>
      )}


      <div className="space-y-4">
        {reclamos.length === 0 && !mostrarFormulario && (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-200 border-dashed">
            <p className="text-gray-500">No tienes reclamos registrados. ¡Eso es bueno!</p>
          </div>
        )}

        {reclamos.map((rec) => (
          <div key={rec.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-4">


            <div className="flex justify-between items-start gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-bold text-lg text-gray-800 leading-tight">{rec.asunto}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">#{rec.id}</span>
                </div>
                <p className="text-[10px] text-gray-400">{rec.fecha}</p>
              </div>

              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0 ${rec.estado === "Resuelto" ? "bg-green-100 text-green-700"
                : rec.estado === "Rechazado" ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
                }`}>
                {rec.estado}
              </span>
            </div>


            <div className="border-t border-gray-100 pt-3">
              <p className="text-gray-600 text-sm mb-3">{rec.descripcion}</p>
                {rec.pedidoId !== "General" && (
                <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded font-bold"><PackageIcon className="w-4 h-4 inline-block mr-1" /> Pedido relacionado: {rec.pedidoId}</span>
              )}
            </div>


            {rec.respuestaAdmin && (
              <div className="mt-2 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="text-xs font-bold text-blue-800 mb-1 uppercase tracking-wide"><MessageSquare className="w-4 h-4 inline-block mr-1" /> Respuesta de Soporte:</p>
                <p className="text-sm text-blue-700">{rec.respuestaAdmin}</p>
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
}

export default ReclamosUsuarios;