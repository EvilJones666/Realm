import DiceRoll from '../UI/DiceRoll';

export default function GMMessage({ message, showDice }) {
  return (
    <div
      className="parchment-texture"
      style={{
        background: 'var(--gm-bg)',
        borderLeft: '3px solid var(--ember)',
        padding: '14px 16px',
        marginBottom: '2px',
        position: 'relative',
      }}
    >
      {/* GM Label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '10px',
        }}
      >
        <span style={{ fontSize: '16px' }}>⚔️</span>
        <span
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--ember)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          The Realm Master
        </span>
        {showDice && <DiceRoll />}
      </div>

      {/* Scene image */}
      {message.image_url && (
        <img
          src={message.image_url}
          alt="Scene"
          style={{
            width: '100%',
            borderRadius: '4px',
            marginBottom: '12px',
            border: '1px solid var(--gm-border)',
            display: 'block',
          }}
          loading="lazy"
        />
      )}

      {/* Narrative */}
      <p
        style={{
          fontFamily: 'Crimson Text, serif',
          fontSize: '17px',
          color: 'var(--text-primary)',
          lineHeight: 1.7,
          margin: 0,
        }}
      >
        {message.content}
      </p>

      {/* Timestamp */}
      <div
        style={{
          fontFamily: 'Crimson Text, serif',
          fontSize: '12px',
          color: 'var(--text-dim)',
          marginTop: '8px',
          fontStyle: 'italic',
        }}
      >
        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}
