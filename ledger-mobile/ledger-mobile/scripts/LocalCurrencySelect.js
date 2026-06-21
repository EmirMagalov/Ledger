/**
 * LocalCurrencySelect.js
 *
 * Локальная (не глобальная) подмена символа валюты.
 * Работает на страницах, где есть селект валюты с атрибутом
 * data-js-local-currency (например market.html и token.html).
 *
 * Поведение:
 *  - На <main> страницы выставляется data-currency-locked, чтобы глобальный
 *    Currency.js не трогал элементы внутри.
 *  - Слушает событие 'currency-change' на каждом локальном селекте
 *    (его диспатчит CurrencySelect.js при выборе опции).
 *  - При смене подменяет символ во всех целевых элементах в пределах
 *    залоченной зоны.
 *  - Не пишет в localStorage и не подписывается на глобальные изменения —
 *    локальный выбор живёт только пока пользователь на странице.
 */

(function () {
  'use strict';

  const SYMBOLS = {
    usd: '$', USD: '$',
    eur: '€', EUR: '€',
    gbp: '£', GBP: '£',
    jpy: '¥', JPY: '¥',
    rub: '₽', RUB: '₽',
    cny: '¥', CNY: '¥',
  };

  const CURRENCY_SELECTORS = [
    '.home__balance',
    '.asset__cell--value',
    '.operations__amount-fiat',
    '.accounts-list__amount-fiat',
    '.coin__subtitle',
    '.coin__price--dollar',
    '.coin__actions-percent',
    '.coin-info__actions-price',
    '.coin__card-value-main',
    '.coin__card-value',
    '.reports__price',
    '.reports__tag--alt',
    '.reports__donut-value',
    '.reports-table__cell',
    '.market__price',
    '[data-js-op-fiat]',
    '[data-js-op-fee-fiat]',
    '[data-currency-amount]',
  ];

  const ALL_SYMBOLS = ['$', '€', '£', '¥', '₽'];
  const PLACEHOLDER = '\u0001CURRENCY\u0001';

  function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  const symbolNumberRe = new RegExp(
    `(${ALL_SYMBOLS.map(escapeRegex).join('|')})(?=[0-9])`, 'g'
  );

  function makeTemplate(text) {
    if (!text || !symbolNumberRe.test(text)) return null;
    symbolNumberRe.lastIndex = 0;
    return text.replace(symbolNumberRe, PLACEHOLDER);
  }
  function applyTemplate(t, s) { return t.split(PLACEHOLDER).join(s); }

  function init() {
    const localSelects = document.querySelectorAll('[data-js-local-currency]');
    if (!localSelects.length) return;

    const root = document.querySelector('main') || document.body;
    root.setAttribute('data-currency-locked', 'true');

    const cache = new WeakMap();

    function registerEl(el) {
      if (cache.has(el)) return cache.get(el);

      let textNode = null;
      for (const node of el.childNodes) {
        if (node.nodeType === Node.TEXT_NODE && makeTemplate(node.textContent)) {
          textNode = node;
          break;
        }
      }
      let template, kind;
      if (textNode) {
        template = makeTemplate(textNode.textContent);
        kind = 'node';
      } else {
        const hasChildElements = Array.from(el.children).length > 0;
        if (hasChildElements) {
          const e = { kind: 'noop' };
          cache.set(el, e);
          return e;
        }
        template = makeTemplate(el.textContent);
        kind = 'text';
      }
      if (!template) {
        const e = { kind: 'noop' };
        cache.set(el, e);
        return e;
      }
      const e = { kind, textNode, template };
      cache.set(el, e);
      return e;
    }

    function collectTargets() {
      const set = new Set();
      CURRENCY_SELECTORS.forEach((sel) => {
        root.querySelectorAll(sel).forEach((el) => set.add(el));
      });
      return set;
    }

    function applySymbol(symbol) {
      collectTargets().forEach((el) => {
        const entry = registerEl(el);
        if (entry.kind === 'noop') return;
        const text = applyTemplate(entry.template, symbol);
        if (entry.kind === 'node' && entry.textNode) {
          entry.textNode.textContent = text;
        } else {
          el.textContent = text;
        }
        if (el.dataset.originalValue !== undefined) {
          delete el.dataset.originalValue;
        }
      });
      // Уведомляем HideBalance, что текст изменился — он перерисует, если активен
      document.dispatchEvent(new CustomEvent('currency:changed', {
        detail: { local: true, symbol },
      }));
    }

    // Кешируем оригиналы для всех целевых элементов
    collectTargets().forEach((el) => registerEl(el));

    localSelects.forEach((selectRoot) => {
      selectRoot.addEventListener('currency-change', (e) => {
        const code = (e.detail?.value || '').toLowerCase();
        const symbol = SYMBOLS[code] || SYMBOLS[code.toUpperCase()] || '$';
        applySymbol(symbol);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
