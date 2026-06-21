// ===== Monthly Tax Liability =====
(() => {
  const canvas = document.querySelector('[data-js-bars]');
  if (!canvas || typeof Chart === 'undefined') return;

  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const gainData = [ 800,  700, 1100, 1900, 1200, 1400,
    1300,  900, 1100, 1200, 2000, 2300];
  const lossData = [   0,    0,  200,    0,  400,    0,
    0,    0,    0,  150,    0,  300];

  const activeIndex = 10;
  const ctx = canvas.getContext('2d');

  const gainGradient = ctx.createLinearGradient(0, 0, 0, 320);
  gainGradient.addColorStop(0, 'rgba(186, 174, 254, 1)');
  gainGradient.addColorStop(1, 'rgba(186, 174, 254, 0)');

  const activeGradient = ctx.createLinearGradient(0, 0, 0, 320);
  activeGradient.addColorStop(0, 'rgba(207, 194, 255, 1)');
  activeGradient.addColorStop(1, 'rgba(186, 174, 254, 0.25)');

  const lossOverlayPlugin = {
    id: 'lossOverlay',
    afterDatasetsDraw(chart) {
      const { ctx, scales: { y }, chartArea } = chart;
      const meta   = chart.getDatasetMeta(0);
      const radius = 10;

      ctx.save();
      lossData.forEach((loss, i) => {
        if (!loss) return;
        const bar = meta.data[i];
        if (!bar) return;

        const { x, width } = bar;
        const yBottom = y.getPixelForValue(0);
        const yTop    = y.getPixelForValue(loss);
        const barH    = yBottom - yTop;

        const lossGradient = ctx.createLinearGradient(0, yTop, 0, chartArea.bottom);
        lossGradient.addColorStop(0, 'rgba(234, 46, 73, 1)');
        lossGradient.addColorStop(1, 'rgba(234, 46, 73, 0)');

        const left  = x - width / 2;
        const right = x + width / 2;
        const r     = Math.min(radius, barH / 2, width / 2);

        ctx.fillStyle = lossGradient;
        ctx.beginPath();
        ctx.moveTo(left, yBottom);
        ctx.lineTo(left, yTop + r);
        ctx.quadraticCurveTo(left, yTop, left + r, yTop);
        ctx.lineTo(right - r, yTop);
        ctx.quadraticCurveTo(right, yTop, right, yTop + r);
        ctx.lineTo(right, yBottom);
        ctx.closePath();
        ctx.fill();
      });
      ctx.restore();
    },
  };

  // ---- Тултип ----
  const tooltipEl = document.createElement('div');
  tooltipEl.className = 'reports-tooltip';
  canvas.parentElement.appendChild(tooltipEl);

  // Текущий символ валюты — берём из глобального LedgerCurrency, если он есть.
  const getSymbol = () => (window.LedgerCurrency?.getSymbol?.() || '$');

  const externalTooltip = (context) => {
    const { chart, tooltip } = context;
    if (tooltip.opacity === 0) {
      tooltipEl.classList.remove('is-visible');
      return;
    }
    const idx = tooltip.dataPoints[0].dataIndex;
    tooltipEl.textContent = `+${getSymbol()}${gainData[idx]}`;
    const bar = chart.getDatasetMeta(0).data[idx];
    tooltipEl.style.left = bar.x + 'px';
    tooltipEl.style.top  = (bar.y - 8) + 'px';
    tooltipEl.classList.add('is-visible');
  };

  const showDefaultTooltip = (chart) => {
    const bar = chart.getDatasetMeta(0).data[activeIndex];
    if (!bar) return;
    tooltipEl.textContent = `+${getSymbol()}${gainData[activeIndex]}`;
    tooltipEl.style.left = bar.x + 'px';
    tooltipEl.style.top  = (bar.y - 8) + 'px';
    tooltipEl.classList.add('is-visible');
  };

  let chartInstance = null;
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Gain',
        data: gainData,
        backgroundColor: gainData.map((_, i) =>
          i === activeIndex ? activeGradient : gainGradient
        ),
        borderRadius: 10,
        borderSkipped: false,
        barPercentage: 1.0,
        categoryPercentage: 0.9,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 30 } },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: '#949494', font: { size: 12, weight: '500' } },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.08)',
            drawTicks: false,
            lineWidth: 1,
            tickBorderDash: [4, 4],
            borderDash: [4, 4],
          },
          border: { display: false, dash: [4, 4] },
          ticks: { display: false },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false, external: externalTooltip },
      },
      interaction: { mode: 'index', intersect: false },
      animation: {
        onComplete: function () { showDefaultTooltip(this); },
      },
    },
    plugins: [lossOverlayPlugin],
  });

  // При смене валюты перерисовываем дефолтный тултип
  document.addEventListener('currency:changed', () => {
    if (chartInstance) showDefaultTooltip(chartInstance);
  });
})();

// ===== Income Sources (doughnut chart) =====
(() => {
  const canvas = document.querySelector('[data-js-donut]');
  if (!canvas || typeof Chart === 'undefined') return;

  const data   = [60, 20, 12, 8];
  const colors = ['#8D8FD5', '#09F8A9', '#FFC82D', '#CC2123'];

  new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: '#1a1a1a',
        borderWidth: 3,
        spacing: 1,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '94%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
    },
  });
})();