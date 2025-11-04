import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await login(username, password);

    if (data.access) {
      // Redirect based on role
      switch (data.role) {
        case "Master Admin":
        case "Website Admin":
          navigate("/WebsiteAdminPanel");
          break;
        case "Head Teacher":
          navigate("/headteacher/dashboard");
          break;
        case "Teacher":
          navigate("/teacher-dashboard");
          break;
        case "Student":
          navigate("/student-dashboard");
          break;
        case "Parent":
          navigate("/parent-dashboard");
          break;
        case "Accountant":
          navigate("/accountant-dashboard");
          break;
        default:
          navigate("/");
      }
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="p-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 w-full mb-4"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-4"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 w-full">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
