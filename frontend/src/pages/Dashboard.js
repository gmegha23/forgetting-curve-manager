import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";
import MemoryChart from "../components/MemoryChart";
import QuizModal from "../components/QuizModal";
import ChatAssistant from "../components/ChatAssistant";

function Dashboard() {
  const [topics, setTopics] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    try {
      const res = await API.get("/topics", {
        headers: { Authorization: token },
      });
      setTopics(res.data);
    } catch (err) {
      console.log(err);
      navigate("/");
    }
  };

  const markRevised = async (id) => {
    const token = localStorage.getItem("token");
    await API.post(
      `/topics/revise/${id}`,
      {},
      { headers: { Authorization: token } }
    );
    fetchTopics();
  };

  const generateQuiz = async (topicId, topicTitle) => {
    setLoadingQuiz(topicId);
    setCurrentQuiz(null);
    
    const token = localStorage.getItem("token");
    try {
      const res = await API.post(
        "/ai/quiz",
        { topic: topicTitle },
        { headers: { Authorization: token } }
      );
      
      if (res.data.success) {
        setCurrentQuiz(res.data.quiz);
      } else {
        alert("Failed to generate quiz. Please try again.");
      }
    } catch (err) {
      console.error("Quiz generation error:", err);
      alert("Error generating quiz. Please check if backend is running.");
    } finally {
      setLoadingQuiz(null);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        padding: "40px",
        position: "relative",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "auto",
          background: "#fff",
          padding: "25px",
          borderRadius: "14px",
        }}
      >
        {/* Welcome Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          color: 'white',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: 0 }}>👋 Welcome back!</h3>
          <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
            You have {topics.length} topic{topics.length !== 1 ? 's' : ''} to review. 
            Keep revising to strengthen your memory!
          </p>
        </div>

        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          📘 Learning Dashboard
        </h2>

        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <Button onClick={() => navigate("/add-topic")}>
            ➕ Add Topic
          </Button>
        </div>

        {topics.length === 0 && (
          <p style={{ textAlign: "center", color: "#666" }}>
            No topics added yet. Click "Add Topic" to start learning!
          </p>
        )}

        {topics.map((t) => (
          <div
            key={t._id}
            style={{
              border: "1px solid #e0e0e0",
              padding: "20px",
              marginBottom: "20px",
              borderRadius: "12px",
              background: "#fafafa",
            }}
          >
            <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>{t.title}</h3>
            <p style={{ margin: "5px 0", color: "#666" }}>
              Category: {t.category || "General"}
            </p>
            <p style={{ margin: "5px 0", fontWeight: "bold", color: "#4a5568" }}>
              Memory Retention: {t.memory}%
            </p>

            <ProgressBar value={t.memory} />

            <div style={{ marginTop: "15px" }}>
              <MemoryChart strength={t.strength} />
            </div>

            <div style={{ marginTop: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Button onClick={() => markRevised(t._id)}>
                🔁 Mark Revised
              </Button>
              
              <Button onClick={() => generateQuiz(t._id, t.title)}>
                {loadingQuiz === t._id ? "⏳ Generating AI Quiz..." : "🤖 Generate AI Quiz"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Quiz Modal */}
      {currentQuiz && (
        <QuizModal 
          quiz={currentQuiz} 
          onClose={() => setCurrentQuiz(null)} 
        />
      )}

      {/* Chat Assistant */}
      <ChatAssistant userTopics={topics} />
    </div>
  );
}

export default Dashboard;