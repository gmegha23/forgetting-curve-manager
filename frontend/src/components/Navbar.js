import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: ' Dashboard', icon: '📘', showWhenLoggedIn: true },
    { path: '/add-topic', label: ' Add Topic', icon: '➕', showWhenLoggedIn: true },
    { path: '/login', label: ' Login', icon: '🔐', showWhenLoggedIn: false },
    { path: '/register', label: 'Register', icon: '📝', showWhenLoggedIn: false },
  ];

  const visibleItems = navItems.filter(item => 
    item.showWhenLoggedIn === isLoggedIn
  );

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem 2rem',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Logo/Brand */}
        <div 
          onClick={() => isLoggedIn ? navigate('/dashboard') : navigate('/login')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <span style={{ fontSize: '28px' }}>🧠</span>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '20px', 
              color: 'white',
              fontWeight: 'bold'
            }}>
              Forgetting Curve Manager
            </h1>
            <p style={{ 
              margin: 0, 
              fontSize: '11px', 
              color: 'rgba(255,255,255,0.8)'
            }}>
              Smart Revision System
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {visibleItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                background: location.pathname === item.path 
                  ? 'rgba(255,255,255,0.2)' 
                  : 'transparent',
                border: 'none',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== item.path) {
                  e.target.style.background = 'transparent';
                }
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}

          {/* Logout Button - Only show when logged in */}
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.25)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.15)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <span>🚪</span>
              Logout
            </button>
          )}

          {/* User Info (Optional) */}
          {isLoggedIn && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.1)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '13px',
              color: 'white'
            }}>
              <span>👤</span>
              <span>User</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;