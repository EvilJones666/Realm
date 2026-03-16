import { useState } from 'react';
import { ARCHETYPES } from '../../lib/constants';
import InventoryModal from '../Character/InventoryModal';

export default function ActionInput({ myPlayer, isMyTurn, onSubmit, disabled }) {
  const [action, setAction] = useState('');
  const [showInventory, setShowInventory] = useState(false);
  const archetype = ARCHETYPES[myPlayer.archetype];

  function handleSubmit(e) {
    e.preventDefault();
    if (!action.trim() || !isMyTurn || disabled) return;
    onSubmit(action.trim());
    setAction('');
  }

  function handleUseItem(item) {
    setAction(`I use the ${item.name}. ${item.description}`);
  }

  function handleSkillTap(skillName) {
    setAction(`I use ${skillName}. `);
  }

  const unlockedSkills = myPlayer.unlocked_skills || [];

  if (myPlayer.status === 'dead') {
    return (
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'Crimson Text, serif',
            fontSize: '16px',
            color: 'var(--text-dim)',
            fontStyle: 'italic',
          }}
        >
          ☠️ You have fallen. Your story ends here.
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        {/* Skills quick-access */}
        {isMyTurn && unlockedSkills.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '6px',
              padding: '8px 12px 0',
              overflowX: 'auto',
            }}
          >
            {unlockedSkills.map(skillName => (
              <button
                key={skillName}
                onClick={() => handleSkillTap(skillName)}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--ember)',
                  borderRadius: '16px',
                  padding: '4px 12px',
                  color: 'var(--ember-glow)',
                  fontFamily: 'Crimson Text, serif',
                  fontSize: '13px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                ✦ {skillName}
              </button>
            ))}
          </div>
        )}

        {/* Input row */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '10px 12px' }}>
          {/* Inventory button */}
          <button
            type="button"
            onClick={() => setShowInventory(true)}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            title="Open Inventory"
          >
            🎒
          </button>

          {/* Text input */}
          <div style={{ flex: 1 }}>
            {isMyTurn ? (
              <textarea
                value={action}
                onChange={e => setAction(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder={`What does ${myPlayer.name} do?`}
                rows={2}
                disabled={disabled}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--ember)',
                  color: 'var(--text-primary)',
                  fontFamily: 'Crimson Text, serif',
                  fontSize: '17px',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  width: '100%',
                  resize: 'none',
                  outline: 'none',
                  boxShadow: '0 0 8px rgba(196,98,45,0.2)',
                }}
              />
            ) : (
              <div
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontFamily: 'Crimson Text, serif',
                  fontSize: '15px',
                  color: 'var(--text-dim)',
                  fontStyle: 'italic',
                }}
              >
                Waiting for another player's turn...
              </div>
            )}
          </div>

          {/* Send button */}
          {isMyTurn && (
            <button
              type="submit"
              disabled={!action.trim() || disabled}
              style={{
                background: action.trim() && !disabled ? 'var(--ember)' : 'var(--bg-elevated)',
                border: 'none',
                borderRadius: '8px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: action.trim() && !disabled ? 'pointer' : 'not-allowed',
                flexShrink: 0,
                transition: 'background 0.2s',
                fontSize: '18px',
              }}
            >
              →
            </button>
          )}
        </form>
      </div>

      {showInventory && (
        <InventoryModal
          player={myPlayer}
          onClose={() => setShowInventory(false)}
          onUseItem={handleUseItem}
        />
      )}
    </>
  );
}
