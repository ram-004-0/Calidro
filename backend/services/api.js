import axios from "axios";

const NGROK_URL = import.meta.env.VITE_BASE_URL;

// Add this line to your browser console
console.log("API is connecting to:", NGROK_URL);

const API = axios.create({
  baseURL: NGROK_URL,
  headers: { "Content-Type": "application/json" },
});

export default API;
