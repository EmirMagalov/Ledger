/**
 * Settings.js
 * Селекты на странице настроек.
 *
 * Селект Preferred currency интегрирован с LedgerCurrency:
 *  - При загрузке: текущая валюта из LedgerCurrency проставляется в селект
 *  - При смене: вызываем LedgerCurrency.set(code), что обновляет всё на сайте
 */

(function () {
  const selects = document.querySelectorAll('[data-js-settings-select]');

  function isCurrencySelect(select) {
    if (!window.LedgerCurrency) return false;
    const codes = Object.keys(window.LedgerCurrency.CURRENCIES);
    const options = select.querySelectorAll('.settings-select__option');
    if (!options.length) return false;
    let hits = 0;
    options.forEach((o) => {
      if (codes.includes(o.dataset.value)) hits++;
    });
    return hits >= Math.ceil(options.length / 2);
  }

  selects.forEach((select) => {
    const trigger = select.querySelector('[data-js-settings-select-trigger]');
    const valueEl = select.querySelector('[data-js-settings-select-value]');
    const list = select.querySelector('[data-js-settings-select-list]');
    const options = list.querySelectorAll('.settings-select__option');
    const isCurrency = isCurrencySelect(select);

    if (isCurrency && window.LedgerCurrency) {
      const current = window.LedgerCurrency.get();
      options.forEach((o) => {
        const isSame = o.dataset.value === current.code;
        o.classList.toggle('is-selected', isSame);
        o.setAttribute('aria-selected', String(isSame));
        if (isSame) valueEl.textContent = o.dataset.label;
      });
    }

    const close = () => {
      select.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    };

    const open = () => {
      document.querySelectorAll('[data-js-settings-select].is-open').forEach((s) => {
        if (s !== select) {
          s.classList.remove('is-open');
          s.querySelector('[data-js-settings-select-trigger]').setAttribute('aria-expanded', 'false');
        }
      });
      select.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    };

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (select.classList.contains('is-open')) {
        close();
      } else {
        open();
      }
    });

    options.forEach((option) => {
      option.addEventListener('click', () => {
        options.forEach((o) => {
          o.classList.remove('is-selected');
          o.setAttribute('aria-selected', 'false');
        });
        option.classList.add('is-selected');
        option.setAttribute('aria-selected', 'true');
        valueEl.textContent = option.dataset.label;
        close();

        if (isCurrency && window.LedgerCurrency) {
          window.LedgerCurrency.set(option.dataset.value);
        }
      });
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-js-settings-select]')) {
      document.querySelectorAll('[data-js-settings-select].is-open').forEach((s) => {
        s.classList.remove('is-open');
        s.querySelector('[data-js-settings-select-trigger]').setAttribute('aria-expanded', 'false');
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('[data-js-settings-select].is-open').forEach((s) => {
        s.classList.remove('is-open');
        s.querySelector('[data-js-settings-select-trigger]').setAttribute('aria-expanded', 'false');
      });
    }
  });
})();
