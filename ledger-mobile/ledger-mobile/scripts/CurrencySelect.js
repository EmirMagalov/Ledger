/**
 * CurrencySelect.js
 * Кастомный селект валюты: триггер-кнопка + выпадающий список.
 *
 * Инициализирует все [data-js-currency-select] на странице.
 * При выборе опции:
 *  - обновляет видимое значение в триггере
 *  - переставляет .is-selected на выбранной опции
 *  - закрывает список
 *  - диспатчит кастомное событие "currency-change" на корне селекта
 *    с detail = { value, label } — удобно слушать снаружи
 */

(function () {
  'use strict';

  function initCurrencySelect(root) {
    const trigger = root.querySelector('[data-js-currency-select-trigger]');
    const valueEl = root.querySelector('[data-js-currency-select-value]');
    const list = root.querySelector('[data-js-currency-select-list]');
    if (!trigger || !valueEl || !list) return;

    const options = list.querySelectorAll('.currency-select__option');

    function open() {
      root.classList.add('is-open');
      list.removeAttribute('hidden');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function close() {
      root.classList.remove('is-open');
      list.setAttribute('hidden', '');
      trigger.setAttribute('aria-expanded', 'false');
    }

    function toggle() {
      if (root.classList.contains('is-open')) close();
      else open();
    }

    function selectOption(option) {
      const value = option.dataset.value;
      const label = option.dataset.label ?? option.textContent.trim();

      options.forEach((o) => {
        const isSame = o === option;
        o.classList.toggle('is-selected', isSame);
        o.setAttribute('aria-selected', String(isSame));
      });

      valueEl.textContent = label;

      // Событие наружу — для подстановки валюты в цены и т.п.
      root.dispatchEvent(
        new CustomEvent('currency-change', {
          detail: { value, label },
          bubbles: true,
        })
      );

      close();
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });

    options.forEach((opt) => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        selectOption(opt);
      });
    });

    // Закрытие по клику вне селекта
    document.addEventListener('click', (e) => {
      if (!root.contains(e.target) && root.classList.contains('is-open')) {
        close();
      }
    });

    // Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && root.classList.contains('is-open')) {
        close();
      }
    });
  }

  function init() {
    document.querySelectorAll('[data-js-currency-select]').forEach(initCurrencySelect);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();