import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // 1. Import your hook
import { GoogleLogin } from "@react-oauth/google"; // Use the component for easier ID Token access
import LoginBg from "../assets/LoginBg.png";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // 2. Destructure the login function
  const API_URL = process.env.REACT_APP_API_URL;

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
      const res = await fetch(`${API_URL}/api/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // GoogleLogin component provides 'credential', which is the idToken
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
      className="min-h-screen flex items-center justify-left bg-cover bg-center"
      style={{ backgroundImage: `url(${LoginBg})` }}
    >
      <div className="w-105 rounded-2xl bg-white/70 backdrop-blur-md shadow-xl p-8 ml-30">
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
              width="340" // Matches your design width
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
