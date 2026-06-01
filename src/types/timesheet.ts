export type DayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thur' | 'fri' | 'sat';
export type MealBreak = 'Y' | 'N';
export type TimesheetStatus = 'draft' | 'completed' | 'signed';
export type TimesheetMode = 'single' | 'crew';

export interface DayEntry {
  start: string;
  finish: string;
  mealBreak: MealBreak;
}

export interface WorkerData {
  ref: string;
  name: string;
  trade: string;
  days: Record<DayKey, DayEntry>;
}

export interface SignatoryBlock {
  signature: string;
  print: string;
  date: string;
}

export interface TimesheetHeader {
  timesheetNumber: string;
  client: string;
  location: string;
  clientContact: string;
  purchaseOrderNo: string;
  weekEndingDate: string;
  [key: string]: string;
}

export interface Timesheet {
  id: string;
  status: TimesheetStatus;
  mode: TimesheetMode;
  header: TimesheetHeader;
  workers: WorkerData[];
  notes: string;
  signoff: {
    briefings: SignatoryBlock;
    supplier: SignatoryBlock;
    client: SignatoryBlock;
  };
  createdAt: number;
  updatedAt: number;
}

export function emptyDayEntry(): DayEntry {
  return { start: '', finish: '', mealBreak: 'N' };
}

export function emptyWorker(): WorkerData {
  return {
    ref: '',
    name: '',
    trade: '',
    days: {
      sun: emptyDayEntry(),
      mon: emptyDayEntry(),
      tue: emptyDayEntry(),
      wed: emptyDayEntry(),
      thur: emptyDayEntry(),
      fri: emptyDayEntry(),
      sat: emptyDayEntry(),
    },
  };
}

export function emptySignatory(): SignatoryBlock {
  return { signature: '', print: '', date: '' };
}

export function createEmptyTimesheet(mode: TimesheetMode): Timesheet {
  const now = Date.now();
  return {
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    status: 'draft',
    mode,
    header: {
      timesheetNumber: '',
      client: '',
      location: '',
      clientContact: '',
      purchaseOrderNo: '',
      weekEndingDate: '',
    },
    workers: [emptyWorker()],
    notes: '',
    signoff: {
      briefings: emptySignatory(),
      supplier: emptySignatory(),
      client: emptySignatory(),
    },
    createdAt: now,
    updatedAt: now,
  };
}
