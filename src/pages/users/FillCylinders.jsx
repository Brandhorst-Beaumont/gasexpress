import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { useToast } from "../../Context/ToastContext";
import { API_BASE_URL } from "../../config/network";
import MapSelector from "../../components/MapSelector";
import { Flame, MapPin, Check, Loader2, X, Droplets } from "lucide-react";

function LlenarBombonas({ alGuardar, alVolver }) {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [bombonas, setBombonas] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cargandoBombonas, setCargandoBombonas] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [coordenadas, setCoordenadas] = useState(null);

  const [datos, setDatos] = useState({
    direccion: user?.direccion || "",
    referencia: ""
  });

  useEffect(() => {
    if (user && user.id) {
      Promise.all([
        fetch(`${API_BASE_URL}/bombonas?usuarioId=${user.id}`).then(r => r.json()),
        fetch(`${API_BASE_URL}/pedidos?clienteId=${user.id}`).then(r => r.json())
      ])
        .then(([listaBombonas, listaPedidos]) => {

          const idsEnPedido = new Set();
          listaPedidos.forEach(p => {
            if (
              p.modalidad === "llenado" &&
              p.statusGlobal !== "entregado" &&
              p.statusGlobal !== "cancelado" &&
              p.bombonas
            ) {
              p.bombonas.forEach(b => idsEnPedido.add(b.id));
            }
          });

          const disponibles = listaBombonas.filter(b => !idsEnPedido.has(b.id));
          setBombonas(disponibles);
          setCargandoBombonas(false);
        })
        .catch(() => setCargandoBombonas(false));
    }
  }, [user]);

  const toggleSeleccion = (bombonaId) => {
    setSeleccionadas(prev =>
      prev.includes(bombonaId)
        ? prev.filter(id => id !== bombonaId)
        : [...prev, bombonaId]
    );
  };

  const seleccionarTodas = () => {
    if (seleccionadas.length === bombonas.length) {
      setSeleccionadas([]);
    } else {
      setSeleccionadas(bombonas.map(b => b.id));
    }
  };

  const handleChange = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (seleccionadas.length === 0) {
      return toast("Selecciona al menos una bombona para llenar.", "warning");
    }

    setLoading(true);

    const bombonasPedido = bombonas
      .filter(b => seleccionadas.includes(b.id))
      .map(b => ({ id: b.id, serial: b.serial, tipo: b.tipo }));


    const descripcionTipos = bombonasPedido
      .map(b => `${b.tipo} (${b.serial})`)
      .join(", ");

    const nuevoPedido = {
      id: Date.now().toString(),
      clienteId: user.id,
      nombreCliente: user.nombre,
      email: user.email,
      telefono: user.telefono || "",
      fecha: new Date().toLocaleString(),

      estado: "Pendiente",
      statusAprobacion: "Pendiente",
      statusGlobal: "pendiente",
      conductor: "",

      modalidad: "llenado",
      tipo: descripcionTipos,
      cantidad: seleccionadas.length,
      bombonas: bombonasPedido,

      direccion: datos.direccion,
      referencia: datos.referencia,

      latitudDestino: coordenadas?.lat || null,
      longitudDestino: coordenadas?.lng || null
    };

    try {
      const response = await fetch(`${API_BASE_URL}/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoPedido),
      });

      if (response.ok) {
        toast("¡Pedido de llenado solicitado con éxito!", "success");
        alGuardar();
      } else {
        toast("Error al guardar el pedido.", "error");
      }
    } catch (error) {
      console.error(error);
      toast("Error de conexión.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 animate-fade-in-up">

      <div className="flex justify-between items-center mb-6 md:mb-8 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Llenar Bombonas</h2>
          <p className="text-sm text-gray-500">Selecciona las bombonas que deseas recargar.</p>
        </div>
        <button
          onClick={alVolver}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors"
          title="Cancelar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {cargandoBombonas ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : bombonas.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Flame className="w-8 h-8 text-yellow-500" />
          </div>
          <h3 className="font-bold text-gray-800 text-lg mb-2">No hay bombonas disponibles</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
            Todas tus bombonas registradas ya tienen un pedido de llenado en proceso. Podrás solicitar un nuevo llenado cuando se complete o cancele el pedido actual.
          </p>
          <button
            type="button"
            onClick={alVolver}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors"
          >
            Volver
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">


          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-bold text-gray-700">Tus Bombonas</label>
              <button
                type="button"
                onClick={seleccionarTodas}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {seleccionadas.length === bombonas.length ? "Deseleccionar todas" : "Seleccionar todas"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bombonas.map((bombona) => {
                const isSelected = seleccionadas.includes(bombona.id);
                return (
                  <button
                    key={bombona.id}
                    type="button"
                    onClick={() => toggleSeleccion(bombona.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${isSelected
                      ? "border-green-500 bg-green-50 ring-2 ring-green-200 ring-offset-1"
                      : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                    }`}
                  >

                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${isSelected
                      ? "bg-green-500 border-green-500"
                      : "border-gray-300"
                    }`}>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>

                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                        <Flame className="w-5 h-5 text-orange-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800">{bombona.tipo}</p>
                        <p className="text-xs text-gray-500 font-mono truncate">{bombona.serial}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {seleccionadas.length > 0 && (
              <p className="text-sm text-green-600 font-medium mt-2">
                {seleccionadas.length} bombona{seleccionadas.length > 1 ? "s" : ""} seleccionada{seleccionadas.length > 1 ? "s" : ""}
              </p>
            )}
          </div>



          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Dirección de Entrega</label>
            <input
              type="text"
              name="direccion"
              required
              value={datos.direccion}
              onChange={handleChange}
              placeholder="Ej: Av. Bolívar, Casa #45..."
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition-colors"
            />
          </div>


          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Punto de Referencia</label>
            <input
              type="text"
              name="referencia"
              value={datos.referencia}
              onChange={handleChange}
              placeholder="Ej: Frente a la panadería..."
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>


          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-bold text-gray-700">Ubicación Exacta</label>
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                {showMap ? '▲ Ocultar Mapa' : '▼ Seleccionar en Mapa'}
              </button>
            </div>

            {showMap && (
              <MapSelector
                onSelectLocation={setCoordenadas}
                onAddressFound={(dir) => setDatos(prev => ({ ...prev, direccion: dir }))}
                initialPosition={coordenadas}
              />
            )}

            {coordenadas && !showMap && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm text-green-700">
                  <Check className="w-4 h-4 inline-block mr-1" /> Ubicación seleccionada: {coordenadas.lat.toFixed(4)}, {coordenadas.lng.toFixed(4)}
                </p>
              </div>
            )}
          </div>


          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || seleccionadas.length === 0}
              className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${loading || seleccionadas.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 hover:scale-[1.01]"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Droplets className="w-5 h-5" />
                  <span>Solicitar Llenado</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">Al confirmar, tu pedido de llenado pasará a revisión.</p>
          </div>

        </form>
      )}
    </div>
  );
}

export default LlenarBombonas;
