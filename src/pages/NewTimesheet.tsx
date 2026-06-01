interface Props {
  onSelectMode: (mode: 'single' | 'crew') => void;
}

export default function NewTimesheet({ onSelectMode }: Props) {
  return (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ marginBottom: 8 }}>Choose mode</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
        How many workers on this timesheet?
      </p>
      <div className="mode-grid">
        <div className="mode-card" onClick={() => onSelectMode('single')}>
          <div className="icon">&#128100;</div>
          <div className="label">Single Worker</div>
          <div className="desc">One worker per timesheet</div>
        </div>
        <div className="mode-card" onClick={() => onSelectMode('crew')}>
          <div className="icon">&#128101;&#128101;</div>
          <div className="label">Group</div>
          <div className="desc">Multiple workers on one sheet</div>
        </div>
      </div>
    </div>
  );
}
