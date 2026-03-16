import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { LEVEL_NAMES, getXPProgress, XP_THRESHOLDS } from '../../lib/constants';

export default function InventoryModal({ player, onClose, onUseItem }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  const level = player.level || 1;
  const xpProgress = getXPProgress(player.xp || 0);
  const nextLevelXP = level < 5 ? XP_THRESHOLDS[level + 1] : null;

  useEffect(() => {
    loadInventory();
  }, [player.id]);

  async function loadInventory() {
    const { data } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('player_id', player.id)
      .order('acquired_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--bg-deep)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div className="realm-heading text-lg">⚔️ {player.name}'s Inventory</div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '24px',
            cursor: 'pointer',
          }}
        >
          ×
        </button>
      </div>

      {/* XP / Level bar */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '13px',
              color: 'var(--gold)',
              letterSpacing: '0.05em',
            }}
          >
            Level {level} · {LEVEL_NAMES[level]}
          </div>
          <div
            style={{
              fontFamily: 'Crimson Text, serif',
              fontSize: '14px',
              color: 'var(--text-secondary)',
            }}
          >
            {player.xp || 0} XP {nextLevelXP ? `/ ${nextLevelXP}` : '(MAX)'}
          </div>
        </div>
        <div className="xp-bar-track">
          <div className="xp-bar-fill" style={{ width: `${xpProgress * 100}%` }} />
        </div>
      </div>

      {/* Items grid */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '16px 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px', fontFamily: 'Crimson Text, serif', fontStyle: 'italic' }}>
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px', fontFamily: 'Crimson Text, serif', fontStyle: 'italic' }}>
            Your pack is empty. The adventure has only just begun.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                style={{
                  background: selectedItem?.id === item.id ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                  border: `1px solid ${selectedItem?.id === item.id ? 'var(--ember)' : 'var(--border)'}`,
                  borderRadius: '6px',
                  padding: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                {item.icon_url ? (
                  <img
                    src={item.icon_url}
                    alt={item.name}
                    style={{ width: '48px', height: '48px', borderRadius: '4px', marginBottom: '8px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      background: 'var(--bg-deep)',
                      borderRadius: '4px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                    }}
                  >
                    ✦
                  </div>
                )}
                <div
                  style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '12px',
                    color: 'var(--gold)',
                    marginBottom: '2px',
                    lineHeight: 1.3,
                  }}
                >
                  {item.name}
                </div>
                <div
                  style={{
                    fontFamily: 'Crimson Text, serif',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    fontStyle: 'italic',
                    lineHeight: 1.4,
                  }}
                >
                  {item.description}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Use item */}
      {selectedItem && (
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <button
            className="btn-ember w-full"
            onClick={() => {
              onUseItem && onUseItem(selectedItem);
              setSelectedItem(null);
              onClose();
            }}
          >
            Use "{selectedItem.name}" in Action
          </button>
        </div>
      )}
    </div>
  );
}
