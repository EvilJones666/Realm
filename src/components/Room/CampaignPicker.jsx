import { CAMPAIGNS } from '../../lib/constants';

export default function CampaignPicker({ selected, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      {CAMPAIGNS.map(campaign => (
        <button
          key={campaign.id}
          onClick={() => onChange(campaign.id)}
          style={{
            background: selected === campaign.id ? 'var(--bg-elevated)' : 'var(--bg-surface)',
            border: `1px solid ${selected === campaign.id ? 'var(--ember)' : 'var(--border)'}`,
            borderRadius: '6px',
            padding: '14px 16px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'border-color 0.2s, background 0.2s',
            boxShadow: selected === campaign.id ? '0 0 12px rgba(196,98,45,0.2)' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '22px' }}>{campaign.emoji}</span>
            <span
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '14px',
                fontWeight: 600,
                color: selected === campaign.id ? 'var(--gold)' : 'var(--text-primary)',
                letterSpacing: '0.04em',
              }}
            >
              {campaign.name}
            </span>
          </div>
          <div
            style={{
              fontFamily: 'Crimson Text, serif',
              fontSize: '15px',
              color: 'var(--text-secondary)',
              fontStyle: 'italic',
              paddingLeft: '32px',
            }}
          >
            {campaign.description}
          </div>
        </button>
      ))}
    </div>
  );
}
