const NETWORK_CONFIG = {

  HOST:
    window.location.hostname === "localhost"
      ? "localhost"
      : window.location.hostname,

  VITE_PORT: 5173,
  API_PORT: 5000,
};

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
export const API_BASE_URL = isLocalhost
  ? `http://${NETWORK_CONFIG.HOST}:${NETWORK_CONFIG.API_PORT}`
  : "/api";
export const APP_BASE_URL = `${window.location.protocol}//${window.location.host}`;

export default NETWORK_CONFIG;
