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
  wealth: {
    eyebrow: 'GROWTH FORECASTER',
    title: 'Wealth Simulator',
    subtitle: 'Project your savings across Bank, S&P 500, and Crypto scenarios.'
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
  if (currentPage === 'wealth') renderWealthPage(container, appState, summary);
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

// Toast notification helper
function showToast(message) {
  let stack = document.querySelector('.toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  const toast = document.createElement('div');
  toast.className = 'toast-item';
  toast.innerHTML = `<span style="color:var(--emerald-bright)">✓</span><span>${message}</span>`;
  stack.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = '0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 2400);
}

// Inject interactive Theme Switcher + 1-Click Quick Transactions onto Dashboard
const originalRenderDashboard = renderDashboardPage;
renderDashboardPage = function(container, state, summary) {
  originalRenderDashboard(container, state, summary);

  // Add interactive 1-click quick-demo bar at the top of the dashboard
  const quickBar = document.createElement('div');
  quickBar.className = 'quick-strip';
  quickBar.innerHTML = `
    <span style="font-size:12px;font-weight:700;color:var(--emerald-bright);">⚡ QUICK DEMO ACTIONS:</span>
    <button class="chip-btn" data-instant-tx="Campus Coffee|Food|expense|4500">+ Coffee (−₩4,500)</button>
    <button class="chip-btn" data-instant-tx="Seoul Subway|Transport|expense|1450">+ Subway (−₩1,450)</button>
    <button class="chip-btn" data-instant-tx="Part-Time Tutoring|Income|income|120000">+ Tutoring (+₩120,000)</button>
    <div style="margin-left:auto;display:flex;gap:6px;">
      <button class="chip-btn" data-set-theme="default" title="Emerald Dark">🟢 Dark</button>
      <button class="chip-btn" data-set-theme="theme-blue" title="Midnight Blue">🔵 Blue</button>
      <button class="chip-btn" data-set-theme="theme-light" title="Light Mode">☀️ Light</button>
    </div>
  `;
  container.prepend(quickBar);

  // Instant 1-click transaction handlers
  quickBar.querySelectorAll('[data-instant-tx]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [name, category, type, amount] = btn.dataset.instantTx.split('|');
      appState.transactions.unshift({
        id: 'tx_' + Date.now(),
        name,
        category,
        type,
        amount: Number(amount),
        date: '2026-11-20',
        desc: 'Quick-added from dashboard'
      });
      saveState(appState);
      renderCurrentPage();
      showToast(`Added "${name}" (${type === 'income' ? '+' : '−'}₩${Number(amount).toLocaleString()})`);
    });
  });

  // Instant theme switcher
  quickBar.querySelectorAll('[data-set-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.body.classList.remove('theme-blue', 'theme-light');
      if (btn.dataset.setTheme !== 'default') {
        document.body.classList.add(btn.dataset.setTheme);
      }
      showToast(`Switched theme to ${btn.textContent.trim()}`);
    });
  });
};

// === GLOBAL MICRO-INTERACTIONS ENGINE ===

// 1. Cursor-tracking radial spotlight on all cards
document.addEventListener('mousemove', (e) => {
  const card = e.target.closest('.kpi-card, .panel-card');
  if (!card) return;
  const rect = card.getBoundingClientRect();
  card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
  card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
});

