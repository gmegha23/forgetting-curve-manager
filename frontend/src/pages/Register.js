import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";

function Register() {
  const [name, setName] = useState("");
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

  const handleRegister = async () => {
    if (!name || !email || !password) {
      alert("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/register", { name, email, password });
      alert("Registration successful! 🎉 Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span style={{ fontSize: "48px" }}>📝</span>
          <h2 style={{ color: "#667eea", marginTop: "10px" }}>Create Account</h2>
          <p style={{ color: "#666" }}>Start your learning journey today</p>
        </div>

        <InputField 
          label="Full Name" 
          value={name} 
          onChange={e => setName(e.target.value)}
          placeholder="Enter your full name"
        />
        
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
          placeholder="Create a password (min 6 characters)"
          onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
        />

        <Button 
          onClick={handleRegister} 
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "10px",
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Creating account..." : "📝 Register"}
        </Button>

        <p style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
          Already have an account?{" "}
          <span 
            style={{ color: "#667eea", cursor: "pointer", fontWeight: "bold" }}
            onClick={() => navigate("/login")}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;

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