import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useToast } from "../../Context/ToastContext";
import { useConfirm } from "../../Context/ConfirmContext";
import { API_BASE_URL } from "../../config/network";

function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const toast = useToast();
  const confirmar = useConfirm();
  const [busqueda, setBusqueda] = useState("");


  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = () => {

    fetch(`${API_BASE_URL}/usuarios?_embed=bombonas`)
      .then((res) => res.json())
      .then((data) => {

        const soloClientes = data.filter((u) => u.rol !== "admin");
        setUsuarios(soloClientes);
      })
      .catch((err) => console.error("Error cargando usuarios:", err));
  };


  const eliminarUsuario = async (id, nombre) => {
    const ok = await confirmar(`¿Estás seguro de eliminar al usuario ${nombre}? Esta acción no se puede deshacer.`);
    if (!ok) return;

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast("Usuario eliminado correctamente", "success");
        cargarUsuarios(); 
      }
    } catch (error) {
      console.error(error);
      toast("Error al eliminar", "error");
    }
  };


  const usuariosFiltrados = usuarios.filter((u) =>
    (u.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (u.cedula || "").includes(busqueda)
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-fade-in-up">


      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-xl font-bold text-gray-800">Usuarios Registrados</h2>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
        </div>
      </div>


      <div className="space-y-4">


        <div className="hidden md:grid grid-cols-12 text-xs font-bold text-gray-400 uppercase tracking-wider px-6 pb-2 border-b border-gray-100">
          <div className="col-span-4">Usuario</div>
          <div className="col-span-3">Contacto</div>
          <div className="col-span-3">Dirección</div>
          <div className="col-span-1 text-center">Bombonas</div>
          <div className="col-span-1 text-right">Acción</div>
        </div>


        {usuariosFiltrados.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No se encontraron usuarios registrados.
          </div>
        )}


        {usuariosFiltrados.map((u) => (
          <div key={u.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">


            <div className="col-span-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                {u.nombre ? u.nombre.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <p className="font-bold text-gray-900">{u.nombre || "Sin Nombre"}</p>
                <p className="text-xs text-gray-500">CI: {u.cedula || "N/A"}</p>
              </div>
            </div>


            <div className="col-span-3">
              <p className="text-sm text-gray-600">{u.email}</p>
              <p className="text-xs text-gray-400">{u.telefono || "Sin teléfono"}</p>
            </div>


            <div className="col-span-3">
              <p className="text-sm text-gray-600 truncate" title={u.direccion}>
                {u.direccion || "Sin dirección registrada"}
              </p>
            </div>

            <div className="col-span-1 flex justify-center">
              <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                {u.bombonas ? u.bombonas.length : 0}
              </span>
            </div>


            <div className="col-span-1 text-right opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => eliminarUsuario(u.id, u.nombre)}
                className="text-red-400 hover:text-red-600 font-bold p-2 rounded hover:bg-red-50"
                title="Eliminar Usuario"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

export default GestionUsuarios;