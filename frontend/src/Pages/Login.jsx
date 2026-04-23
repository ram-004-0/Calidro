import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; //
import { GoogleLogin } from "@react-oauth/google";
import LoginBg from "../assets/LoginBg.png";

const API_URL =
  "https://calidro-production.up.railway.app/api" || "http://localhost:5000";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        login(data.user); // This saves to localStorage "user" and updates state

        navigate(data.role === "admin" ? "/admin-overview" : "/userhome");
      } else {
        alert(data.message || "Invalid credentials!");
      }
    } catch (err) {
      alert("Server error. Please try again.");
    }
  };

  // Logic for Google Success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(`${API_URL}/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        login(data.user); // 4. Critical: Ensure the server returns the user object

        navigate(data.role === "admin" ? "/admin-overview" : "/userhome");
      } else {
        alert("Google Login failed on server.");
      }
    } catch (err) {
      console.error("Google Login Failed", err);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: `url(${LoginBg})` }}
    >
      <div className="w-full max-w-lg bg-white/70 backdrop-blur-md shadow-xl p-8 rounded-2xl">
        <div className="flex justify-between mb-8">
          <button className="text-lg font-semibold border-b-2 border-black pb-2">
            LOGIN
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-[#c79a63]">
              USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-transparent border-b-2 border-[#c79a63] focus:outline-none py-2"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-[#c79a63]">
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b-2 border-[#c79a63] focus:outline-none py-2"
            />
          </div>

          {/* To maintain design precisely, we wrap the hidden GoogleLogin 
             around your custom button or use the standard button.
             Standard Google button is required by Google for brand guidelines, 
             but here is the custom integration:
          */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log("Login Failed")}
              useOneTap
              theme="outline"
              size="large"
              text="continue_with"
              shape="circle"
              // Set to 100% so it respects the container's width
              width="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
