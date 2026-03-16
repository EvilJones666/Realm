import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useRoom(roomId) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roomId) return;
    loadRoom();

    const sub = supabase
      .channel(`room-hook:${roomId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, payload => {
        setRoom(payload.new);
      })
      .subscribe();

    return () => supabase.removeChannel(sub);
  }, [roomId]);

  async function loadRoom() {
    setLoading(true);
    const { data, error } = await supabase.from('rooms').select('*').eq('id', roomId).single();
    if (error) setError(error.message);
    else setRoom(data);
    setLoading(false);
  }

  return { room, loading, error, setRoom };
}
