import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div
      className="flex flex-col items-center justify-center h-full px-6"
      style={{ background: 'var(--bg-deep)' }}
    >
      {/* Logo */}
      <div className="text-center mb-12">
        <div
          style={{
            fontFamily: 'Cinzel Decorative, serif',
            fontSize: '48px',
            fontWeight: 900,
            color: 'var(--gold)',
            textShadow: '0 0 30px rgba(201,168,76,0.4)',
            letterSpacing: '0.1em',
          }}
        >
          REALM
        </div>
        <div
          style={{
            fontFamily: 'Crimson Text, serif',
            fontSize: '18px',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
            marginTop: '4px',
          }}
        >
          An AI-powered group adventure
        </div>
      </div>

      {sent ? (
        <div className="realm-card text-center max-w-sm w-full">
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>✉️</div>
          <div className="realm-heading text-lg mb-2">Check Your Email</div>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'Crimson Text, serif', fontSize: '17px' }}>
            A magic link has been sent to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
            Click it to enter the Realm.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="realm-card">
            <div
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                letterSpacing: '0.1em',
                marginBottom: '16px',
                textTransform: 'uppercase',
              }}
            >
              Enter with Magic Link
            </div>

            <input
              type="email"
              className="realm-input mb-4"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />

            {error && (
              <div
                style={{
                  color: '#e87070',
                  fontFamily: 'Crimson Text, serif',
                  fontSize: '15px',
                  marginBottom: '12px',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-ember w-full"
              disabled={loading || !email}
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </div>

          <p
            style={{
              textAlign: 'center',
              color: 'var(--text-dim)',
              fontFamily: 'Crimson Text, serif',
              fontSize: '15px',
              marginTop: '16px',
              fontStyle: 'italic',
            }}
          >
            No password required. No account setup.
          </p>
        </form>
      )}

      {/* Decorative element */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: 'linear-gradient(to top, rgba(196,98,45,0.05), transparent)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
