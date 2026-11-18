let appState = loadState();
let currentPage = 'dashboard';
let txFilters = { query: '', category: 'ALL', type: 'ALL' };

const PAGE_META = {
  dashboard: {
    eyebrow: 'MONDAY, NOVEMBER 02, 2026',
    subtitle: 'Here is your financial picture for November.'
  },
  transactions: {
    eyebrow: 'MONEY MANAGEMENT',
    title: 'Transactions',
    subtitle: 'Review, search, and organize your account activity.'
  },
  budgets: {
    eyebrow: 'SPENDING LIMITS',
    title: 'Budgets',
    subtitle: 'Set monthly category caps and track remaining balances.'
  },
  analytics: {
    eyebrow: 'FINANCIAL INSIGHTS',
    title: 'Analytics',
    subtitle: 'Compare cash flow trends and category distributions.'
  },
  goals: {
    eyebrow: 'TARGET TRACKER',
    title: 'Savings Goals',
    subtitle: 'Contribute toward milestones that matter to you.'
  },
  notifications: {
    eyebrow: 'ALERTS & REMINDERS',
    title: 'Notifications',
    subtitle: 'Stay ahead of budget thresholds and deposits.'
  },
  settings: {
    eyebrow: 'WORKSPACE SETTINGS',
    title: 'Profile & Settings',
    subtitle: 'Manage demo data, account profile, and project credits.'
  }
};

function updateUserUI() {
  const firstName = appState.user.name.split(' ')[0];
  const initials = appState.user.name
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  document.getElementById('sidebar-user-name').textContent = appState.user.name;
  document.getElementById('user-initials').textContent = initials || 'MP';

  if (currentPage === 'dashboard') {
    document.getElementById('page-title').textContent = `Good morning, ${firstName}`;
  }
}

function renderCurrentPage() {
  const container = document.getElementById('view-container');
  const summary = computeSummary(appState);
  const meta = PAGE_META[currentPage];

  document.getElementById('page-eyebrow').textContent = meta.eyebrow;
  document.getElementById('page-subtitle').textContent = meta.subtitle;
  if (currentPage !== 'dashboard') {
    document.getElementById('page-title').textContent = meta.title;
  } else {
    updateUserUI();
  }

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === currentPage);
  });

  if (currentPage === 'dashboard') renderDashboardPage(container, appState, summary);
  if (currentPage === 'transactions') renderTransactionsPage(container, appState, txFilters);
  if (currentPage === 'budgets') renderBudgetsPage(container, appState, summary);
  if (currentPage === 'analytics') renderAnalyticsPage(container, appState, summary);
  if (currentPage === 'goals') renderGoalsPage(container, appState);
  if (currentPage === 'notifications') renderNotificationsPage(container, appState);
  if (currentPage === 'settings') renderSettingsPage(container, appState);

  bindDynamicEvents();
  if (window.lucide) lucide.createIcons();
}

