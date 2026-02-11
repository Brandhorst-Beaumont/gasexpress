import { API_BASE_URL } from "../config/network";

const API_URL = `${API_BASE_URL}/usuarios`;


export const registerUser = async (usuario) => {
  try {

    const checkRes = await fetch(`${API_URL}?email=${usuario.email}`);
    const existingUsers = await checkRes.json();

    if (existingUsers.length > 0) {
      return { success: false, message: "El correo ya está registrado." };
    }


    const nuevoUsuario = {
      id: Date.now().toString(),
      ...usuario,
      rol: "usuario"
    };


    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoUsuario),
    });

    if (response.ok) {
      return { success: true, user: nuevoUsuario };
    } else {
      return { success: false, message: "Error al guardar en el servidor." };
    }

  } catch (error) {
    console.error("Error registro:", error);
    return { success: false, message: "Error de conexión con el servidor (Puerto 5000)." };
  }
};


export const loginUser = async (email, password) => {
  try {

    const response = await fetch(`${API_URL}?email=${email}&password=${password}`);
    const usuarios = await response.json();

    if (usuarios.length > 0) {
      return { success: true, user: usuarios[0] };
    } else {
      return { success: false, message: "Credenciales incorrectas." };
    }
  } catch (error) {
    console.error("Error login:", error);
    return { success: false, message: "No se pudo conectar con el servidor." };
  }
};


export const updateUser = async (id, datosActualizados) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosActualizados),
    });

    if (response.ok) {
      const user = await response.json();
      return { success: true, user: user };
    } else {
      return { success: false, message: "Error al actualizar." };
    }
  } catch (error) {
    console.error("Error Update:", error);
    return { success: false, message: "Error de conexión." };
  }
};
