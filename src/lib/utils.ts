/** Gabungkan class names, membuang falsy value */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Format tanggal ke "dd Mon" – lokal Indonesia */
export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

/** Format timestamp ke "dd Mon YY, HH:mm" */
export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Cek apakah deadline melewati hari ini (dan kolom bukan 'done') */
export function isOverdue(deadline: string, columnId: string): boolean {
  if (columnId === 'done') return false;
  const today = new Date().toISOString().split('T')[0];
  return deadline < today;
}

/** Buat inisial 2 huruf dari nama lengkap */
export function makeInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** UUID sederhana berbasis Date + random */
export function generateId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
