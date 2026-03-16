import React, { useEffect, useState } from 'react';

const SurpriseDaisy: React.FC = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 8000); // Effect lasts 8 seconds
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999,
      pointerEvents: 'none',
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(2px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      animation: 'fadeOut 1s ease-in-out forwards 7s'
    }}>
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0.3; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes fadeOut {
          to { opacity: 0; visibility: hidden; }
        }
        @keyframes textGlow {
          0%, 100% { text-shadow: 0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,215,0,0.4); }
          50% { text-shadow: 0 0 20px rgba(255,255,255,1), 0 0 40px rgba(255,215,0,0.6); }
        }
        .daisy {
          position: absolute;
          width: 40px;
          height: 40px;
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="15" fill="%23FFD700"/><path d="M50 35 L50 5 Q40 5 40 20 Q40 35 50 35 Z" fill="white"/><path d="M50 65 L50 95 Q60 95 60 80 Q60 65 50 65 Z" fill="white"/><path d="M35 50 L5 50 Q5 60 20 60 Q35 60 35 50 Z" fill="white"/><path d="M65 50 L95 50 Q95 40 80 40 Q65 40 65 50 Z" fill="white"/><path d="M39.4 39.4 L18.2 18.2 Q11.1 25.3 21.7 35.9 Q32.3 46.5 39.4 39.4 Z" fill="white"/><path d="M60.6 60.6 L81.8 81.8 Q88.9 74.7 78.3 64.1 Q67.7 53.5 60.6 60.6 Z" fill="white"/><path d="M39.4 60.6 L18.2 81.8 Q25.3 88.9 35.9 78.3 Q46.5 67.7 39.4 60.6 Z" fill="white"/><path d="M60.6 39.4 L81.8 18.2 Q74.7 11.1 64.1 21.7 Q53.5 32.3 60.6 39.4 Z" fill="white"/></svg>');
          background-size: contain;
          background-repeat: no-repeat;
        }
      `}</style>
      
      {/* Generate 20 daisies */}
      {Array.from({ length: 25 }).map((_, i) => (
        <div
          key={i}
          className="daisy"
          style={{
            left: `${Math.random() * 100}vw`,
            animation: `fall ${3 + Math.random() * 4}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: 0,
            scale: 0.5 + Math.random() * 1.5,
          }}
        />
      ))}

      <div style={{
        textAlign: 'center',
        padding: '40px',
        borderRadius: '30px',
        background: 'rgba(255,255,255,0.7)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.3)',
        animation: 'float 4s ease-in-out infinite',
        zIndex: 10
      }}>
        <h1 style={{
          fontSize: '64px',
          fontFamily: "'Dancing Script', 'Pacifico', cursive",
          color: '#2c3e50',
          margin: 0,
          background: 'linear-gradient(45deg, #11998e, #38ef7d)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'textGlow 3s ease-in-out infinite'
        }}>
          Salom Romashka 🌼
        </h1>
        <p style={{
          fontSize: '24px',
          color: '#7f8c8d',
          marginTop: '10px',
          fontWeight: 300
        }}>
          Siz uchun maxsus guldasta...
        </p>
      </div>
    </div>
  );
};

export default SurpriseDaisy;
