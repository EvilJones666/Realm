import { useState } from 'react';
import { supabase } from '../lib/supabase';
import CreateRoom from '../components/Room/CreateRoom';
import JoinRoom from '../components/Room/JoinRoom';

export default function Home({ session }) {
  const [view, setView] = useState('home'); // 'home' | 'create' | 'join'

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  if (view === 'create') return <CreateRoom session={session} onBack={() => setView('home')} />;
  if (view === 'join') return <JoinRoom session={session} onBack={() => setView('home')} />;

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: 'var(--bg-deep)' }}
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
        <div
          style={{
            fontFamily: 'Cinzel Decorative, serif',
            fontSize: '22px',
            fontWeight: 900,
            color: 'var(--gold)',
            letterSpacing: '0.08em',
          }}
        >
          REALM
        </div>
        <button
          onClick={handleSignOut}
          style={{
            fontFamily: 'Crimson Text, serif',
            fontSize: '14px',
            color: 'var(--text-dim)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Sign out
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center flex-1 px-6">
        {/* Hero */}
        <div className="text-center mb-12">
          <div
            style={{
              fontSize: '64px',
              marginBottom: '16px',
              filter: 'drop-shadow(0 0 20px rgba(196,98,45,0.5))',
            }}
          >
            ⚔️
          </div>
          <h1
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '8px',
            }}
          >
            Your Adventure Awaits
          </h1>
          <p
            style={{
              fontFamily: 'Crimson Text, serif',
              fontSize: '18px',
              color: 'var(--text-secondary)',
              fontStyle: 'italic',
              maxWidth: '300px',
            }}
          >
            Gather your party. Claude is your Game Master.
          </p>
        </div>

        {/* Actions */}
        <div className="w-full max-w-xs flex flex-col gap-4">
          <button
            className="btn-ember w-full"
            style={{ fontSize: '16px', padding: '16px' }}
            onClick={() => setView('create')}
          >
            ⚔️ Create a Room
          </button>
          <button
            className="btn-ghost w-full"
            style={{ fontSize: '16px', padding: '15px' }}
            onClick={() => setView('join')}
          >
            🗝️ Join a Room
          </button>
        </div>

        {/* Signed in as */}
        <p
          style={{
            marginTop: '40px',
            fontFamily: 'Crimson Text, serif',
            fontSize: '14px',
            color: 'var(--text-dim)',
            fontStyle: 'italic',
          }}
        >
          {session.user.email}
        </p>
      </div>

      {/* Bottom gradient */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '150px',
          background: 'linear-gradient(to top, rgba(196,98,45,0.04), transparent)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
