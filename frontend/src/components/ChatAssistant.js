import React, { useState, useRef, useEffect } from 'react';
import API from '../api';
import Button from './Button';

function ChatAssistant({ userTopics }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: '👋 Hi! I\'m your learning assistant. Ask me about:\n\n• When to revise topics\n• Explaining concepts\n• The forgetting curve\n• Study tips\n\nWhat would you like to know? 🤓'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await API.post('/ai/chat', 
        { 
          message: userMessage,
          userTopics: userTopics || []
        },
        { headers: { Authorization: token } }
      );

      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: res.data.response,
        isFallback: res.data.fallback
      }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: '😅 Sorry, I\'m having trouble connecting. Please try again in a moment.',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Suggested questions
  const suggestedQuestions = [
    "When should I revise my topics?",
    "Explain the forgetting curve",
    "How does memory strength work?",
    "Give me study tips"
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        💬
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '380px',
        height: '550px',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          padding: '15px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '18px' }}>🤖 Learning Assistant</h3>
          <p style={{ margin: '5px 0 0', fontSize: '12px', opacity: 0.9 }}>
            Powered by Google Gemini AI
          </p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0 5px'
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          background: '#f5f5f5'
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '15px'
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '12px 15px',
                borderRadius: '12px',
                background: msg.type === 'user' 
                  ? 'linear-gradient(135deg, #667eea, #764ba2)'
                  : msg.isError 
                    ? '#ffebee'
                    : msg.isFallback
                      ? '#fff3e0'
                      : 'white',
                color: msg.type === 'user' ? 'white' : '#333',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              {msg.type === 'bot' && (
                <div style={{ fontSize: '20px', marginBottom: '5px' }}>
                  {msg.isFallback ? '📚' : '🤖'}
                </div>
              )}
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.5' }}>
                {msg.text}
              </div>
              {msg.isFallback && !msg.isError && (
                <div style={{ fontSize: '11px', color: '#ff9800', marginTop: '5px' }}>
                  ✨ Smart response
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '15px' }}>
            <div
              style={{
                background: 'white',
                padding: '12px 15px',
                borderRadius: '12px',
                display: 'flex',
                gap: '5px'
              }}
            >
              <span className="dot">●</span>
              <span className="dot">●</span>
              <span className="dot">●</span>
              <style>{`
                .dot {
                  animation: bounce 1.4s infinite;
                }
                .dot:nth-child(1) { animation-delay: 0s; }
                .dot:nth-child(2) { animation-delay: 0.2s; }
                .dot:nth-child(3) { animation-delay: 0.4s; }
                @keyframes bounce {
                  0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
                  30% { transform: translateY(-10px); opacity: 1; }
                }
              `}</style>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      <div
        style={{
          padding: '10px 15px',
          background: '#f9f9f9',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}
      >
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => setInputMessage(q)}
            style={{
              padding: '5px 10px',
              fontSize: '11px',
              background: '#e8eaf6',
              border: 'none',
              borderRadius: '15px',
              cursor: 'pointer',
              color: '#5e35b1'
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: '15px',
          background: 'white',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          gap: '10px'
        }}
      >
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about learning..."
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            resize: 'none',
            fontFamily: 'inherit',
            fontSize: '14px'
          }}
          rows="2"
        />
        <Button
          onClick={sendMessage}
          disabled={isLoading || !inputMessage.trim()}
          style={{
            padding: '0 20px',
            height: '45px',
            alignSelf: 'flex-end'
          }}
        >
          Send
        </Button>
      </div>
    </div>
  );
}

export default ChatAssistant;