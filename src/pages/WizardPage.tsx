import { useState, useCallback, useEffect, useRef } from 'react';
import type { Timesheet, DayKey, MealBreak } from '../types/timesheet';
import { emptyWorker } from '../types/timesheet';
import { saveTimesheet } from '../db/database';
import { HEADER_FIELDS, WIZARD_SKIP_FIELDS, DAYS } from '../config/formConfig';

interface Props {
  timesheet: Timesheet;
  onComplete: (ts: Timesheet) => void;
  onCancel: () => void;
}

interface StepDef {
  id: string;
  title: string;
  subtitle: string;
  kind: 'text' | 'date' | 'day' | 'toggle' | 'notes' | 'final';
}

const DAY_ORDER: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thur', 'fri', 'sat'];

function prevDayKey(dayKey: DayKey): DayKey | null {
  const idx = DAY_ORDER.indexOf(dayKey);
  return idx > 0 ? DAY_ORDER[idx - 1] : null;
}

function generateSteps(ts: Timesheet): StepDef[] {
  const steps: StepDef[] = [];

  for (const f of HEADER_FIELDS) {
    if (WIZARD_SKIP_FIELDS.includes(f.key)) continue;
    steps.push({
      id: `header:${f.key}`,
      title: f.label,
      subtitle: f.key === 'weekEndingDate' ? 'e.g. 22/05/2026' : '',
      kind: f.key === 'weekEndingDate' ? 'date' : 'text',
    });
  }

  for (let w = 0; w < ts.workers.length; w++) {
    const pfx = ts.mode === 'crew' ? `Worker ${w + 1}: ` : '';
    steps.push({ id: `worker:${w}:ref`, title: `${pfx}Reference`, subtitle: '(PTS Number)', kind: 'text' });
    steps.push({ id: `worker:${w}:name`, title: `${pfx}Name`, subtitle: '(your name)', kind: 'text' });
    steps.push({ id: `worker:${w}:trade`, title: `${pfx}Trade`, subtitle: '', kind: 'text' });
    for (const day of DAYS) {
      steps.push({ id: `worker:${w}:${day.key}:day`, title: `${pfx}${day.label}`, subtitle: 'Start, finish & meal break', kind: 'day' });
    }
  }

  if (ts.mode === 'crew') {
    steps.push({ id: 'add-worker', title: 'Add another worker?', subtitle: '', kind: 'toggle' });
  }

  steps.push({ id: 'notes', title: 'Notes', subtitle: 'Optional notes', kind: 'notes' });
  steps.push({ id: 'final', title: 'All done!', subtitle: 'Review your timesheet', kind: 'final' });

  return steps;
}

function DayStep({
  stepId,
  dayKey,
  worker,
  stepIdx,
  totalSteps,
  onSave,
  onSkip,
  onBack,
}: {
  stepId: string;
  dayKey: DayKey;
  worker: any;
  stepIdx: number;
  totalSteps: number;
  onSave: (stepId: string, start: string, finish: string, mealBreak: MealBreak) => void;
  onSkip: (stepId: string) => void;
  onBack: () => void;
}) {
  const currentDay = worker?.days?.[dayKey];
  const prevKey = prevDayKey(dayKey);
  const prevDay = prevKey && worker ? worker.days[prevKey] : null;

  const [start, setStart] = useState(currentDay?.start || prevDay?.start || '');
  const [finish, setFinish] = useState(currentDay?.finish || prevDay?.finish || '');
  const [meal, setMeal] = useState<MealBreak>(currentDay?.mealBreak || prevDay?.mealBreak || 'N');
  const startRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startRef.current?.focus();
  }, []);

  const handleSave = () => onSave(stepId, start, finish, meal);
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); handleSave(); } };
  const filled = start || finish;

  return (
    <div className="wizard-step">
      <div className="step-label">Step {stepIdx + 1} of {totalSteps}</div>
      <div className="step-title">{DAYS.find(d => d.key === dayKey)?.label || dayKey}</div>
      <div className="day-inputs">
        <div className="day-field">
          <label>Start time</label>
          <input ref={startRef} className="step-input time-input" type="time" value={start} onChange={e => setStart(e.target.value)} onKeyDown={handleKeyDown} />
        </div>
        <div className="day-field">
          <label>Finish time</label>
          <input className="step-input time-input" type="time" value={finish} onChange={e => setFinish(e.target.value)} onKeyDown={handleKeyDown} />
        </div>
        <div className="day-field">
          <label>Meal break taken?</label>
          <div className="meal-toggle">
            <button className={meal === 'Y' ? 'selected' : ''} onClick={() => setMeal('Y')}>YES</button>
            <button className={meal === 'N' ? 'selected' : ''} onClick={() => setMeal('N')}>NO</button>
          </div>
        </div>
      </div>
      <div className="step-nav">
        <button className="btn btn-secondary" onClick={onBack}>Back</button>
        <button className="btn btn-secondary" onClick={() => onSkip(stepId)}>Skip day</button>
        <button className="btn btn-primary" onClick={handleSave}>{filled ? 'Save & Next' : 'Next'}</button>
      </div>
    </div>
  );
}

