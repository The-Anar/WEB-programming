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
    const matchQ = !query || t.name.toLowerCase().includes(query) || t.category.toLowerCase().includes(query) || (t.desc || '').toLowerCase().includes(query) || (t.date || '').toLowerCase().includes(query);
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
        <input type="text" id="tx-filter-search" placeholder="Filter by keyword or YYYY-MM..." value="${filters.query || ''}" />
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

let monthCompareChartInstance = null;

function buildMonthlyRecords(state) {
  const map = {};

  state.transactions.forEach(t => {
    const ym = (t.date || '2026-11').slice(0, 7);
    if (!map[ym]) {
      map[ym] = {
        ym,
        income: 0,
        expenses: 0,
        categories: { Food: 0, Housing: 0, Transport: 0, Shopping: 0, Education: 0 }
      };
    }
    const amt = Number(t.amount || 0);
    if (t.type === 'income') {
      map[ym].income += amt;
    } else {
      map[ym].expenses += amt;
      map[ym].categories[t.category] = (map[ym].categories[t.category] || 0) + amt;
    }
  });

  return Object.values(map).sort((a, b) => b.ym.localeCompare(a.ym));
}

function formatMonthLabel(ym) {
  const [y, m] = ym.split('-');
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${names[Number(m) - 1] || m} ${y}`;
}

function renderAnalyticsPage(container, state, summary) {
  const monthlyList = buildMonthlyRecords(state);
  const defaultCurrent = monthlyList[0]?.ym || '2026-11';
  const defaultPrev = monthlyList[1]?.ym || defaultCurrent;

  const totalAllIncome = monthlyList.reduce((s, m) => s + m.income, 0);
  const totalAllExpenses = monthlyList.reduce((s, m) => s + m.expenses, 0);
  const avgSavingsRate = totalAllIncome > 0
    ? Math.round(((totalAllIncome - totalAllExpenses) / totalAllIncome) * 100)
    : 0;
  const avgMonthlySpend = monthlyList.length > 0
    ? Math.round(totalAllExpenses / monthlyList.length)
    : 0;
  const bestMonth = [...monthlyList].sort((a, b) => (b.income - b.expenses) - (a.income - a.expenses))[0];

  const optionsHTML = monthlyList.map(m =>
    `<option value="${m.ym}">${formatMonthLabel(m.ym)}</option>`
  ).join('');

  const tableRowsHTML = monthlyList.map(m => {
    const net = m.income - m.expenses;
    const rate = m.income > 0 ? Math.round((net / m.income) * 100) : 0;
    const topEntry = Object.entries(m.categories).sort((a, b) => b[1] - a[1])[0] || ['None', 0];
    return `
      <tr data-select-month="${m.ym}" style="cursor:pointer;" title="Click to compare ${formatMonthLabel(m.ym)} above">
        <td><strong>${formatMonthLabel(m.ym)}</strong></td>
        <td class="trend-up">+${formatKRW(m.income)}</td>
        <td class="trend-down">−${formatKRW(m.expenses)}</td>
        <td><strong>${formatKRW(net)}</strong> <span class="muted small">(${rate}%)</span></td>
        <td><span class="badge badge-expense">${topEntry[0]} · ${formatKRW(topEntry[1])}</span></td>
        <td>
          <button class="btn btn-ghost" style="padding:4px 10px;font-size:12px;" data-inspect-tx="${m.ym}">
            Inspect →
          </button>
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);">
      <div class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-label">AVG. SAVINGS RATE</span>
          <div class="kpi-icon"><i data-lucide="percent"></i></div>
        </div>
        <div class="kpi-value trend-up">${avgSavingsRate}%</div>
        <div class="kpi-trend muted">Across ${monthlyList.length} tracked months</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-label">AVG. MONTHLY SPENDING</span>
          <div class="kpi-icon"><i data-lucide="flame"></i></div>
        </div>
        <div class="kpi-value">${formatKRW(avgMonthlySpend)}</div>
        <div class="kpi-trend muted">Average monthly outflow</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-label">BEST SAVING MONTH</span>
          <div class="kpi-icon"><i data-lucide="award"></i></div>
        </div>
        <div class="kpi-value">${bestMonth ? formatMonthLabel(bestMonth.ym) : 'N/A'}</div>
        <div class="kpi-trend trend-up">${bestMonth ? '+' + formatKRW(bestMonth.income - bestMonth.expenses) + ' saved' : ''}</div>
      </div>
    </div>

    <div class="panel-card">
      <div class="panel-header" style="align-items:center;flex-wrap:wrap;gap:12px;">
        <div>
          <h2>Spending &amp; Cash Flow Intelligence</h2>
          <span class="panel-sub">Compare two months by category or switch to the multi-month trend</span>
        </div>

        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <div id="month-selectors" style="display:flex;align-items:center;gap:8px;">
            <select id="compare-month-a" style="background:var(--bg-input);border:1px solid var(--emerald-border);border-radius:10px;padding:7px 11px;font-size:13px;font-weight:600;">
              ${optionsHTML}
            </select>
            <span class="muted small">vs</span>
            <select id="compare-month-b" style="background:var(--bg-input);border:1px solid var(--border-subtle);border-radius:10px;padding:7px 11px;font-size:13px;font-weight:600;">
              ${optionsHTML}
            </select>
          </div>

          <button class="chip-btn" id="mode-bar-btn" style="border-color:var(--emerald-bright);color:var(--emerald-bright);">📊 Category Compare</button>
          <button class="chip-btn" id="mode-line-btn">📈 Multi-Month Trend</button>
        </div>
      </div>

      <div id="overspend-callout" class="quick-strip" style="margin-bottom:18px;"></div>

      <div class="chart-wrap" style="height:280px;">
        <canvas id="month-compare-canvas"></canvas>
      </div>
    </div>

    <div class="panel-card">
      <div class="panel-header">
        <div>
          <h2>Monthly Financial Archive</h2>
          <span class="panel-sub">Click any row to load that month into the comparison chart above</span>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>MONTH</th>
              <th>TOTAL INCOME</th>
              <th>TOTAL EXPENSES</th>
              <th>NET SAVED (RATE)</th>
              <th>BIGGEST SPENDING LEAK</th>
              <th>RECORDS</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHTML}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const selA = document.getElementById('compare-month-a');
  const selB = document.getElementById('compare-month-b');
  selA.value = defaultCurrent;
  selB.value = defaultPrev;
  let chartMode = 'bar';

  function updateAnalyticsChart() {
    const recA = monthlyList.find(m => m.ym === selA.value) || monthlyList[0];
    const recB = monthlyList.find(m => m.ym === selB.value) || monthlyList[0];
    if (!recA || !recB) return;

    const cats = ['Food', 'Housing', 'Transport', 'Shopping', 'Education'];
    const dataA = cats.map(c => recA.categories[c] || 0);
    const dataB = cats.map(c => recB.categories[c] || 0);

    let biggestJumpCat = 'None';
    let biggestDiff = 0;
    cats.forEach((c, idx) => {
      const diff = dataA[idx] - dataB[idx];
      if (diff > biggestDiff) {
        biggestDiff = diff;
        biggestJumpCat = c;
      }
    });

    const totalDiff = recA.expenses - recB.expenses;
    const callout = document.getElementById('overspend-callout');
    if (biggestDiff > 0) {
      callout.innerHTML = `
        <span style="font-size:13px;">
          ⚠️ <strong>Spending Leak Alert (${formatMonthLabel(recA.ym)} vs ${formatMonthLabel(recB.ym)}):</strong>
          Your biggest jump was in <strong>${biggestJumpCat}</strong> (<span class="trend-down">+${formatKRW(biggestDiff)}</span> higher than ${formatMonthLabel(recB.ym)}).
          Total monthly spending changed by <strong class="${totalDiff > 0 ? 'trend-down' : 'trend-up'}">${totalDiff >= 0 ? '+' : '−'}${formatKRW(Math.abs(totalDiff))}</strong>.
        </span>
      `;
    } else {
      callout.innerHTML = `
        <span style="font-size:13px;">
          ✅ <strong>Under Control:</strong> No category increased in <strong>${formatMonthLabel(recA.ym)}</strong> compared to <strong>${formatMonthLabel(recB.ym)}</strong>.
        </span>
      `;
    }

    const ctx = document.getElementById('month-compare-canvas');
    if (monthCompareChartInstance) monthCompareChartInstance.destroy();

    if (chartMode === 'bar') {
      monthCompareChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: cats,
          datasets: [
            {
              label: formatMonthLabel(recA.ym),
              data: dataA,
              backgroundColor: '#19d396',
              borderRadius: 6
            },
            {
              label: formatMonthLabel(recB.ym),
              data: dataB,
              backgroundColor: '#4f9cf9',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#8b9bb0', usePointStyle: true } },
            tooltip: {
              callbacks: {
                label: (c) => `${c.dataset.label}: ₩${Number(c.raw).toLocaleString('ko-KR')}`
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#8b9bb0' } },
            y: {
              grid: { color: 'rgba(255,255,255,0.06)' },
              ticks: {
                color: '#8b9bb0',
                callback: (v) => '₩' + (v / 1000).toLocaleString() + 'k'
              }
            }
          }
        }
      });
    } else {
      const chronological = [...monthlyList].reverse();
      monthCompareChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: chronological.map(m => formatMonthLabel(m.ym)),
          datasets: [
            {
              label: 'Income',
              data: chronological.map(m => m.income),
              borderColor: '#19d396',
              backgroundColor: 'rgba(25, 211, 150, 0.14)',
              fill: true,
              borderWidth: 3,
              tension: 0.3
            },
            {
              label: 'Expenses',
              data: chronological.map(m => m.expenses),
              borderColor: '#f46a6a',
              backgroundColor: 'rgba(244, 106, 106, 0.12)',
              fill: true,
              borderWidth: 3,
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#8b9bb0', usePointStyle: true } },
            tooltip: {
              callbacks: {
                label: (c) => `${c.dataset.label}: ₩${Number(c.raw).toLocaleString('ko-KR')}`
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#8b9bb0' } },
            y: {
              grid: { color: 'rgba(255,255,255,0.06)' },
              ticks: {
                color: '#8b9bb0',
                callback: (v) => '₩' + (v / 1000000).toFixed(1) + 'm'
              }
            }
          }
        }
      });
    }
  }

  const barBtn = document.getElementById('mode-bar-btn');
  const lineBtn = document.getElementById('mode-line-btn');
  const selectorsBox = document.getElementById('month-selectors');

  barBtn.addEventListener('click', () => {
    chartMode = 'bar';
    selectorsBox.style.display = 'flex';
    barBtn.style.borderColor = 'var(--emerald-bright)';
    barBtn.style.color = 'var(--emerald-bright)';
    lineBtn.style.borderColor = '';
    lineBtn.style.color = '';
    updateAnalyticsChart();
  });

  lineBtn.addEventListener('click', () => {
    chartMode = 'line';
    selectorsBox.style.display = 'none';
    lineBtn.style.borderColor = 'var(--emerald-bright)';
    lineBtn.style.color = 'var(--emerald-bright)';
    barBtn.style.borderColor = '';
    barBtn.style.color = '';
    updateAnalyticsChart();
  });

  container.querySelectorAll('tr[data-select-month]').forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('[data-inspect-tx]')) return;
      selA.value = row.dataset.selectMonth;
      chartMode = 'bar';
      selectorsBox.style.display = 'flex';
      barBtn.style.borderColor = 'var(--emerald-bright)';
      barBtn.style.color = 'var(--emerald-bright)';
      lineBtn.style.borderColor = '';
      lineBtn.style.color = '';
      updateAnalyticsChart();
      if (typeof showToast === 'function') {
        showToast(`Loaded ${formatMonthLabel(row.dataset.selectMonth)} into comparison`);
      }
    });
  });

  container.querySelectorAll('[data-inspect-tx]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      txFilters.query = btn.dataset.inspectTx;
      currentPage = 'transactions';
      renderCurrentPage();
    });
  });

  selA.addEventListener('change', updateAnalyticsChart);
  selB.addEventListener('change', updateAnalyticsChart);
  updateAnalyticsChart();
}

