export function uid(prefix) {
  return prefix + '-' + Math.random().toString(36).slice(2, 9);
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

const EGP_FORMATTER = new Intl.NumberFormat('ar-EG');
export function egp(value) {
  const num = Number(value || 0);
  return isFinite(num) ? EGP_FORMATTER.format(num) + ' ج.م' : '';
}

export function parseNumber(value) {
  const str = String(value || '').replace(/[^\d.]/g, '');
  return Number(str || 0);
}
