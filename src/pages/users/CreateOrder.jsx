import { useState, useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { useToast } from "../../Context/ToastContext";
import { API_BASE_URL } from "../../config/network";
import MapSelector from "../../components/MapSelector";
import { Flame, MapPin, Check, Loader2, X } from "lucide-react";

function CrearPedido({ alGuardar, alVolver }) {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [coordenadas, setCoordenadas] = useState(null);


  const [pedido, setPedido] = useState({
    tipo: "10kg",
    cantidad: 1,
    direccion: user?.direccion || "",
    referencia: ""
  });

  const handleChange = (e) => {
    setPedido({ ...pedido, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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

      ...pedido,

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
        toast("¡Pedido solicitado con éxito!", "success");
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
          <h2 className="text-2xl font-bold text-gray-800">Solicitar Gas</h2>
          <p className="text-sm text-gray-500">Llena los datos para enviarte la bombona.</p>
        </div>
        <button
          onClick={alVolver}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors"
          title="Cancelar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">


        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Selecciona el Tamaño</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {["10kg", "18kg", "43kg"].map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => setPedido({ ...pedido, tipo })}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${pedido.tipo === tipo
                  ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-200 ring-offset-1"
                  : "border-gray-200 hover:border-blue-300 text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <span className="mb-1"><Flame className="w-6 h-6 text-blue-700" /></span>
                <span className="font-bold">Gas {tipo}</span>
              </button>
            ))}
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Cantidad</label>
            <input
              type="number"
              name="cantidad"
              min="1"
              max="10"
              value={pedido.cantidad}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-center font-bold text-lg"
            />
          </div>


          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Punto de Referencia</label>
            <input
              type="text"
              name="referencia"
              value={pedido.referencia}
              onChange={handleChange}
              placeholder="Ej: Frente a la panadería..."
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>


        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Dirección de Entrega</label>
          <input
            type="text"
            name="direccion"
            required
            value={pedido.direccion}
            onChange={handleChange}
            placeholder="Ej: Av. Bolívar, Casa #45..."
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition-colors"
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
              onAddressFound={(dir) => setPedido(prev => ({ ...prev, direccion: dir }))}
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
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.01]"
              }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Confirmar Pedido</span>
              </>
            )}
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">Al confirmar, tu pedido pasará a revisión.</p>
        </div>

      </form>
    </div>
  );
}

export default CrearPedido;