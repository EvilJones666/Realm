import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Lobby from '../components/Room/Lobby';
import ChatRoom from '../components/Chat/ChatRoom';
import CharacterCreate from '../components/Character/CharacterCreate';

export default function Game({ session }) {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [myPlayer, setMyPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRoom();
    // Subscribe to room changes
    const sub = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, payload => {
        setRoom(payload.new);
      })
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [roomId]);

  async function loadRoom() {
    setLoading(true);
    const { data: roomData, error: roomErr } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomErr || !roomData) {
      setError('Room not found.');
      setLoading(false);
      return;
    }
    setRoom(roomData);

    // Check if user already has a player in this room
    const { data: playerData } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', session.user.id)
      .maybeSingle();

    setMyPlayer(playerData);
    setLoading(false);
  }

  function handlePlayerCreated(player) {
    setMyPlayer(player);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: 'var(--bg-deep)' }}>
        <div className="realm-heading text-xl animate-pulse">Entering the Realm...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4" style={{ background: 'var(--bg-deep)' }}>
        <div style={{ color: '#e87070', fontFamily: 'Crimson Text, serif', fontSize: '18px' }}>{error}</div>
        <button className="btn-ghost" onClick={() => navigate('/')}>← Back to Home</button>
      </div>
    );
  }

  // Need to create character first
  if (!myPlayer) {
    return (
      <CharacterCreate
        room={room}
        session={session}
        onCreated={handlePlayerCreated}
        onBack={() => navigate('/')}
      />
    );
  }

  // In lobby
  if (room.status === 'lobby') {
    return (
      <Lobby
        room={room}
        myPlayer={myPlayer}
        session={session}
        onRoomUpdate={setRoom}
      />
    );
  }

  // Game active
  return (
    <ChatRoom
      room={room}
      myPlayer={myPlayer}
      session={session}
    />
  );
}
