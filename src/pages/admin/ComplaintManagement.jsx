import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/network";
import { useToast } from "../../Context/ToastContext";
import { useConfirm } from "../../Context/ConfirmContext";
import { Package as PackageIcon, Trash2, CircleCheck, BadgeCheck, MessageSquare } from "lucide-react";

function GestionReclamos() {
  const [reclamos, setReclamos] = useState([]);
  const toast = useToast();
  const confirmar = useConfirm();


  const [reclamoActivo, setReclamoActivo] = useState(null);
  const [respuestaTexto, setRespuestaTexto] = useState("");


  useEffect(() => {
    cargarReclamos();
  }, []);

  const cargarReclamos = () => {
    fetch(`${API_BASE_URL}/reclamos`)
      .then(res => res.json())
      .then(data => {

        const ordenados = data.sort((a, b) => (a.estado === "En Revisión" ? -1 : 1));
        setReclamos(ordenados);
      })
      .catch(err => console.error("Error cargando reclamos:", err));
  };


  const abrirRespuesta = (id) => {
    setReclamoActivo(id);
    setRespuestaTexto(""); 
  };


  const enviarRespuesta = async (id) => {
    if (!respuestaTexto.trim()) return toast("Debes escribir una respuesta.", "warning");

    try {
      const response = await fetch(`${API_BASE_URL}/reclamos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          respuestaAdmin: respuestaTexto,
          estado: "Resuelto" 
        }),
      });

      if (response.ok) {
        toast("Respuesta enviada y reclamo cerrado.", "success");
        setReclamoActivo(null);
        cargarReclamos();
      }
    } catch (error) {
      toast("Error al enviar respuesta", "error");
    }
  };


  const eliminarReclamo = async (id) => {
    const ok = await confirmar("¿Eliminar este reclamo del historial?");
    if (!ok) return;
    await fetch(`${API_BASE_URL}/reclamos/${id}`, { method: "DELETE" });
    cargarReclamos();
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Reclamos</h2>

      {reclamos.length === 0 && (
        <div className="bg-white p-10 text-center rounded-xl text-gray-500 border border-gray-200 border-dashed">
            <div className="flex flex-col items-center">
              <BadgeCheck className="w-10 h-10 text-green-500 mb-2" />
              <div>No hay reclamos pendientes.</div>
            </div>
          </div>
      )}

      <div className="grid gap-6">
        {reclamos.map((rec) => (
          <div key={rec.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative flex flex-col gap-4">


            <div className="flex flex-col md:flex-row justify-between items-start gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-gray-900 leading-tight">{rec.asunto}</h3>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono">#{rec.id.toString().slice(-6)}</span>
                </div>

                <p className="text-sm text-gray-500">
                  Cliente: <span className="font-bold text-gray-700">{rec.nombreUsuario}</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">Fecha: {rec.fecha}</p>

                {rec.pedidoId && rec.pedidoId !== "General" && (
                  <span className="inline-block mt-2 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold border border-blue-100">
                    <PackageIcon className="w-4 h-4 inline-block mr-1" /> Pedido: #{rec.pedidoId}
                  </span>
                )}
              </div>


              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide self-start md:self-auto ${rec.estado === "En Revisión" ? "bg-yellow-100 text-yellow-600 border border-yellow-200" :
                rec.estado === "Resuelto" ? "bg-green-100 text-green-600 border border-green-200" :
                  "bg-red-100 text-red-600 border border-red-200"
                }`}>
                {rec.estado}
              </span>
            </div>


            <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm border border-gray-100 relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-gray-200 rounded-l-lg"></div>
              <p className="pl-2 italic">"{rec.descripcion}"</p>
            </div>


            {rec.respuestaAdmin ? (
              <div className="bg-green-50 p-4 rounded-lg border border-green-100 relative mt-2">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-400 rounded-l-lg"></div>
                <p className="text-xs font-bold text-green-700 uppercase mb-1 pl-2"><CircleCheck className="w-4 h-4 inline-block mr-1 text-green-700" />Respuesta enviada:</p>
                <p className="text-sm text-gray-700 pl-2">"{rec.respuestaAdmin}"</p>

                <button onClick={() => eliminarReclamo(rec.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1" title="Eliminar del historial">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (

              <div className="mt-2 border-t border-gray-50 pt-4">
                {reclamoActivo === rec.id ? (
                  <div className="animate-fade-in bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-xs font-bold text-blue-700 mb-2 uppercase">Redactar Respuesta:</p>
                    <textarea
                      rows="4"
                      className="w-full p-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white resize-none"
                      placeholder="Escribe una respuesta amable para el cliente..."
                      value={respuestaTexto}
                      onChange={(e) => setRespuestaTexto(e.target.value)}
                      autoFocus
                    ></textarea>

                    <div className="flex gap-2 mt-3 justify-end">
                      <button
                        onClick={() => setReclamoActivo(null)}
                        className="text-gray-500 text-xs font-bold px-4 py-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => enviarRespuesta(rec.id)}
                        className="bg-blue-600 text-white text-xs font-bold px-6 py-2 rounded-lg hover:bg-blue-700 shadow-md transition-transform active:scale-95"
                      >
                        Enviar Respuesta
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => eliminarReclamo(rec.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                      title="Eliminar Reclamo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => abrirRespuesta(rec.id)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" /> Responder
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}

export default GestionReclamos;