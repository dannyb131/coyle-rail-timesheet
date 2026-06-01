import Dexie, { type Table } from 'dexie';
import type { Timesheet } from '../types/timesheet';

class TimesheetDB extends Dexie {
  timesheets!: Table<Timesheet, string>;

  constructor() {
    super('TimesheetDB');
    this.version(1).stores({
      timesheets: 'id, status, createdAt, updatedAt',
    });
  }
}

const db = new TimesheetDB();

export async function getAllTimesheets(): Promise<Timesheet[]> {
  return db.timesheets.orderBy('updatedAt').reverse().toArray();
}

export async function getTimesheet(id: string): Promise<Timesheet | undefined> {
  return db.timesheets.get(id);
}

export async function saveTimesheet(ts: Timesheet): Promise<void> {
  ts.updatedAt = Date.now();
  await db.timesheets.put(ts);
}

export async function deleteTimesheet(id: string): Promise<void> {
  await db.timesheets.delete(id);
}

export async function duplicateTimesheet(ts: Timesheet): Promise<Timesheet> {
  const copy: Timesheet = {
    ...ts,
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    status: 'draft',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    signoff: {
      briefings: { signature: '', print: '', date: '' },
      supplier: { signature: '', print: '', date: '' },
      client: { signature: '', print: '', date: '' },
    },
  };
  await saveTimesheet(copy);
  return copy;
}

export default db;
