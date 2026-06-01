import { Fragment, useMemo } from 'react';
import type { Timesheet, DayKey } from '../types/timesheet';
import { DAYS } from '../config/formConfig';

interface Props {
  timesheet: Timesheet;
}

const LINE = '.................................................';
const LINE_SHORT = '..........................';

export default function TimesheetPreview({ timesheet }: Props) {
  const { header, workers, notes, signoff } = timesheet;

  const cellBorder: React.CSSProperties = { border: '1px solid #000' };

  const dayDates = useMemo(() => {
    if (!header.weekEndingDate) return DAYS.map(() => '');
    let weekEnd: Date;
    if (header.weekEndingDate.includes('-')) {
      const parts = header.weekEndingDate.split('-');
      weekEnd = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else if (header.weekEndingDate.includes('/')) {
      const parts = header.weekEndingDate.split('/');
      weekEnd = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    } else {
      return DAYS.map(() => '');
    }
    const friIdx = 5;
    return DAYS.map((_, i) => {
      const d = new Date(weekEnd);
      d.setDate(weekEnd.getDate() + (i - friIdx));
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    });
  }, [header.weekEndingDate]);

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontFamily: 'Arial, sans-serif', fontSize: 10 }}>
        <colgroup>
          <col style={{ width: '7%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '8%' }} />
          {Array.from({ length: 14 }).map((_, i) => (
            <col key={i} style={{ width: `${65 / 14}%` }} />
          ))}
        </colgroup>

        {/* ===== TOP BAND: Logo | Address | Title ===== */}
        <tr>
          <td colSpan={3} style={{ ...cellBorder, padding: '6px 4px', verticalAlign: 'middle', textAlign: 'center' }}>
            <img src="/logo.jpg" alt="Coyle Rail" style={{ maxHeight: 36, maxWidth: '100%' }} />
          </td>
          <td colSpan={5} style={{ ...cellBorder, padding: '4px', verticalAlign: 'middle', textAlign: 'center', fontSize: 8, lineHeight: 1.5 }}>
            <strong>HYGEIA,</strong> 66-68 COLLEGE ROAD,<br />
            HARROW, MIDDLESEX, HA1 1BE<br />
            TEL: 020 8861 3000
          </td>
          {/* Title — separate cell */}
          <td colSpan={9} style={{ ...cellBorder, padding: '6px 10px', verticalAlign: 'middle' }}>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 0.5, textAlign: 'center' }}>RECORD OF HOURS WORKED</div>
          </td>
        </tr>

        {/* ===== ROW 2: Client/Location (spans 3 rows) | Timesheet Number ===== */}
        <tr>
          <td rowSpan={3} colSpan={8} style={{ ...cellBorder, padding: '6px 8px', verticalAlign: 'top', lineHeight: 1.8 }}>
            <div style={{ fontSize: 8 }}>CLIENT: {header.client}</div>
            <div style={{ fontSize: 8 }}>LOCATION: {header.location}</div>
            <div style={{ fontSize: 8 }}>CLIENT CONTACT: {header.clientContact}</div>
          </td>
          <td colSpan={9} style={{ ...cellBorder, padding: '4px 8px', verticalAlign: 'middle', fontSize: 8 }}>
            TIMESHEET NUMBER: {header.timesheetNumber}
          </td>
        </tr>

        {/* ===== ROW 3: (merged) | Purchase Order ===== */}
        <tr>
          <td colSpan={9} style={{ ...cellBorder, padding: '4px 8px', verticalAlign: 'middle', fontSize: 8 }}>
            CLIENTS PURCHASE ORDER NO: {header.purchaseOrderNo}
          </td>
        </tr>

        {/* ===== ROW 4: (merged) | Week Ending ===== */}
        <tr>
          <td colSpan={9} style={{ ...cellBorder, padding: '4px 8px', verticalAlign: 'middle', fontSize: 8 }}>
            WEEK ENDING DATE: {header.weekEndingDate}
          </td>
        </tr>

        {/* ===== ROW 5: PO Notice | Client Delivery Unit ===== */}
        <tr>
          <td colSpan={8} style={{ ...cellBorder, padding: '4px 8px', verticalAlign: 'middle', fontSize: 7 }}>
            TO ENSURE PROMPT PAYMENT THE PURCHASE ORDER NUMBER <strong>MUST</strong> BE RECORDED.
          </td>
          <td colSpan={9} style={{ ...cellBorder, padding: '4px 8px', verticalAlign: 'middle', fontSize: 8 }}>
            CLIENT DELIVERY UNIT: {header.clientDeliveryUnit}
          </td>
        </tr>

        {/* ===== GRID: Caption + Day Headers with START/FINISH ===== */}
        <tr>
          <td colSpan={3} style={{ ...cellBorder, padding: '3px 6px', textAlign: 'left', fontSize: 7, fontWeight: 700 }}>
            ACTUAL ON SITE WORKING TIMES ONLY <strong>MUST</strong> BE RECODED
          </td>
          {DAYS.map((d) => (
            <td key={d.key} colSpan={2} style={{ ...cellBorder, padding: '3px 4px', fontSize: 9, fontWeight: 700, textAlign: 'center' }}>
              <div>{d.label}</div>
              <div style={{ fontSize: 7, fontWeight: 400 }}>START / FINISH</div>
            </td>
          ))}
        </tr>

        {/* ===== GRID: Date row (merged per day) ===== */}
        <tr>
          <th style={{ ...cellBorder, padding: '2px 4px', textAlign: 'left', fontSize: 8, fontWeight: 700, background: '#f5f5f5' }}>REF:</th>
          <th style={{ ...cellBorder, padding: '2px 4px', textAlign: 'left', fontSize: 8, fontWeight: 700, background: '#f5f5f5' }}>NAME</th>
          <th style={{ ...cellBorder, padding: '2px 4px', textAlign: 'left', fontSize: 8, fontWeight: 700, background: '#f5f5f5' }}>TRADE</th>
          {DAYS.map((d, i) => (
            <td key={`date-${d.key}`} colSpan={2} style={{ ...cellBorder, padding: '2px 4px', fontSize: 7, textAlign: 'center', background: '#f5f5f5' }}>
              {dayDates[i]}
            </td>
          ))}
        </tr>

        {/* ===== GRID: Data rows (17 rows) ===== */}
        {Array.from({ length: 17 }).map((_, rowIdx) => {
          const worker = workers[rowIdx];
          return (
            <tr key={`row-${rowIdx}`} style={{ height: 20 }}>
              <td style={{ ...cellBorder, padding: '1px 4px', textAlign: 'left', fontSize: 8 }}>
                {worker?.ref || ''}
              </td>
              <td style={{ ...cellBorder, padding: '1px 4px', textAlign: 'left', fontSize: 8 }}>
                {worker?.name || ''}
              </td>
              <td style={{ ...cellBorder, padding: '1px 4px', textAlign: 'left', fontSize: 8 }}>
                {worker?.trade || ''}
              </td>
              {DAYS.map((d) => {
                const hasData = worker && (worker.name || worker.ref);
                const dayData = worker?.days[d.key as DayKey];
                return (
                  <Fragment key={d.key}>
                    <td style={{ ...cellBorder, padding: '1px 2px', fontSize: 8, textAlign: 'center' }}>
                      {hasData ? (dayData?.start || '----') : ''}
                    </td>
                    <td style={{ ...cellBorder, padding: '1px 2px', fontSize: 8, textAlign: 'center' }}>
                      {hasData ? (dayData?.finish || '----') : ''}
                    </td>
                  </Fragment>
                );
              })}
            </tr>
          );
        })}

        {/* ===== MEAL BREAK ROW ===== */}
        <tr>
          <td colSpan={3} style={{ ...cellBorder, padding: '4px 6px', textAlign: 'left', verticalAlign: 'top' }}>
            <div style={{ fontSize: 7.5, fontWeight: 700, lineHeight: 1.5 }}>
              30 MINUTES MEAL BREAK TAKEN (Circle as appropriate)
            </div>
            <div style={{ fontSize: 7, lineHeight: 1.5 }}>Mandatory requirement</div>
          </td>
          {DAYS.map((d) => {
            const firstWorker = workers[0];
            const mb = firstWorker?.days[d.key as DayKey]?.mealBreak;
            const yCircle = mb === 'Y';
            const nCircle = mb === 'N';
            return (
              <td key={`mb-${d.key}`} colSpan={2} style={{ ...cellBorder, padding: '4px 2px', fontSize: 10, fontWeight: 700, textAlign: 'center' }}>
                <span style={yCircle ? { border: '2px solid #000', borderRadius: '50%', padding: '0 4px' } : undefined}>Y</span>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <span style={nCircle ? { border: '2px solid #000', borderRadius: '50%', padding: '0 4px' } : undefined}>N</span>
              </td>
            );
          })}
        </tr>

        {/* ===== FOOTER ===== */}
        <tr>
          {/* Briefings */}
          <td colSpan={6} style={{ ...cellBorder, padding: '8px 10px', verticalAlign: 'top', textAlign: 'left', fontSize: 8 }}>
            <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 8 }}>
              CLIENT CONFIRMATION OF ONSITE BREIFINGS UNDERTAKEN
            </div>
            <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 8 }}>Rule book Requirements:</div>
            <div style={{ fontSize: 7, lineHeight: 1.4, marginBottom: 8 }}>
              I certify that the above persons have been briefed in accordance with the
              relevant sections of the Modular Rule Book. (A safe system of work Briefing
              and the relevant Health, Safety & Welfare arrangements).
            </div>
            <div style={{ fontSize: 8, minHeight: 18 }}>
              SIGNED{' '}
              {signoff.briefings.signature ? (
                <img src={signoff.briefings.signature} alt="Signature" style={{ height: 21, verticalAlign: 'middle' }} />
              ) : LINE}
            </div>
            <div style={{ fontSize: 8 }}>PRINT{signoff.briefings.print ? ` ${signoff.briefings.print}` : `${LINE}`}</div>
            <div style={{ fontSize: 8 }}>DATE{signoff.briefings.date ? ` ${signoff.briefings.date}` : `${LINE}`}</div>
          </td>

          {/* Supplier + Client */}
          <td colSpan={5} style={{ ...cellBorder, padding: '8px 10px', verticalAlign: 'top', textAlign: 'left', fontSize: 8 }}>
            <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 8 }}>
              CONFIRMATION OF HOURS ON SITE:
            </div>

            <div style={{ fontWeight: 700, marginBottom: 2, fontSize: 8 }}>SUPPLIER:</div>
            <div style={{ fontSize: 8, minHeight: 18 }}>
              SIGNED{' '}
              {signoff.supplier.signature ? (
                <img src={signoff.supplier.signature} alt="Signature" style={{ height: 21, verticalAlign: 'middle' }} />
              ) : LINE_SHORT}
            </div>
            <div style={{ fontSize: 8 }}>PRINT{signoff.supplier.print ? ` ${signoff.supplier.print}` : `${LINE_SHORT}`}</div>
            <div style={{ marginBottom: 10, fontSize: 8 }}>DATE{signoff.supplier.date ? ` ${signoff.supplier.date}` : `${LINE_SHORT}`}</div>

            <div style={{ fontWeight: 700, marginBottom: 2, fontSize: 8 }}>CLIENT:</div>
            <div style={{ fontSize: 8, minHeight: 18 }}>
              SIGNED{' '}
              {signoff.client.signature ? (
                <img src={signoff.client.signature} alt="Signature" style={{ height: 21, verticalAlign: 'middle' }} />
              ) : LINE_SHORT}
            </div>
            <div style={{ fontSize: 8 }}>PRINT{signoff.client.print ? ` ${signoff.client.print}` : `${LINE_SHORT}`}</div>
            <div style={{ fontSize: 8 }}>DATE{signoff.client.date ? ` ${signoff.client.date}` : `${LINE_SHORT}`}</div>
          </td>

          {/* Meal deduction notice + Notes — stacked in separate boxes */}
          <td colSpan={6} style={{ ...cellBorder, padding: 0, verticalAlign: 'top' }}>
            <div style={{ ...cellBorder, padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #000' }}>
              <div style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.3 }}>
                30 MINS BREAK WILL BE DEDUCTED IF MEAL BREAKS NOT CIRCLED
              </div>
            </div>
            <div style={{ padding: '8px 10px', textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 9, marginBottom: 4 }}>NOTES:</div>
              <div style={{ fontSize: 8, minHeight: 40 }}>{notes || ''}</div>
            </div>
          </td>
        </tr>
      </table>
    </div>
  );
}
