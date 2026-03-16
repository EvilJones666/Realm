import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function usePlayers(roomId) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;
    loadPlayers();

    const sub = supabase
      .channel(`players:${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, () => {
        loadPlayers();
      })
      .subscribe();

    return () => supabase.removeChannel(sub);
  }, [roomId]);

  async function loadPlayers() {
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomId)
      .order('turn_order');
    setPlayers(data || []);
    setLoading(false);
  }

  return { players, loading, setPlayers };
}
