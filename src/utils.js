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

// This function now requires the full state to find related items
export function calculateUnitRemaining(unit, allContracts, allPayments) {
  const contract = allContracts.find(c => c.unitId === unit.id);
  if (!contract) {
    return Number(unit.totalPrice || 0);
  }

  const totalPrice = Number(contract.totalPrice || 0);

  const installmentPayments = allPayments
      .filter(p => p.unitId === unit.id && p.installmentId)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const downPayment = Number(contract.downPayment || 0);

  // Total paid towards the principal is the down payment plus all installment payments.
  const totalPaid = downPayment + installmentPayments;

  const remaining = totalPrice - totalPaid;
  return Math.max(0, remaining);
}
