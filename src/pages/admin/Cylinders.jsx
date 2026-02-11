import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/network";
import { useToast } from "../../Context/ToastContext";
import { useConfirm } from "../../Context/ConfirmContext";
import { Trash2, CircleCheck, Search, Flame } from "lucide-react";

function Bombonas() {
  const [bombonas, setBombonas] = useState([]);
  const toast = useToast();
  const confirmar = useConfirm();
  const [filtro, setFiltro] = useState("");


  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {

      const resBombonas = await fetch(`${API_BASE_URL}/bombonas`);
      const listaBombonas = await resBombonas.json();


      const resUsuarios = await fetch(`${API_BASE_URL}/usuarios`);
      const listaUsuarios = await resUsuarios.json();

      const dataCombinada = listaBombonas.map((bombona) => {
        const dueno = listaUsuarios.find((u) => u.id === bombona.usuarioId);
        return {
          ...bombona,
          nombrePropietario: dueno ? dueno.nombre : "Usuario Desconocido"
        };
      });

      setBombonas(dataCombinada);

    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };


  const toggleEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === "activa" ? "pendiente" : "activa";
    try {
      const response = await fetch(`${API_BASE_URL}/bombonas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (response.ok) cargarDatos();
    } catch (error) { toast("Error al actualizar estado", "error"); }
  };


  const eliminarBombona = async (id) => {
    const ok = await confirmar("¿Seguro que quieres eliminar esta bombona?");
    if (!ok) return;
    try {
      const response = await fetch(`${API_BASE_URL}/bombonas/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast("Bombona eliminada.", "success");
        cargarDatos();
      }
    } catch (error) { console.error(error); }
  };


  const bombonasFiltradas = bombonas.filter((b) =>
    b.serial.toLowerCase().includes(filtro.toLowerCase()) ||
    b.nombrePropietario.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 animate-fade-in-up">


      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800">Inventario de Bombonas</h2>
          <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Buscar serial o dueño..."
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
          <span className="absolute left-3 top-2 text-gray-400"><Search className="w-4 h-4" /></span>
        </div>
      </div>


      {bombonasFiltradas.length === 0 && (
        <div className="text-center py-10 text-gray-500 border border-dashed rounded-xl">
          No se encontraron bombonas.
        </div>
      )}


      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Serial</th>
              <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Tipo</th>
              <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Propietario</th>
              <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Fecha</th>
              <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Estado</th>
              <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bombonasFiltradas.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors group">
                <td className="py-4 text-sm font-medium text-gray-600 font-mono">{b.serial}</td>
                <td className="py-4 text-center">
                  <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-md">{b.tipo}</span>
                </td>
                <td className="py-4 text-sm text-gray-800 font-medium">{b.nombrePropietario}</td>
                <td className="py-4 text-sm text-gray-500">{b.fecha || "N/A"}</td>
                <td className="py-4 text-center">
                  <button
                    onClick={() => toggleEstado(b.id, b.estado)}
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-all shadow-sm ${b.estado === "activa" ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                      }`}
                  >
                    {b.estado || "pendiente"}
                  </button>
                </td>
                <td className="py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => eliminarBombona(b.id)} className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <div className="md:hidden space-y-4">
        {bombonasFiltradas.map((b) => (
          <div key={b.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm relative flex flex-col gap-3">


            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center text-lg"><Flame className="w-5 h-5 text-orange-500" /></div>
                <div>
                  <p className="font-bold text-gray-800 font-mono">{b.serial}</p>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">{b.tipo}</span>
                </div>
              </div>

              <button onClick={() => eliminarBombona(b.id)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
            </div>


            <div className="text-sm text-gray-600 border-t border-gray-50 pt-2 space-y-1">
              <p><span className="font-bold text-gray-400 text-xs uppercase">Dueño:</span> {b.nombrePropietario}</p>
              <p><span className="font-bold text-gray-400 text-xs uppercase">Fecha:</span> {b.fecha || "N/A"}</p>
            </div>

            <button
              onClick={() => toggleEstado(b.id, b.estado)}
              className={`w-full py-2 rounded-lg text-xs font-bold uppercase transition-all border ${b.estado === "activa"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-yellow-50 text-yellow-700 border-yellow-200"
                }`}
            >
              {b.estado === "activa" ? (<><CircleCheck className="w-4 h-4 inline-block mr-1 text-green-600"/> Activa</>) : "Pendiente"}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Bombonas;