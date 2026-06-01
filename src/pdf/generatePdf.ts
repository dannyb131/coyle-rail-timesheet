import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { Timesheet, DayKey } from '../types/timesheet';
import { DAYS, FORM_TEXT } from '../config/formConfig';

const PAGE_W = 841.89;
const PAGE_H = 595.28;
const MARGIN = 28;
const Y0 = PAGE_H - MARGIN;

// Column positions (x coordinates)
const LEFT = MARGIN;
const RIGHT = PAGE_W - MARGIN;
const FULL_W = RIGHT - LEFT;

// Grid columns: REF(10%), NAME(15%), TRADE(10%), 14 time cols(65% total ~4.64% each)
const REF_W = FULL_W * 0.10;
const NAME_W = FULL_W * 0.15;
const TRADE_W = FULL_W * 0.10;
const TIME_COL_W = (FULL_W - REF_W - NAME_W - TRADE_W) / 14;
const COL3_END = LEFT + REF_W + NAME_W + TRADE_W;

const DOTS = '....................................';

async function embedSignature(
  doc: PDFDocument,
  page: any,
  dataUrl: string,
  x: number,
  y: number,
  w: number,
  h: number
) {
  if (!dataUrl || !dataUrl.startsWith('data:image/png;base64,')) return;
  const b64 = dataUrl.replace('data:image/png;base64,', '');
  try {
    const pngImage = await doc.embedPng(b64);
    page.drawImage(pngImage, { x, y, width: w, height: h });
  } catch {
    // skip
  }
}

