import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { useToast } from "../../Context/ToastContext";
import { useConfirm } from "../../Context/ConfirmContext";
import { API_BASE_URL } from "../../config/network";
import { Trash2, Flame } from "lucide-react";

function Bombonas() {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const confirmar = useConfirm();
  const [bombonas, setBombonas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [nuevaBombona, setNuevaBombona] = useState({ tipo: "10kg", serial: "" });

  useEffect(() => {
    if (user && user.id) {
      cargarBombonas();
    }
  }, [user]);

  const cargarBombonas = async () => {
    try {
      const [resBombonas, resPedidos] = await Promise.all([
        fetch(`${API_BASE_URL}/bombonas?usuarioId=${user.id}`),
        fetch(`${API_BASE_URL}/pedidos?clienteId=${user.id}`)
      ]);
      const listaBombonas = await resBombonas.json();
      const listaPedidos = await resPedidos.json();


      const idsEnLlenado = new Set();
      listaPedidos.forEach(p => {
        if (
          p.modalidad === "llenado" &&
          p.statusGlobal !== "entregado" &&
          p.statusGlobal !== "cancelado" &&
          p.bombonas
        ) {
          p.bombonas.forEach(b => idsEnLlenado.add(b.id));
        }
      });


      const bombonesConEstado = listaBombonas.map(b => ({
        ...b,
        estadoDinamico: idsEnLlenado.has(b.id)
          ? "en_llenado"
          : "en_posesion"
      }));

      setBombonas(bombonesConEstado);
    } catch (error) { console.error("Error cargando bombonas:", error); }
  };

  const handleRegistrar = async (e) => {
    e.preventDefault();
    if (!nuevaBombona.serial) return toast("Escribe el serial", "warning");

    const datosAGuardar = {
      id: Date.now().toString(),
      usuarioId: user.id,
      nombreUsuario: user.nombre,
      tipo: nuevaBombona.tipo,
      serial: nuevaBombona.serial,
      fecha: new Date().toLocaleDateString(),
      estado: "pendiente"
    };

    try {
      const response = await fetch(`${API_BASE_URL}/bombonas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosAGuardar),
      });

      if (response.ok) {
        toast("Bombona registrada.", "success");
        setMostrarFormulario(false);
        setNuevaBombona({ tipo: "10kg", serial: "" });
        cargarBombonas();
      }
    } catch (error) { console.error(error); }
  };

  const handleEliminar = async (id) => {
    const ok = await confirmar("¿Eliminar esta bombona?");
    if (!ok) return;
    await fetch(`${API_BASE_URL}/bombonas/${id}`, { method: "DELETE" });
    cargarBombonas();
  };

  return (
    <div className="space-y-6 animate-fade-in-up">


      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Mis Bombonas</h2>
        {!mostrarFormulario && (
          <button
            onClick={() => setMostrarFormulario(true)}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span> Registrar Bombona
          </button>
        )}
      </div>



      {mostrarFormulario && (
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6 shadow-inner animate-fade-in">
          <h3 className="font-bold text-blue-800 mb-4">Nueva Bombona</h3>
          <form onSubmit={handleRegistrar} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Tipo</label>
              <select
                value={nuevaBombona.tipo}
                onChange={(e) => setNuevaBombona({ ...nuevaBombona, tipo: e.target.value })}
                className="w-full p-3 rounded-lg border border-blue-300 bg-white"
              >
                <option value="10kg">10kg (Pequeña)</option>
                <option value="18kg">18kg (Mediana)</option>
                <option value="43kg">43kg (Grande)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Serial</label>
              <input
                type="text"
                placeholder="Ej: BOM-1234"
                value={nuevaBombona.serial}
                onChange={(e) => setNuevaBombona({ ...nuevaBombona, serial: e.target.value })}
                className="w-full p-3 rounded-lg border border-blue-300"
                required
              />
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button type="button" onClick={() => setMostrarFormulario(false)} className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg font-bold">Cancelar</button>
              <button type="submit" className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-bold">Guardar</button>
            </div>
          </form>
        </div>
      )}


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {bombonas.length === 0 && !mostrarFormulario && (
          <div className="col-span-full text-center py-10 bg-white rounded-xl border border-gray-200 text-gray-500 border-dashed">
            No tienes bombonas registradas.
          </div>
        )}

        {bombonas.map((bombona) => (
          <div key={bombona.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 relative group hover:shadow-md transition-all">


            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-xl shrink-0"><Flame className="w-5 h-5 text-orange-700" /></div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 leading-tight">{bombona.tipo}</h3>
                  <p className="text-[10px] text-gray-400">{bombona.fecha}</p>
                </div>
              </div>

              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide shrink-0 ${
                bombona.estadoDinamico === "en_llenado"
                  ? "bg-blue-100 text-blue-600 border border-blue-200"
                  : "bg-green-100 text-green-600 border border-green-200"
                }`}>
                {bombona.estadoDinamico === "en_llenado" ? "En llenado" : "Disponible"}
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg mb-4 border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Serial</p>
              <p className="font-mono text-gray-800 font-medium text-base truncate">{bombona.serial}</p>
            </div>

            <button
              onClick={() => handleEliminar(bombona.id)}
              disabled={bombona.estadoDinamico === "en_llenado"}
              className={`w-full py-2 rounded-lg font-bold text-xs transition-colors border flex items-center justify-center gap-2 ${
                bombona.estadoDinamico === "en_llenado"
                  ? "text-gray-300 border-gray-100 cursor-not-allowed"
                  : "text-red-500 border-red-50 hover:bg-red-50 hover:border-red-100"
              }`}
            >
              <Trash2 className="w-4 h-4" /> Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Bombonas;