export default function WizardPage({ timesheet, onComplete }: Props) {
  const [ts, setTs] = useState<Timesheet>(() => ({
    ...timesheet,
    workers: timesheet.workers.length === 0 ? [emptyWorker()] : timesheet.workers,
  }));
  const [stepIdx, setStepIdx] = useState(0);
  const [dirty, setDirty] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const steps = generateSteps(ts);
  const current = steps[stepIdx];

  const save = useCallback(async (updated: Timesheet) => {
    await saveTimesheet(updated);
    setDirty(false);
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => save(ts), 600);
    return () => clearTimeout(timer);
  }, [ts, dirty, save]);

  useEffect(() => {
    if (current?.kind === 'text' || current?.kind === 'date') {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [current?.id, current?.kind]);

  const updateTs = (fn: (prev: Timesheet) => Timesheet) => {
    setTs((prev) => {
      const next = fn(prev);
      if (next !== prev) setDirty(true);
      return next;
    });
  };

  const goNext = () => { if (stepIdx < steps.length - 1) setStepIdx(i => i + 1); };
  const goBack = () => { if (stepIdx > 0) setStepIdx(i => i - 1); };

  const handleHeaderChange = (key: string, value: string) => {
    updateTs(prev => ({ ...prev, header: { ...prev.header, [key]: value } }));
    goNext();
  };

  const handleSkipHeader = (key: string) => {
    updateTs(prev => ({ ...prev, header: { ...prev.header, [key]: prev.header[key] || '' } }));
    goNext();
  };

  const handleWorkerField = (stepId: string, value: string) => {
    const parts = stepId.split(':');
    const wi = parseInt(parts[1], 10);
    const field = parts[2] as 'ref' | 'name' | 'trade';
    updateTs(prev => {
      const workers = [...prev.workers];
      const w = { ...workers[wi], [field]: value };
      workers[wi] = w;
      return { ...prev, workers };
    });
    goNext();
  };

  const handleSkipWorker = (stepId: string) => {
    const parts = stepId.split(':');
    const wi = parseInt(parts[1], 10);
    const field = parts[2] as 'ref' | 'name' | 'trade';
    updateTs(prev => {
      const workers = [...prev.workers];
      const w = { ...workers[wi], [field]: '' };
      workers[wi] = w;
      return { ...prev, workers };
    });
    goNext();
  };

  const handleDaySave = (stepId: string, start: string, finish: string, mealBreak: MealBreak) => {
    const parts = stepId.split(':');
    const wi = parseInt(parts[1], 10);
    const dayKey = parts[2] as DayKey;
    updateTs(prev => {
      const workers = [...prev.workers];
      const w = { ...workers[wi] };
      const days = { ...w.days };
      days[dayKey] = { start, finish, mealBreak };
      w.days = days;
      workers[wi] = w;
      return { ...prev, workers };
    });
    goNext();
  };

  const handleSkipDay = (stepId: string) => {
    const parts = stepId.split(':');
    const wi = parseInt(parts[1], 10);
    const dayKey = parts[2] as DayKey;
    updateTs(prev => {
      const workers = [...prev.workers];
      const w = { ...workers[wi] };
      const days = { ...w.days };
      days[dayKey] = { start: '', finish: '', mealBreak: 'N' };
      w.days = days;
      workers[wi] = w;
      return { ...prev, workers };
    });
    goNext();
  };

  const handleAddWorker = (add: boolean) => {
    if (add) {
      updateTs(prev => ({ ...prev, workers: [...prev.workers, emptyWorker()] }));
    } else {
      goNext();
    }
  };

  const handleNotes = (value: string) => {
    updateTs(prev => ({ ...prev, notes: value }));
    goNext();
  };

  const handleFinish = () => {
    const updated = { ...ts, status: 'draft' as const };
    saveTimesheet(updated).then(() => onComplete(updated));
  };

  if (!current) return null;

  return (
    <div className="wizard-container">
      <div className="wizard-progress">
        {steps.map((s, i) => (
          <div key={s.id} className={`dot ${i === stepIdx ? 'active' : ''} ${i < stepIdx ? 'done' : ''}`} />
        ))}
      </div>

      {current.kind === 'day' ? (
        (() => {
          const parts = current.id.split(':');
          const wi = parseInt(parts[1], 10);
          const dayKey = parts[2] as DayKey;
          return (
            <DayStep
              key={current.id}
              stepId={current.id}
              dayKey={dayKey}
              worker={ts.workers[wi]}
              stepIdx={stepIdx}
              totalSteps={steps.length}
              onSave={handleDaySave}
              onSkip={handleSkipDay}
              onBack={goBack}
            />
          );
        })()
      ) : current.kind === 'text' || current.kind === 'date' ? (() => {
        let currentValue = '';
        if (current.id.startsWith('header:')) {
          const key = current.id.replace('header:', '');
          currentValue = (ts.header as unknown as Record<string, string>)[key] || '';
        } else if (current.id.startsWith('worker:')) {
          const parts = current.id.split(':');
          const wi = parseInt(parts[1], 10);
          const field = parts[2];
          const w = ts.workers[wi];
          if (w) currentValue = (w as any)[field] || '';
        }

        const handleSubmit = () => {
          const val = inputRef.current?.value?.trim() || '';
          if (current.id.startsWith('header:')) {
            handleHeaderChange(current.id.replace('header:', ''), val);
          } else if (current.id.startsWith('worker:')) {
            handleWorkerField(current.id, val);
          }
        };

        return (
          <div className="wizard-step" key={current.id}>
            <div className="step-label">Step {stepIdx + 1} of {steps.length}</div>
            <div className="step-title">{current.title}</div>
            {current.subtitle && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 8 }}>{current.subtitle}</p>}
            <input
              key={current.id}
              ref={inputRef}
              className="step-input"
              type={current.kind === 'date' ? 'date' : 'text'}
              defaultValue={currentValue}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); } }}
            />
            <div className="step-nav">
              <button className="btn btn-secondary" onClick={goBack}>Back</button>
              <button className="btn btn-secondary" onClick={() => {
                if (current.id.startsWith('header:')) handleSkipHeader(current.id.replace('header:', ''));
                else if (current.id.startsWith('worker:')) handleSkipWorker(current.id);
              }}>Skip</button>
              <button className="btn btn-primary" onClick={handleSubmit}>Next</button>
            </div>
          </div>
        );
      })() : current.kind === 'notes' ? (
        <div className="wizard-step" key="notes">
          <div className="step-label">Step {stepIdx + 1} of {steps.length}</div>
          <div className="step-title">{current.title}</div>
          <textarea
            key="notes-input"
            className="step-input"
            style={{ minHeight: 120, textAlign: 'left', resize: 'vertical' }}
            defaultValue={ts.notes || ''}
            autoFocus
            onBlur={e => handleNotes(e.target.value)}
          />
          <div className="step-nav">
            <button className="btn btn-secondary" onClick={goBack}>Back</button>
            <button className="btn btn-secondary" onClick={() => handleNotes((document.querySelector('.wizard-step textarea') as HTMLTextAreaElement)?.value || '')}>Skip</button>
            <button className="btn btn-primary" onClick={() => handleNotes((document.querySelector('.wizard-step textarea') as HTMLTextAreaElement)?.value || '')}>Next</button>
          </div>
        </div>
      ) : current.kind === 'toggle' ? (
        <div className="wizard-step" key="toggle">
          <div className="step-label">Step {stepIdx + 1} of {steps.length}</div>
          <div className="step-title">{current.title}</div>
          <div className="add-worker-actions">
            <button className="btn btn-primary btn-lg" onClick={() => handleAddWorker(true)}>Yes, add worker</button>
            <button className="btn btn-secondary btn-lg" onClick={() => handleAddWorker(false)}>No, continue</button>
          </div>
          <div className="step-nav">
            <button className="btn btn-secondary" onClick={goBack}>Back</button>
          </div>
        </div>
      ) : current.kind === 'final' ? (
        <div className="wizard-step" key="final">
          <div className="step-label">Step {stepIdx + 1} of {steps.length}</div>
          <div className="step-title">{current.title}</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Your timesheet is ready to review.</p>
          <button className="btn btn-primary btn-lg" onClick={handleFinish}>Review Timesheet</button>
        </div>
      ) : null}

      {ts.mode === 'crew' && ts.workers.length > 0 && (
        <div className="worker-count">{ts.workers.length} worker{ts.workers.length > 1 ? 's' : ''} added</div>
      )}
    </div>
  );
}
