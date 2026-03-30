/**
 * Seed data for the Debt collection.
 * Each entry mirrors the Debt schema fields.
 */
const debts = [
  {
    name:           'Chase Sapphire Reserve',
    type:           'Credit Card',
    balance:        4250.75,
    interestRate:   24.99,
    minimumPayment: 85,
    dueDay:         15,
    currency:       'USD',
    debtApp:        'Chase Mobile',
    notes:          'Pay in full to avoid interest',
  },
  {
    name:           'BCA KTA Personal Loan',
    type:           'Personal Loan',
    balance:        32000000,
    interestRate:   11.5,
    minimumPayment: 1450000,
    dueDay:         10,
    currency:       'IDR',
    debtApp:        'myBCA',
    notes:          '24-month term, started Jan 2024',
  },
  {
    name:           'Home Mortgage – Wells Fargo',
    type:           'Mortgage',
    balance:        218500,
    interestRate:   6.75,
    minimumPayment: 1420,
    dueDay:         1,
    currency:       'USD',
    debtApp:        'Wells Fargo App',
    notes:          '30-year fixed, originated 2022',
  },
  {
    name:           'Toyota Auto Loan',
    type:           'Auto Loan',
    balance:        11800,
    interestRate:   5.9,
    minimumPayment: 320,
    dueDay:         20,
    currency:       'USD',
    debtApp:        'Toyota Financial',
    notes:          '',
  },
  {
    name:           'Sallie Mae Student Loan',
    type:           'Student Loan',
    balance:        27400,
    interestRate:   4.5,
    minimumPayment: 285,
    dueDay:         5,
    currency:       'USD',
    debtApp:        'Sallie Mae App',
    notes:          'Income-driven repayment plan',
  },
];

module.exports = debts;
