# Full Specification — Coyle Rail Timesheet PWA

## 1. Product summary
Build an **installable Progressive Web App (PWA)** that lets a rail worker record weekly hours and produce a PDF that is pixel-faithful to the Coyle Rail **"RECORD OF HOURS WORKED"** paper form. The app must:
- Collect data through a **one-field-at-a-time wizard** (enter a value, auto-advance to the next).
- **Auto-populate** a timesheet laid out identically to the official form.
- **Save** timesheets on the device and allow **re-opening/editing** any saved sheet at any time.
- Support **supervisor sign-off** via an on-screen **drawn signature**.
- **Generate a PDF** and hand it to the device's **native share/email** sheet.
- Run on both **Android and PC** from a **single codebase**, **offline-capable**, **no accounts, no backend, no hosting cost**.

## 2. Target platforms & delivery
- Single web codebase delivered as a **PWA**.
- On **Android**: open in Chrome -> "Add to Home screen" -> launches full-screen like a native app.
- On **PC** (Chrome/Edge): "Install app" -> standalone desktop window.
- Must work **fully offline** after first load (service worker caches the app shell + assets).
- All data and PDF generation happen **client-side**; no server is required at any point.

## 3. The source form to replicate (Coyle Rail "RECORD OF HOURS WORKED")
Reproduce this exact layout in both the on-screen preview and the PDF.

**Top band (3 cells across):**
- **Left:** Coyle Rail logo (green "COYLE" wordmark + "RAIL"). Use a placeholder image slot `/public/assets/coyle-logo.png` that can be swapped for the real logo later.
- **Centre:** fixed address text — `HYGEIA, 66-68 COLLEGE ROAD, HARROW, MIDDLESEX, HA1 1BE` / `TEL: 020 8861 3000`.
- **Right:** bold title `RECORD OF HOURS WORKED` with `TIMESHEET NUMBER:` beneath.

**Header block (editable fields):**
- Left column: `CLIENT:` (default value **CRSA**), `LOCATION:`, `CLIENT CONTACT:`.
- Right column: `CLIENTS PURCHASE ORDER NO:`, `WEEK ENDING DATE:` (e.g. 22/05/2026), `CLIENT DELIVERY UNIT:`.
- Full-width caption line: `TO ENSURE PROMPT PAYMENT THE PURCHASE ORDER NUMBER MUST BE RECORDED.`

