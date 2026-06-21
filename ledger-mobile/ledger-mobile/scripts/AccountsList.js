/**
 * AccountsList.js
 * - Поиск по списку (имя + тикер)
 * - Сортировка по селекту "Sort by" (Name A-Z, Z-A, Highest/Lowest Balance)
 * - Скрытие пустых балансов (чекбокс "Hide empty token accounts")
 * - Toggle "избранное"
 *
 * Источник истины для баланса — оригинальный текст в .accounts-list__amount-fiat.
 * Чтобы корректно работать после смены валюты и в режиме скрытого баланса,
 * парсим число из data-balance-original (кешируется при первой инициализации).
 */

(function () {
  'use strict';

  function parseFiatAmount(text) {
    if (!text) return 0;
    // удаляем всё, кроме цифр, точки, минуса, запятой
    const cleaned = String(text).replace(/[^0-9.,-]/g, '').replace(/,/g, '');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  /**
   * Имя монеты — это первый текстовый узел внутри .accounts-list__coin-name
   * (после имени там может идти span с бейджем "NATIVE SEGWIT").
   */
  function getCoinName(item) {
    const nameEl = item.querySelector('.accounts-list__coin-name');
    if (!nameEl) return '';
    const firstText = Array.from(nameEl.childNodes).find(
      (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim() !== ''
    );
    return (firstText ? firstText.textContent : nameEl.textContent).trim();
  }

  function getTicker(item) {
    return (item.querySelector('.accounts-list__coin-ticker')?.textContent || '').trim();
  }

  /**
   * Возвращает «оригинальный» баланс в виде числа, не обращая внимания на то,
   * скрыт ли сейчас баланс (HideBalance мог записать `$****`).
   * Берём из data-original-value (HideBalance кеширует), иначе — из textContent.
   */
  function getFiatNumber(item) {
    const el = item.querySelector('.accounts-list__amount-fiat');
    if (!el) return 0;
    const raw = el.dataset.originalValue ?? el.textContent;
    return parseFiatAmount(raw);
  }

  /* ----------------- state ----------------- */

  const state = {
    query: '',
    sort: 'name-asc',
    hideEmpty: false,
  };

  let itemsContainer = null;
  let items = [];
  let originalOrder = [];

  /* ----------------- apply ----------------- */

  function applyVisibility() {
    items.forEach((item) => {
      const name = getCoinName(item).toLowerCase();
      const ticker = getTicker(item).toLowerCase();
      const matchesSearch = !state.query
        || name.includes(state.query)
        || ticker.includes(state.query);

      const balance = getFiatNumber(item);
      const passesEmptyFilter = !state.hideEmpty || balance > 0;

      const visible = matchesSearch && passesEmptyFilter;
      item.style.display = visible ? '' : 'none';
    });
  }

  function applySort() {
    if (!itemsContainer) return;

    let sorted;
    if (state.sort === 'original') {
      sorted = originalOrder.slice();
    } else {
      sorted = items.slice().sort((a, b) => {
        switch (state.sort) {
          case 'name-asc':
            return getCoinName(a).localeCompare(getCoinName(b), undefined, { sensitivity: 'base' });
          case 'name-desc':
            return getCoinName(b).localeCompare(getCoinName(a), undefined, { sensitivity: 'base' });
          case 'balance-desc':
            return getFiatNumber(b) - getFiatNumber(a);
          case 'balance-asc':
            return getFiatNumber(a) - getFiatNumber(b);
          default:
            return 0;
        }
      });
    }

    // Перевставляем в правильном порядке (DOM не пересоздаём — appendChild
    // переносит существующие узлы)
    const fragment = document.createDocumentFragment();
    sorted.forEach((item) => fragment.appendChild(item));
    itemsContainer.appendChild(fragment);
  }

  function refresh() {
    applySort();
    applyVisibility();
  }

  /* ----------------- inits ----------------- */

  function initSearch() {
    const input = document.querySelector('[data-js-accounts-search]');
    if (!input) return;
    input.addEventListener('input', () => {
      state.query = input.value.trim().toLowerCase();
      applyVisibility();
    });
  }

  function initFavorites() {
    document.querySelectorAll('.accounts-list__action--favorite').forEach((btn) => {
      btn.addEventListener('click', () => btn.classList.toggle('is-active'));
    });
  }

  /**
   * Клик по строке аккаунта переводит на coin.html.
   * Игнорируем клики по интерактивным элементам внутри строки
   * (звезда избранного, кнопка скрыть и т.п.) — чтобы они работали как раньше.
   */
  function initItemNavigation() {
    const items = document.querySelectorAll('[data-js-accounts-item]');
    items.forEach((item) => {
      // курсор и доступность
      item.style.cursor = 'pointer';
      if (!item.hasAttribute('role')) item.setAttribute('role', 'link');
      if (!item.hasAttribute('tabindex')) item.setAttribute('tabindex', '0');

      const go = () => {
        // Если у конкретного элемента есть свой href в data-href — используем его,
        // иначе универсальный coin.html.
        const href = item.dataset.href || 'coin.html';
        window.location.href = href;
      };

      item.addEventListener('click', (e) => {
        // Не переходим, если кликнули по кнопке/ссылке/инпуту внутри строки
        if (e.target.closest('button, a, input, label, [role="button"]')) return;
        go();
      });

      // Доступность с клавиатуры
      item.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === item) {
          e.preventDefault();
          go();
        }
      });
    });
  }

  /**
   * Находим именно тот currency-select, у которого опции — варианты сортировки
   * (по data-value: name-asc, name-desc, balance-desc, balance-asc).
   */
  function initSortSelect() {
    const candidates = document.querySelectorAll('[data-js-currency-select]');
    let sortSelect = null;
    candidates.forEach((root) => {
      const opt = root.querySelector('[data-value="name-asc"], [data-value="balance-desc"]');
      if (opt) sortSelect = root;
    });
    if (!sortSelect) return;

    // CurrencySelect диспатчит 'currency-change' с detail.value
    sortSelect.addEventListener('currency-change', (e) => {
      const value = e.detail?.value;
      if (!value) return;
      state.sort = value;
      refresh();
    });

    // Подцепляем текущее значение, если selected уже стоит
    const selected = sortSelect.querySelector('.currency-select__option.is-selected');
    if (selected?.dataset.value) {
      state.sort = selected.dataset.value;
    }
  }

  function initHideEmpty() {
    // AccountOptions.js диспатчит 'hide-empty-tokens-change' с detail.checked
    const optionsRoot = document.querySelector('[data-js-accounts-options]');
    if (!optionsRoot) return;

    const checkbox = optionsRoot.querySelector('[data-js-hide-empty-tokens]');
    if (checkbox) {
      // Стартовое состояние читаем из самого чекбокса (в HTML по умолчанию checked)
      state.hideEmpty = !!checkbox.checked;
    }

    optionsRoot.addEventListener('hide-empty-tokens-change', (e) => {
      state.hideEmpty = !!e.detail?.checked;
      applyVisibility();
    });
  }

  /* ----------------- bootstrap ----------------- */

  function init() {
    itemsContainer = document.querySelector('[data-js-accounts-items]');
    if (!itemsContainer) return;

    items = Array.from(itemsContainer.querySelectorAll('.accounts-list__item'));
    originalOrder = items.slice();

    // Зафиксируем оригинальные значения баланса в data-original-value
    // ДО того, как HideBalance их подменит — иначе при выкл. показа баланса
    // мы потеряем настоящие числа для сортировки и фильтра.
    items.forEach((item) => {
      const fiatEl = item.querySelector('.accounts-list__amount-fiat');
      if (fiatEl && fiatEl.dataset.originalValue === undefined) {
        fiatEl.dataset.originalValue = fiatEl.textContent;
      }
      const cryptoEl = item.querySelector('.accounts-list__amount-crypto');
      if (cryptoEl && cryptoEl.dataset.originalValue === undefined) {
        cryptoEl.dataset.originalValue = cryptoEl.textContent;
      }
    });

    initSearch();
    initFavorites();
    initItemNavigation();
    initSortSelect();
    initHideEmpty();

    refresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
