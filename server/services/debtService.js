const Debt = require('../models/Debt');
const Transaction = require('../models/Transaction');

async function getDebts() {
  const [debts, debtTxs] = await Promise.all([
    Debt.find().sort({ balance: -1 }).lean(),
    Transaction.find({ category: 'DEBT' }).lean(),
  ]);

  // Build a map: debtName → { totalPaid, monthsPaid }
  const paymentMap = {};
  for (const tx of debtTxs) {
    const key = (tx.name || '').trim();
    if (!paymentMap[key]) paymentMap[key] = { totalPaid: 0, monthsPaid: 0 };
    paymentMap[key].totalPaid += tx.total || 0;
    paymentMap[key].monthsPaid += 1;
  }

  // Enrich each debt with payment progress
  return debts.map((d) => {
    const info = paymentMap[(d.name || '').trim()] || { totalPaid: 0, monthsPaid: 0 };
    return { ...d, totalPaid: info.totalPaid, monthsPaid: info.monthsPaid };
  });
}

async function createDebt(data) {
  return Debt.create(data);
}

async function updateDebt(id, data) {
  const debt = await Debt.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!debt) throw Object.assign(new Error('Debt not found'), { status: 404 });
  return debt;
}

async function deleteDebt(id) {
  const debt = await Debt.findByIdAndDelete(id);
  if (!debt) throw Object.assign(new Error('Debt not found'), { status: 404 });
  return debt;
}

module.exports = { getDebts, createDebt, updateDebt, deleteDebt };
