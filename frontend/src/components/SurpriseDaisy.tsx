import React, { useEffect, useState } from 'react';

const SurpriseDaisy: React.FC = () => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, 15000); // Ultimate version lasts 15 seconds
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
            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(179,229,252,0.2) 50%, rgba(255,255,255,0.4) 100%)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            animation: 'fadeOut 2s ease-in-out forwards 13s'
        }}>
            <style>{`
                @keyframes fall {
                    0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
                }
                @keyframes bloomLeft {
                    0% { transform: translateX(-100%) rotate(-45deg) scale(0.5); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateX(-15%) rotate(0deg) scale(0.8); opacity: 1; }
                }
                @keyframes bloomRight {
                    0% { transform: translateX(100%) rotate(45deg) scale(0.5); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateX(15%) rotate(0deg) scale(0.8); opacity: 1; }
                }
                @keyframes sparkle {
                    0%, 100% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1); opacity: 0.8; }
                }
                @keyframes floatCard {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    33% { transform: translateY(-15px) rotate(1deg); }
                    66% { transform: translateY(5px) rotate(-1deg); }
                }
                @keyframes shine {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }
                @keyframes fadeOut {
                    to { opacity: 0; visibility: hidden; }
                }
                .daisy-icon {
                    position: absolute;
                    width: 50px;
                    height: 50px;
                    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="15" fill="%23FFD700"/><path d="M50 35 L50 5 Q40 5 40 20 Q40 35 50 35 Z" fill="white"/><path d="M50 65 L50 95 Q60 95 60 80 Q60 65 50 65 Z" fill="white"/><path d="M35 50 L5 50 Q5 60 20 60 Q35 60 35 50 Z" fill="white"/><path d="M65 50 L95 50 Q95 40 80 40 Q65 40 65 50 Z" fill="white"/><path d="M39.4 39.4 L18.2 18.2 Q11.1 25.3 21.7 35.9 Q32.3 46.5 39.4 39.4 Z" fill="white"/><path d="M60.6 60.6 L81.8 81.8 Q88.9 74.7 78.3 64.1 Q67.7 53.5 60.6 60.6 Z" fill="white"/><path d="M39.4 60.6 L18.2 81.8 Q25.3 88.9 35.9 78.3 Q46.5 67.7 39.4 60.6 Z" fill="white"/><path d="M60.6 39.4 L81.8 18.2 Q74.7 11.1 64.1 21.7 Q53.5 32.3 60.6 39.4 Z" fill="white"/></svg>');
                    background-size: contain;
                    background-repeat: no-repeat;
                }
                .sparkle {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: white;
                    border-radius: 50%;
                    box-shadow: 0 0 10px white, 0 0 20px #FFD700;
                }
                .shine-overlay {
                    position: absolute;
                    top: 0;
                    width: 50px;
                    height: 100%;
                    background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%);
                    transform: skewX(-25deg);
                    animation: shine 3s infinite;
                }
            `}</style>

            {/* Side Daisies (Refined scale) */}
            <div className="daisy-icon" style={{ left: '-50px', bottom: '15%', width: '200px', height: '200px', transform: 'rotate(-20deg)', animation: 'bloomLeft 2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }} />
            <div className="daisy-icon" style={{ right: '-50px', top: '15%', width: '200px', height: '200px', transform: 'rotate(20deg)', animation: 'bloomRight 2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }} />

            {/* Falling Full Daisies (v1 improved) */}
            {Array.from({ length: 30 }).map((_, i) => (
                <div
                    key={`fall-${i}`}
                    className="daisy-icon"
                    style={{
                        left: `${Math.random() * 100}vw`,
                        animation: `fall ${5 + Math.random() * 5}s linear infinite`,
                        animationDelay: `${Math.random() * 10}s`,
                        width: `${30 + Math.random() * 30}px`,
                        height: `${30 + Math.random() * 30}px`,
                        opacity: 0
                    }}
                />
            ))}

            {/* Magical Sparkles Background */}
            {Array.from({ length: 50 }).map((_, i) => (
                <div
                    key={`sparkle-${i}`}
                    className="sparkle"
                    style={{
                        left: `${Math.random() * 100}vw`,
                        top: `${Math.random() * 100}vh`,
                        animation: `sparkle ${2 + Math.random() * 3}s infinite`,
                        animationDelay: `${Math.random() * 5}s`,
                    }}
                />
            ))}

            <div style={{
                textAlign: 'center',
                padding: '50px 70px',
                borderRadius: '35px',
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.5)',
                animation: 'floatCard 6s ease-in-out infinite, textDraw 1.5s ease-out forwards',
                zIndex: 10,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div className="shine-overlay" />
                <div style={{
                    fontSize: '80px',
                    fontFamily: "'Dancing Script', 'Pacifico', cursive",
                    margin: 0,
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #11998e, #38ef7d, #2c3e50, #11998e)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'textGlow 3s ease-in-out infinite',
                    padding: '10px'
                }}>
                    Salom Romashka 🌼
                </div>
                <div style={{
                    width: '120px',
                    height: '3px',
                    background: 'linear-gradient(90deg, transparent, #38ef7d, #11998e, transparent)',
                    margin: '15px auto'
                }} />
                <p style={{
                    fontSize: '32px',
                    color: '#2c3e50',
                    marginTop: '15px',
                    fontWeight: 300,
                    letterSpacing: '1px',
                    fontStyle: 'italic'
                }}>
                    Siz uchun eng mahsus mo''jiza ✨❤️
                </p>
            </div>
        </div>
    );
};

export default SurpriseDaisy;
