import { useState } from 'react';
import { ARCHETYPES } from '../../lib/constants';
import CharacterCard from '../Character/CharacterCard';

export default function TurnIndicator({ players, currentTurnPlayerId, room }) {
  const [viewingPlayer, setViewingPlayer] = useState(null);

  const alivePlayers = players.filter(p => p.status !== 'dead');
  const deadPlayers = players.filter(p => p.status === 'dead');
  const allDisplayed = [...alivePlayers, ...deadPlayers];

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          overflowX: 'auto',
        }}
      >
        {allDisplayed.map(player => {
          const isActive = player.id === currentTurnPlayerId;
          const isDead = player.status === 'dead';
          const archetype = ARCHETYPES[player.archetype];

          return (
            <button
              key={player.id}
              onClick={() => setViewingPlayer(player)}
              style={{
                position: 'relative',
                background: 'none',
                border: 'none',
                padding: '0',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {player.portrait_url ? (
                <img
                  src={player.portrait_url}
                  alt={player.name}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: `2px solid ${isActive ? 'var(--ember)' : 'var(--border)'}`,
                    filter: isDead ? 'grayscale(100%) brightness(0.4)' : 'none',
                    boxShadow: isActive ? '0 0 12px rgba(196,98,45,0.6)' : 'none',
                  }}
                  className={isActive ? 'animate-ember-pulse' : ''}
                />
              ) : (
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--bg-elevated)',
                    border: `2px solid ${isActive ? 'var(--ember)' : 'var(--border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    filter: isDead ? 'grayscale(100%) brightness(0.4)' : 'none',
                    boxShadow: isActive ? '0 0 12px rgba(196,98,45,0.6)' : 'none',
                  }}
                  className={isActive ? 'animate-ember-pulse' : ''}
                >
                  {isDead ? '☠️' : archetype.emoji}
                </div>
              )}

              {/* Dead skull overlay */}
              {isDead && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                  }}
                >
                  ☠️
                </div>
              )}

              {/* Name label */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-16px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '9px',
                  color: isActive ? 'var(--ember-glow)' : 'var(--text-dim)',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.02em',
                }}
              >
                {player.name.split(' ')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {viewingPlayer && (
        <CharacterCard player={viewingPlayer} onClose={() => setViewingPlayer(null)} />
      )}
    </>
  );
}
