import { ARCHETYPES, LEVEL_NAMES, getXPProgress, XP_THRESHOLDS } from '../../lib/constants';

export default function CharacterCard({ player, onClose }) {
  const archetype = ARCHETYPES[player.archetype];
  const xpProgress = getXPProgress(player.xp || 0);
  const level = player.level || 1;
  const nextLevelXP = level < 5 ? XP_THRESHOLDS[level + 1] : null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px 12px 0 0',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'y-auto',
          padding: '20px',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div
          style={{
            width: '40px',
            height: '4px',
            background: 'var(--border)',
            borderRadius: '2px',
            margin: '0 auto 20px',
          }}
        />

        {/* Portrait + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          {player.portrait_url ? (
            <img
              src={player.portrait_url}
              alt={player.name}
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--border)',
              }}
            />
          ) : (
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'var(--bg-elevated)',
                border: '2px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
              }}
            >
              {archetype.emoji}
            </div>
          )}
          <div>
            <div
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '18px',
                fontWeight: 700,
                color: player.status === 'dead' ? 'var(--text-dim)' : 'var(--gold)',
                marginBottom: '2px',
              }}
            >
              {player.name}
              {player.status === 'dead' && ' ☠️'}
            </div>
            <div
              style={{
                fontFamily: 'Crimson Text, serif',
                fontSize: '15px',
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
              }}
            >
              {archetype.emoji} {archetype.label} · Level {level} {LEVEL_NAMES[level]}
            </div>
          </div>
        </div>

        {/* Description */}
        <div
          style={{
            fontFamily: 'Crimson Text, serif',
            fontSize: '16px',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
            marginBottom: '20px',
            padding: '12px',
            background: 'var(--bg-elevated)',
            borderRadius: '4px',
            border: '1px solid var(--border)',
          }}
        >
          "{player.description}"
        </div>

        {/* XP Bar */}
        {player.status === 'alive' && (
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'Cinzel, serif',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                letterSpacing: '0.08em',
                marginBottom: '6px',
              }}
            >
              <span>XP: {player.xp || 0}</span>
              {nextLevelXP && <span>Next level: {nextLevelXP}</span>}
              {!nextLevelXP && <span style={{ color: 'var(--gold)' }}>MAX LEVEL</span>}
            </div>
            <div className="xp-bar-track">
              <div className="xp-bar-fill" style={{ width: `${xpProgress * 100}%` }} />
            </div>
          </div>
        )}

        {/* Skills */}
        {player.unlocked_skills && player.unlocked_skills.length > 0 && (
          <div>
            <div
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              Unlocked Skills
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {player.unlocked_skills.map(skillName => {
                // Find skill details
                const skillDetail = Object.values(archetype.skills || {}).find(s => s.name === skillName);
                return (
                  <div
                    key={skillName}
                    style={{
                      padding: '10px 12px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'Cinzel, serif',
                        fontSize: '13px',
                        color: 'var(--ember-glow)',
                        marginBottom: '2px',
                      }}
                    >
                      ✦ {skillName}
                    </div>
                    {skillDetail && (
                      <div
                        style={{
                          fontFamily: 'Crimson Text, serif',
                          fontSize: '14px',
                          color: 'var(--text-secondary)',
                          fontStyle: 'italic',
                        }}
                      >
                        {skillDetail.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          className="btn-ghost w-full"
          style={{ marginTop: '20px' }}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
