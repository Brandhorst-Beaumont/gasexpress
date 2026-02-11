import { createContext, useState, useContext, useCallback } from "react";
import { AlertTriangle, X } from "lucide-react";

const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({
    abierto: false,
    mensaje: "",
    onConfirm: null,
    onCancel: null,
  });

  const confirmar = useCallback((mensaje) => {
    return new Promise((resolve) => {
      setState({
        abierto: true,
        mensaje,
        onConfirm: () => {
          setState(s => ({ ...s, abierto: false }));
          resolve(true);
        },
        onCancel: () => {
          setState(s => ({ ...s, abierto: false }));
          resolve(false);
        },
      });
    });
  }, []);

  return (
    <ConfirmContext.Provider value={confirmar}>
      {children}

      {state.abierto && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-1">Confirmar acción</h3>
                <p className="text-sm text-gray-600">{state.mensaje}</p>
              </div>
              <button onClick={state.onCancel} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={state.onCancel}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={state.onConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors shadow-lg"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}

export default ConfirmContext;
