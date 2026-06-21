/**
 * Currency.js
 * Глобальный менеджер символа валюты.
 *
 * Меняет ТОЛЬКО символ валюты, числа не конвертируются.
 * Текущий выбор сохраняется в localStorage, ключ 'ledger:currency'.
 *
 * Публичный API:
 *   window.LedgerCurrency.get()              -> { code, symbol, label }
 *   window.LedgerCurrency.set(code)          -> применить новую валюту
 *   window.LedgerCurrency.getSymbol()        -> текущий символ
 *   window.LedgerCurrency.subscribe(cb)      -> подписка на смену
 *   window.LedgerCurrency.refresh()          -> повторить рендер (например после
 *                                               динамического обновления DOM)
 *
 * Алгоритм:
 *   1. Каждому целевому элементу при первой инициализации сохраняем
 *      «шаблон» — текущее текстовое содержимое, в котором ВСЕ символы валют
 *      заменены на маркер __CURRENCY__.
 *   2. При render() на этом шаблоне заменяем __CURRENCY__ на текущий символ.
 *   3. Шаблон сохраняется отдельно для каждого элемента, не зависит от
 *      состояния HideBalance (мы пишем в textContent или в конкретную text-ноду
 *      и сбрасываем data-original-value, чтобы HideBalance перекешировал).
 *
 * Совместимость с HideBalance (порядок подключения):
 *   Currency.js ДО HideBalance.js. Тогда первый раз HideBalance видит уже
 *   правильный символ. При смене валюты Currency сбрасывает data-original-value
 *   и диспатчит 'currency:changed' — HideBalance подписан и при необходимости
 *   перерисовывает скрытое представление.
 *
 * Локальные селекты (market.html, token.html):
 *   На корневом элементе страницы выставляется data-currency-locked.
 *   Currency.js не трогает элементы внутри такой зоны — там работает
 *   LocalCurrencySelect.js.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'ledger:currency';
  const DEFAULT_CODE = 'usd';

  const CURRENCIES = {
    usd: { code: 'usd', symbol: '$', label: 'US Dollar - USD' },
    eur: { code: 'eur', symbol: '€', label: 'Euro - EUR' },
    gbp: { code: 'gbp', symbol: '£', label: 'British Pound - GBP' },
    jpy: { code: 'jpy', symbol: '¥', label: 'Japanese Yen - JPY' },
    rub: { code: 'rub', symbol: '₽', label: 'Russian Ruble - RUB' },
    cny: { code: 'cny', symbol: '¥', label: 'Chinese Yuan - CNY' },
  };

  const CURRENCY_SELECTORS = [
    // Home (index.html)
    '.home__balance',
    '.asset__cell--value',
    '.operations__amount-fiat',
    // Accounts
    '.accounts-list__amount-fiat',
    // Coin / Token
    '.coin__subtitle',
    '.coin__price--dollar',
    '.coin__actions-percent',
    '.coin-info__actions-price',
    '.coin__card-value-main',
    '.coin__card-value',
    // Reports
    '.reports__price',
    '.reports__tag--alt',
    '.reports__donut-value',
    '.reports-table__cell',
    // Market
    '.market__price',
    // Operation modal
    '[data-js-op-fiat]',
    '[data-js-op-fee-fiat]',
    // Универсальный маркер
    '[data-currency-amount]',
  ];

  // Все символы валют, которые могут встречаться в исходной разметке.
  // Только эти будут заменяться на плейсхолдер при создании шаблона.
  const ALL_SYMBOLS = ['$', '€', '£', '¥', '₽'];
  const PLACEHOLDER = '\u0001CURRENCY\u0001'; // невидимый маркер

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Регекс «символ + сразу за ним цифра» — чтобы не задеть случайные иероглифы.
  const symbolNumberRe = new RegExp(
    `(${ALL_SYMBOLS.map(escapeRegex).join('|')})(?=[0-9])`,
    'g'
  );

  /** Превращает "1 BTC = $87,871.00 / $9.10" -> "1 BTC = ⟨CURRENCY⟩87,871.00 / ⟨CURRENCY⟩9.10" */
  function makeTemplate(text) {
    if (!text || !symbolNumberRe.test(text)) return null;
    // reset lastIndex после .test()
    symbolNumberRe.lastIndex = 0;
    return text.replace(symbolNumberRe, PLACEHOLDER);
  }

  function applyTemplate(template, symbol) {
    return template.split(PLACEHOLDER).join(symbol);
  }

  /* ---- state ---- */

  function readStored() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v && CURRENCIES[v]) return v;
    } catch (e) { /* noop */ }
    return DEFAULT_CODE;
  }

  function writeStored(code) {
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) { /* noop */ }
  }

  let currentCode = readStored();
  const subscribers = new Set();

  /* ---- cache ---- */

  // WeakMap: элемент -> { kind: 'noop'|'text'|'node', textNode?, template }
  const elementCache = new WeakMap();

  function collectTargets() {
    const set = new Set();
    CURRENCY_SELECTORS.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => set.add(el));
    });
    return set;
  }

  function registerElement(el) {
    if (elementCache.has(el)) return elementCache.get(el);

    // 1. Пытаемся работать с конкретной text-нодой, если в ней есть деньги.
    let textNode = null;
    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && makeTemplate(node.textContent)) {
        textNode = node;
        break;
      }
    }

    let template;
    let kind;
    if (textNode) {
      template = makeTemplate(textNode.textContent);
      kind = 'node';
    } else {
      // 2. Ничего не нашли в листовых нодах — пробуем целиком textContent
      //    (только если у элемента нет вложенных элементов; иначе писать
      //    в textContent опасно — снесём дочерние).
      const hasChildElements = Array.from(el.children).length > 0;
      if (hasChildElements) {
        const entry = { kind: 'noop' };
        elementCache.set(el, entry);
        return entry;
      }
      template = makeTemplate(el.textContent);
      kind = 'text';
    }

    if (!template) {
      const entry = { kind: 'noop' };
      elementCache.set(el, entry);
      return entry;
    }

    const entry = { kind, textNode, template };
    elementCache.set(el, entry);
    return entry;
  }

  function writeText(el, entry, fullText) {
    if (entry.kind === 'noop') return;
    if (entry.kind === 'node' && entry.textNode) {
      entry.textNode.textContent = fullText;
    } else {
      el.textContent = fullText;
    }
    if (el.dataset.originalValue !== undefined) {
      delete el.dataset.originalValue;
    }
  }

  /* ---- render ---- */

  function applyToElement(el) {
    if (el.closest('[data-currency-locked]')) return;
    const entry = registerElement(el);
    if (entry.kind === 'noop') return;
    writeText(el, entry, applyTemplate(entry.template, CURRENCIES[currentCode].symbol));
  }

  function render() {
    collectTargets().forEach(applyToElement);
  }

  /* ---- public API ---- */

  function set(code) {
    if (!CURRENCIES[code] || code === currentCode) return;
    currentCode = code;
    writeStored(code);
    render();
    notify();
  }

  function get() { return { ...CURRENCIES[currentCode] }; }
  function getSymbol() { return CURRENCIES[currentCode].symbol; }

  function subscribe(cb) {
    if (typeof cb !== 'function') return () => {};
    subscribers.add(cb);
    return () => subscribers.delete(cb);
  }

  function notify() {
    const info = get();
    subscribers.forEach((cb) => { try { cb(info); } catch (e) {} });
    document.dispatchEvent(new CustomEvent('currency:changed', { detail: info }));
  }

  function refresh() { render(); }

  window.LedgerCurrency = {
    get, set, getSymbol, subscribe, refresh, CURRENCIES,
  };

  function init() { render(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
