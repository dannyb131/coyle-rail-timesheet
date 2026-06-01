import { useEffect, useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';
import type { Timesheet } from '../types/timesheet';
import { getAllTimesheets, deleteTimesheet, duplicateTimesheet } from '../db/database';
import { STATUS_LABELS } from '../config/formConfig';
import TimesheetPreview from '../components/TimesheetPreview';

interface Props {
  onNew: () => void;
  onOpen: (ts: Timesheet) => void;
  onReview: (ts: Timesheet) => void;
}

export default function Home({ onNew, onOpen, onReview }: Props) {
  const [sheets, setSheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfTarget, setPdfTarget] = useState<Timesheet | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    setLoading(true);
    const all = await getAllTimesheets();
    setSheets(all);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    await deleteTimesheet(id);
    setSheets((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDuplicate = async (ts: Timesheet) => {
    const copy = await duplicateTimesheet(ts);
    setSheets((prev) => [copy, ...prev]);
  };

  useEffect(() => {
    if (!pdfTarget || !pdfRef.current) return;
    const element = pdfRef.current;
    const filename = `Timesheet_${pdfTarget.header.client || 'Unknown'}_${(pdfTarget.header.weekEndingDate || pdfTarget.id.slice(0, 8)).replace(/\//g, '-')}.pdf`;

    const opt = {
      margin: 5,
      filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' as const },
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setPdfTarget(null);
    }).catch(() => {
      setPdfTarget(null);
    });
  }, [pdfTarget]);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <button className="btn btn-primary btn-lg" onClick={onNew} style={{ width: '100%' }}>
          + New Timesheet
        </button>
      </div>

      {sheets.length === 0 ? (
        <div className="empty-state">
          <div className="icon">&#128203;</div>
          <h2>No timesheets yet</h2>
          <p>Create your first timesheet to get started.</p>
        </div>
      ) : (
        <div className="home-list">
          {sheets.map((ts) => (
            <div key={ts.id} className="timesheet-row">
              <div className="info" onClick={() => onReview(ts)}>
                <div className="title">
                  {ts.header.client || 'No client'} &middot; Week ending{' '}
                  {ts.header.weekEndingDate || 'N/A'}
                </div>
                <div className="sub">
                  {ts.workers.length} worker{ts.workers.length !== 1 ? 's' : ''} &middot;{' '}
                  {ts.mode === 'single' ? 'Single' : 'Group'} &middot;{' '}
                  {formatDate(ts.updatedAt)}
                </div>
              </div>
              <div className="actions">
                <span className={`badge badge-${ts.status}`}>
                  {STATUS_LABELS[ts.status]}
                </span>
                <button onClick={(e) => { e.stopPropagation(); onOpen(ts); }}>
                  Open
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDuplicate(ts); }}>
                  Copy
                </button>
                <button onClick={(e) => { e.stopPropagation(); setPdfTarget(ts); }}>
                  PDF
                </button>
                <button
                  className="danger"
                  onClick={(e) => { e.stopPropagation(); handleDelete(ts.id); }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden preview for PDF generation */}
      {pdfTarget && (
        <div ref={pdfRef} style={{ position: 'fixed', top: -9999, left: -9999 }}>
          <TimesheetPreview timesheet={pdfTarget} />
        </div>
      )}
    </div>
  );
}
