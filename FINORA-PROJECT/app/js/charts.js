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
          backgroundColor: 'rgba(25, 211, 150, 0.12)',
          borderWidth: 3,
          tension: 0.35,
          pointRadius: 3
        },
        {
          label: 'Expenses',
          data: history.map(h => h.expenses),
          borderColor: '#f46a6a',
          backgroundColor: 'rgba(244, 106, 106, 0.12)',
          borderWidth: 3,
          tension: 0.35,
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
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

  categoryChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
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