function bindDynamicEvents() {
  // Jump to transactions from dashboard
  document.querySelectorAll('[data-jump]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = btn.dataset.jump;
      renderCurrentPage();
    });
  });

  // Delete transaction
  document.querySelectorAll('[data-delete-tx]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.deleteTx;
      appState.transactions = appState.transactions.filter(t => t.id !== id);
      saveState(appState);
      renderCurrentPage();
    });
  });

  // Transaction page filters
  const fSearch = document.getElementById('tx-filter-search');
  const fCat = document.getElementById('tx-filter-cat');
  const fType = document.getElementById('tx-filter-type');
  if (fSearch) {
    fSearch.addEventListener('input', e => {
      txFilters.query = e.target.value;
      renderCurrentPage();
    });
  }
  if (fCat) {
    fCat.addEventListener('change', e => {
      txFilters.category = e.target.value;
      renderCurrentPage();
    });
  }
  if (fType) {
    fType.addEventListener('change', e => {
      txFilters.type = e.target.value;
      renderCurrentPage();
    });
  }

  // Budget modal trigger
  const openBudgetBtn = document.getElementById('open-budget-modal');
  if (openBudgetBtn) {
    openBudgetBtn.addEventListener('click', () => {
      document.getElementById('budget-modal').classList.remove('hidden');
    });
  }

  // Add money to savings goal
  document.querySelectorAll('[data-add-goal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.addGoal;
      const step = Number(btn.dataset.step);
      const goal = appState.goals.find(g => g.id === id);
      if (goal) {
        goal.saved += step;
        saveState(appState);
        renderCurrentPage();
      }
    });
  });

  // Settings actions
  const switchBtn = document.getElementById('switch-account-btn');
  if (switchBtn) {
    switchBtn.addEventListener('click', () => {
      document.getElementById('auth-screen').classList.remove('hidden');
    });
  }

  const resetBtn = document.getElementById('reset-demo-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      appState = resetState();
      updateUserUI();
      renderCurrentPage();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Sidebar navigation
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = btn.dataset.page;
      document.getElementById('sidebar').classList.remove('open');
      renderCurrentPage();
    });
  });

  // Mobile drawer toggle
  document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Topbar global search
  document.getElementById('global-search').addEventListener('input', e => {
    txFilters.query = e.target.value;
    if (currentPage !== 'transactions') currentPage = 'transactions';
    renderCurrentPage();
  });

  // Quick notifications button
  document.getElementById('quick-notif-btn').addEventListener('click', () => {
    currentPage = 'notifications';
    renderCurrentPage();
  });

  // User profile pill opens auth switcher
  document.getElementById('user-profile-btn').addEventListener('click', () => {
    document.getElementById('auth-screen').classList.remove('hidden');
  });

  // Demo chips in auth screen
  document.querySelectorAll('[data-demo-user]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.getElementById('login-name').value = chip.dataset.demoUser;
      document.getElementById('login-email').value = chip.dataset.demoEmail;
    });
  });

  // Auth form submit
  document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    appState.user.name = document.getElementById('login-name').value.trim() || 'Minji Park';
    appState.user.email = document.getElementById('login-email').value.trim();
    saveState(appState);
    updateUserUI();
    document.getElementById('auth-screen').classList.add('hidden');
    renderCurrentPage();
  });

  // Add transaction modal controls
  const txModal = document.getElementById('tx-modal');
  document.getElementById('open-tx-modal').addEventListener('click', () => txModal.classList.remove('hidden'));
  document.getElementById('close-tx-modal').addEventListener('click', () => txModal.classList.add('hidden'));
  document.getElementById('cancel-tx-modal').addEventListener('click', () => txModal.classList.add('hidden'));

  document.getElementById('tx-form').addEventListener('submit', e => {
    e.preventDefault();
    const newTx = {
      id: 'tx_' + Date.now(),
      name: document.getElementById('tx-name').value.trim(),
      amount: Number(document.getElementById('tx-amount').value),
      category: document.getElementById('tx-category').value,
      date: document.getElementById('tx-date').value,
      type: document.getElementById('tx-type').value,
      desc: document.getElementById('tx-desc').value.trim()
    };
    appState.transactions.unshift(newTx);
    saveState(appState);
    e.target.reset();
    document.getElementById('tx-date').value = '2026-11-02';
    txModal.classList.add('hidden');
    renderCurrentPage();
  });

  // Budget modal controls
  const budgetModal = document.getElementById('budget-modal');
  document.getElementById('close-budget-modal').addEventListener('click', () => budgetModal.classList.add('hidden'));
  document.getElementById('cancel-budget-modal').addEventListener('click', () => budgetModal.classList.add('hidden'));

  document.getElementById('budget-form').addEventListener('submit', e => {
    e.preventDefault();
    const cat = document.getElementById('budget-category').value;
    const limit = Number(document.getElementById('budget-limit').value);
    const target = appState.budgets.find(b => b.category === cat);
    if (target) target.limit = limit;
    saveState(appState);
    budgetModal.classList.add('hidden');
    renderCurrentPage();
  });

  updateUserUI();
  renderCurrentPage();
});