**Main hours grid:**
- Left caption cell: `ACTUAL ON SITE WORKING TIMES ONLY MUST BE RECODED` (keep the form's original spelling "RECODED").
- Day columns across the top in this order: **SUN, MON, TUE, WED, THUR, FRI, SAT**. Each day is split into two sub-columns: **START** and **FINISH**.
- Row header columns on the left: **REF**, **NAME**, **TRADE**.
- Approximately **17 blank worker rows** (the app fills 1 row in single mode, multiple rows in crew mode; remaining rows stay blank).
- A meal-break row spanning all days: `30 MINUTES MEAL BREAK TAKEN (Circle as appropriate) - Mandatory requirement`, with a **Y / N** pair under **each** day (the chosen value is circled/highlighted).

**Footer band (sign-off + notices):**
- **Left cell — Briefings certification:** `CLIENT CONFIRMATION OF ONSITE BREIFINGS UNDERTAKEN - Rule book Requirements:` then the certification paragraph: *"I certify that the above persons have been briefed in accordance with the relevant sections of the Modular Rule Book. (A safe system of work Briefing and the relevant Health, Safety & Welfare arrangements)."* followed by `SIGNED...`, `PRINT...`, `DATE...`. (Keep the form's spelling "BREIFINGS".)
- **Middle cell — Confirmation of hours on site:** `SUPPLIER:` block (SIGNED / PRINT / DATE) and `CLIENT:` block (SIGNED / PRINT / DATE).
- **Right cell:** bold notice `30 MINS BREAK WILL BE DEDUCTED IF MEAL BREAKS NOT CIRCLED`, and a `NOTES:` area below.

## 4. Modes
When starting a new timesheet, the user **chooses the mode**:
- **Single worker** — wizard collects one REF/NAME/TRADE and that week's daily times; PDF fills one row.
- **Crew** — wizard lets the user add multiple workers, each with their own REF/NAME/TRADE and daily START/FINISH + break, all on one sheet (multiple rows).

## 5. Wizard behaviour (one field per step)
- Presents **one input at a time**; on valid entry it **auto-advances** to the next field.
- **Back / Next** navigation and a **progress indicator**.
- **Autosaves** after every step (so an interrupted session is never lost).
- Step order:
  1. Header fields: Timesheet Number, Client (pre-filled CRSA, editable), Location, Client Contact, Purchase Order No, Week Ending Date, Client Delivery Unit.
  2. Per worker: REF -> NAME -> TRADE -> then for **each day SUN->SAT**: START time -> FINISH time -> Meal break taken? **Y/N**.
  3. (Crew) "Add another worker?" loop.
  4. Notes.
- Daily hours entry style is **Start + Finish + break Y/N per day** (no automatic hour totals required; can be added later).

## 6. Save / edit / data storage
- **On-device only** storage using **IndexedDB** (via **Dexie.js**). No cloud sync, no accounts. Each device keeps its own copies.
- Full **CRUD**: create, open/edit, duplicate, delete saved timesheets.
- Each timesheet has a **status**: `Draft` -> `Completed` -> `Signed`, shown as a badge in the list.
- A timesheet can be re-opened and edited at **any** stage.

## 7. Sign-off
- On the sign-off screen, capture **drawn signatures** (finger on Android / mouse on PC) via a signature pad, plus typed **PRINT name** and **DATE**, for each signatory: **Briefings**, **Supplier**, **Client**.
- Signatures stored as PNG data URLs and **embedded into the PDF**.
- Completing sign-off sets status -> `Signed`.

## 8. PDF generation & emailing
- Generate the PDF **in-browser** (client-side) recreating the full layout above, with the meal-break Y/N circled per day and signatures embedded.
- Provide a **preview**, then a **Share/Email** action using the **Web Share API** (`navigator.share` with a `files` attachment) so the user picks the email app/recipient on Android or PC.
- Provide **Download** and **mailto** as fallbacks where Web Share with files is unsupported.
- The app does **not** send email itself (no mail server).

## 9. Data model
```
Timesheet {
  id: string
  status: 'draft' | 'completed' | 'signed'
  mode: 'single' | 'crew'
  header: {
    timesheetNumber: string
    client: string            // default "CRSA"
    location: string
    clientContact: string
    purchaseOrderNo: string
    weekEndingDate: string    // dd/mm/yyyy
    clientDeliveryUnit: string
  }
  workers: Array<{
    ref: string
    name: string
    trade: string
    days: {
      sun|mon|tue|wed|thur|fri|sat: {
        start: string         // "HH:MM"
        finish: string        // "HH:MM"
        mealBreak: 'Y' | 'N'
      }
    }
  }>
  notes: string
  signoff: {
    briefings: { signature: string /* PNG dataURL */, print: string, date: string }
    supplier:  { signature: string, print: string, date: string }
    client:    { signature: string, print: string, date: string }
  }
  createdAt: number
  updatedAt: number
}
```
- Keep all **field labels, day order, and header keys in a single `formConfig` module** so they're easy to change during development.

## 10. Recommended tech stack
- **Vite + React + TypeScript** (builds to static files, single codebase).
- **vite-plugin-pwa** (Workbox) for manifest + service worker (installable + offline).
- **Dexie.js** for IndexedDB storage and CRUD.
- **react-signature-canvas** for the signature pad.
- **pdf-lib** (or `@react-pdf/renderer`) for client-side PDF drawing + image embedding.
- **Web Share API** for native share/email; mailto + download fallback.

## 11. Screens
1. **Home / list** — saved timesheets with status badges; actions: New, Open/Edit, Duplicate, Delete, Generate PDF.
2. **New Timesheet** — pick **Single** or **Crew**.
3. **Wizard** — one field per step, auto-advance, Back/Next, progress, autosave.
4. **Review / Preview** — live render of the filled form; edit any field; Save / Mark complete.
5. **Sign-off** — signature pads + print name + date for Briefings/Supplier/Client.
6. **PDF & Share** — generate, preview, Share/Email or Download.

## 12. Proposed file structure
```
Timesheet/
  index.html
  package.json
  vite.config.ts          # includes vite-plugin-pwa config
  tsconfig.json
  public/
    manifest.webmanifest
    icons/                # PWA icons (192, 512, maskable)
    assets/coyle-logo.png # placeholder logo
  src/
    main.tsx
    App.tsx               # routing
    config/formConfig.ts  # labels, days, header field defs (CRSA default)
    types/timesheet.ts
    db/database.ts        # Dexie schema + CRUD
    components/
      Wizard/             # WizardShell + per-field step components
      SignaturePad.tsx
      TimesheetPreview.tsx
    pages/
      Home.tsx
      NewTimesheet.tsx
      Review.tsx
      SignOff.tsx
      ExportPDF.tsx
    pdf/generatePdf.ts     # recreates form layout, embeds signatures
    utils/
      share.ts            # Web Share + fallbacks
      hours.ts            # time helpers
```

## 13. Build order
1. Scaffold Vite + React + TS; add PWA plugin, manifest, icons.
2. Types + `formConfig` + Dexie DB layer.
3. Home/list screen with CRUD + autosave.
4. Wizard shell + step components (single & crew) with per-step autosave.
5. Live `TimesheetPreview` matching the grid.
6. Signature pad + sign-off screen.
7. `generatePdf` recreating the layout and embedding signatures.
8. Share/email integration + download fallback.
9. Polish: offline test, install test on Android & PC.

## 14. Explicit decisions & assumptions
- Delivery = **Installable PWA** (single codebase for Android + PC).
- Storage = **on-device only** (IndexedDB), no accounts/sync.
- Sign-off = **on-screen drawn signature**.
- Mode = **user chooses Single or Crew** per new timesheet.
- Email = **device share/email sheet**, app does not send mail directly.
- Header = **all fields editable** (labels centralised, may change during dev).
- Daily entry = **Start + Finish + break Y/N** (no auto totals for now).
- Logo = **layout recreated**, real PNG dropped in later.
- Preserve the form's original wording/spelling ("RECODED", "BREIFINGS").
