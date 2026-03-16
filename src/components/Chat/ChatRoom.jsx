import React, { useState } from 'react';

export default function ChatRoom() {
  const [result, setResult] = useState('waiting...');
  return (
    <div style={{padding: 20, color: 'white', background: '#0d0a07', minHeight: '100vh'}}>
      <p>{result}</p>
      <button
        style={{padding: 20, fontSize: 20, background: 'orange'}}
        onClick={async () => {
          setResult('calling...');
          const r = await fetch('/api/gm', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({test: true})
          });
          const d = await r.json();
          setResult(JSON.stringify(d));
        }}
      >
        TAP ME
      </button>
    </div>
  );
}
