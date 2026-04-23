import axios from "axios";

//amf
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://calidro-production.up.railway.app/api";

console.log("🚀 API connecting to:", NGROK_URL);

const API = axios.create({
  baseURL: NGROK_URL,
  headers: {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json",
  },
});

export default API;