function wrapText(font: any, text: string, maxWidth: number, size: number): string[] {
  const lines: string[] = [];
  let current = '';
  for (const word of text.split(' ')) {
    const test = current ? current + ' ' + word : word;
    if (font.widthOfTextAtSize(test, size) < maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generatePdf(timesheet: Timesheet): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontB = await doc.embedFont(StandardFonts.HelveticaBold);

  const black = rgb(0, 0, 0);
  const green = rgb(0.176, 0.416, 0.31);

  let logoImg: any = null;
  try {
    const resp = await fetch(`${import.meta.env.BASE_URL}logo.jpg`);
    if (resp.ok) {
      const buf = await resp.arrayBuffer();
      logoImg = await doc.embedJpg(new Uint8Array(buf));
    }
  } catch { /* no logo */ }

  const { header, workers, notes, signoff } = timesheet;

  let y = Y0;

  function txt(t: string, x: number, yy: number, size: number, opts?: { bold?: boolean; color?: any; align?: 'left' | 'center' | 'right' }) {
    const f = opts?.bold ? fontB : font;
    const c = opts?.color || black;
    let xx = x;
    if (opts?.align === 'center') { const w = f.widthOfTextAtSize(t, size); xx = x - w / 2; }
    else if (opts?.align === 'right') { const w = f.widthOfTextAtSize(t, size); xx = x - w; }
    page.drawText(t, { x: xx, y: yy, size, font: f, color: c });
  }

  function rect(x: number, yy: number, w: number, h: number) {
    page.drawRectangle({ x, y: yy, width: w, height: h, borderColor: black, borderWidth: 0.5 });
  }

  function line(x1: number, y1: number, x2: number, y2: number) {
    page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: 0.5, color: black });
  }

  function xForCol(col: number): number {
    if (col === 0) return LEFT;
    if (col === 1) return LEFT + REF_W;
    if (col === 2) return LEFT + REF_W + NAME_W;
    if (col === 3) return COL3_END;
    return COL3_END + (col - 3) * TIME_COL_W;
  }

  // ==================== TOP BAND: Logo | Address | Title ====================
  const topH = 38;
  rect(LEFT, y - topH, FULL_W, topH);

  // Logo cell
  const logoW = FULL_W * 0.18;
  if (logoImg) {
    const logoScale = Math.min(logoW / logoImg.width, topH / logoImg.height) * 0.8;
    const lw = logoImg.width * logoScale;
    const lh = logoImg.height * logoScale;
    page.drawImage(logoImg, {
      x: LEFT + (logoW - lw) / 2,
      y: y - topH + (topH - lh) / 2,
      width: lw,
      height: lh,
    });
  } else {
    txt('COYLE', LEFT + 6, y - 14, 12, { bold: true, color: green });
    txt('RAIL', LEFT + 6, y - 25, 8, { bold: true, color: green });
  }
  line(LEFT + logoW, y, LEFT + logoW, y - topH);

  // Address cell
  const addrW = FULL_W * 0.37;
  const addrX = LEFT + logoW + 6;
  txt('HYGEIA, 66-68 COLLEGE ROAD,', addrX, y - 10, 7, { bold: true });
  txt('HARROW, MIDDLESEX, HA1 1BE', addrX, y - 19, 7);
  txt('TEL: 020 8861 3000', addrX, y - 28, 7);
  line(LEFT + logoW + addrW, y, LEFT + logoW + addrW, y - topH);

  // Title cell
  const titleX = LEFT + logoW + addrW;
  const titleW = FULL_W - logoW - addrW;
  txt('RECORD OF HOURS WORKED', titleX + titleW / 2, y - 22, 13, { bold: true, align: 'center' });

  y -= topH;

  // ==================== HEADER: Client/Location | Timesheet Number ====================
  const hdrH = 14;
  rect(LEFT, y - hdrH, FULL_W, hdrH);
  txt(`CLIENT:    ${header.client || DOTS}`, LEFT + 4, y - 8, 7);
  txt(`LOCATION:    ${header.location || DOTS}`, LEFT + 4 + FULL_W * 0.15, y - 8, 7);
  txt(`CLIENT CONTACT:    ${header.clientContact || DOTS}`, LEFT + 4 + FULL_W * 0.30, y - 8, 7);
  // Timesheet number cell
  line(COL3_END, y, COL3_END, y - hdrH);
  txt(`TIMESHEET NUMBER:    ${header.timesheetNumber || DOTS}`, COL3_END + 4, y - 8, 7);
  y -= hdrH;

  // ==================== HEADER: PO Notice | Purchase Order ====================
  rect(LEFT, y - hdrH, FULL_W, hdrH);
  txt('TO ENSURE PROMPT PAYMENT THE PURCHASE ORDER NUMBER', LEFT + 4, y - 8, 7, { bold: true });
  const mustW = fontB.widthOfTextAtSize('MUST', 7);
  const poPreW = fontB.widthOfTextAtSize('TO ENSURE PROMPT PAYMENT THE PURCHASE ORDER NUMBER ', 7);
  txt('MUST', LEFT + 4 + poPreW, y - 8, 7, { bold: true });
  txt(' BE RECORDED.', LEFT + 4 + poPreW + mustW, y - 8, 7);
  // Purchase order cell
  line(COL3_END, y, COL3_END, y - hdrH);
  txt(`CLIENTS PURCHASE ORDER NO:    ${header.purchaseOrderNo || DOTS}`, COL3_END + 4, y - 8, 7);
  y -= hdrH;

  // ==================== HEADER: (empty) | Week Ending ====================
  rect(LEFT, y - hdrH, FULL_W, hdrH);
  line(COL3_END, y, COL3_END, y - hdrH);
  txt(`WEEK ENDING DATE:    ${header.weekEndingDate || DOTS}`, COL3_END + 4, y - 8, 7);
  y -= hdrH;

  // ==================== HEADER: (empty) | Client Delivery Unit ====================
  rect(LEFT, y - hdrH, FULL_W, hdrH);
  line(COL3_END, y, COL3_END, y - hdrH);
  txt(`CLIENT DELIVERY UNIT:    ${header.clientDeliveryUnit || DOTS}`, COL3_END + 4, y - 8, 7);
  y -= hdrH;

  // ==================== GRID: Caption + Day Headers with START/FINISH ====================
  const captionH = 14;
  rect(LEFT, y - captionH, FULL_W, captionH);

  // Caption on left
  txt('ACTUAL ON SITE WORKING TIMES ONLY', LEFT + 4, y - 5, 7, { bold: true });
  const capW = fontB.widthOfTextAtSize('ACTUAL ON SITE WORKING TIMES ONLY ', 7);
  txt('MUST', LEFT + 4 + capW, y - 5, 7, { bold: true });
  const mustW2 = fontB.widthOfTextAtSize('MUST', 7);
  txt(' BE RECODED', LEFT + 4 + capW + mustW2, y - 5, 7, { bold: true });

  // Day headers + START/FINISH
  for (let i = 0; i < 7; i++) {
    const cx = xForCol(3 + i * 2) + TIME_COL_W;
    txt(DAYS[i].label, cx, y - 5, 8, { bold: true, align: 'center' });
    txt('START / FINISH', cx, y - 12, 5, { align: 'center' });
  }

  // Vertical divider
  line(COL3_END, y, COL3_END, y - captionH);

  y -= captionH;

  // ==================== GRID: Date row (REF/NAME/TRADE + dates) ====================
  const dayDates: string[] = [];
  if (header.weekEndingDate) {
    let weekEnd: Date;
    if (header.weekEndingDate.includes('-')) {
      const parts = header.weekEndingDate.split('-');
      weekEnd = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else {
      const parts = header.weekEndingDate.split('/');
      weekEnd = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    const friIdx = 5;
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekEnd);
      d.setDate(weekEnd.getDate() + (i - friIdx));
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      dayDates.push(`${dd}/${mm}/${yyyy}`);
    }
  }
  while (dayDates.length < 7) dayDates.push('');

  const dateRowH = 10;
  rect(LEFT, y - dateRowH, FULL_W, dateRowH);
  txt('REF:', LEFT + 2, y - 7, 7, { bold: true });
  txt('NAME', LEFT + REF_W + 2, y - 7, 7, { bold: true });
  txt('TRADE', LEFT + REF_W + NAME_W + 2, y - 7, 7, { bold: true });

  for (let i = 0; i < 7; i++) {
    const cx = xForCol(3 + i * 2) + TIME_COL_W;
    txt(dayDates[i], cx, y - 7, 6, { align: 'center' });
  }

  // Vertical dividers
  line(LEFT + REF_W, y, LEFT + REF_W, y - dateRowH);
  line(LEFT + REF_W + NAME_W, y, LEFT + REF_W + NAME_W, y - dateRowH);
  line(COL3_END, y, COL3_END, y - dateRowH);
  for (let i = 0; i < 7; i++) {
    const cx = xForCol(3 + i * 2);
    line(cx, y, cx, y - dateRowH);
  }

  y -= dateRowH;

  // ==================== GRID: Data rows ====================
  const rowH = 17;
  const numRows = 17;

  for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
    const worker = workers[rowIdx];
    rect(LEFT, y - rowH, FULL_W, rowH);

    // REF column
    if (worker) {
      txt(worker.ref || DOTS.slice(0, 20), LEFT + 2, y - 9, 7);
    }

    // NAME column
    if (worker) {
      txt(worker.name || DOTS.slice(0, 20), LEFT + REF_W + 2, y - 9, 7);
    }

    // TRADE column
    if (worker) {
      txt(worker.trade || '', LEFT + REF_W + NAME_W + 2, y - 9, 7);
    }

    // Time cells
    const hasData = worker && (worker.name || worker.ref);
    for (let i = 0; i < 7; i++) {
      const day = DAYS[i];
      const dayData = worker?.days[day.key as DayKey];
      const sx = xForCol(3 + i * 2);
      if (hasData) {
        if (dayData?.start) {
          txt(dayData.start, sx + TIME_COL_W * 0.25, y - 8, 6, { align: 'center' });
        } else {
          txt('----', sx + TIME_COL_W * 0.25, y - 8, 6, { align: 'center' });
        }
        if (dayData?.finish) {
          txt(dayData.finish, sx + TIME_COL_W * 0.75, y - 8, 6, { align: 'center' });
        } else {
          txt('----', sx + TIME_COL_W * 0.75, y - 8, 6, { align: 'center' });
        }
      }
    }

    // Vertical dividers
    line(LEFT + REF_W, y, LEFT + REF_W, y - rowH);
    line(LEFT + REF_W + NAME_W, y, LEFT + REF_W + NAME_W, y - rowH);
    line(COL3_END, y, COL3_END, y - rowH);
    for (let i = 0; i < 7; i++) {
      const cx = xForCol(3 + i * 2);
      line(cx, y, cx, y - rowH);
    }

    y -= rowH;
  }

  // ==================== MEAL BREAK ROW ====================
  const mealH = 14;
  rect(LEFT, y - mealH, FULL_W, mealH);

  // Label on left
  txt('30 MINUTES MEAL BREAK TAKEN', LEFT + 3, y - 5, 6, { bold: true });
  txt('(Circle as appropriate)', LEFT + 3, y - 11, 5.5);

  // Y N under each day
  const firstWorker = workers[0];
  for (let i = 0; i < 7; i++) {
    const day = DAYS[i];
    const mb = firstWorker?.days[day.key as DayKey]?.mealBreak;
    const cx = xForCol(3 + i * 2) + TIME_COL_W / 2;
    txt('Y', cx - 5, y - 7, 8, { bold: true });
    txt('N', cx + 5, y - 7, 8, { bold: true });
    // Circle the selected value
    if (mb === 'Y') {
      page.drawEllipse({
        x: cx - 5 + 3,
        y: y - 5,
        xScale: 7,
        yScale: 6,
        borderColor: black,
        borderWidth: 0.8,
      });
    } else if (mb === 'N') {
      page.drawEllipse({
        x: cx + 5 + 3,
        y: y - 5,
        xScale: 7,
        yScale: 6,
        borderColor: black,
        borderWidth: 0.8,
      });
    }
  }

  // Vertical dividers
  line(COL3_END, y, COL3_END, y - mealH);
  for (let i = 0; i < 7; i++) {
    const cx = xForCol(3 + i * 2);
    line(cx, y, cx, y - mealH);
  }

  y -= mealH;

  // ==================== FOOTER ====================

  // Divider lines
  const col1End = LEFT + FULL_W * 0.35;  // Briefings column end
  const col2End = LEFT + FULL_W * 0.65;  // Supplier/Client column end

  line(col1End, y, col1End, MARGIN);
  line(col2End, y, col2End, MARGIN);
  line(LEFT, y, RIGHT, y);

  // --- Briefings (left third) ---
  const briefX = LEFT + 4;
  let briefY = y - 8;
  txt('CLIENT CONFIRMATION OF ONSITE BREIFINGS UNDERTAKEN', briefX, briefY, 7, { bold: true });
  briefY -= 10;
  txt('Rule book Requirements:', briefX, briefY, 7, { bold: true });
  briefY -= 10;

  const briefLines = wrapText(font, FORM_TEXT.briefingsText, col1End - LEFT - 8, 6);
  for (const line of briefLines) {
    txt(line, briefX, briefY, 6);
    briefY -= 8;
  }

  briefY -= 4;
  txt(`SIGNED${signoff.briefings.signature ? ' [Signed]' : DOTS.slice(0, 35)}`, briefX, briefY, 7);
  if (signoff.briefings.signature) {
    await embedSignature(doc, page, signoff.briefings.signature, briefX + 50, briefY - 4, 50, 16);
  }
  briefY -= 10;
  txt(`PRINT${signoff.briefings.print ? ' ' + signoff.briefings.print : DOTS.slice(0, 35)}`, briefX, briefY, 7);
  briefY -= 10;
  txt(`DATE${signoff.briefings.date ? ' ' + signoff.briefings.date : DOTS.slice(0, 35)}`, briefX, briefY, 7);

  // --- Supplier + Client (middle third) ---
  const midX = col1End + 4;
  let midY = y - 8;
  txt('CONFIRMATION OF HOURS ON SITE:', midX, midY, 7, { bold: true });
  midY -= 12;

  txt('SUPPLIER:', midX, midY, 7, { bold: true });
  midY -= 10;
  txt(`SIGNED${signoff.supplier.signature ? ' [Signed]' : '...'}`, midX, midY, 7);
  if (signoff.supplier.signature) {
    await embedSignature(doc, page, signoff.supplier.signature, midX + 50, midY - 4, 50, 16);
  }
  midY -= 10;
  txt(`PRINT${signoff.supplier.print ? ' ' + signoff.supplier.print : '....'}`, midX, midY, 7);
  midY -= 10;
  txt(`DATE${signoff.supplier.date ? ' ' + signoff.supplier.date : '.....'}`, midX, midY, 7);
  midY -= 14;

  txt('CLIENT:', midX, midY, 7, { bold: true });
  midY -= 10;
  txt(`SIGNED${signoff.client.signature ? ' [Signed]' : '...'}`, midX, midY, 7);
  if (signoff.client.signature) {
    await embedSignature(doc, page, signoff.client.signature, midX + 50, midY - 4, 50, 16);
  }
  midY -= 10;
  txt(`PRINT${signoff.client.print ? ' ' + signoff.client.print : '....'}`, midX, midY, 7);
  midY -= 10;
  txt(`DATE${signoff.client.date ? ' ' + signoff.client.date : '.....'}`, midX, midY, 7);

  // --- Deduction notice + Notes (right third) ---
  const rightX = col2End + 4;
  const rightMidX = col2End + (RIGHT - col2End) / 2;

  // Deduction notice (top of right cell)
  const noticeH = 20;
  txt('30 MINS BREAK WILL BE DEDUCTED IF', rightMidX, y - 10, 8, { bold: true, align: 'center' });
  txt('MEAL BREAKS NOT CIRCLED', rightMidX, y - 20, 8, { bold: true, align: 'center' });

  // Horizontal divider
  line(col2End, y - noticeH, RIGHT, y - noticeH);

  // Notes (below divider)
  txt('NOTES:', rightX, y - noticeH - 10, 7, { bold: true });
  if (notes) {
    const noteW = RIGHT - col2End - 8;
    const noteLines = wrapText(font, notes, noteW, 6);
    let noteY = y - noticeH - 20;
    for (const l of noteLines) {
      txt(l, rightX, noteY, 6);
      noteY -= 8;
    }
  }

  return doc.save();
}
