import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const SHOTS = 'C:\\Users\\danny\\Documents\\Coding\\Timesheet';

const html = `<!DOCTYPE html>
<html><head><style>
body { font-family: Arial, sans-serif; background: #e8edf2; padding: 20px; margin: 0; }
</style></head><body>
<div style="overflow-x:auto">
<table style="width:100%;border-collapse:collapse;border:1px solid #000;font-family:Arial,sans-serif;font-size:10px">
  <colgroup>
    <col style="width:7%"><col style="width:15%"><col style="width:8%">
    <col style="width:4.64%"><col style="width:4.64%">
    <col style="width:4.64%"><col style="width:4.64%">
    <col style="width:4.64%"><col style="width:4.64%">
    <col style="width:4.64%"><col style="width:4.64%">
    <col style="width:4.64%"><col style="width:4.64%">
    <col style="width:4.64%"><col style="width:4.64%">
  </colgroup>
  <tr>
    <td colspan="8" style="border:1px solid #000;padding:4px 6px;vertical-align:top">
      <table style="width:100%;border:none;border-collapse:collapse"><tbody><tr>
        <td style="border:none;width:35%;text-align:center;padding:6px 4px;vertical-align:middle">
          <div style="font-weight:800;font-size:18px;color:#2d6a4f;line-height:1">COYLE</div>
          <div style="font-weight:800;font-size:11px;color:#2d6a4f;letter-spacing:4px">RAIL</div>
        </td>
        <td style="border:none;text-align:center;padding:4px;font-size:8px;line-height:1.5;vertical-align:middle">
          <strong>HYGEIA,</strong><br>66-68 COLLEGE ROAD,<br>HARROW, MIDDLESEX, HA1 1BE<br>TEL: 020 8861 3000
        </td>
      </tr></tbody></table>
    </td>
    <td colspan="9" style="border:1px solid #000;padding:8px 10px;vertical-align:top">
      <div style="font-size:15px;font-weight:800;letter-spacing:0.5px;margin-bottom:8px">RECORD OF HOURS WORKED</div>
      <div style="font-size:9px;text-align:left">TIMESHEET NUMBER: </div>
    </td>
  </tr>
  <tr>
    <td colspan="8" style="border:1px solid #000;padding:4px 8px;vertical-align:top;text-align:left;font-size:9px;line-height:1.8">
      <div>CLIENT:&nbsp;&nbsp;</div>
      <div>LOCATION:&nbsp;&nbsp;</div>
      <div>CLIENT CONTACT:&nbsp;&nbsp;</div>
    </td>
    <td colspan="9" style="border:1px solid #000;padding:4px 8px;vertical-align:top;text-align:left;font-size:9px;line-height:1.8">
      <div>CLIENTS PURCHASE ORDER NO:&nbsp;&nbsp;</div>
      <div>WEEK ENDING DATE:&nbsp;&nbsp;</div>
    </td>
  </tr>
  <tr>
    <td colspan="17" style="border:1px solid #000;padding:3px 8px;text-align:left;font-size:8px;font-weight:700">
      TO ENSURE PROMPT PAYMENT THE PURCHASE ORDER NUMBER <strong>MUST</strong> BE RECORDED.
    </td>
  </tr>
  <tr>
    <td colspan="3" style="border:1px solid #000;padding:3px 6px;text-align:left;font-size:7px;font-weight:700">
      ACTUAL ON SITE WORKING TIMES ONLY <strong>MUST</strong> BE RECODED
    </td>
    <td colspan="2" style="border:1px solid #000;padding:3px 4px;font-size:9px;font-weight:700;text-align:center">SUN</td>
    <td colspan="2" style="border:1px solid #000;padding:3px 4px;font-size:9px;font-weight:700;text-align:center">MON</td>
    <td colspan="2" style="border:1px solid #000;padding:3px 4px;font-size:9px;font-weight:700;text-align:center">TUE</td>
    <td colspan="2" style="border:1px solid #000;padding:3px 4px;font-size:9px;font-weight:700;text-align:center">WED</td>
    <td colspan="2" style="border:1px solid #000;padding:3px 4px;font-size:9px;font-weight:700;text-align:center">THUR</td>
    <td colspan="2" style="border:1px solid #000;padding:3px 4px;font-size:9px;font-weight:700;text-align:center">FRI</td>
    <td colspan="2" style="border:1px solid #000;padding:3px 4px;font-size:9px;font-weight:700;text-align:center">SAT</td>
  </tr>
  <tr>
    <th style="border:1px solid #000;padding:2px 4px;text-align:left;font-size:8px;font-weight:700;background:#f5f5f5">REF:</th>
    <th style="border:1px solid #000;padding:2px 4px;text-align:left;font-size:8px;font-weight:700;background:#f5f5f5">NAME</th>
    <th style="border:1px solid #000;padding:2px 4px;text-align:left;font-size:8px;font-weight:700;background:#f5f5f5">TRADE</th>
    <th style="border:1px solid #000;padding:2px 2px;font-size:7px;font-weight:700;text-align:center;background:#f5f5f5">START</th><th style="border:1px solid #000;padding:2px 2px;font-size:7px;font-weight:700;text-align:center;background:#f5f5f5">FINISH</th>
    <th style="border:1px solid #000;padding:2px 2px;font-size:7px;font-weight:700;text-align:center;background:#f5f5f5">START</th><th style="border:1px solid #000;padding:2px 2px;font-size:7px;font-weight:700;text-align:center;background:#f5f5f5">FINISH</th>
    <th style="border:1px solid #000;padding:2px 2px;font-size:7px;font-weight:700;text-align:center;background:#f5f5f5">START</th><th style="border:1px solid #000;padding:2px 2px;font-size:7px;font-weight:700;text-align:center;background:#f5f5f5">FINISH</th>
    <th style="border:1px solid #000;padding:2px 2px;font-size:7px;font-weight:700;text-align:center;background:#f5f5f5">START</th><th style="border:1px solid #000;padding:2px 2px;font-size:7px;font-weight:700;text-align:center;background:#f5f5f5">FINISH</th>
    <th style="border:1px solid #000;padding:2px 2px;font-size:7px;font-weight:700;text-align:center;background:#f5f5f5">START</th><th style="border:1px solid #000;padding:2px 2px;font-size:7px;font-weight:700;text-align:center;background:#f5f5f5">FINISH</th>
    <th style="border:1px solid #000;padding:2px 2px;font-size:7px;font-weight:700;text-align:center;background:#f5f5f5">START</th><th style="border:1px solid #000;padding:2px 2px;font-size:7px;font-weight:700;text-align:center;background:#f5f5f5">FINISH</th>
    <th style="border:1px solid #000;padding:2px 2px;font-size:7px;font-weight:700;text-align:center;background:#f5f5f5">START</th><th style="border:1px solid #000;padding:2px 2px;font-size:7px;font-weight:700;text-align:center;background:#f5f5f5">FINISH</th>
  </tr>
  ${Array.from({length: 17}, () => `<tr style="height:20px">
    <td style="border:1px solid #000;padding:1px 4px;font-size:8px"></td><td style="border:1px solid #000;padding:1px 4px;font-size:8px"></td><td style="border:1px solid #000;padding:1px 4px;font-size:8px"></td>
    <td style="border:1px solid #000;padding:1px 2px;font-size:8px;text-align:center"></td><td style="border:1px solid #000;padding:1px 2px;font-size:8px;text-align:center"></td>
    <td style="border:1px solid #000;padding:1px 2px;font-size:8px;text-align:center"></td><td style="border:1px solid #000;padding:1px 2px;font-size:8px;text-align:center"></td>
    <td style="border:1px solid #000;padding:1px 2px;font-size:8px;text-align:center"></td><td style="border:1px solid #000;padding:1px 2px;font-size:8px;text-align:center"></td>
    <td style="border:1px solid #000;padding:1px 2px;font-size:8px;text-align:center"></td><td style="border:1px solid #000;padding:1px 2px;font-size:8px;text-align:center"></td>
    <td style="border:1px solid #000;padding:1px 2px;font-size:8px;text-align:center"></td><td style="border:1px solid #000;padding:1px 2px;font-size:8px;text-align:center"></td>
    <td style="border:1px solid #000;padding:1px 2px;font-size:8px;text-align:center"></td><td style="border:1px solid #000;padding:1px 2px;font-size:8px;text-align:center"></td>
    <td style="border:1px solid #000;padding:1px 2px;font-size:8px;text-align:center"></td><td style="border:1px solid #000;padding:1px 2px;font-size:8px;text-align:center"></td>
  </tr>`).join('\n')}
  <tr>
    <td colspan="3" style="border:1px solid #000;padding:4px 6px;text-align:left;vertical-align:top">
      <div style="font-size:7.5px;font-weight:700;line-height:1.5">30 MINUTES MEAL BREAK TAKEN (Circle as appropriate)</div>
      <div style="font-size:7px;line-height:1.5">Mandatory requirement</div>
    </td>
    <td colspan="2" style="border:1px solid #000;padding:4px 2px;font-size:10px;font-weight:700;text-align:center">Y&nbsp;&nbsp;&nbsp;&nbsp;N</td>
    <td colspan="2" style="border:1px solid #000;padding:4px 2px;font-size:10px;font-weight:700;text-align:center">Y&nbsp;&nbsp;&nbsp;&nbsp;N</td>
    <td colspan="2" style="border:1px solid #000;padding:4px 2px;font-size:10px;font-weight:700;text-align:center">Y&nbsp;&nbsp;&nbsp;&nbsp;N</td>
    <td colspan="2" style="border:1px solid #000;padding:4px 2px;font-size:10px;font-weight:700;text-align:center">Y&nbsp;&nbsp;&nbsp;&nbsp;N</td>
    <td colspan="2" style="border:1px solid #000;padding:4px 2px;font-size:10px;font-weight:700;text-align:center">Y&nbsp;&nbsp;&nbsp;&nbsp;N</td>
    <td colspan="2" style="border:1px solid #000;padding:4px 2px;font-size:10px;font-weight:700;text-align:center">Y&nbsp;&nbsp;&nbsp;&nbsp;N</td>
    <td colspan="2" style="border:1px solid #000;padding:4px 2px;font-size:10px;font-weight:700;text-align:center">Y&nbsp;&nbsp;&nbsp;&nbsp;N</td>
  </tr>
  <tr>
    <td colspan="6" style="border:1px solid #000;padding:8px 10px;vertical-align:top;text-align:left;font-size:8px">
      <div style="font-weight:700;margin-bottom:4px;font-size:8px">CLIENT CONFIRMATION OF ONSITE BREIFINGS UNDERTAKEN</div>
      <div style="font-weight:700;margin-bottom:4px;font-size:8px">Rule book Requirements:</div>
      <div style="font-size:7px;line-height:1.4;margin-bottom:8px">I certify that the above persons have been briefed in accordance with the relevant sections of the Modular Rule Book. (A safe system of work Briefing and the relevant Health, Safety & Welfare arrangements).</div>
      <div style="font-size:8px">SIGNED.................................................</div>
      <div style="font-size:8px">PRINT.................................................</div>
      <div style="font-size:8px">DATE.................................................</div>
    </td>
    <td colspan="5" style="border:1px solid #000;padding:8px 10px;vertical-align:top;text-align:left;font-size:8px">
      <div style="font-weight:700;margin-bottom:8px;font-size:8px">CONFIRMATION OF HOURS ON SITE:</div>
      <div style="font-weight:700;margin-bottom:2px;font-size:8px">SUPPLIER:</div>
      <div style="font-size:8px">SIGNED..........................</div>
      <div style="font-size:8px">PRINT..........................</div>
      <div style="margin-bottom:10px;font-size:8px">DATE..........................</div>
      <div style="font-weight:700;margin-bottom:2px;font-size:8px">CLIENT:</div>
      <div style="font-size:8px">SIGNED..........................</div>
      <div style="font-size:8px">PRINT..........................</div>
      <div style="font-size:8px">DATE..........................</div>
    </td>
    <td colspan="6" style="border:1px solid #000;padding:8px 10px;vertical-align:top;text-align:center">
      <div style="font-size:12px;font-weight:800;line-height:1.3;margin-bottom:14px">30 MINS BREAK WILL BE DEDUCTED IF MEAL BREAKS NOT CIRCLED</div>
      <div style="text-align:left;font-weight:700;font-size:9px;margin-bottom:4px">NOTES:</div>
      <div style="text-align:left;font-size:8px;min-height:40px"></div>
    </td>
  </tr>
</table>
</div>
</body></html>`;

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  await page.setContent(html);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SHOTS, 'current-preview.png'), fullPage: true });
  console.log('Screenshot saved');
  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
