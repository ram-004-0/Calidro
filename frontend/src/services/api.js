import axios from "axios";

// Fallback to localhost if environment variable is missing
const NGROK_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

console.log("🚀 API connecting to:", NGROK_URL);

const API = axios.create({
  baseURL: NGROK_URL,
  headers: {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json",
  },
});

export default API;
