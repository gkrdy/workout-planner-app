// Small date helpers. Dates are "YYYY-MM-DD" strings in the phone's local time.

export function toIso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fromIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number): string {
  const d = fromIso(iso);
  d.setDate(d.getDate() + days);
  return toIso(d);
}

export function today(): string {
  return toIso(new Date());
}

export function shortDate(iso: string): string {
  return fromIso(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