function renderGoalsPage(container, state) {
  const totalSaved = state.goals.reduce((sum, g) => sum + Number(g.saved || 0), 0);
  const totalTarget = state.goals.reduce((sum, g) => sum + Number(g.target || 0), 0);
  const overallPct = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;
  const totalRemaining = Math.max(0, totalTarget - totalSaved);

  const cards = state.goals.map(g => {
    const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
    const remaining = Math.max(0, g.target - g.saved);
    const isDone = remaining === 0;

    const today = new Date('2026-11-20');
    const due = new Date(g.deadline);
    const monthsLeft = Math.max(1, Math.ceil((due - today) / (1000 * 60 * 60 * 24 * 30)));
    const monthlyPace = Math.ceil(remaining / monthsLeft);

    return `
      <div class="panel-card ${isDone ? 'goal-celebrate' : ''}" style="display:flex;flex-direction:column;justify-content:space-between;gap:14px;">
        <div>
          <div class="panel-header" style="margin-bottom:10px;">
            <div>
              <h2>${g.title}</h2>
              <span class="panel-sub">Target: ${g.deadline} · ${isDone ? 'Goal reached! 🎉' : `${monthsLeft} mo left`}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="badge badge-income">${pct}%</span>
              <button class="icon-btn" style="width:28px;height:28px;" data-delete-goal="${g.id}" title="Delete goal">✕</button>
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;font-size:14px;">
            <strong>${formatKRW(g.saved)}</strong>
            <span class="muted">Goal: ${formatKRW(g.target)}</span>
          </div>

          <div class="progress-track">
            <div class="progress-fill" style="width:${pct}%"></div>
          </div>

          <div style="display:flex;justify-content:space-between;font-size:12px;" class="muted">
            <span>${isDone ? 'Completed!' : `${formatKRW(remaining)} left`}</span>
            <span>${isDone ? 'Ready to celebrate' : `Suggested: ${formatKRW(monthlyPace)}/mo`}</span>
          </div>
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;padding-top:10px;border-top:1px solid var(--border-subtle);">
          <button class="btn btn-ghost" style="padding:7px 12px;font-size:12px;" data-add-goal="${g.id}" data-step="50000">+ ₩50,000</button>
          <button class="btn btn-emerald" style="padding:7px 12px;font-size:12px;" data-add-goal="${g.id}" data-step="200000">+ ₩200,000</button>
          <button class="btn btn-ghost" style="padding:7px 12px;font-size:12px;margin-left:auto;" data-custom-goal="${g.id}">Custom +</button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);">
      <div class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-label">TOTAL SAVED ACROSS GOALS</span>
          <div class="kpi-icon"><i data-lucide="piggy-bank"></i></div>
        </div>
        <div class="kpi-value trend-up">${formatKRW(totalSaved)}</div>
        <div class="kpi-trend muted">Combined milestone progress</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-label">REMAINING TO TARGET</span>
          <div class="kpi-icon"><i data-lucide="target"></i></div>
        </div>
        <div class="kpi-value">${formatKRW(totalRemaining)}</div>
        <div class="kpi-trend muted">Out of ${formatKRW(totalTarget)} total</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-label">OVERALL COMPLETION</span>
          <div class="kpi-icon"><i data-lucide="award"></i></div>
        </div>
        <div class="kpi-value trend-up">${overallPct}%</div>
        <div class="kpi-trend muted">${state.goals.length} active savings goals</div>
      </div>
    </div>

    <div class="cards-2col">
      ${cards}
      <div class="panel-card" id="empty-slot-new-goal" style="border:1.5px dashed var(--emerald-border);background:rgba(25,211,150,0.03);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-height:205px;cursor:pointer;">
        <div style="width:44px;height:44px;border-radius:12px;background:var(--emerald-soft);color:var(--emerald-bright);display:grid;place-items:center;font-size:22px;font-weight:700;margin-bottom:10px;">+</div>
        <strong style="font-size:15px;margin-bottom:4px;">Create Another Savings Goal</strong>
        <span class="muted small">Add a target for travel, tuition, emergency funds, or tech</span>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-custom-goal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.customGoal;
      const goal = state.goals.find(g => g.id === id);
      if (!goal) return;
      const input = prompt(`How much would you like to add to "${goal.title}" (in KRW)?`, '100000');
      const amount = Number(input);
      if (!amount || amount <= 0) return;
      goal.saved += amount;
      saveState(state);
      renderCurrentPage();
      if (typeof showToast === 'function') showToast(`Added +₩${amount.toLocaleString()} to "${goal.title}"!`);
    });
  });

  container.querySelectorAll('[data-delete-goal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.deleteGoal;
      state.goals = state.goals.filter(g => g.id !== id);
      saveState(state);
      renderCurrentPage();
      if (typeof showToast === 'function') showToast('Removed savings goal');
    });
  });

  const dashedCard = document.getElementById('empty-slot-new-goal');
  if (dashedCard) {
    dashedCard.addEventListener('click', () => {
      const topBtn = document.getElementById('quick-new-goal');
      if (topBtn) topBtn.click();
    });
  }
}

function renderNotificationsPage(container, state) {
  state.notifications.forEach((n, idx) => {
    if (typeof n.read === 'undefined') n.read = false;
    if (!n.tag) n.tag = idx === 0 ? 'Budget Alert' : idx === 1 ? 'Income' : 'Goal Milestone';
  });

  const unreadCount = state.notifications.filter(n => !n.read).length;

  const badgeEl = document.getElementById('notif-badge');
  if (badgeEl) {
    badgeEl.textContent = unreadCount;
    badgeEl.style.display = unreadCount > 0 ? 'inline-block' : 'none';
  }

  const itemsHTML = state.notifications.map(n => `
    <div class="activity-pill" style="margin-bottom:12px;border-left:3px solid ${n.read ? 'transparent' : 'var(--emerald-bright)'};opacity:${n.read ? '0.72' : '1'};">
      <div style="padding-right:12px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <span class="badge ${n.tag === 'Budget Alert' ? 'badge-expense' : 'badge-income'}">${n.tag}</span>
          <strong style="font-size:14px;">${n.title}</strong>
        </div>
        <span class="muted small">${n.body}</span>
      </div>
      <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
        <span class="muted small">${n.time}</span>
        <button class="icon-btn" style="width:30px;height:30px;" data-dismiss-notif="${n.id}" title="Dismiss alert">✓</button>
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="charts-grid" style="grid-template-columns: 1.55fr 1fr; align-items: start;">
      <div class="panel-card">
        <div class="panel-header" style="align-items:center;flex-wrap:wrap;gap:10px;">
          <div>
            <h2>Budget &amp; Activity Alerts</h2>
            <span class="panel-sub">${unreadCount} unread alert${unreadCount === 1 ? '' : 's'} for your FINORA account</span>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-ghost" style="padding:7px 12px;font-size:12px;" id="mark-all-read-btn">Mark all read</button>
            <button class="btn btn-emerald" style="padding:7px 12px;font-size:12px;" id="test-alert-btn">+ Test Alert</button>
          </div>
        </div>

        ${itemsHTML || '<p class="muted small" style="padding:20px 0;">You are all caught up! No active alerts.</p>'}
      </div>

      <div style="display:flex;flex-direction:column;gap:18px;">
        <div class="panel-card">
          <div class="panel-header">
            <div>
              <h2>Smart Alert Rules</h2>
              <span class="panel-sub">Customize when FINORA notifies you</span>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:12px;font-size:13.5px;">
            <label style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
              <span>Warn when category hits 80%</span>
              <input type="checkbox" checked style="accent-color:var(--emerald-bright);width:16px;height:16px;" />
            </label>
            <label style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
              <span>Large expense alert (&gt; ₩100,000)</span>
              <input type="checkbox" checked style="accent-color:var(--emerald-bright);width:16px;height:16px;" />
            </label>
            <label style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
              <span>Savings goal milestone celebrations</span>
              <input type="checkbox" checked style="accent-color:var(--emerald-bright);width:16px;height:16px;" />
            </label>
            <label style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
              <span>Weekly Sunday spending digest</span>
              <input type="checkbox" style="accent-color:var(--emerald-bright);width:16px;height:16px;" />
            </label>
          </div>
        </div>

        <div class="panel-card">
          <div class="panel-header">
            <div>
              <h2>Upcoming Scheduled Bills</h2>
              <span class="panel-sub">Recurring monthly reminders</span>
            </div>
          </div>

          <div class="activity-pill" style="margin-bottom:10px;">
            <div>
              <strong style="display:block;font-size:13.5px;">Studio Apartment Rent</strong>
              <span class="muted small">Housing · Due Dec 02, 2026</span>
            </div>
            <strong class="trend-down">−₩550,000</strong>
          </div>

          <div class="activity-pill">
            <div>
              <strong style="display:block;font-size:13.5px;">T-Money Transit Auto-Reload</strong>
              <span class="muted small">Transport · Due Dec 05, 2026</span>
            </div>
            <strong class="trend-down">−₩50,000</strong>
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-dismiss-notif]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.dismissNotif;
      state.notifications = state.notifications.filter(n => n.id !== id);
      saveState(state);
      renderCurrentPage();
      if (typeof showToast === 'function') showToast('Alert dismissed');
    });
  });

  const markAllBtn = document.getElementById('mark-all-read-btn');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', () => {
      state.notifications.forEach(n => { n.read = true; });
      saveState(state);
      renderCurrentPage();
      if (typeof showToast === 'function') showToast('All notifications marked as read');
    });
  }

  const testBtn = document.getElementById('test-alert-btn');
  if (testBtn) {
    testBtn.addEventListener('click', () => {
      state.notifications.unshift({
        id: 'n_' + Date.now(),
        tag: 'Budget Alert',
        title: 'Shopping spending reached 94%',
        body: 'You have spent ₩234,600 of your ₩250,000 Shopping budget this month.',
        time: 'Just now',
        read: false
      });
      saveState(state);
      renderCurrentPage();
      if (typeof showToast === 'function') showToast('New budget alert triggered!');
    });
  }
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
let wealthChartInstance = null;

