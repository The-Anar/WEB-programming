let cashflowChartInstance = null;
let categoryChartInstance = null;

function renderCashflowChart(canvasId, state, summary) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  if (cashflowChartInstance) {
    cashflowChartInstance.destroy();
  }

  const history = state.monthlyHistory.map((item, idx) => {
    if (idx === state.monthlyHistory.length - 1) {
      return {
        month: item.month,
        income: summary.totalIncome,
        expenses: summary.totalExpenses
      };
    }
    return item;
  });

  cashflowChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: history.map(h => h.month),
      datasets: [
        {
          label: 'Income',
          data: history.map(h => h.income),
          borderColor: '#19d396',
          backgroundColor: 'rgba(25, 211, 150, 0.14)',
          fill: true,
          borderWidth: 3,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Expenses',
          data: history.map(h => h.expenses),
          borderColor: '#f46a6a',
          backgroundColor: 'rgba(244, 106, 106, 0.10)',
          fill: true,
          borderWidth: 3,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: { color: '#8b9bb0', usePointStyle: true }
        },
        tooltip: {
          callbacks: {
            label: (c) => `${c.dataset.label}: ₩${Number(c.raw).toLocaleString('ko-KR')}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#8b9bb0' }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.06)' },
          ticks: {
            color: '#8b9bb0',
            callback: (val) => '₩' + (val / 1000000).toFixed(1) + 'm'
          }
        }
      }
    }
  });
}

function renderCategoryChart(canvasId, state, summary) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }

  const labels = state.budgets.map(b => b.category);
  const values = state.budgets.map(b => summary.categoryTotals[b.category] || 0);
  const colors = state.budgets.map(b => b.color);

  // Inject centered total overlay inside the doughnut ring
  const box = ctx.parentElement;
  let centerLabel = box.querySelector('.doughnut-center');
  if (!centerLabel) {
    centerLabel = document.createElement('div');
    centerLabel.className = 'doughnut-center';
    centerLabel.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;text-align:center;';
    box.appendChild(centerLabel);
  }
  const millions = (summary.totalExpenses / 1000000).toFixed(2);
  centerLabel.innerHTML = `
    <strong style="font-size:17px;font-weight:800;letter-spacing:-0.02em;">₩${millions}m</strong>
    <span style="font-size:11px;color:var(--text-secondary);">spent</span>
  `;

  categoryChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (c) => `${c.label}: ₩${Number(c.raw).toLocaleString('ko-KR')}`
          }
        }
      }
    }
  });
}