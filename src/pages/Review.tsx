import type { Timesheet } from '../types/timesheet';
import TimesheetPreview from '../components/TimesheetPreview';
import { saveTimesheet } from '../db/database';
import { useState } from 'react';

interface Props {
  timesheet: Timesheet;
  onEdit: (ts: Timesheet) => void;
  onSignOff: (ts: Timesheet) => void;
  onBack: () => void;
}

export default function Review({ timesheet, onEdit, onSignOff, onBack }: Props) {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await saveTimesheet(timesheet);
    setSaving(false);
    alert('Timesheet saved!');
  };

  const handleMarkComplete = async () => {
    const updated = { ...timesheet, status: 'completed' as const };
    await saveTimesheet(updated);
    onSignOff(updated);
  };

  return (
    <div className="review-container">
      <h2 style={{ marginBottom: 8 }}>Review Timesheet</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
        {timesheet.header.client || 'No client'} &middot; Week ending {timesheet.header.weekEndingDate || 'N/A'}
        &middot; {timesheet.workers.length} worker{timesheet.workers.length !== 1 ? 's' : ''}
      </p>

      <TimesheetPreview timesheet={timesheet} />

      <div className="review-actions" style={{ justifyContent: 'center' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          Back to list
        </button>
        <button className="btn btn-secondary" onClick={() => onEdit(timesheet)}>
          Edit
        </button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        {timesheet.status !== 'signed' && (
          <button className="btn btn-primary" onClick={handleMarkComplete}>
            Mark Complete & Sign Off
          </button>
        )}
      </div>
    </div>
  );
}
