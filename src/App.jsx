import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Game from './pages/Game';

export default function App() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: 'var(--bg-deep)' }}>
        <div className="text-center">
          <div className="realm-heading text-2xl mb-2">⚔️ REALM</div>
          <div style={{ color: 'var(--text-dim)', fontFamily: 'Crimson Text, serif' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={session ? <Navigate to="/" /> : <Auth />} />
        <Route path="/" element={session ? <Home session={session} /> : <Navigate to="/auth" />} />
        <Route path="/game/:roomId" element={session ? <Game session={session} /> : <Navigate to="/auth" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
