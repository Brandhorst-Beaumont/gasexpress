import { useState, useEffect } from "react";
import { MessageSquare, CircleCheck, Package as PackageIcon, Truck, Home, MapPin, Satellite, X } from "lucide-react";
import LiveMap from "./LiveMap";

const pasosSeguimiento = [
  { status: 'pendiente', label: 'Pedido Realizado', icon: <MessageSquare className="w-4 h-4" />, desc: 'Cliente envió la solicitud.' },
  { status: 'aprobado', label: 'Aprobado', icon: <CircleCheck className="w-4 h-4 text-green-600" />, desc: 'Admin confirmó el pedido.' },
  { status: 'cargando', label: 'Cargando', icon: <PackageIcon className="w-4 h-4" />, desc: 'En almacén.' },
  { status: 'en_ruta', label: 'En Camino', icon: <Truck className="w-4 h-4" />, desc: 'Conductor en vía.' },
  { status: 'entregado', label: 'Entregado', icon: <Home className="w-4 h-4" />, desc: 'Finalizado con éxito.' }
];

function getStepState(pedidoStatus, stepStatus) {
  const currentStatus = (pedidoStatus || "pendiente").toLowerCase();
  const statusOrder = pasosSeguimiento.map(p => p.status);
  const currentIndex = statusOrder.indexOf(currentStatus);
  const stepIndex = statusOrder.indexOf(stepStatus);

  if (currentStatus === 'entregado') return "completado";
  if (stepIndex < currentIndex) return "completado";
  if (stepIndex === currentIndex) return "activo";
  return "pendiente";
}

function ModalSeguimiento({ pedido, onClose, isAdmin = false }) {
  if (!pedido) return null;

  const latSegura = pedido.latitudConductor ? parseFloat(pedido.latitudConductor) : null;
  const lngSegura = pedido.longitudConductor ? parseFloat(pedido.longitudConductor) : null;

  return (
    <div className={`fixed inset-0 z-100 flex items-center justify-center p-0 md:p-4 backdrop-blur-sm bg-black/80 animate-fade-in`}>
      <div className={`bg-white md:rounded-2xl shadow-2xl w-full h-full overflow-hidden flex flex-col ${isAdmin ? 'md:h-[85vh] md:max-w-6xl border border-gray-200' : 'md:h-[90vh] md:max-w-5xl'}`}>


        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shadow-sm z-10 shrink-0">
          <div>
            <h3 className="font-bold text-lg text-gray-800">Pedido #{pedido.id.toString().slice(-4)}</h3>
            {pedido.conductor ? (
              <p className={`text-xs text-blue-600 font-bold ${isAdmin ? 'hidden md:block' : ''}`}>
                <Truck className="w-4 h-4 inline-block mr-1" /> {pedido.conductor}
              </p>
            ) : isAdmin ? (
              <p className="text-xs text-blue-600 font-bold hidden md:block">Esperando conductor</p>
            ) : null}
          </div>
          <button onClick={onClose} className="bg-gray-200 w-8 h-8 rounded-full text-gray-600 hover:bg-red-100 hover:text-red-500 transition-colors flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>


        <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">


          <div className={`w-full bg-white border-b md:border-b-0 md:border-r border-gray-200 overflow-x-auto md:overflow-y-auto flex md:flex-col p-2 md:p-4 gap-2 md:gap-0 shrink-0 h-auto md:h-full ${isAdmin ? 'md:w-80 scrollbar-hide' : 'md:w-1/3 scrollbar-hide'}`}>
            {pasosSeguimiento.map((paso, index) => {
              const estadoVisual = getStepState(pedido.statusGlobal, paso.status);
              const esUltimo = index === pasosSeguimiento.length - 1;

              return (
                <div key={paso.status} className="flex md:flex-row flex-col items-center md:items-start gap-1 md:gap-4 md:pb-8 min-w-70px md:min-w-0 shrink-0 relative">
                  {!esUltimo && (
                    <div className={`hidden md:block absolute left-[0.9rem] top-8 w-0.5 h-full ${estadoVisual === 'completado' ? 'bg-green-200' : 'bg-gray-200'}`}></div>
                  )}

                  <div className={`relative z-10 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-sm border-2 transition-all shrink-0 ${estadoVisual === 'completado' ? 'bg-green-100 border-green-500 text-green-600' :
                    estadoVisual === 'activo' ? 'bg-blue-100 border-blue-500 text-blue-600 animate-pulse' :
                      'bg-gray-50 border-gray-300 text-gray-400'
                    }`}>
                    {estadoVisual === 'completado' ? <CircleCheck className="w-3 h-3" /> : paso.icon}
                  </div>

                  <div className="text-center md:text-left">
                    <h5 className={`font-bold text-[9px] md:text-sm leading-tight ${estadoVisual === 'pendiente' ? 'text-gray-400' : 'text-gray-800'}`}>{paso.label}</h5>
                    <p className="hidden md:block text-xs text-gray-500 mt-1">{paso.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>


          <div className="flex-1 bg-gray-100 relative h-full min-h-[300px]">
            {latSegura && lngSegura ? (
              <LiveMap
                key={pedido.id}
                conductorCoords={[latSegura, lngSegura]}
                destinoCoords={
                  pedido.latitudDestino && pedido.longitudDestino
                    ? [pedido.latitudDestino, pedido.longitudDestino]
                    : [latSegura + 0.008, lngSegura + 0.008]
                }
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                <Satellite className="w-12 h-12 mb-2 text-gray-400" />
                <p>Esperando GPS...</p>
                <p className="text-xs mt-2 opacity-70">El conductor debe iniciar la ruta</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalSeguimiento;
