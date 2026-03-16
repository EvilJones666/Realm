import { useEffect, useState } from 'react';

const FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
const D20_FACES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];

export default function DiceRoll() {
  const [current, setCurrent] = useState('?');
  const [final, setFinal] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let count = 0;
    const max = 16;
    const interval = setInterval(() => {
      setCurrent(D20_FACES[Math.floor(Math.random() * D20_FACES.length)]);
      count++;
      if (count >= max) {
        clearInterval(interval);
        const result = D20_FACES[Math.floor(Math.random() * D20_FACES.length)];
        setCurrent(result);
        setFinal(result);
        setDone(true);
      }
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontFamily: 'Cinzel, serif',
        fontSize: '11px',
        color: done ? (parseInt(final) >= 15 ? 'var(--gold)' : parseInt(final) <= 4 ? '#e87070' : 'var(--text-secondary)') : 'var(--text-dim)',
        background: 'var(--bg-deep)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '2px 8px',
        letterSpacing: '0.05em',
        transition: 'color 0.3s',
      }}
    >
      <span style={{ fontSize: '12px' }}>🎲</span>
      <span>d20: {current}</span>
    </div>
  );
}
