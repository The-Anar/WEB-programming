function renderDashboardPage(container, state, summary) {
  const recent = state.transactions.slice(0, 3);
  const totalSpent = summary.totalExpenses || 1;

  const legendHTML = state.budgets.map(b => {
    const val = summary.categoryTotals[b.category] || 0;
    const pct = Math.round((val / totalSpent) * 100);
    return `
      <div class="legend-row">
        <div class="legend-left">
          <span class="dot" style="background:${b.color}"></span>
          <span>${b.category}</span>
        </div>
        <div>
          <span class="muted small" style="margin-right:8px">${pct}%</span>
          <strong>${formatKRW(val)}</strong>
        </div>
      </div>
    `;
  }).join('');

  const recentHTML = recent.map(t => `
    <div class="activity-pill">
      <div>
        <strong style="display:block;font-size:14px">${t.name}</strong>
        <span class="muted small">${t.category} · ${t.date}</span>
      </div>
      <strong class="${t.type === 'income' ? 'trend-up' : 'trend-down'}">
        ${t.type === 'income' ? '+' : '−'}${formatKRW(t.amount)}
      </strong>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-label">TOTAL BALANCE</span>
          <div class="kpi-icon"><i data-lucide="wallet"></i></div>
        </div>
        <div class="kpi-value">${formatKRW(summary.totalBalance)}</div>
        <div class="kpi-trend trend-up">↑ 8.2% vs last month</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-label">MONTHLY INCOME</span>
          <div class="kpi-icon"><i data-lucide="arrow-up-right"></i></div>
        </div>
        <div class="kpi-value">${formatKRW(summary.totalIncome)}</div>
        <div class="kpi-trend trend-up">↑ 4.5% vs last month</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-label">MONTHLY EXPENSES</span>
          <div class="kpi-icon"><i data-lucide="arrow-down-right"></i></div>
        </div>
        <div class="kpi-value">${formatKRW(summary.totalExpenses)}</div>
        <div class="kpi-trend trend-down">↓ 2.1% vs last month</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-label">MONTHLY SAVINGS</span>
          <div class="kpi-icon"><i data-lucide="piggy-bank"></i></div>
        </div>
        <div class="kpi-value">${formatKRW(summary.netSavings)}</div>
        <div class="kpi-trend trend-up">↑ 11.6% vs last month</div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="panel-card">
        <div class="panel-header">
          <div>
            <h2>Income vs expenses</h2>
            <span class="panel-sub">Monthly cash flow · last 6 months</span>
          </div>
          <span class="badge badge-income">Live Sync</span>
        </div>
        <div class="chart-wrap">
          <canvas id="cashflow-canvas"></canvas>
        </div>
      </div>

      <div class="panel-card">
        <div class="panel-header">
          <div>
            <h2>Spending by category</h2>
            <span class="panel-sub">This month · ${formatKRW(summary.totalExpenses)} spent</span>
          </div>
        </div>
        <div class="doughnut-layout">
          <div class="doughnut-box">
            <canvas id="category-canvas"></canvas>
          </div>
          <div class="category-legend">${legendHTML}</div>
        </div>
      </div>
    </div>

    <div class="panel-card">
      <div class="panel-header">
        <div>
          <h2>Recent activity</h2>
          <span class="panel-sub">Your latest income and expenses</span>
        </div>
        <button class="btn btn-ghost" data-jump="transactions">View all →</button>
      </div>
      <div class="activity-row">${recentHTML}</div>
    </div>
  `;

  renderCashflowChart('cashflow-canvas', state, summary);
  renderCategoryChart('category-canvas', state, summary);
}

function renderTransactionsPage(container, state, filters = {}) {
  const query = (filters.query || '').toLowerCase();
  const category = filters.category || 'ALL';
  const type = filters.type || 'ALL';

  const filtered = state.transactions.filter(t => {
    const matchQ = !query || t.name.toLowerCase().includes(query) || t.category.toLowerCase().includes(query) || (t.desc || '').toLowerCase().includes(query);
    const matchCat = category === 'ALL' || t.category === category;
    const matchType = type === 'ALL' || t.type === type;
    return matchQ && matchCat && matchType;
  });

  const rows = filtered.map(t => `
    <tr>
      <td>
        <strong>${t.name}</strong>
        <div class="muted small">${t.desc || 'Personal record'}</div>
      </td>
      <td>${t.category}</td>
      <td>${t.date}</td>
      <td><span class="badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}">${t.type.toUpperCase()}</span></td>
      <td class="${t.type === 'income' ? 'trend-up' : 'trend-down'}">
        <strong>${t.type === 'income' ? '+' : '−'}${formatKRW(t.amount)}</strong>
      </td>
      <td>
        <button class="btn btn-danger" style="padding:5px 10px;font-size:12px" data-delete-tx="${t.id}">Delete</button>
      </td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div class="panel-card">
      <div class="filter-bar">
        <input type="text" id="tx-filter-search" placeholder="Filter by keyword..." value="${filters.query || ''}" />
        <select id="tx-filter-cat">
          <option value="ALL">All categories</option>
          <option value="Food" ${category === 'Food' ? 'selected' : ''}>Food</option>
          <option value="Housing" ${category === 'Housing' ? 'selected' : ''}>Housing</option>
          <option value="Transport" ${category === 'Transport' ? 'selected' : ''}>Transport</option>
          <option value="Shopping" ${category === 'Shopping' ? 'selected' : ''}>Shopping</option>
          <option value="Education" ${category === 'Education' ? 'selected' : ''}>Education</option>
          <option value="Income" ${category === 'Income' ? 'selected' : ''}>Income</option>
        </select>
        <select id="tx-filter-type">
          <option value="ALL">All types</option>
          <option value="expense" ${type === 'expense' ? 'selected' : ''}>Expenses only</option>
          <option value="income" ${type === 'income' ? 'selected' : ''}>Income only</option>
        </select>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>TRANSACTION</th>
              <th>CATEGORY</th>
              <th>DATE</th>
              <th>TYPE</th>
              <th>AMOUNT</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="6" class="muted">No matching transactions found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderBudgetsPage(container, state, summary) {
  const cards = state.budgets.map(b => {
    const spent = summary.categoryTotals[b.category] || 0;
    const pct = Math.min(100, Math.round((spent / b.limit) * 100));
    const remaining = b.limit - spent;
    const statusClass = pct >= 100 ? 'over' : pct >= 80 ? 'warn' : '';

    return `
      <div class="panel-card">
        <div class="panel-header">
          <div>
            <h2>${b.category}</h2>
            <span class="panel-sub">Monthly spending limit</span>
          </div>
          <span class="badge ${pct >= 100 ? 'badge-expense' : 'badge-income'}">${pct}% used</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:14px">
          <span>Spent: <strong>${formatKRW(spent)}</strong></span>
          <span class="muted">Limit: ${formatKRW(b.limit)}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill ${statusClass}" style="width:${pct}%"></div>
        </div>
        <div class="muted small">
          ${remaining >= 0 ? `${formatKRW(remaining)} remaining this month` : `Over budget by ${formatKRW(Math.abs(remaining))}`}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="display:flex;justify-content:flex-end">
      <button class="btn btn-emerald" id="open-budget-modal">+ Edit Category Limit</button>
    </div>
    <div class="cards-2col">${cards}</div>
  `;
}

function renderAnalyticsPage(container, state, summary) {
  const savingsRate = summary.totalIncome > 0
    ? Math.round((summary.netSavings / summary.totalIncome) * 100)
    : 0;

  const topCat = Object.entries(summary.categoryTotals).sort((a, b) => b[1] - a[1])[0] || ['None', 0];

  container.innerHTML = `
    <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
      <div class="kpi-card">
        <span class="kpi-label">SAVINGS RATE</span>
        <div class="kpi-value trend-up">${savingsRate}%</div>
        <span class="muted small">Target recommended: 30%+</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">HIGHEST SPENDING CATEGORY</span>
        <div class="kpi-value">${topCat[0]}</div>
        <span class="muted small">${formatKRW(topCat[1])} spent this period</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">TOTAL RECORDS TRACKED</span>
        <div class="kpi-value">${state.transactions.length}</div>
        <span class="muted small">Stored locally in browser</span>
      </div>
    </div>

    <div class="panel-card">
      <div class="panel-header">
        <div>
          <h2>6-Month Cash Flow Trend</h2>
          <span class="panel-sub">Comparing monthly income vs. total spending</span>
        </div>
      </div>
      <div class="chart-wrap" style="height:300px">
        <canvas id="analytics-cashflow-canvas"></canvas>
      </div>
    </div>
  `;

  renderCashflowChart('analytics-cashflow-canvas', state, summary);
}

function renderGoalsPage(container, state) {
  const cards = state.goals.map(g => {
    const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
    return `
      <div class="panel-card">
        <div class="panel-header">
          <div>
            <h2>${g.title}</h2>
            <span class="panel-sub">Target date: ${g.deadline}</span>
          </div>
          <span class="badge badge-income">${pct}%</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:14px">
          <strong>${formatKRW(g.saved)}</strong>
          <span class="muted">Goal: ${formatKRW(g.target)}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${pct}%"></div>
        </div>
        <div style="margin-top:12px;display:flex;gap:8px">
          <button class="btn btn-ghost" data-add-goal="${g.id}" data-step="50000">+ ₩50,000</button>
          <button class="btn btn-emerald" data-add-goal="${g.id}" data-step="200000">+ ₩200,000</button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `<div class="cards-2col">${cards}</div>`;
}

function renderNotificationsPage(container, state) {
  const items = state.notifications.map(n => `
    <div class="activity-pill" style="margin-bottom:12px">
      <div>
        <strong style="display:block;margin-bottom:4px">${n.title}</strong>
        <span class="muted small">${n.body}</span>
      </div>
      <span class="muted small">${n.time}</span>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="panel-card">
      <div class="panel-header">
        <div>
          <h2>Budget & Activity Alerts</h2>
          <span class="panel-sub">Automated notifications for your FINORA account</span>
        </div>
      </div>
      ${items}
    </div>
  `;
}

function renderSettingsPage(container, state) {
  container.innerHTML = `
    <div class="cards-2col">
      <div class="panel-card">
        <div class="panel-header">
          <div>
            <h2>Account & Preferences</h2>
            <span class="panel-sub">Signed in as ${state.user.name}</span>
          </div>
        </div>
        <p class="muted small" style="margin-bottom:14px">Email: ${state.user.email}<br/>Currency: South Korean Won (₩ KRW)</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-ghost" id="switch-account-btn">Switch Demo Account</button>
          <button class="btn btn-danger" id="reset-demo-btn">Reset Sample Data</button>
        </div>
      </div>

      <div class="panel-card">
        <div class="panel-header">
          <div>
            <h2>Project Team & Architecture</h2>
            <span class="panel-sub">Gachon University · Web Programming Final Project</span>
          </div>
        </div>
        <p class="muted small" style="line-height:1.7">
          <strong>Group Members:</strong><br/>
          • <strong>Anar</strong> (Student ID: 202637018)<br/>
          • <strong>Ankhorgil</strong> (Student ID: 202637470)<br/><br/>
          <strong>Stack:</strong> Modular HTML5, CSS3, Vanilla JS, Chart.js, Lucide Icons, and LocalStorage persistence.
        </p>
      </div>
    </div>
  `;
}