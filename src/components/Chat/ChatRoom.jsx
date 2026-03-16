import { useEffect, useRef, useState } from 'react';
import { supabase, uploadImage } from '../../lib/supabase';
import { buildGMPrompt, buildMessageHistory } from '../../lib/gm';
import { getLevel, ARCHETYPES, LEVEL_NAMES } from '../../lib/constants';
import TurnIndicator from './TurnIndicator';
import GMMessage from './GMMessage';
import MessageBubble from './MessageBubble';
import ActionInput from './ActionInput';
import LevelUpToast from '../UI/LevelUpToast';

export default function ChatRoom({ room, myPlayer, session }) {
  const [messages, setMessages] = useState([]);
  const [players, setPlayers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(room);
  const [currentPlayer, setCurrentPlayer] = useState(myPlayer);
  const [gmProcessing, setGmProcessing] = useState(false);
  const [levelUp, setLevelUp] = useState(null); // { newLevel, newSkill }
  const [lastGMMessageId, setLastGMMessageId] = useState(null);
  const messagesEndRef = useRef(null);

  const isMyTurn = currentRoom.current_turn_player_id === currentPlayer.id;

  useEffect(() => {
    loadInitialData();
    const channel = supabase
      .channel(`game:${room.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${room.id}` }, payload => {
        setMessages(prev => [...prev, payload.new]);
        if (payload.new.type === 'gm_narrative') setLastGMMessageId(payload.new.id);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${room.id}` }, () => {
        loadPlayers();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${room.id}` }, payload => {
        setCurrentRoom(payload.new);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [room.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadInitialData() {
    const [{ data: msgs }, { data: pls }] = await Promise.all([
      supabase.from('messages').select('*').eq('room_id', room.id).order('created_at'),
      supabase.from('players').select('*').eq('room_id', room.id).order('turn_order'),
    ]);
    setMessages(msgs || []);
    setPlayers(pls || []);
    if (msgs?.length > 0) {
      const lastGM = [...msgs].reverse().find(m => m.type === 'gm_narrative');
      if (lastGM) setLastGMMessageId(lastGM.id);
    }
    // Update current player from fresh data
    const fresh = pls?.find(p => p.id === myPlayer.id);
    if (fresh) setCurrentPlayer(fresh);
  }

  async function loadPlayers() {
    const { data } = await supabase.from('players').select('*').eq('room_id', room.id).order('turn_order');
    if (data) {
      setPlayers(data);
      const fresh = data.find(p => p.id === myPlayer.id);
      if (fresh) setCurrentPlayer(fresh);
    }
  }

  async function handleAction(actionText) {
    const testRes = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gm-respond`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ roomId: 'test', systemPrompt: 'Respond ONLY with JSON: {"narrative":"FRONTEND WORKS","image_prompt":null,"actions":[]}', messageHistory: [{ role: 'user', content: 'test' }] })
      }
    );
    const testData = await testRes.json();
    alert(JSON.stringify(testData));
    return;

    if (gmProcessing) return;
    setGmProcessing(true);

    // Save player action message
    await supabase.from('messages').insert({
      room_id: room.id,
      player_id: currentPlayer.id,
      type: 'player_action',
      content: actionText,
    });

    // Build GM context
    const allPlayers = await supabase.from('players').select('*').eq('room_id', room.id).order('turn_order');
    const freshPlayers = allPlayers.data || players;
    const allMessages = await supabase.from('messages').select('*').eq('room_id', room.id).order('created_at');
    const freshMessages = allMessages.data || messages;

    const systemPrompt = buildGMPrompt(currentRoom, freshPlayers, freshMessages);
    const msgHistory = buildMessageHistory(freshMessages, freshPlayers);

    let gmResponse = null;
    let gmError = null;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gm-respond`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ roomId: room.id, systemPrompt, messageHistory: msgHistory }),
        }
      );
      console.log('[GM] fetch status:', res.status);
      const data = await res.json();
      console.log('[GM] fetch data:', JSON.stringify(data));
      if (!res.ok || data?.error) {
        gmError = `Edge function error (${res.status}): ${data?.error ? JSON.stringify(data.error) : res.statusText}`;
        console.error('[GM] fetch error:', gmError);
      } else {
        gmResponse = data;
      }
    } catch (e) {
      console.error('[GM] Caught exception:', e);
      gmError = `Exception: ${e?.message || String(e)}`;
    }

    // Generate scene image if needed
    let imageUrl = null;
    if (gmResponse?.image_prompt) {
      try {
        const { data: imgData } = await supabase.functions.invoke('generate-image', {
          body: { prompt: gmResponse.image_prompt, type: 'scene' }
        });
        if (imgData?.base64) {
          imageUrl = await uploadImage(imgData.base64, imgData.mimeType, 'images', `${room.id}-${Date.now()}.jpg`);
        }
      } catch (e) {
        console.error('Image error:', e);
      }
    }

    // Save GM narrative
    const narrativeContent = gmResponse?.narrative
      ? gmResponse.narrative
      : `The realm shifts...\n[GM_ERROR: ${gmError || 'Unknown error — no narrative returned'}]`;
    console.log('[GM] narrativeContent to insert:', narrativeContent?.slice(0, 120));
    const { data: insertData, error: insertError } = await supabase.from('messages').insert({
      room_id: room.id,
      type: 'gm_narrative',
      content: narrativeContent,
      image_url: imageUrl,
    }).select();
    console.log('[GM] insert result:', JSON.stringify(insertData), 'error:', JSON.stringify(insertError));

    // Process GM actions
    if (gmResponse?.actions) {
      await processGMActions(gmResponse.actions, freshPlayers);
    }

    // Advance turn
    await advanceTurn(freshPlayers);
    setGmProcessing(false);
  }

  async function processGMActions(actions, freshPlayers) {
    for (const action of actions) {
      try {
        if (action.type === 'award_xp') {
          const targetPlayer = freshPlayers.find(p => p.id === action.player_id);
          if (!targetPlayer || targetPlayer.status === 'dead') continue;
          const newXP = (targetPlayer.xp || 0) + action.amount;
          const oldLevel = targetPlayer.level || 1;
          const newLevel = getLevel(newXP);

          await supabase.from('players').update({ xp: newXP, level: newLevel }).eq('id', action.player_id);
          await supabase.from('xp_events').insert({ player_id: action.player_id, amount: action.amount, reason: action.reason });

          if (newLevel > oldLevel) {
            const newSkill = ARCHETYPES[targetPlayer.archetype]?.skills?.[newLevel]?.name;
            if (newSkill) {
              const updatedSkills = [...(targetPlayer.unlocked_skills || []), newSkill];
              await supabase.from('players').update({ unlocked_skills: updatedSkills }).eq('id', action.player_id);
              if (action.player_id === currentPlayer.id) {
                setLevelUp({ newLevel, newSkill });
              }
            }
          }
        }

        if (action.type === 'add_item') {
          // Generate item icon
          let iconUrl = null;
          try {
            const { data: imgData } = await supabase.functions.invoke('generate-image', {
              body: { prompt: action.item.name + ' ' + action.item.description, type: 'item' }
            });
            if (imgData?.base64) {
              iconUrl = await uploadImage(imgData.base64, imgData.mimeType, 'images', `item-${Date.now()}.jpg`);
            }
          } catch (e) { /* non-critical */ }

          await supabase.from('inventory_items').insert({
            player_id: action.player_id,
            name: action.item.name,
            description: action.item.description,
            icon_url: iconUrl,
          });
        }

        if (action.type === 'kill_player') {
          await supabase.from('players').update({ status: 'dead' }).eq('id', action.player_id);
          await supabase.from('messages').insert({
            room_id: room.id,
            type: 'system',
            content: `☠️ ${freshPlayers.find(p => p.id === action.player_id)?.name || 'A hero'} has fallen. ${action.cause || ''}`,
          });
        }

        if (action.type === 'unlock_skill') {
          const target = freshPlayers.find(p => p.id === action.player_id);
          if (target) {
            const updated = [...(target.unlocked_skills || []), action.skill];
            await supabase.from('players').update({ unlocked_skills: updated }).eq('id', action.player_id);
          }
        }
      } catch (e) {
        console.error('Action processing error:', e);
      }
    }
  }

  async function advanceTurn(freshPlayers) {
    const alivePlayers = freshPlayers.filter(p => p.status === 'alive').sort((a, b) => a.turn_order - b.turn_order);
    if (alivePlayers.length === 0) return;

    const currentIdx = alivePlayers.findIndex(p => p.id === currentRoom.current_turn_player_id);
    const nextIdx = (currentIdx + 1) % alivePlayers.length;
    const nextPlayer = alivePlayers[nextIdx];
    const turnDurationHours = currentRoom.turn_duration_hours || 24;
    const turnExpiresAt = new Date(Date.now() + turnDurationHours * 3600 * 1000).toISOString();

    await supabase.from('rooms').update({
      current_turn_player_id: nextPlayer.id,
      turn_expires_at: turnExpiresAt,
    }).eq('id', room.id);
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-deep)' }}>
      {/* Room header */}
      <div
        style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--gold)',
          }}
        >
          {room.name}
        </div>
        <div
          style={{
            fontFamily: 'Crimson Text, serif',
            fontSize: '13px',
            color: isMyTurn ? 'var(--ember-glow)' : 'var(--text-dim)',
            fontStyle: 'italic',
          }}
        >
          {isMyTurn ? 'Your turn' : `${players.find(p => p.id === currentRoom.current_turn_player_id)?.name || '...'}'s turn`}
        </div>
      </div>

      {/* Turn indicator */}
      <TurnIndicator
        players={players}
        currentTurnPlayerId={currentRoom.current_turn_player_id}
        room={currentRoom}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" style={{ paddingTop: '8px', paddingBottom: '8px' }}>
        {messages.map((msg, i) => {
          if (msg.type === 'gm_narrative') {
            return (
              <GMMessage
                key={msg.id}
                message={msg}
                showDice={msg.id === lastGMMessageId && i > 0}
              />
            );
          }
          if (msg.type === 'system') {
            return (
              <div
                key={msg.id}
                style={{
                  textAlign: 'center',
                  padding: '8px 16px',
                  fontFamily: 'Crimson Text, serif',
                  fontSize: '14px',
                  color: 'var(--text-dim)',
                  fontStyle: 'italic',
                }}
              >
                {msg.content}
              </div>
            );
          }
          const player = players.find(p => p.id === msg.player_id);
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              player={player}
              isMe={msg.player_id === currentPlayer.id}
            />
          );
        })}

        {gmProcessing && (
          <div
            style={{
              padding: '14px 16px',
              background: 'var(--gm-bg)',
              borderLeft: '3px solid var(--ember)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚔️</span>
              <span
                style={{
                  fontFamily: 'Crimson Text, serif',
                  fontSize: '16px',
                  color: 'var(--text-secondary)',
                  fontStyle: 'italic',
                }}
              >
                The Realm Master deliberates...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Action input */}
      <ActionInput
        myPlayer={currentPlayer}
        isMyTurn={isMyTurn}
        onSubmit={handleAction}
        disabled={gmProcessing}
      />

      {/* Level up toast */}
      {levelUp && (
        <LevelUpToast
          level={levelUp.newLevel}
          skill={levelUp.newSkill}
          playerName={currentPlayer.name}
          onDismiss={() => setLevelUp(null)}
        />
      )}
    </div>
  );
}