function renderWealthPage(container, state, summary) {
  const defaultInitial = Math.max(500000, Math.round(summary.totalBalance / 100000) * 100000);
  const defaultMonthly = Math.max(100000, Math.round(Math.max(0, summary.netSavings) / 100000) * 100000);

  container.innerHTML = `
    <!-- TOP 3 SCENARIO PROJECTION CARDS -->
    <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);">
      <div class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-label">🏦 BANK SAVINGS (3.5% APY)</span>
          <div class="kpi-icon"><i data-lucide="landmark"></i></div>
        </div>
        <div class="kpi-value" id="res-bank">₩0</div>
        <div class="kpi-trend muted" id="gain-bank">Low risk · Guaranteed yield</div>
      </div>

      <div class="kpi-card" style="border-color:var(--emerald-border);">
        <div class="kpi-top">
          <span class="kpi-label">📈 S&amp;P 500 INDEX (9.5% APY)</span>
          <div class="kpi-icon"><i data-lucide="trending-up"></i></div>
        </div>
        <div class="kpi-value trend-up" id="res-sp500">₩0</div>
        <div class="kpi-trend trend-up" id="gain-sp500">Balanced long-term growth</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-label">🚀 CRYPTO PORTFOLIO (18% APY)</span>
          <div class="kpi-icon"><i data-lucide="zap"></i></div>
        </div>
        <div class="kpi-value" style="color:#f59e0b;" id="res-crypto">₩0</div>
        <div class="kpi-trend muted" id="gain-crypto">High volatility · Speculative</div>
      </div>
    </div>

    <!-- INTERACTIVE SLIDERS + COMPOUND GROWTH CHART -->
    <div class="charts-grid" style="grid-template-columns: 1fr 1.6fr; align-items: start;">
      <div class="panel-card">
        <div class="panel-header">
          <div>
            <h2>Simulation Controls</h2>
            <span class="panel-sub">Pre-filled from your live FINORA balance &amp; monthly savings</span>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:18px;">
          <div>
            <div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:6px;">
              <span class="muted">Starting Principal</span>
              <strong id="lbl-initial">${formatKRW(defaultInitial)}</strong>
            </div>
            <input type="range" id="sim-initial" min="0" max="20000000" step="100000" value="${defaultInitial}" style="width:100%;accent-color:var(--emerald-bright);cursor:pointer;" />
          </div>

          <div>
            <div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:6px;">
              <span class="muted">Monthly Contribution</span>
              <strong id="lbl-monthly">${formatKRW(defaultMonthly)}</strong>
            </div>
            <input type="range" id="sim-monthly" min="0" max="3000000" step="50000" value="${defaultMonthly}" style="width:100%;accent-color:var(--emerald-bright);cursor:pointer;" />
          </div>

          <div>
            <div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:6px;">
              <span class="muted">Investment Horizon</span>
              <strong id="lbl-years">10 Years</strong>
            </div>
            <input type="range" id="sim-years" min="1" max="30" step="1" value="10" style="width:100%;accent-color:var(--emerald-bright);cursor:pointer;" />
          </div>

          <div class="quick-strip" style="margin-top:4px;">
            <span class="muted small" id="sim-principal-note">Total Principal Contributed: ₩0</span>
          </div>
        </div>
      </div>

      <div class="panel-card">
        <div class="panel-header">
          <div>
            <h2>Compound Growth Projection</h2>
            <span class="panel-sub">Comparing Principal vs. Bank Savings, S&amp;P 500, and Crypto</span>
          </div>
          <span class="badge badge-income">Compound Interest</span>
        </div>
        <div class="chart-wrap" style="height:295px;">
          <canvas id="wealth-sim-canvas"></canvas>
        </div>
      </div>
    </div>
  `;

  const sInitial = document.getElementById('sim-initial');
  const sMonthly = document.getElementById('sim-monthly');
  const sYears = document.getElementById('sim-years');

  function computeSeries(initial, monthly, years, annualRate) {
    const monthlyRate = annualRate / 12;
    const points = [initial];
    let balance = initial;
    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) {
        balance = (balance + monthly) * (1 + monthlyRate);
      }
      points.push(Math.round(balance));
    }
    return points;
  }

  function updateSimulation() {
    const initial = Number(sInitial.value);
    const monthly = Number(sMonthly.value);
    const years = Number(sYears.value);

    document.getElementById('lbl-initial').textContent = formatKRW(initial);
    document.getElementById('lbl-monthly').textContent = formatKRW(monthly);
    document.getElementById('lbl-years').textContent = `${years} Year${years === 1 ? '' : 's'}`;

    const labels = Array.from({ length: years + 1 }, (_, i) => `Yr ${i}`);
    const principalSeries = Array.from({ length: years + 1 }, (_, i) => initial + monthly * 12 * i);
    const bankSeries = computeSeries(initial, monthly, years, 0.035);
    const spSeries = computeSeries(initial, monthly, years, 0.095);
    const cryptoSeries = computeSeries(initial, monthly, years, 0.18);

    const totalContrib = principalSeries[years];
    const finalBank = bankSeries[years];
    const finalSP = spSeries[years];
    const finalCrypto = cryptoSeries[years];

    document.getElementById('sim-principal-note').innerHTML =
      `Total Cash Contributed: <strong>${formatKRW(totalContrib)}</strong>`;

    document.getElementById('res-bank').textContent = formatKRW(finalBank);
    document.getElementById('gain-bank').textContent = `+${formatKRW(finalBank - totalContrib)} profit`;

    document.getElementById('res-sp500').textContent = formatKRW(finalSP);
    document.getElementById('gain-sp500').textContent = `+${formatKRW(finalSP - totalContrib)} profit`;

    document.getElementById('res-crypto').textContent = formatKRW(finalCrypto);
    document.getElementById('gain-crypto').textContent = `+${formatKRW(finalCrypto - totalContrib)} profit`;

    const ctx = document.getElementById('wealth-sim-canvas');
    if (wealthChartInstance) wealthChartInstance.destroy();

    wealthChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Crypto (18%)',
            data: cryptoSeries,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            borderWidth: 2.5,
            tension: 0.3,
            pointRadius: 2
          },
          {
            label: 'S&P 500 (9.5%)',
            data: spSeries,
            borderColor: '#19d396',
            backgroundColor: 'rgba(25, 211, 150, 0.14)',
            fill: true,
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 3
          },
          {
            label: 'Bank Savings (3.5%)',
            data: bankSeries,
            borderColor: '#4f9cf9',
            borderWidth: 2.5,
            tension: 0.3,
            pointRadius: 2
          },
          {
            label: 'Cash Contributed',
            data: principalSeries,
            borderColor: '#8b9bb0',
            borderDash: [5, 5],
            borderWidth: 2,
            tension: 0,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { color: '#8b9bb0', usePointStyle: true } },
          tooltip: {
            callbacks: {
              label: (c) => `${c.dataset.label}: ₩${Number(c.raw).toLocaleString('ko-KR')}`
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#8b9bb0' } },
          y: {
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: {
              color: '#8b9bb0',
              callback: (v) => '₩' + (v / 1000000).toFixed(1) + 'm'
            }
          }
        }
      }
    });
  }

  [sInitial, sMonthly, sYears].forEach(el => el.addEventListener('input', updateSimulation));
  updateSimulation();
}