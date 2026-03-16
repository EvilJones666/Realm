import { ARCHETYPES } from '../../lib/constants';

export default function MessageBubble({ message, player, isMe }) {
  if (!player) return null;
  const archetype = ARCHETYPES[player.archetype];

  if (message.type === 'system') {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '8px 16px',
          fontFamily: 'Crimson Text, serif',
          fontSize: '14px',
          color: 'var(--text-dim)',
          fontStyle: 'italic',
        }}
      >
        {message.content}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMe ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: '8px',
        padding: '4px 16px',
      }}
    >
      {/* Portrait */}
      {player.portrait_url ? (
        <img
          src={player.portrait_url}
          alt={player.name}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '1px solid var(--border)',
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            flexShrink: 0,
          }}
        >
          {archetype.emoji}
        </div>
      )}

      {/* Bubble */}
      <div style={{ maxWidth: '75%' }}>
        {/* Name */}
        <div
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '11px',
            color: 'var(--gold)',
            letterSpacing: '0.04em',
            marginBottom: '4px',
            textAlign: isMe ? 'right' : 'left',
          }}
        >
          {archetype.emoji} {player.name}
        </div>

        {/* Message */}
        <div
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: isMe ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
            padding: '10px 14px',
          }}
        >
          <p
            style={{
              fontFamily: 'Crimson Text, serif',
              fontSize: '17px',
              color: 'var(--text-primary)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {message.content}
          </p>
        </div>

        {/* Timestamp */}
        <div
          style={{
            fontFamily: 'Crimson Text, serif',
            fontSize: '11px',
            color: 'var(--text-dim)',
            marginTop: '3px',
            textAlign: isMe ? 'right' : 'left',
          }}
        >
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
