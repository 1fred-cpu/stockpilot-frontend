export function generateReference(prefix: string = "RSK"): string {
  // Current date as YYYYMMDD
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");

  // Random 6-character alphanumeric code
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `${prefix}-${dateStr}-${randomStr}`;
}
