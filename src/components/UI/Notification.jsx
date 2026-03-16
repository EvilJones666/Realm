import { useEffect, useState } from 'react';

export default function Notification({ message, type = 'info', onDismiss, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, []);

  const colors = {
    info: 'var(--text-secondary)',
    success: '#6dbf67',
    error: '#e87070',
    gold: 'var(--gold)',
  };

  return (
    <div
      className="animate-slide-up"
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 300,
        background: 'var(--bg-elevated)',
        border: `1px solid ${colors[type]}`,
        borderRadius: '8px',
        padding: '12px 20px',
        maxWidth: '320px',
        width: '90%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        cursor: 'pointer',
      }}
      onClick={onDismiss}
    >
      <p
        style={{
          fontFamily: 'Crimson Text, serif',
          fontSize: '16px',
          color: colors[type],
          margin: 0,
          textAlign: 'center',
        }}
      >
        {message}
      </p>
    </div>
  );
}