// 2. Smooth number roll-up animation for KRW KPI values
function animateKPIValues() {
  document.querySelectorAll('.kpi-value').forEach(el => {
    const rawText = el.textContent.trim();
    if (!rawText.startsWith('₩')) return;
    const target = Number(rawText.replace(/[₩,]/g, ''));
    if (isNaN(target) || target === 0) return;

    const duration = 450;
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      el.textContent = '₩' + current.toLocaleString('ko-KR');
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

// 3. Upgrade page rendering with interactive controls across every tab
const baseRenderCurrentPage = renderCurrentPage;
renderCurrentPage = function() {
  baseRenderCurrentPage();
  animateKPIValues();

  // Dashboard: Make the 4 top KPI cards & category legend clickable shortcuts
  if (currentPage === 'dashboard') {
    const kpiCards = document.querySelectorAll('.kpi-grid .kpi-card');
    const destinations = ['transactions', 'transactions', 'budgets', 'analytics'];
    const labels = ['View all transactions', 'View income records', 'Manage category budgets', 'Open cash flow analytics'];

    kpiCards.forEach((card, idx) => {
      card.title = labels[idx];
      card.addEventListener('click', () => {
        currentPage = destinations[idx];
        renderCurrentPage();
      });
    });

    document.querySelectorAll('.legend-row').forEach(row => {
      row.style.cursor = 'pointer';
      row.title = 'Click to view transactions in this category';
      row.addEventListener('click', () => {
        const catName = row.querySelector('.legend-left span:last-child')?.textContent.trim();
        if (catName) {
          txFilters.category = catName;
          currentPage = 'transactions';
          renderCurrentPage();
        }
      });
    });
  }

  // Transactions: Add 1-click "Export CSV" button
  if (currentPage === 'transactions') {
    const filterBar = document.querySelector('.filter-bar');
    if (filterBar) {
      const exportBtn = document.createElement('button');
      exportBtn.className = 'btn btn-ghost';
      exportBtn.style.marginLeft = 'auto';
      exportBtn.textContent = '⬇ Export CSV';
      exportBtn.addEventListener('click', () => {
        const csvRows = [
          ['Name', 'Category', 'Date', 'Type', 'Amount (KRW)', 'Description'].join(','),
          ...appState.transactions.map(t =>
            [t.name, t.category, t.date, t.type, t.amount, `"${(t.desc || '').replace(/"/g, '""')}"`].join(',')
          )
        ];
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'FINORA_Transactions_2026.csv';
        a.click();
        URL.revokeObjectURL(url);
        showToast('Exported transactions to CSV!');
      });
      filterBar.appendChild(exportBtn);
    }
  }

  // Savings Goals: Add "+ New Savings Goal" button & celebration feedback
  if (currentPage === 'goals') {
    const container = document.getElementById('view-container');
    const topAction = document.createElement('div');
    topAction.style.cssText = 'display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;';
    topAction.innerHTML = `
      <span class="muted small">Click a contribution button to boost your savings progress live.</span>
      <button class="btn btn-emerald" id="quick-new-goal">+ Create New Goal</button>
    `;
    container.prepend(topAction);

    document.getElementById('quick-new-goal').addEventListener('click', () => {
      const title = prompt('New savings goal name (e.g., Tokyo Trip or Emergency Fund):');
      if (!title || !title.trim()) return;
      const targetStr = prompt('Target amount in KRW (e.g., 1000000):', '1000000');
      const target = Number(targetStr);
      if (!target || target <= 0) return;

      appState.goals.push({
        id: 'g_' + Date.now(),
        title: title.trim(),
        target,
        saved: 0,
        deadline: '2027-06-30'
      });
      saveState(appState);
      renderCurrentPage();
      showToast(`Created goal "${title.trim()}"!`);
    });

    // Trigger toast when adding funds to a goal
    document.querySelectorAll('[data-add-goal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const step = Number(btn.dataset.step);
        showToast(`Added +₩${step.toLocaleString()} toward your goal! 🎉`);
      });
    });
  }
};

// 4. Keyboard shortcuts: Press 'N' to open Add Transaction, 'Escape' to close modals
document.addEventListener('keydown', (e) => {
  const tag = document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

  if (e.key.toLowerCase() === 'n') {
    e.preventDefault();
    document.getElementById('tx-modal').classList.remove('hidden');
  } else if (e.key === 'Escape') {
    document.getElementById('tx-modal').classList.add('hidden');
    document.getElementById('budget-modal').classList.add('hidden');
  }
});

// Trigger initial enhanced render
renderCurrentPage();