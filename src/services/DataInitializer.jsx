import { setData } from "./StorageService";
import { API_BASE_URL } from "../config/network";

export async function Data() {

  if (!localStorage.getItem("usuarios")) {
    try {
      const response = await fetch(`${API_BASE_URL}/db.json`);
      const data = await response.json();


      setData("usuarios", data.usuarios);
      setData("reclamos", data.reclamos || []);
      setData("camiones", data.camiones || []);
      setData("rutas", data.rutas || []);


      setData("pedidos", data.pedidos || []);
      setData("bombonas", data.bombonas || []);
    } catch (error) {
      console.error(" Error cargando db.json:", error);
    }
  }
}

