import axios from "axios";

const NGROK_URL = import.meta.env.VITE_BASE_URL;

console.log("API is connecting to:", NGROK_URL);

const API = axios.create({
  baseURL: "https://juicy-huff-anagram.ngrok-free.dev/api", // Ensure NO trailing slash
  headers: {
    "ngrok-skip-browser-warning": "69420",
  },
});

export default API;
