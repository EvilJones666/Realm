import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { buildGMPrompt, buildMessageHistory } from '../../lib/gm';
import { CAMPAIGNS, TURN_DURATIONS } from '../../lib/constants';
import CampaignPicker from './CampaignPicker';

export default function Lobby({ room, myPlayer, session, onRoomUpdate }) {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [campaign, setCampaign] = useState(room.campaign_preset || 'cursed_dungeon');
  const [turnDuration, setTurnDuration] = useState(room.turn_duration_hours || 24);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [tab, setTab] = useState('players'); // 'players' | 'campaign'

  const isOwner = session.user.id === room.created_by;

  useEffect(() => {
    loadPlayers();
    const sub = supabase
      .channel(`lobby:${room.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${room.id}` }, () => {
        loadPlayers();
      })
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [room.id]);

  async function loadPlayers() {
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', room.id)
      .order('created_at');
    if (data) setPlayers(data);
  }

  async function handleSaveSettings() {
    setLoading(true);
    const { data: updated } = await supabase
      .from('rooms')
      .update({ campaign_preset: campaign, turn_duration_hours: turnDuration })
      .eq('id', room.id)
      .select()
      .single();
    if (updated) onRoomUpdate(updated);
    setLoading(false);
  }

  async function handleStartGame() {
    if (players.length < 1) return;
    setStarting(true);

    // Save settings first
    const { data: updatedRoom } = await supabase
      .from('rooms')
      .update({ campaign_preset: campaign, turn_duration_hours: turnDuration })
      .eq('id', room.id)
      .select()
      .single();

    const roomForGM = updatedRoom || room;

    // Assign turn order
    for (let i = 0; i < players.length; i++) {
      await supabase.from('players').update({ turn_order: i }).eq('id', players[i].id);
    }

    // Build GM prompt and call GM
    const systemPrompt = buildGMPrompt(roomForGM, players, []);
    const openingMessage = [{ role: 'user', content: 'Open the campaign. Set the scene dramatically. Describe where the party finds themselves. End with the party standing at their first decision point.' }];

    let gmResponse = null;
    try {
      const _gmRes = await fetch('/api/gm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, systemPrompt, messageHistory: openingMessage }),
      });
      const data = await _gmRes.json();
      if (_gmRes.ok) gmResponse = data;
    } catch (e) {
      console.error('GM error:', e);
    }

    // Save opening narrative message
    let imageUrl = null;
    if (gmResponse?.image_prompt) {
      try {
        const imgRes = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: gmResponse.image_prompt, type: 'scene' }),
        });
        const imgData = await imgRes.json();
        if (imgData?.base64) {
          const { uploadImage } = await import('../../lib/supabase');
          imageUrl = await uploadImage(imgData.base64, imgData.mimeType, 'images', `${room.id}-opening-${Date.now()}.jpg`);
        }
      } catch (e) {
        console.error('Image gen error:', e);
      }
    }

    await supabase.from('messages').insert({
      room_id: room.id,
      type: 'gm_narrative',
      content: gmResponse?.narrative || 'The adventure begins...',
      image_url: imageUrl,
    });

    // Set game active
    const firstPlayer = players[0];
    const turnExpiresAt = new Date(Date.now() + turnDuration * 3600 * 1000).toISOString();

    await supabase.from('rooms').update({
      status: 'active',
      current_turn_player_id: firstPlayer.id,
      turn_expires_at: turnExpiresAt,
    }).eq('id', room.id);

    setStarting(false);
  }

  const selectedCampaign = CAMPAIGNS.find(c => c.id === campaign);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-deep)' }}>
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div className="realm-heading text-xl">{room.name}</div>
          <div
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--ember)',
              letterSpacing: '0.2em',
            }}
          >
            {room.code}
          </div>
        </div>
        <div
          style={{
            fontFamily: 'Crimson Text, serif',
            fontSize: '14px',
            color: 'var(--text-dim)',
            fontStyle: 'italic',
          }}
        >
          Share this code with your party
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        {['players', 'campaign'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${tab === t ? 'var(--ember)' : 'transparent'}`,
              color: tab === t ? 'var(--ember-glow)' : 'var(--text-secondary)',
              fontFamily: 'Cinzel, serif',
              fontSize: '12px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
          >
            {t === 'players' ? `Players (${players.length})` : 'Campaign'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '16px 20px' }}>
        {tab === 'players' && (
          <div>
            {players.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  color: 'var(--text-dim)',
                  fontFamily: 'Crimson Text, serif',
                  fontStyle: 'italic',
                  padding: '40px 0',
                }}
              >
                Waiting for adventurers to join...
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {players.map(player => (
                  <div key={player.id} className="realm-card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {player.portrait_url ? (
                      <img
                        src={player.portrait_url}
                        alt={player.name}
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '48px', height: '48px', borderRadius: '50%',
                          background: 'var(--bg-surface)', border: '2px solid var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '22px',
                        }}
                      >
                        {player.archetype === 'warrior' ? '⚔️' :
                         player.archetype === 'rogue' ? '🗡️' :
                         player.archetype === 'mage' ? '🔮' :
                         player.archetype === 'ranger' ? '🏹' : '✝️'}
                      </div>
                    )}
                    <div>
                      <div
                        style={{
                          fontFamily: 'Cinzel, serif',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--gold)',
                        }}
                      >
                        {player.name}
                      </div>
                      <div
                        style={{
                          fontFamily: 'Crimson Text, serif',
                          fontSize: '14px',
                          color: 'var(--text-secondary)',
                          fontStyle: 'italic',
                        }}
                      >
                        {player.archetype.charAt(0).toUpperCase() + player.archetype.slice(1)}
                      </div>
                    </div>
                    {player.user_id === room.created_by && (
                      <div
                        style={{
                          marginLeft: 'auto',
                          fontFamily: 'Cinzel, serif',
                          fontSize: '10px',
                          color: 'var(--ember)',
                          letterSpacing: '0.05em',
                        }}
                      >
                        HOST
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'campaign' && (
          <div>
            {isOwner ? (
              <>
                <CampaignPicker selected={campaign} onChange={setCampaign} />

                <div style={{ marginTop: '20px', marginBottom: '8px' }}>
                  <div
                    style={{
                      fontFamily: 'Cinzel, serif',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: '12px',
                    }}
                  >
                    Turn Timer
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {TURN_DURATIONS.map(d => (
                      <button
                        key={d.value}
                        onClick={() => setTurnDuration(d.value)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: turnDuration === d.value ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                          border: `1px solid ${turnDuration === d.value ? 'var(--ember)' : 'var(--border)'}`,
                          borderRadius: '4px',
                          color: turnDuration === d.value ? 'var(--ember-glow)' : 'var(--text-secondary)',
                          fontFamily: 'Crimson Text, serif',
                          fontSize: '15px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  className="btn-ghost w-full"
                  style={{ marginTop: '12px' }}
                  onClick={handleSaveSettings}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </>
            ) : (
              <div className="realm-card">
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{selectedCampaign?.emoji}</div>
                <div className="realm-heading text-base mb-2">{selectedCampaign?.name}</div>
                <div style={{ fontFamily: 'Crimson Text, serif', fontSize: '16px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  {selectedCampaign?.description}
                </div>
                <div style={{ marginTop: '12px', fontFamily: 'Crimson Text, serif', fontSize: '14px', color: 'var(--text-dim)' }}>
                  Turn timer: {TURN_DURATIONS.find(d => d.value === room.turn_duration_hours)?.label || '24 hours'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        {isOwner ? (
          <button
            className="btn-ember w-full"
            style={{ fontSize: '16px', padding: '16px' }}
            onClick={handleStartGame}
            disabled={starting || players.length < 1}
          >
            {starting ? 'Summoning the GM...' : '⚔️ Begin Adventure'}
          </button>
        ) : (
          <div
            style={{
              textAlign: 'center',
              fontFamily: 'Crimson Text, serif',
              fontSize: '16px',
              color: 'var(--text-secondary)',
              fontStyle: 'italic',
            }}
          >
            Waiting for the party leader to begin...
          </div>
        )}
      </div>
    </div>
  );
}
