import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function JoinRoom({ session, onBack }) {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleJoin(e) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) {
      setError('Room codes are 6 characters.');
      return;
    }
    setError('');
    setLoading(true);

    const { data: room, error: err } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', trimmed)
      .maybeSingle();

    setLoading(false);

    if (err || !room) {
      setError('No room found with that code.');
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
        <div className="realm-heading text-lg">Join a Room</div>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center flex-1 px-6">
        <form onSubmit={handleJoin} className="w-full max-w-sm">
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
              Enter Room Code
            </div>

            <input
              type="text"
              className="realm-input mb-6"
              placeholder="XXXXXX"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
              maxLength={6}
              required
              autoFocus
              style={{ textAlign: 'center', fontSize: '28px', letterSpacing: '0.3em', fontFamily: 'Cinzel, serif' }}
            />

            {error && (
              <div style={{ color: '#e87070', fontSize: '15px', marginBottom: '12px', fontFamily: 'Crimson Text, serif' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-ember w-full"
              disabled={loading || code.trim().length !== 6}
            >
              {loading ? 'Finding Room...' : 'Enter the Realm'}
            </button>
          </div>

          <p
            style={{
              textAlign: 'center',
              fontFamily: 'Crimson Text, serif',
              fontSize: '15px',
              color: 'var(--text-dim)',
              fontStyle: 'italic',
              marginTop: '16px',
            }}
          >
            Get the code from your party leader.
          </p>
        </form>
      </div>
    </div>
  );
}
