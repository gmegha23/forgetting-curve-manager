import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";

function AddTopic() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect to login if no token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleAdd = async () => {
    if (!title) {
      alert("Please enter a topic title");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      await API.post(
        "/topics",
        { title, category: category || "General" },
        { headers: { Authorization: token } }
      );
      alert("Topic added successfully! 🎉");
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to add topic. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span style={{ fontSize: "48px" }}>➕</span>
          <h2 style={{ color: "#667eea", marginTop: "10px" }}>Add New Topic</h2>
          <p style={{ color: "#666" }}>What do you want to learn today?</p>
        </div>

        <InputField 
          label="Topic Title *" 
          value={title} 
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g., Database Normalization, Arrays in Java"
        />
        
        <InputField 
          label="Category (Optional)" 
          value={category} 
          onChange={e => setCategory(e.target.value)}
          placeholder="e.g., Programming, Database, OS"
        />

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <Button 
            onClick={handleAdd} 
            disabled={loading}
            style={{
              flex: 1,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Adding..." : "➕ Add Topic"}
          </Button>
          
          <Button 
            onClick={() => navigate("/dashboard")}
            style={{
              flex: 1,
              background: "#e0e0e0",
              color: "#333"
            }}
          >
            Cancel
          </Button>
        </div>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#999" }}>
          💡 Tip: Add topics you're currently learning. The system will schedule revisions based on the forgetting curve!
        </p>
      </div>
    </div>
  );
}

export default AddTopic;

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
  maxWidth: "500px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
};