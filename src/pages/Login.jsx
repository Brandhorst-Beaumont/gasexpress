import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { API_BASE_URL } from "../config/network";

function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {

      const resUsuarios = await fetch(`${API_BASE_URL}/usuarios?email=${form.email}&password=${form.password}`);
      const dataUsuarios = await resUsuarios.json();

      if (dataUsuarios.length > 0) {
        const usuario = dataUsuarios[0];


        setUser(usuario);
        localStorage.setItem("sesionActiva", JSON.stringify(usuario));
        setLoading(false);


        if (usuario.rol === "admin") navigate("/admin/dashboard");
        else navigate("/usuario/dashboard");
        return;
      }


      const resConductores = await fetch(`${API_BASE_URL}/conductores?email=${form.email}&password=${form.password}`);
      const dataConductores = await resConductores.json();

      if (dataConductores.length > 0) {
        const conductor = dataConductores[0];


        const conductorConRol = { ...conductor, rol: "conductor" };


        setUser(conductorConRol);
        localStorage.setItem("sesionActiva", JSON.stringify(conductorConRol));
        setLoading(false);


        navigate("/conductor/dashboard");
        return;
      }

      setLoading(false);
      setError("Correo o contraseña incorrectos.");

    } catch (err) {
      console.error(err);
      setLoading(false);
      setError("Error de conexión con el servidor.");
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex flex-col items-center justify-center p-4 py-10 relative"
      style={{ backgroundImage: "url('/pdvsa_1.jpg.jpeg')" }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10 animate-fade-in-up">
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Bienvenido</h2>
        <p className="text-center text-gray-500 mb-6">Sistema de Gas Comunal</p>


        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center font-bold text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico</label>
            <input
              name="email"
              type="email"
              placeholder="ejemplo@gasexpress.com"
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña</label>
            <input
              name="password"
              type="password"
              placeholder="••••••"
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-3 rounded-lg transition-transform hover:scale-[1.02] ${loading ? "bg-gray-400" : "bg-black"}`}
          >
            {loading ? "Verificando..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/register" className="text-blue-600 font-bold hover:underline">
            ¿No tienes cuenta? Regístrate aquí
          </Link>
        </div>
        <div className="mt-2 text-center">
          <Link to="/" className="text-sm text-gray-400 hover:text-gray-600">← Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;