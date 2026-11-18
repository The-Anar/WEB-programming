const STORAGE_KEY = 'finora_app_state_v1';

const DEFAULT_STATE = {
  user: {
    name: 'Minji Park',
    email: 'minji.park@gachon.ac.kr'
  },
  baseBalance: 1698100, // Opening balance before November transactions
  transactions: [
    { id: 't1', name: 'Market groceries', category: 'Food', date: '2026-11-01', type: 'expense', amount: 42800, desc: 'Weekly grocery shopping' },
    { id: 't2', name: 'Salary · Studio North', category: 'Income', date: '2026-11-01', type: 'income', amount: 2850000, desc: 'Monthly part-time & studio stipend' },
    { id: 't3', name: 'Seoul Metro', category: 'Transport', date: '2026-10-31', type: 'expense', amount: 1450, desc: 'Subway commute' },
    { id: 't4', name: 'Design books & supplies', category: 'Education', date: '2026-10-28', type: 'expense', amount: 38200, desc: 'Web programming reference' },
    { id: 't5', name: 'Studio Apartment Rent', category: 'Housing', date: '2026-10-25', type: 'expense', amount: 550000, desc: 'Monthly housing rent' },
    { id: 't6', name: 'Campus Cafeteria & Coffee', category: 'Food', date: '2026-10-22', type: 'expense', amount: 185000, desc: 'October meals & coffee' },
    { id: 't7', name: 'Autumn Jacket & Essentials', category: 'Shopping', date: '2026-10-18', type: 'expense', amount: 168000, desc: 'Seasonal clothing' },
    { id: 't8', name: 'KTX & Transit Pass', category: 'Transport', date: '2026-10-14', type: 'expense', amount: 141650, desc: 'Monthly transit reload' }
  ],
  budgets: [
    { category: 'Food', limit: 450000, color: '#19d396' },
    { category: 'Housing', limit: 600000, color: '#0ea5e9' },
    { category: 'Transport', limit: 200000, color: '#4f9cf9' },
    { category: 'Shopping', limit: 250000, color: '#f59e0b' },
    { category: 'Education', limit: 150000, color: '#f46a6a' }
  ],
  goals: [
    { id: 'g1', title: 'Student Emergency Fund', target: 3000000, saved: 2150000, deadline: '2027-02-28' },
    { id: 'g2', title: 'MacBook / Dev Setup Upgrade', target: 1800000, saved: 1120000, deadline: '2027-05-15' },
    { id: 'g3', title: 'Jeju Semester Break Trip', target: 650000, saved: 490000, deadline: '2026-12-20' }
  ],
  monthlyHistory: [
    { month: 'Jun', income: 1650000, expenses: 980000 },
    { month: 'Jul', income: 1920000, expenses: 1140000 },
    { month: 'Aug', income: 1810000, expenses: 1020000 },
    { month: 'Sep', income: 2350000, expenses: 1290000 },
    { month: 'Oct', income: 2120000, expenses: 1180000 },
    { month: 'Nov', income: 2850000, expenses: 1127600 }
  ],
  notifications: [
    { id: 'n1', title: 'Housing budget is at 92%', body: 'You have spent ₩550,000 of your ₩600,000 Housing limit.', time: '2 hours ago' },
    { id: 'n2', title: 'Salary deposit recorded', body: '+₩2,850,000 from Studio North added to your balance.', time: '1 day ago' },
    { id: 'n3', title: 'Jeju Trip goal is 75% funded', body: 'Only ₩160,000 left to reach your December target!', time: '3 days ago' }
  ]
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    return JSON.parse(raw);
  } catch (e) {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function resetState() {
  const fresh = structuredClone(DEFAULT_STATE);
  saveState(fresh);
  return fresh;
}

function formatKRW(amount) {
  return '₩' + Math.round(Number(amount || 0)).toLocaleString('ko-KR');
}

function computeSummary(state) {
  const totalIncome = state.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = state.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netSavings = totalIncome - totalExpenses;
  const totalBalance = state.baseBalance + netSavings;

  const categoryTotals = {};
  state.transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
    });

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    netSavings,
    categoryTotals
  };
}