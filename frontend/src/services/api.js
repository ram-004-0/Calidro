import axios from "axios";

// This pulls from your Vercel/Railway environment settings
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://calidro-production.up.railway.app/api";

console.log("🚀 API connecting to:", API_URL);

const API = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
