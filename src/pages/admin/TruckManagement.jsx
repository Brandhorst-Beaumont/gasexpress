import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/network";
import { useToast } from "../../Context/ToastContext";
import { useConfirm } from "../../Context/ConfirmContext";
import { Truck, Phone, User as UserIcon, SquarePen, Trash2, X } from "lucide-react";

function ControlCamiones() {
  const [conductores, setConductores] = useState([]);
  const toast = useToast();
  const confirmar = useConfirm();
  const [isModalOpen, setIsModalOpen] = useState(false);


  const [conductorAEditar, setConductorAEditar] = useState(null);


  useEffect(() => {
    cargarConductores();
  }, []);

  const cargarConductores = () => {
    fetch(`${API_BASE_URL}/conductores`)
      .then(res => res.json())
      .then(data => setConductores(data))
      .catch(err => console.error("Error:", err));
  };


  const abrirModalCrear = () => {
    setConductorAEditar(null);
    setIsModalOpen(true);
  };

  const abrirModalEditar = (conductor) => {
    setConductorAEditar(conductor);
    setIsModalOpen(true);
  };


  const guardarConductor = async (datosFormulario) => {


    if (conductorAEditar) {
      try {
        const response = await fetch(`${API_BASE_URL}/conductores/${conductorAEditar.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datosFormulario),
        });

        if (response.ok) {
          cargarConductores();
          toast("Información actualizada correctamente", "success");
        }
      } catch (error) {
        toast("Error al actualizar", "error");
      }
    }

    else {
      const nuevoConductor = {
        id: Date.now().toString(),
        estado: "Disponible",
        password: "123",     
        rol: "conductor",     
        ...datosFormulario
      };

      try {
        const response = await fetch(`${API_BASE_URL}/conductores`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevoConductor),
        });
        if (response.ok) {
          cargarConductores();
          toast("Conductor creado. Su contraseña es '123'", "success");
        }
      } catch (error) {
        toast("Error al crear", "error");
      }
    }

    setIsModalOpen(false);
  };


  const alternarEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === "Disponible" ? "En Ruta" : "Disponible";
    try {
      await fetch(`${API_BASE_URL}/conductores/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      cargarConductores();
    } catch (error) { console.error(error); }
  };


  const eliminarConductor = async (id) => {
    const ok = await confirmar("¿Estás seguro de eliminar a este conductor?");
    if (!ok) return;
    try {
      await fetch(`${API_BASE_URL}/conductores/${id}`, { method: "DELETE" });
      cargarConductores();
    } catch (error) { console.error(error); }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">


      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Conductores</h2>
        <button
          onClick={abrirModalCrear}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span> Agregar Conductor
        </button>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {conductores.length === 0 && (
          <div className="col-span-full text-center py-10 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
            No hay conductores registrados.
          </div>
        )}

        {conductores.map((c) => (
          <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 relative hover:shadow-md transition-shadow flex flex-col justify-between">


            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl shrink-0"><Truck className="w-6 h-6" /></div>
                <span className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wide border ${c.estado === "En Ruta" ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-green-100 text-green-700 border-green-200"
                  }`}>
                  {c.estado}
                </span>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{c.nombre}</h3>
                <p className="text-xs text-gray-500 mb-3 truncate">{c.email}</p>

                <div className="space-y-1">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400 inline-block mr-1" /> {c.telefono}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-gray-400 inline-block mr-1" /> {c.cedula}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 mb-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Unidad Asignada</p>
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                  <span className="text-sm text-gray-800 font-bold">{c.modelo}</span>
                  <span className="text-xs font-mono bg-white px-2 py-1 rounded border text-gray-600">{c.placa}</span>
                </div>
              </div>
            </div>


            <div className="flex gap-2 pt-2">
              <button
                onClick={() => alternarEstado(c.id, c.estado)}
                className={`flex-1 py-3 px-2 rounded-lg text-xs font-bold transition-colors shadow-sm ${c.estado === "Disponible"
                  ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200"
                  : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                  }`}
              >
                {c.estado === "Disponible" ? "Enviar a Ruta" : "Liberar"}
              </button>

              <button onClick={() => abrirModalEditar(c)} className="w-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100">
                <SquarePen className="w-4 h-4" />
              </button>

              <button onClick={() => eliminarConductor(c.id)} className="w-10 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors border border-red-100">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>


      {isModalOpen && (
        <ModalConductor
          conductorAEditar={conductorAEditar}
          onClose={() => setIsModalOpen(false)}
          onSave={guardarConductor}
        />
      )}

    </div>
  );
}


function ModalConductor({ onClose, onSave, conductorAEditar }) {
  const toast = useToast();
  const [form, setForm] = useState({
    nombre: "", email: "", telefono: "", cedula: "", placa: "", modelo: ""
  });

  useEffect(() => {
    if (conductorAEditar) {
      setForm(conductorAEditar);
    } else {
      setForm({ nombre: "", email: "", telefono: "", cedula: "", placa: "", modelo: "" });
    }
  }, [conductorAEditar]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.placa) return toast("Faltan datos obligatorios", "warning");
    const { id, ...datosLimpios } = form;
    onSave(datosLimpios);
  };

  return (
    <div className="fixed inset-0 md:left-64 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in z-60">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col animate-scale-in">

        <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            {conductorAEditar ? "Editar Conductor" : "Agregar Nuevo"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 font-bold text-gray-600 transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Completo</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Juan Pérez" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
            <input name="email" value={form.email} type="email" onChange={handleChange} placeholder="correo@ejemplo.com" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teléfono</label>
            <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="0414-1234567" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cédula</label>
            <input name="cedula" value={form.cedula} onChange={handleChange} placeholder="V-12345678" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="md:col-span-2 border-t border-gray-100 my-2 pt-2">
            <p className="text-sm font-bold text-blue-600 mb-4"><Truck className="w-4 h-4 inline-block mr-2" /> Datos del Vehículo</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Placa</label>
                <input name="placa" value={form.placa} onChange={handleChange} placeholder="ABC-123" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Modelo</label>
                <input name="modelo" value={form.modelo} onChange={handleChange} placeholder="Ford 350" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" />
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 flex gap-3 pt-4 mt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg transition-colors">
              {conductorAEditar ? "Guardar Cambios" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ControlCamiones;