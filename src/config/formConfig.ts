export const DAYS: readonly { key: string; label: string }[] = [
  { key: 'sun', label: 'SUN' },
  { key: 'mon', label: 'MON' },
  { key: 'tue', label: 'TUE' },
  { key: 'wed', label: 'WED' },
  { key: 'thur', label: 'THUR' },
  { key: 'fri', label: 'FRI' },
  { key: 'sat', label: 'SAT' },
] as const;

export const HEADER_FIELDS = [
  { key: 'timesheetNumber', label: 'Timesheet Number', defaultValue: '' },
  { key: 'client', label: 'Client', defaultValue: '' },
  { key: 'location', label: 'Location', defaultValue: '' },
  { key: 'clientContact', label: 'Client Contact', defaultValue: '' },
  { key: 'purchaseOrderNo', label: 'Clients Purchase Order No', defaultValue: '' },
  { key: 'weekEndingDate', label: 'Week Ending Date', defaultValue: '', type: 'date' },
] as const;

export const WIZARD_SKIP_FIELDS = ['purchaseOrderNo'];

export const COMPANY_INFO = {
  name: 'HYGEIA',
  address: '66-68 COLLEGE ROAD, HARROW, MIDDLESEX, HA1 1BE',
  tel: 'TEL: 020 8861 3000',
  brand: 'COYLE RAIL',
} as const;

export const FORM_TEXT = {
  title: 'RECORD OF HOURS WORKED',
  caption: 'ACTUAL ON SITE WORKING TIMES ONLY MUST BE RECODED',
  poNotice: 'TO ENSURE PROMPT PAYMENT THE PURCHASE ORDER NUMBER MUST BE RECORDED.',
  mealBreakLabel: '30 MINUTES MEAL BREAK TAKEN (Circle as appropriate) - Mandatory requirement',
  mealBreakDeduction: '30 MINS BREAK WILL BE DEDUCTED IF MEAL BREAKS NOT CIRCLED',
  briefingsTitle: 'CLIENT CONFIRMATION OF ONSITE BREIFINGS UNDERTAKEN - Rule book Requirements:',
  briefingsText: 'I certify that the above persons have been briefed in accordance with the relevant sections of the Modular Rule Book. (A safe system of work Briefing and the relevant Health, Safety & Welfare arrangements).',
  hoursConfirmation: 'CONFIRMATION OF HOURS ON SITE',
  supplier: 'SUPPLIER',
  client: 'CLIENT',
  notes: 'NOTES',
} as const;

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  completed: 'Completed',
  signed: 'Signed',
};
