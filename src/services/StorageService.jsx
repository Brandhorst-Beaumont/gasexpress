export const setData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error guardando datos", error);
  }
};

export const getData = (key) => {
  try {
    const value = localStorage.getItem(key);

    if (!value || value === "undefined" || value === "null") {
      return null;
    }
    return JSON.parse(value);
  } catch (error) {
    console.error(`Error leyendo la clave ${key}:`, error);
    return null;
  }
};
  