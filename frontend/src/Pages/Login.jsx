import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; //
import { GoogleLogin } from "@react-oauth/google";
import LoginBg from "../assets/LoginBg.png";
import CalidroLogo from "../assets/calidrologo.png";
import { ArrowLeft } from "lucide-react";
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
        login(data.user);

        localStorage.setItem("userId", data.user.user_id);

        const userRole = data.user.role;
        navigate(userRole === "admin" ? "/admin-overview" : "/userhome");
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
      const res = await fetch(`${API_URL}/api/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        login(data.user);

        const userRole = data.user.role;
        navigate(userRole === "admin" ? "/admin-overview" : "/userhome");
      } else {
        alert("Google Login failed on server.");
      }
    } catch (err) {
      console.error("Google Login Failed", err);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center lg:justify-start bg-cover bg-center p-4"
      style={{ backgroundImage: `url(${LoginBg})` }}
    >
      <div className="w-full max-w-lg bg-white/70 backdrop-blur-md shadow-xl p-8 rounded-2xl lg:ml-30 mx-auto">
        {/* Header Section: Preserved */}
        <div className="flex justify-between mb-12">
          <button
            onClick={() => navigate("/")}
            className="text-sm font-bold text-gray-600 hover:text-black transition-colors"
          >
            ← BACK
          </button>
          <button className="text-lg font-semibold border-b-2 border-black pb-2 cursor-default">
            LOGIN
          </button>
        </div>

        {/* Main Content Section */}
        <div className="space-y-10 pb-6">
          {/* Welcome Text Section + Logo */}
          <div className="text-center space-y-4">
            {" "}
            <div className="flex justify-center mb-6">
              <img
                src={CalidroLogo}
                alt="Calidro Logo"
                className="h-12 w-auto object-contain"
              />
            </div>
            <h2 className="text-4xl font-bold text-gray-800 tracking-tight">
              Welcome to Calidro
            </h2>
            <div className="pt-2">
              <p className="text-sm text-gray-500 italic">
                Please use your authorized Google account to continue.
              </p>
            </div>
          </div>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log("Login Failed")}
              useOneTap
              theme="outline"
              size="large"
              text="continue_with"
              shape="circle"
              width="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
