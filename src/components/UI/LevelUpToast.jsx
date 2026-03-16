import { useEffect, useState } from 'react';
import { LEVEL_NAMES } from '../../lib/constants';

export default function LevelUpToast({ level, skill, playerName, onDismiss }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const ps = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 0.8 + Math.random() * 0.8,
    }));
    setParticles(ps);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.92)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
      }}
    >
      {/* Gold particles */}
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            bottom: '30%',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--gold)',
            animation: `particle-float ${p.duration}s ease-out ${p.delay}s both`,
          }}
        />
      ))}

      {/* Content */}
      <div className="animate-level-up" style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: '64px',
            marginBottom: '12px',
            filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.6))',
          }}
        >
          ⚔️
        </div>

        <div
          style={{
            fontFamily: 'Cinzel Decorative, serif',
            fontSize: '36px',
            fontWeight: 900,
            color: 'var(--gold-light)',
            textShadow: '0 0 40px rgba(201,168,76,0.6)',
            letterSpacing: '0.1em',
            marginBottom: '8px',
          }}
        >
          LEVEL UP
        </div>

        <div
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '20px',
            color: 'var(--text-primary)',
            marginBottom: '4px',
          }}
        >
          {playerName}
        </div>

        <div
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '14px',
            color: 'var(--gold)',
            letterSpacing: '0.1em',
            marginBottom: '32px',
          }}
        >
          Level {level} · {LEVEL_NAMES[level]}
        </div>

        {skill && (
          <div
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--ember)',
              borderRadius: '8px',
              padding: '16px 24px',
              marginBottom: '32px',
              boxShadow: '0 0 20px rgba(196,98,45,0.3)',
            }}
          >
            <div
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '12px',
                color: 'var(--ember)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              New Skill Unlocked
            </div>
            <div
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '18px',
                color: 'var(--gold-light)',
                fontWeight: 700,
              }}
            >
              ✦ {skill}
            </div>
          </div>
        )}

        <button className="btn-ember" onClick={onDismiss} style={{ minWidth: '160px' }}>
          Continue
        </button>
      </div>
    </div>
  );
}
