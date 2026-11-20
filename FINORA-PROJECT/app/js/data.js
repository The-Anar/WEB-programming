const STORAGE_KEY = 'finora_app_state_v2';

const DEFAULT_STATE = {
  user: {
    name: 'Minji Park',
    email: 'minji.park@gachon.ac.kr'
  },
  baseBalance: 1698100, // Opening balance before current month transactions
  transactions: [
    // NOVEMBER 2026
    { id: 't1', name: 'Market groceries', category: 'Food', date: '2026-11-01', type: 'expense', amount: 42800, desc: 'Weekly grocery shopping' },
    { id: 't2', name: 'Salary · Studio North', category: 'Income', date: '2026-11-01', type: 'income', amount: 2850000, desc: 'Monthly part-time & studio stipend' },
    { id: 't3', name: 'Studio Apartment Rent', category: 'Housing', date: '2026-11-02', type: 'expense', amount: 550000, desc: 'November housing rent' },
    { id: 't4', name: 'Late Night Delivery & Cafes', category: 'Food', date: '2026-11-05', type: 'expense', amount: 198000, desc: 'Delivery orders & campus coffee' },
    { id: 't5', name: 'Seoul Metro & Bus', category: 'Transport', date: '2026-11-08', type: 'expense', amount: 64000, desc: 'T-money reload' },
    { id: 't6', name: 'Winter Sneakers & Hoodie', category: 'Shopping', date: '2026-11-12', type: 'expense', amount: 234600, desc: 'Seasonal apparel' },
    { id: 't7', name: 'Algorithm & Web Textbooks', category: 'Education', date: '2026-11-15', type: 'expense', amount: 38200, desc: 'Course study materials' },

    // OCTOBER 2026
    { id: 't8', name: 'Salary · Studio North', category: 'Income', date: '2026-10-01', type: 'income', amount: 2120000, desc: 'October studio stipend' },
    { id: 't9', name: 'Studio Apartment Rent', category: 'Housing', date: '2026-10-02', type: 'expense', amount: 550000, desc: 'October housing rent' },
    { id: 't10', name: 'Campus Cafeteria & Coffee', category: 'Food', date: '2026-10-14', type: 'expense', amount: 185000, desc: 'October meals & coffee' },
    { id: 't11', name: 'Autumn Jacket & Essentials', category: 'Shopping', date: '2026-10-18', type: 'expense', amount: 168000, desc: 'Seasonal clothing' },
    { id: 't12', name: 'KTX & Transit Pass', category: 'Transport', date: '2026-10-24', type: 'expense', amount: 141650, desc: 'Monthly transit + weekend trip' },
    { id: 't13', name: 'Seoul Metro', category: 'Transport', date: '2026-10-31', type: 'expense', amount: 1450, desc: 'Subway commute' },

    // SEPTEMBER 2026
    { id: 't14', name: 'Salary · Studio North', category: 'Income', date: '2026-09-01', type: 'income', amount: 2350000, desc: 'September studio stipend' },
    { id: 't15', name: 'Studio Apartment Rent', category: 'Housing', date: '2026-09-02', type: 'expense', amount: 550000, desc: 'September housing rent' },
    { id: 't16', name: 'Chuseok Dining & Groceries', category: 'Food', date: '2026-09-16', type: 'expense', amount: 310000, desc: 'Holiday food & gatherings' },
    { id: 't17', name: 'Fall Semester Books', category: 'Education', date: '2026-09-05', type: 'expense', amount: 145000, desc: 'Semester textbooks' },
    { id: 't18', name: 'Subway & Bus', category: 'Transport', date: '2026-09-20', type: 'expense', amount: 58000, desc: 'Monthly commute' },

    // AUGUST 2026
    { id: 't19', name: 'Summer Internship Stipend', category: 'Income', date: '2026-08-01', type: 'income', amount: 1810000, desc: 'August internship pay' },
    { id: 't20', name: 'Studio Apartment Rent', category: 'Housing', date: '2026-08-02', type: 'expense', amount: 550000, desc: 'August housing rent' },
    { id: 't21', name: 'Groceries & Summer Meals', category: 'Food', date: '2026-08-15', type: 'expense', amount: 215000, desc: 'August food spending' },
    { id: 't22', name: 'Tech Accessories', category: 'Shopping', date: '2026-08-22', type: 'expense', amount: 195000, desc: 'USB-C hub & mouse' }
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
  // Focus Dashboard & Budgets on the latest active month (2026-11) while keeping full history for Analytics
  const latestMonth = '2026-11';
  const currentMonthTx = state.transactions.filter(t => (t.date || '').startsWith(latestMonth));

  const totalIncome = currentMonthTx
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = currentMonthTx
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netSavings = totalIncome - totalExpenses;
  const totalBalance = state.baseBalance + netSavings;

  const categoryTotals = {};
  currentMonthTx
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