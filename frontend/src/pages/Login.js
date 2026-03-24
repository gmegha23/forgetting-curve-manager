import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      alert("Login successful! 🎉");
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.msg || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span style={{ fontSize: "48px" }}>🧠</span>
          <h2 style={{ color: "#667eea", marginTop: "10px" }}>Welcome Back!</h2>
          <p style={{ color: "#666" }}>Login to continue your learning journey</p>
        </div>

        <InputField 
          label="Email" 
          type="email"
          value={email} 
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
        
        <InputField 
          label="Password" 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter your password"
          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
        />

        <Button 
          onClick={handleLogin} 
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "10px",
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Logging in..." : "🔐 Login"}
        </Button>

        <p style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
          New to the platform?{" "}
          <span 
            style={{ color: "#667eea", cursor: "pointer", fontWeight: "bold" }}
            onClick={() => navigate("/register")}
          >
            Create an account
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;

const pageStyle = {
  minHeight: "calc(100vh - 70px)",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px"
};

const cardStyle = {
  background: "#fff",
  padding: "40px",
  borderRadius: "16px",
  width: "100%",
  maxWidth: "400px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
};