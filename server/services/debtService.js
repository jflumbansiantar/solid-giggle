const Debt = require('../models/Debt');

async function getDebts() {
  return Debt.find().sort({ balance: -1 });
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
