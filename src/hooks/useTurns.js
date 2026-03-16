import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useTurns(room, players, myPlayerId) {
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!room || !players.length) return;
    const active = players.find(p => p.id === room.current_turn_player_id);
    setCurrentPlayer(active || null);
    setIsMyTurn(room.current_turn_player_id === myPlayerId);
  }, [room, players, myPlayerId]);

  useEffect(() => {
    if (!room?.turn_expires_at) return;
    const update = () => {
      const remaining = new Date(room.turn_expires_at) - new Date();
      setTimeLeft(remaining > 0 ? remaining : 0);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [room?.turn_expires_at]);

  function formatTimeLeft(ms) {
    if (!ms) return '';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  return { isMyTurn, currentPlayer, timeLeft, formatTimeLeft };
}
