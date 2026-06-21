

(function () {
  'use strict';
  const RANGES = {
    '1D': { points: 24,   stepMs: 60 * 60 * 1000,                   volatility: 0.008 },
    '1W': { points: 7 * 24, stepMs: 60 * 60 * 1000,                 volatility: 0.012 },
    '1M': { points: 30,     stepMs: 24 * 60 * 60 * 1000,            volatility: 0.02  },
    '1Y': { points: 365,    stepMs: 24 * 60 * 60 * 1000,            volatility: 0.025 },
    'ALL': { points: 365,    stepMs: 24 * 60 * 60 * 1000,            volatility: 0.045 },
  };

  const BASE_PRICE = 43250; // стартовая точка для генерации

  function generateSeries(rangeKey) {
    const cfg = RANGES[rangeKey];
    const now = Date.now();
    const data = [];

    let price = BASE_PRICE;
    const drift = (Math.random() - 0.5) * cfg.volatility * 0.2;

    for (let i = cfg.points - 1; i >= 0; i--) {
      const timestamp = now - i * cfg.stepMs;

      const change = (Math.random() - 0.5) * 2 * cfg.volatility + drift;
      price = price * (1 + change);

      data.push([timestamp, Number(price.toFixed(2))]);
    }

    return data;
  }

  function getChartOptions(initialData) {
    return {
      chart: {
        type: 'area',
        height: 293,
        background: 'transparent',
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: {
          enabled: true,
          speed: 400,
          animateGradually: { enabled: false },
          dynamicAnimation: { enabled: true, speed: 300 },
        },
      },
      theme: { mode: 'dark' },
      series: [{ name: 'Price', data: initialData }],
      colors: ['#F0B90A'],
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          type: 'vertical',
          opacityFrom: 0.35,
          opacityTo: 0.02,
          stops: [0, 100],
        },
      },
      dataLabels: { enabled: false },
      markers: {
        size: 0,
        hover: { size: 5 },
      },
      grid: {
        borderColor: 'rgba(255, 255, 255, 0.04)',
        strokeDashArray: 3,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { left: 10, right: 10, top: 0, bottom: 0 },
      },
      xaxis: {
        type: 'datetime',
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: {
            colors: '#949494',
            fontSize: '11px',
            fontWeight: 500,
          },
          datetimeUTC: false,
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#949494',
            fontSize: '11px',
            fontWeight: 500,
          },
          formatter: (val) => '$' + val.toLocaleString('en-US', { maximumFractionDigits: 0 }),
        },
      },
      tooltip: {
        theme: 'dark',
        x: { format: 'dd MMM yyyy, HH:mm' },
        y: {
          formatter: (val) => '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        },
      },
    };
  }
  function init() {
    if (typeof ApexCharts === 'undefined') {
      console.warn('[CoinChart] ApexCharts is not loaded. Include https://cdn.jsdelivr.net/npm/apexcharts before CoinChart.js');
      return;
    }

    const container = document.querySelector('[data-js-coin-chart]');
    if (!container) return;

    const buttons = document.querySelectorAll('[data-js-chart-range]');

    const initialBtn = document.querySelector('[data-js-chart-range].is-active') || buttons[0];
    const initialRange = initialBtn?.dataset.jsChartRange || '1M';

    const chart = new ApexCharts(container, getChartOptions(generateSeries(initialRange)));
    chart.render();

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const range = btn.dataset.jsChartRange;
        if (!RANGES[range]) return;

        buttons.forEach((b) => b.classList.toggle('is-active', b === btn));

        chart.updateSeries([{ name: 'Price', data: generateSeries(range) }]);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();