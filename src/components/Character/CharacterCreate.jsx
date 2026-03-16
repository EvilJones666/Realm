import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ARCHETYPES } from '../../lib/constants';

const ARCHETYPE_KEYS = Object.keys(ARCHETYPES);

export default function CharacterCreate({ room, session, onCreated, onBack }) {
  const [step, setStep] = useState('form'); // 'form' | 'portrait'
  const [name, setName] = useState('');
  const [archetype, setArchetype] = useState('warrior');
  const [description, setDescription] = useState('');
  const [portraitUrl, setPortraitUrl] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleGeneratePortrait() {
    setError('');
    setGenerating(true);
    try {
      const prompt = `${ARCHETYPES[archetype].label}: ${description}`;
      const imgRes = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: 'portrait' }),
      });
      const data = await imgRes.json();
      if (!imgRes.ok || !data?.url) throw new Error(data?.error || 'No image returned');
      setPortraitUrl(data.url);
      setStep('portrait');
    } catch (e) {
      setError(e.message || 'Portrait generation failed. Check your API key.');
    }
    setGenerating(false);
  }

  async function handleRegeneratePortrait() {
    setPortraitUrl(null);
    await handleGeneratePortrait();
  }

  async function handleConfirm() {
    setSaving(true);
    setError('');
    try {

      // Count existing players for turn order
      const { count } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room.id);

      const { data: player, error: insertErr } = await supabase
        .from('players')
        .insert({
          room_id: room.id,
          user_id: session.user.id,
          name: name.trim(),
          archetype,
          description: description.trim(),
          portrait_url: portraitUrl,
          turn_order: count || 0,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      onCreated(player);
    } catch (e) {
      setError(e.message || 'Failed to create character.');
    }
    setSaving(false);
  }

  function handleSkipPortrait() {
    setPortraitUrl(null);
    handleConfirmWithoutPortrait();
  }

  async function handleConfirmWithoutPortrait() {
    setSaving(true);
    setError('');
    try {
      const { count } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room.id);

      const { data: player, error: insertErr } = await supabase
        .from('players')
        .insert({
          room_id: room.id,
          user_id: session.user.id,
          name: name.trim(),
          archetype,
          description: description.trim(),
          portrait_url: null,
          turn_order: count || 0,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      onCreated(player);
    } catch (e) {
      setError(e.message || 'Failed to create character.');
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-deep)' }}>
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <button
          onClick={step === 'portrait' ? () => setStep('form') : onBack}
          style={{ background: 'none', border: 'none', color: 'var(--ember)', cursor: 'pointer', fontSize: '20px' }}
        >
          ←
        </button>
        <div className="realm-heading text-lg">
          {step === 'form' ? 'Create Your Character' : 'Your Portrait'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '20px' }}>
        {step === 'form' && (
          <>
            {/* Name */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Character Name
              </label>
              <input
                type="text"
                className="realm-input"
                placeholder="e.g. Kira Ashborn"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={30}
                autoFocus
              />
            </div>

            {/* Archetype */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Archetype
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {ARCHETYPE_KEYS.map(key => {
                  const a = ARCHETYPES[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setArchetype(key)}
                      style={{
                        background: archetype === key ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                        border: `1px solid ${archetype === key ? 'var(--ember)' : 'var(--border)'}`,
                        borderRadius: '6px',
                        padding: '12px 14px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>{a.emoji}</span>
                        <div>
                          <div
                            style={{
                              fontFamily: 'Cinzel, serif',
                              fontSize: '13px',
                              fontWeight: 600,
                              color: archetype === key ? 'var(--gold)' : 'var(--text-primary)',
                            }}
                          >
                            {a.label}
                          </div>
                          <div
                            style={{
                              fontFamily: 'Crimson Text, serif',
                              fontSize: '14px',
                              color: 'var(--text-secondary)',
                              fontStyle: 'italic',
                            }}
                          >
                            {a.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Describe Your Character
              </label>
              <textarea
                className="realm-input"
                placeholder="Tall and scarred, with cold grey eyes. A former soldier with nothing left to lose..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={200}
                rows={3}
                style={{ resize: 'none' }}
              />
              <div
                style={{
                  fontFamily: 'Crimson Text, serif',
                  fontSize: '13px',
                  color: 'var(--text-dim)',
                  textAlign: 'right',
                  marginTop: '4px',
                }}
              >
                {description.length}/200 — used for portrait generation
              </div>
            </div>

            {error && (
              <div style={{ color: '#e87070', fontSize: '15px', marginBottom: '12px', fontFamily: 'Crimson Text, serif' }}>
                {error}
              </div>
            )}
          </>
        )}

        {step === 'portrait' && (
          <div className="text-center">
            {generating ? (
              <div style={{ padding: '60px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
                <div
                  style={{
                    fontFamily: 'Crimson Text, serif',
                    fontSize: '18px',
                    color: 'var(--text-secondary)',
                    fontStyle: 'italic',
                  }}
                >
                  Nano Banana is painting your portrait...
                </div>
              </div>
            ) : portraitUrl ? (
              <>
                <img
                  src={portraitUrl}
                  alt="Character portrait"
                  style={{
                    width: '100%',
                    maxWidth: '320px',
                    borderRadius: '8px',
                    border: '2px solid var(--border)',
                    marginBottom: '16px',
                    boxShadow: '0 0 30px rgba(196,98,45,0.2)',
                  }}
                />
                <div
                  style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '16px',
                    color: 'var(--gold)',
                    marginBottom: '4px',
                  }}
                >
                  {name}
                </div>
                <div
                  style={{
                    fontFamily: 'Crimson Text, serif',
                    fontSize: '15px',
                    color: 'var(--text-secondary)',
                    fontStyle: 'italic',
                    marginBottom: '20px',
                  }}
                >
                  {ARCHETYPES[archetype].emoji} {ARCHETYPES[archetype].label}
                </div>
              </>
            ) : null}

            {error && (
              <div style={{ color: '#e87070', fontSize: '15px', marginBottom: '12px', fontFamily: 'Crimson Text, serif' }}>
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {step === 'form' && (
          <>
            <button
              className="btn-ember w-full"
              onClick={handleGeneratePortrait}
              disabled={generating || !name.trim() || !description.trim()}
            >
              {generating ? 'Generating...' : '🎨 Generate Portrait'}
            </button>
            <button
              className="btn-ghost w-full"
              onClick={handleSkipPortrait}
              disabled={saving || !name.trim()}
            >
              {saving ? 'Creating...' : 'Skip Portrait'}
            </button>
          </>
        )}

        {step === 'portrait' && !generating && (
          <>
            <button
              className="btn-ember w-full"
              onClick={handleConfirm}
              disabled={saving}
            >
              {saving ? 'Entering the Realm...' : '⚔️ Enter the Realm'}
            </button>
            <button
              className="btn-ghost w-full"
              onClick={handleRegeneratePortrait}
              disabled={generating || saving}
            >
              🔄 Regenerate
            </button>
          </>
        )}
      </div>
    </div>
  );
}
