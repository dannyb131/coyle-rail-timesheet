import { useEffect, useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';
import type { Timesheet } from '../types/timesheet';
import { shareFile, downloadBlob } from '../utils/share';
import TimesheetPreview from '../components/TimesheetPreview';

interface Props {
  timesheet: Timesheet;
  onBack: () => void;
}

export default function ExportPDF({ timesheet, onBack }: Props) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  const filename = `Timesheet_${timesheet.header.client || 'Unknown'}_${(timesheet.header.weekEndingDate || timesheet.id.slice(0, 8)).replace(/\//g, '-')}.pdf`;

  useEffect(() => {
    if (!previewRef.current) return;
    setLoading(true);

    const element = previewRef.current;
    const opt = {
      margin: 5,
      filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' as const },
    };

    html2pdf().set(opt).from(element).outputPdf('blob').then((blob: Blob) => {
      setPdfBlob(blob);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setLoading(false);
    }).catch((err: unknown) => {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
      setLoading(false);
    });

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [timesheet]);

  const handleShare = async () => {
    if (!pdfBlob) return;
    setSharing(true);
    try {
      const sent = await shareFile(
        pdfBlob,
        filename,
        `Timesheet - ${timesheet.header.client}`,
        `Timesheet for week ending ${timesheet.header.weekEndingDate}`
      );
      if (!sent) {
        downloadBlob(pdfBlob, filename);
      }
    } catch (err) {
      console.error('Share failed:', err);
      downloadBlob(pdfBlob, filename);
    } finally {
      setSharing(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    downloadBlob(pdfBlob, filename);
  };

  return (
    <div className="export-container">
      <h2 style={{ marginBottom: 8 }}>Export PDF</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
        {filename}
      </p>

      {loading ? (
        <div className="loading">
          <p>Generating PDF...</p>
        </div>
      ) : (
        <div className="export-actions">
          <button className="btn btn-secondary" onClick={onBack}>
            Back
          </button>
          <button className="btn btn-secondary" onClick={handleDownload}>
            Download PDF
          </button>
          <button className="btn btn-primary btn-lg" onClick={handleShare} disabled={sharing}>
            {sharing ? 'Sharing...' : 'Share / Email'}
          </button>
        </div>
      )}

      <h3 style={{ marginBottom: 8 }}>Form Preview</h3>
      <div ref={previewRef}>
        <TimesheetPreview timesheet={timesheet} />
      </div>

    </div>
  );
}
