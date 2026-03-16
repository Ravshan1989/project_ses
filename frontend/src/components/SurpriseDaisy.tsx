import React, { useEffect, useState } from 'react';

const SurpriseDaisy: React.FC = () => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, 12000); // Cinematic version lasts longer
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
            background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(200,240,255,0.1) 100%)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            animation: 'fadeOut 1.5s ease-in-out forwards 10.5s'
        }}>
            <style>{`
                @keyframes bloomLeft {
                    0% { transform: translateX(-100%) rotate(-45deg) scale(0.5); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateX(-20%) rotate(0deg) scale(1); opacity: 1; }
                }
                @keyframes bloomRight {
                    0% { transform: translateX(100%) rotate(45deg) scale(0.5); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateX(20%) rotate(0deg) scale(1); opacity: 1; }
                }
                @keyframes petalFall {
                    0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.8; }
                    100% { transform: translateY(110vh) translateX(50px) rotate(720deg); opacity: 0; }
                }
                @keyframes heartFloat {
                    0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
                    50% { opacity: 0.6; }
                    100% { transform: translateY(-20vh) scale(1.2); opacity: 0; }
                }
                @keyframes textDraw {
                    0% { filter: blur(10px); opacity: 0; transform: scale(0.9); }
                    100% { filter: blur(0); opacity: 1; transform: scale(1); }
                }
                @keyframes floatCard {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes fadeOut {
                    to { opacity: 0; visibility: hidden; }
                }
                .daisy-static {
                    position: absolute;
                    width: 250px;
                    height: 250px;
                    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="15" fill="%23FFD700"/><path d="M50 35 L50 5 Q40 5 40 20 Q40 35 50 35 Z" fill="white"/><path d="M50 65 L50 95 Q60 95 60 80 Q60 65 50 65 Z" fill="white"/><path d="M35 50 L5 50 Q5 60 20 60 Q35 60 35 50 Z" fill="white"/><path d="M65 50 L95 50 Q95 40 80 40 Q65 40 65 50 Z" fill="white"/><path d="M39.4 39.4 L18.2 18.2 Q11.1 25.3 21.7 35.9 Q32.3 46.5 39.4 39.4 Z" fill="white"/><path d="M60.6 60.6 L81.8 81.8 Q88.9 74.7 78.3 64.1 Q67.7 53.5 60.6 60.6 Z" fill="white"/><path d="M39.4 60.6 L18.2 81.8 Q25.3 88.9 35.9 78.3 Q46.5 67.7 39.4 60.6 Z" fill="white"/><path d="M60.6 39.4 L81.8 18.2 Q74.7 11.1 64.1 21.7 Q53.5 32.3 60.6 39.4 Z" fill="white"/></svg>');
                    background-size: contain;
                    background-repeat: no-repeat;
                    z-index: 5;
                }
                .petal {
                    position: absolute;
                    width: 15px;
                    height: 20px;
                    background: white;
                    border-radius: 50% 0 50% 50%;
                    opacity: 0.6;
                }
                .heart {
                    position: absolute;
                    color: rgba(255, 105, 180, 0.4);
                    font-size: 20px;
                }
            `}</style>

            {/* Side Daisies */}
            <div className="daisy-static" style={{ left: 0, bottom: '10%', animation: 'bloomLeft 2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }} />
            <div className="daisy-static" style={{ right: 0, top: '10%', animation: 'bloomRight 2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }} />

            {/* Petal Rain */}
            {Array.from({ length: 40 }).map((_, i) => (
                <div
                    key={`petal-${i}`}
                    className="petal"
                    style={{
                        left: `${Math.random() * 100}vw`,
                        animation: `petalFall ${4 + Math.random() * 5}s linear infinite`,
                        animationDelay: `${Math.random() * 10}s`,
                    }}
                />
            ))}

            {/* Floating Hearts */}
            {Array.from({ length: 15 }).map((_, i) => (
                <div
                    key={`heart-${i}`}
                    className="heart"
                    style={{
                        left: `${Math.random() * 100}vw`,
                        animation: `heartFloat ${6 + Math.random() * 4}s ease-in infinite`,
                        animationDelay: `${Math.random() * 8}s`,
                    }}
                >❤️</div>
            ))}

            <div style={{
                textAlign: 'center',
                padding: '60px 80px',
                borderRadius: '40px',
                background: 'rgba(255,255,255,0.75)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1), inset 0 0 20px rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.4)',
                animation: 'floatCard 5s ease-in-out infinite, textDraw 1.5s ease-out forwards',
                zIndex: 10,
                position: 'relative'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#fff',
                    borderRadius: '50%',
                    padding: '10px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}>
                    🌼
                </div>
                <h1 style={{
                    fontSize: '72px',
                    fontFamily: "'Dancing Script', 'Pacifico', cursive",
                    margin: 0,
                    background: 'linear-gradient(45deg, #11998e, #38ef7d, #11998e)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                    letterSpacing: '2px'
                }}>
                    Salom Romashka
                </h1>
                <div style={{
                    width: '100px',
                    height: '2px',
                    background: 'linear-gradient(to right, transparent, #38ef7d, transparent)',
                    margin: '20px auto'
                }} />
                <p style={{
                    fontSize: '28px',
                    color: '#5c7c7d',
                    marginTop: '10px',
                    fontWeight: 400,
                    fontStyle: 'italic',
                    opacity: 0.8
                }}>
                    Bu mo''jiza faqat siz uchun! ✨🌼
                </p>
            </div>
        </div>
    );
};

export default SurpriseDaisy;
