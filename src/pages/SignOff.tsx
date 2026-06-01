import { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import type { Timesheet, SignatoryBlock } from '../types/timesheet';
import { saveTimesheet } from '../db/database';

interface Props {
  timesheet: Timesheet;
  onComplete: (ts: Timesheet) => void;
  onBack: () => void;
}

function SignaturePad({
  label,
  initial,
  onSave,
  defaultPrint,
  defaultSignature,
}: {
  label: string;
  initial: SignatoryBlock;
  onSave: (block: SignatoryBlock) => void;
  defaultPrint?: string;
  defaultSignature?: string;
}) {
  const sigRef = useRef<SignatureCanvas>(null);
  const [print, setPrint] = useState(initial.print || '');
  const [date, setDate] = useState(initial.date || new Date().toLocaleDateString('en-GB'));
  const [signed, setSigned] = useState(!!initial.signature);

  const emit = (sig: string, p: string, d: string) => {
    onSave({ signature: sig, print: p, date: d });
  };

  useEffect(() => {
    if (defaultPrint) {
      setPrint(defaultPrint);
    }
  }, [defaultPrint]);

  useEffect(() => {
    if (defaultSignature && sigRef.current && sigRef.current.isEmpty()) {
      const img = new Image();
      img.onload = () => {
        const ctx = sigRef.current?.getCanvas()?.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 600, 180);
          setSigned(true);
        }
      };
      img.src = defaultSignature;
    }
  }, [defaultSignature]);

  const handleClear = () => {
    sigRef.current?.clear();
    setSigned(false);
    emit('', print, date);
  };

  const handleSave = () => {
    const sigData = sigRef.current?.toDataURL() || '';
    setSigned(true);
    emit(sigData, print, date);
  };

  return (
    <div className="signature-card">
      <h3>{label}</h3>
      <SignatureCanvas
        ref={sigRef}
        penColor="#000"
          canvasProps={{
            className: 'sig-pad',
            width: 600,
            height: 180,
          }}
      />
      <div className="sig-actions">
        <button onClick={handleClear}>Clear</button>
        <button onClick={handleSave} style={{ background: 'var(--green)', color: '#fff', border: 'none' }}>
          Save Signature
        </button>
      </div>
      {signed && <span style={{ fontSize: '0.8rem', color: 'var(--green)', fontWeight: 700 }}>&#10003; Signed</span>}
      <input
        type="text"
        placeholder="Print name"
        value={print}
        onChange={(e) => setPrint(e.target.value)}
      />
      <input
        type="text"
        placeholder="Date (e.g. 22/05/2026)"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={{ marginTop: 0 }}
      />
    </div>
  );
}

export default function SignOff({ timesheet, onComplete, onBack }: Props) {
  const [ts, setTs] = useState(timesheet);
  const [saving, setSaving] = useState(false);

  const handleBlockSave = (block: 'briefings' | 'supplier' | 'client') => (data: SignatoryBlock) => {
    setTs((prev) => {
      const updated = { ...prev, signoff: { ...prev.signoff, [block]: data } };
      if (block === 'briefings') {
        updated.signoff.supplier = data;
        updated.signoff.client = data;
      }
      return updated;
    });
  };

  const defaultPrint = ts.signoff.briefings.print || '';
  const defaultSignature = ts.signoff.briefings.signature || '';

  const handleFinish = async () => {
    const missing: string[] = [];
    if (!ts.signoff.briefings.signature) missing.push('Briefings');
    if (!ts.signoff.supplier.signature) missing.push('Supplier');
    if (!ts.signoff.client.signature) missing.push('Client');

    if (missing.length > 0) {
      alert(`Please save signatures for: ${missing.join(', ')}`);
      return;
    }

    setSaving(true);
    const updated = { ...ts, status: 'signed' as const };
    await saveTimesheet(updated);
    setSaving(false);
    onComplete(updated);
  };

  return (
    <div>
      <h2 style={{ marginBottom: 8, textAlign: 'center' }}>Sign-off</h2>
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: 20 }}>
        Capture signatures for sign-off. Each person must sign and print their name.
      </p>

      <div className="signature-section">
        <SignaturePad
          label="Briefings (Client)"
          initial={ts.signoff.briefings}
          onSave={handleBlockSave('briefings')}
        />
        <SignaturePad
          label="Supplier"
          initial={ts.signoff.supplier}
          onSave={handleBlockSave('supplier')}
          defaultPrint={defaultPrint}
          defaultSignature={defaultSignature}
        />
        <SignaturePad
          label="Client"
          initial={ts.signoff.client}
          onSave={handleBlockSave('client')}
          defaultPrint={defaultPrint}
          defaultSignature={defaultSignature}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
        <button className="btn btn-secondary" onClick={onBack}>
          Back
        </button>
        <button className="btn btn-primary btn-lg" onClick={handleFinish} disabled={saving}>
          {saving ? 'Saving...' : 'Complete & Generate PDF'}
        </button>
      </div>
    </div>
  );
}
