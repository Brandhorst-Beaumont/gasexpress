import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { useToast } from "../../Context/ToastContext";
import LiveMap from "../../components/LiveMap";
import { API_BASE_URL } from "../../config/network";
import { Truck, CircleCheck, BadgeCheck, Printer, MapPin, Flame } from "lucide-react";


function EstadoEntrega() {
    const { user } = useContext(AuthContext);
    const toast = useToast();
    const [pedidos, setPedidos] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [miUbicacion, setMiUbicacion] = useState(null);
    const [autoFollow, setAutoFollow] = useState(true);


    useEffect(() => {
        if (user?.nombre) {
            cargarPedidos();
            const intervalo = setInterval(() => cargarPedidos(true), 5000);
            let watchId;
            if (navigator.geolocation && !pedidoSeleccionado?.esSimulacion) {
                watchId = navigator.geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setMiUbicacion([latitude, longitude]);
                        const pedidoEnCurso = localStorage.getItem("pedidoEnRutaID");
                        if (pedidoEnCurso) actualizarUbicacionBD(pedidoEnCurso, latitude, longitude);
                    },
                    (error) => console.error("Geolocation error:", error),
                    { enableHighAccuracy: true }
                );
            }
            return () => { clearInterval(intervalo); if (watchId) navigator.geolocation.clearWatch(watchId); };
        }
    }, [user]);

    const actualizarUbicacionBD = async (id, lat, lng) => {
        try {
            await fetch(`${API_BASE_URL}/pedidos/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ latitudConductor: lat, longitudConductor: lng }),
            });
        } catch (e) { console.error(e); }
    };

    const cargarPedidos = (silencioso = false) => {
        fetch(`${API_BASE_URL}/pedidos`)
            .then(res => res.json())
            .then(data => {
                const nombreConductor = user.nombre.trim().toLowerCase();
                const activos = data.filter(p => p.conductor?.trim().toLowerCase() === nombreConductor && p.statusGlobal !== "cancelado" && p.statusGlobal !== "entregado");
                const terminados = data.filter(p => p.conductor?.trim().toLowerCase() === nombreConductor && p.statusGlobal === "entregado");

                setPedidos(activos);
                setHistorial(terminados.reverse());

                setPedidoSeleccionado(prev => {
                    const enRuta = activos.find(p => p.statusGlobal === "en_ruta");
                    if (enRuta) { localStorage.setItem("pedidoEnRutaID", enRuta.id); return enRuta; }
                    localStorage.removeItem("pedidoEnRutaID");
                    return prev ? data.find(p => p.id === prev.id) || null : null;
                });
            })
            .catch(err => !silencioso && console.error(err));
    };

    const cambiarEtapa = async (id, nuevaEtapa) => {
        await fetch(`${API_BASE_URL}/pedidos/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ statusGlobal: nuevaEtapa }),
        });
        if (nuevaEtapa === "entregado") {
            setPedidoSeleccionado(null);
            toast("¡Entrega completada!", "success");
        }
        cargarPedidos();
    };

    const handleImprimir = () => {
        window.print();
    };

    const listaEspera = pedidos.filter(p => p.id !== pedidoSeleccionado?.id);

    if (!user) return <div className="p-10 text-center">Cargando...</div>;

    return (
        <div className="space-y-8 animate-fade-in-up pb-10">

            <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
                <h1 className="text-3xl font-bold uppercase text-gray-800">Reporte de Jornada Diaria</h1>
                <div className="flex justify-between mt-4 text-sm text-gray-600">
                    <p><strong>Conductor:</strong> {user.nombre}</p>
                    <p><strong>Cédula:</strong> {user.cedula}</p>
                    <p><strong>Fecha:</strong> {new Date().toLocaleDateString()}</p>
                </div>
            </div>


            <div className="print:hidden">
                {pedidoSeleccionado ? (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">

                        <div className="bg-[#15803d] px-6 py-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <span className="animate-pulse">●</span>
                                <h2 className="font-bold text-lg">{pedidoSeleccionado.statusGlobal === "en_ruta" ? "EN RUTA" : "ASIGNADO"}</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                {pedidoSeleccionado.statusGlobal === "en_ruta" && (
                                    <>
                                        <button 
                                            onClick={() => setAutoFollow(!autoFollow)}
                                            className={`text-white text-xs px-3 py-1.5 rounded-lg border border-white/40 transition-colors font-bold ${
                                                autoFollow ? 'bg-white/30 hover:bg-white/40' : 'bg-white/10 hover:bg-white/20'
                                            }`}
                                        >
                                            {autoFollow ? (<><MapPin className="w-4 h-4 inline-block mr-1" /> Seguimiento: ON</>) : (<><MapPin className="w-4 h-4 inline-block mr-1" /> Seguimiento: OFF</>)}
                                        </button>
                                        
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="h-64 md:h-80 w-full bg-gray-100 relative border-b border-gray-200">
                                {pedidoSeleccionado.statusGlobal === "en_ruta" ? (
                                    <LiveMap 
                                        conductorCoords={miUbicacion} 
                                        destinoCoords={
                                            pedidoSeleccionado.latitudDestino && pedidoSeleccionado.longitudDestino
                                                ? [pedidoSeleccionado.latitudDestino, pedidoSeleccionado.longitudDestino]
                                                : (miUbicacion ? [miUbicacion[0] + 0.008, miUbicacion[1] + 0.008] : null)
                                        }
                                        autoFollow={autoFollow}
                                    />
                                ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
                                        <MapPin className="w-10 h-10 mb-2 text-gray-400" />
                                        <p className="font-medium">Inicia la ruta para ver el mapa</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Destino</p>
                                    <h3 className="font-bold text-2xl text-gray-800 leading-tight">{pedidoSeleccionado.direccion}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{pedidoSeleccionado.nombreCliente}</p>

                                    <div className="mt-3 inline-block bg-orange-100 text-orange-800 px-4 py-2 rounded-lg font-bold border border-orange-200 shadow-sm">
                                        <Flame className="w-5 h-5 inline-block mr-2 text-orange-700" /> {pedidoSeleccionado.tipo} <span className="text-black ml-1">x {pedidoSeleccionado.cantidad} Unid.</span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    {pedidoSeleccionado.statusGlobal !== "en_ruta" && (
                                        <button
                                            onClick={() => cambiarEtapa(pedidoSeleccionado.id, "en_ruta")}
                                            className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 text-lg"
                                        >
                                            <Truck className="w-5 h-5" /> Iniciar Ruta
                                        </button>
                                    )}
                                    {pedidoSeleccionado.statusGlobal === "en_ruta" && (
                                        <button
                                            onClick={() => cambiarEtapa(pedidoSeleccionado.id, "entregado")}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 text-lg"
                                        >
                                            <CircleCheck className="w-5 h-5" /> Confirmar Entrega
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-green-50 p-8 rounded-2xl text-center text-green-700 border border-green-100 shadow-sm">
                        <BadgeCheck className="text-4xl block mb-2 w-10 h-10 text-green-500 mx-auto" />
                        <h3 className="font-bold text-xl">{pedidos.length > 0 ? "Selecciona un pedido de la lista" : "¡Todo listo! Estás libre."}</h3>
                    </div>
                )}
            </div>


            <div className="print:hidden">
                {listaEspera.length > 0 && (
                    <div className="grid gap-3 mt-4">
                        <h3 className="text-gray-400 font-bold px-2 uppercase text-xs tracking-wider">Próximas Entregas ({listaEspera.length})</h3>
                        {listaEspera.map(p => (
                            <div
                                key={p.id}
                                className="bg-white p-4 rounded-xl shadow-sm cursor-pointer border border-gray-200 hover:border-green-500 transition-all active:bg-gray-50"
                                onClick={() => setPedidoSeleccionado(p)}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-gray-800">{p.nombreCliente}</p>
                                        <p className="text-xs text-gray-500 truncate ">{p.direccion}</p>
                                    </div>
                                    <span className="bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1 rounded-full border border-orange-100">
                                        {p.tipo} x{p.cantidad}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>


            {historial.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200 print:border-none print:mt-0">

                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-gray-400 font-bold px-2 uppercase text-xs tracking-wider print:text-black print:text-lg">
                            Historial de Hoy
                        </h3>

                        <button
                            onClick={handleImprimir}
                            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-sm print:hidden"
                        >
                            <Printer className="w-4 h-4" /> Imprimir
                        </button>
                    </div>

                    <div className="space-y-3 print:space-y-0 print:block">
                        {historial.map((p, index) => (
                            <div key={p.id} className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center print:border-b print:border-gray-300 print:rounded-none print:px-0 print:py-2 print:shadow-none">
                                <div className="flex gap-4 items-center">
                                    <span className="hidden print:block font-bold text-gray-500">{index + 1}.</span>
                                    <div>
                                        <p className="font-bold text-gray-700 text-sm print:text-black">{p.nombreCliente}</p>
                                        <p className="text-xs text-gray-400 print:text-gray-600">Pedido #{p.id.toString().slice(-4)} • {p.direccion}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 print:bg-transparent print:text-black print:p-0">
                                        <CircleCheck className="w-4 h-4 inline-block mr-1 text-green-700" /> Entregado
                                    </span>
                                    <span className="text-[10px] text-gray-400 hidden print:block">
                                        {p.tipo} (x{p.cantidad})
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="hidden print:flex justify-end mt-8 border-t border-black pt-4">
                        <p className="text-xl font-bold">Total Entregas: {historial.length}</p>
                    </div>
                </div>
            )}

        </div>
    );
}

export default EstadoEntrega;