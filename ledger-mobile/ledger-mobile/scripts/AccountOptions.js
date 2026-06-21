/**
 * AccountsOptions.js
 * Попап "Options" с кнопкой-триггером (три точки).
 *
 * Инициализирует все [data-js-accounts-options] на странице.
 * Поведение:
 *  - Клик по кнопке открывает/закрывает попап
 *  - Клик вне попапа закрывает его
 *  - Escape закрывает
 *  - Когда попап открыт, тултип скрывается (через класс is-open на корне)
 *  - Чекбокс "Hide empty token accounts" диспатчит событие
 *    "hide-empty-tokens-change" с detail.checked
 */

(function () {
  'use strict';

  function initAccountsOptions(root) {
    const trigger = root.querySelector('[data-js-accounts-options-trigger]');
    const popup = root.querySelector('[data-js-accounts-options-popup]');
    const hideEmptyCheckbox = root.querySelector('[data-js-hide-empty-tokens]');
    if (!trigger || !popup) return;

    function open() {
      root.classList.add('is-open');
      popup.removeAttribute('hidden');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function close() {
      root.classList.remove('is-open');
      popup.setAttribute('hidden', '');
      trigger.setAttribute('aria-expanded', 'false');
    }

    function toggle() {
      if (root.classList.contains('is-open')) close();
      else open();
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });

    // Клики внутри попапа не должны его закрывать
    popup.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Клик вне корневого элемента — закрываем
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

    // Свитч "Hide empty token accounts" — диспатчит событие наружу
    hideEmptyCheckbox?.addEventListener('change', (e) => {
      root.dispatchEvent(
        new CustomEvent('hide-empty-tokens-change', {
          detail: { checked: e.target.checked },
          bubbles: true,
        })
      );
    });
  }

  function init() {
    document.querySelectorAll('[data-js-accounts-options]').forEach(initAccountsOptions);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();