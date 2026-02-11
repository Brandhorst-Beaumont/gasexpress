import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { API_BASE_URL } from "../../config/network";
import { ShoppingCart, Droplets, X, Loader2 } from "lucide-react";

function SeleccionTipoPedido({ onNueva, onLlenar, onVolver }) {
  const { user } = useContext(AuthContext);
  const [tieneBombonas, setTieneBombonas] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (user && user.id) {
      fetch(`${API_BASE_URL}/bombonas?usuarioId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          setTieneBombonas(data.length > 0);
          setCargando(false);
        })
        .catch(() => setCargando(false));
    } else {
      setCargando(false);
    }
  }, [user]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 animate-fade-in-up">

      <div className="flex justify-between items-center mb-6 md:mb-8 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Nuevo Pedido</h2>
          <p className="text-sm text-gray-500">¿Qué deseas hacer?</p>
        </div>
        <button
          onClick={onVolver}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors"
          title="Cancelar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {cargando ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">


          <button
            onClick={onNueva}
            className="group flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-center gap-4 cursor-pointer"
          >
            <div className="w-16 h-16 bg-blue-100 group-hover:bg-blue-200 rounded-2xl flex items-center justify-center transition-colors">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-700 transition-colors">Comprar Bombona Nueva</h3>
              <p className="text-sm text-gray-500 mt-1">Solicita una bombona nueva llena</p>
            </div>
          </button>


          {tieneBombonas && (
            <button
              onClick={onLlenar}
              className="group flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all text-center gap-4 cursor-pointer"
            >
              <div className="w-16 h-16 bg-green-100 group-hover:bg-green-200 rounded-2xl flex items-center justify-center transition-colors">
                <Droplets className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800 group-hover:text-green-700 transition-colors">Llenar Bombonas</h3>
                <p className="text-sm text-gray-500 mt-1">Recarga tus bombonas registradas</p>
              </div>
            </button>
          )}

        </div>
      )}
    </div>
  );
}

export default SeleccionTipoPedido;
