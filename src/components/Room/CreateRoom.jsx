import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, generateRoomCode } from '../../lib/supabase';

export default function CreateRoom({ session, onBack }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    setLoading(true);

    let code;
    let attempts = 0;
    // Ensure unique code
    while (attempts < 10) {
      code = generateRoomCode();
      const { data } = await supabase.from('rooms').select('id').eq('code', code).maybeSingle();
      if (!data) break;
      attempts++;
    }

    const { data: room, error: err } = await supabase
      .from('rooms')
      .insert({
        code,
        name: name.trim(),
        campaign_preset: 'cursed_dungeon', // default, changed in lobby
        created_by: session.user.id,
        status: 'lobby',
      })
      .select()
      .single();

    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }

    navigate(`/game/${room.id}`);
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-deep)' }}>
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'var(--ember)', cursor: 'pointer', fontSize: '20px' }}
        >
          ←
        </button>
        <div className="realm-heading text-lg">Create a Room</div>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center flex-1 px-6">
        <form onSubmit={handleCreate} className="w-full max-w-sm">
          <div className="realm-card">
            <div
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                letterSpacing: '0.1em',
                marginBottom: '20px',
                textTransform: 'uppercase',
              }}
            >
              Name Your Party
            </div>

            <input
              type="text"
              className="realm-input mb-6"
              placeholder="e.g. The Doomed Fellowship"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={40}
              required
              autoFocus
            />

            <p
              style={{
                fontFamily: 'Crimson Text, serif',
                fontSize: '15px',
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
                marginBottom: '20px',
              }}
            >
              A 6-character room code will be generated. Share it with your party to let them join.
            </p>

            {error && (
              <div style={{ color: '#e87070', fontSize: '15px', marginBottom: '12px', fontFamily: 'Crimson Text, serif' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-ember w-full"
              disabled={loading || !name.trim()}
            >
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
