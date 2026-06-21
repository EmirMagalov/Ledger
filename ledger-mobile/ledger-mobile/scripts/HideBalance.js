/**
 * HideBalance.js
 * - Скрытие / показ баланса (кнопка [data-js-hide-balance-button])
 * - Модалки News и Receive
 *
 * Интеграция с Currency.js:
 *  - Currency.js подключается ДО HideBalance.js — суммы уже под нужным символом.
 *  - При смене валюты Currency сбрасывает data-original-value у элементов
 *    и диспатчит 'currency:changed'. Если баланс сейчас скрыт — перерисовываем,
 *    чтобы префикс символа в маске тоже обновился.
 */

(function () {
  'use strict';

  // ---------- state ----------
  const state = {
    isBalanceHidden: false,
  };

  // ---------- utils ----------
  function extractSign(str) {
    const trimmed = (str || '').trim();
    if (trimmed.startsWith('+')) return { sign: '+', rest: trimmed.slice(1) };
    if (trimmed.startsWith('-')) return { sign: '-', rest: trimmed.slice(1) };
    return { sign: '', rest: trimmed };
  }

  function getOriginal(el) {
    if (el.dataset.originalValue === undefined) {
      el.dataset.originalValue = el.textContent;
    }
    return el.dataset.originalValue;
  }

  // ---------- balance refs (главный баланс на home) ----------
  let _balanceEl = null;
  let _balanceSmallEl = null;
  let _balanceMainTextNode = null;
  let _balanceOriginalMainText = null;

  function initBalanceRefs(force) {
    if (_balanceEl && !force) return;

    _balanceEl = document.querySelector('.home__balance:not(.home__balance--small)');
    if (!_balanceEl) return;

    _balanceSmallEl = _balanceEl.querySelector('.home__balance--small');

    _balanceMainTextNode = Array.from(_balanceEl.childNodes).find(
      (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim() !== ''
    );

    if (_balanceMainTextNode) {
      _balanceOriginalMainText = _balanceMainTextNode.textContent;
    }
  }

  function renderBalance() {
    initBalanceRefs();
    if (!_balanceEl || !_balanceMainTextNode) return;

    if (state.isBalanceHidden) {
      const currency = _balanceOriginalMainText.match(/^[^\d.-]+/)?.[0] ?? '$';
      _balanceMainTextNode.textContent = `${currency}••••`;
      if (_balanceSmallEl) _balanceSmallEl.style.display = 'none';
    } else {
      _balanceMainTextNode.textContent = _balanceOriginalMainText;
      if (_balanceSmallEl) _balanceSmallEl.style.display = '';
    }
  }

  function renderChangePercent() {
    const els = document.querySelectorAll('.home__change-percent');
    els.forEach((el) => {
      const original = getOriginal(el);
      if (state.isBalanceHidden) {
        const { sign } = extractSign(original);
        el.textContent = `${sign}***%`;
      } else {
        el.textContent = original;
      }
    });
  }

  function renderAssetAmount() {
    const els = document.querySelectorAll('.asset__cell--amount');
    els.forEach((el) => {
      if (el.closest('.asset__row--head')) return;
      const original = getOriginal(el);
      if (state.isBalanceHidden) {
        const parts = original.trim().split(/\s+/);
        const ticker = parts[parts.length - 1] || '';
        el.textContent = `*** ${ticker}`;
      } else {
        el.textContent = original;
      }
    });
  }

  function renderAssetValue() {
    const els = document.querySelectorAll('.asset__cell--value');
    els.forEach((el) => {
      if (el.closest('.asset__row--head')) return;
      const original = getOriginal(el);
      if (state.isBalanceHidden) {
        const currency = original.match(/^[^\d.-]+/)?.[0] ?? '$';
        el.textContent = `${currency}***`;
      } else {
        el.textContent = original;
      }
    });
  }

  function renderOperationsCrypto() {
    const els = document.querySelectorAll('.operations__amount-crypto');
    els.forEach((el) => {
      const original = getOriginal(el);
      if (state.isBalanceHidden) {
        const { sign, rest } = extractSign(original);
        const parts = rest.split(/\s+/);
        const ticker = parts[parts.length - 1] || '';
        el.textContent = `${sign}********* ${ticker}`;
      } else {
        el.textContent = original;
      }
    });
  }

  function renderOperationsFiat() {
    const els = document.querySelectorAll('.operations__amount-fiat');
    els.forEach((el) => {
      const original = getOriginal(el);
      if (state.isBalanceHidden) {
        const { sign, rest } = extractSign(original);
        const currency = rest.match(/^[^\d.-]+/)?.[0] ?? '$';
        el.textContent = `${sign}${currency}****`;
      } else {
        el.textContent = original;
      }
    });
  }

  // Скрытие баланса в списке аккаунтов (accounts.html)
  function renderAccountsAmounts() {
    const fiatEls = document.querySelectorAll('.accounts-list__amount-fiat');
    fiatEls.forEach((el) => {
      const original = getOriginal(el);
      if (state.isBalanceHidden) {
        const currency = original.match(/^[^\d.-]+/)?.[0] ?? '$';
        el.textContent = `${currency}****`;
      } else {
        el.textContent = original;
      }
    });

    const cryptoEls = document.querySelectorAll('.accounts-list__amount-crypto');
    cryptoEls.forEach((el) => {
      const original = getOriginal(el);
      if (state.isBalanceHidden) {
        const parts = original.trim().split(/\s+/);
        const ticker = parts[parts.length - 1] || '';
        el.textContent = `*** ${ticker}`;
      } else {
        el.textContent = original;
      }
    });
  }

  function render() {
    renderBalance();
    renderChangePercent();
    renderAssetAmount();
    renderAssetValue();
    renderOperationsCrypto();
    renderOperationsFiat();
    renderAccountsAmounts();
  }

  /**
   * Currency.js при смене валюты:
   *  - меняет видимый текст элементов
   *  - удаляет data-original-value с обработанных элементов
   *  - диспатчит 'currency:changed'
   *
   * Если в этот момент баланс скрыт — нужно перерисовать маску с новым символом
   * (data-original-value уже сброшен, getOriginal закеширует свежий текст с новым $).
   *
   * Главный баланс на home: его references мы кешируем отдельно. Принудительно
   * переинициализируем, чтобы _balanceOriginalMainText содержал свежий символ.
   */
  function handleCurrencyChange() {
    initBalanceRefs(true); // force re-init refs
    if (state.isBalanceHidden) {
      render();
    }
  }

  // ---------- news modal ----------
  function initNewsModal() {
    const openBtn = document.querySelector('[data-js-news-button]');
    const modal = document.querySelector('[data-js-news-modal]');
    if (!openBtn || !modal) return;

    const overlay = modal.querySelector('[data-js-news-modal-overlay]');
    const closeBtn = modal.querySelector('[data-js-news-modal-close]');
    const tabs = modal.querySelectorAll('[data-js-news-modal-tab]');
    const panes = modal.querySelectorAll('[data-js-news-modal-pane]');

    function open() {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-news-modal-open');
    }

    function close() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-news-modal-open');
    }

    function switchTab(name) {
      tabs.forEach((tab) => {
        const isActive = tab.dataset.jsNewsModalTab === name;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
      });

      panes.forEach((pane) => {
        const isActive = pane.dataset.jsNewsModalPane === name;
        pane.classList.toggle('is-active', isActive);
        if (isActive) {
          pane.removeAttribute('hidden');
        } else {
          pane.setAttribute('hidden', '');
        }
      });
    }

    openBtn.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    overlay?.addEventListener('click', close);

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        switchTab(tab.dataset.jsNewsModalTab);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        close();
      }
    });
  }

  // ---------- receive modal ----------
  function initReceiveModal() {
    const openBtn = document.querySelector('[data-js-receive-open-button]');
    const modal = document.querySelector('[data-js-receive-modal]');
    if (!openBtn || !modal) return;

    const overlay = modal.querySelector('[data-js-receive-modal-overlay]');
    const closeBtns = modal.querySelectorAll('[data-js-receive-modal-close]');
    const views = modal.querySelectorAll('[data-js-receive-modal-view]');
    const showQrBtn = modal.querySelector('[data-js-receive-modal-show-qr]');
    const showAddressBtn = modal.querySelector('[data-js-receive-modal-show-address]');
    const copyBtn = modal.querySelector('[data-js-receive-modal-copy]');
    const copyBtnQr = modal.querySelector('[data-js-receive-modal-copy-qr]');
    const addressEl = modal.querySelector('[data-js-receive-modal-address]');
    const addressElQr = modal.querySelector('[data-js-receive-modal-address-qr]');

    function switchView(name) {
      views.forEach((view) => {
        const isActive = view.dataset.jsReceiveModalView === name;
        if (isActive) {
          view.removeAttribute('hidden');
        } else {
          view.setAttribute('hidden', '');
        }
      });
    }

    function open() {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-receive-modal-open');
      switchView('address');
    }

    function close() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-receive-modal-open');
    }

    openBtn.addEventListener('click', open);
    closeBtns.forEach((btn) => btn.addEventListener('click', close));
    overlay?.addEventListener('click', close);

    showQrBtn?.addEventListener('click', () => switchView('qr'));
    showAddressBtn?.addEventListener('click', () => switchView('address'));

    function setupCopyButton(btn, sourceEl) {
      if (!btn || !sourceEl) return;
      let timeoutId = null;
      const flash = () => {
        btn.classList.add('is-copied');
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => btn.classList.remove('is-copied'), 1500);
      };
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const address = sourceEl.textContent?.trim();
        if (!address) return;
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(address).then(flash).catch(() => {});
        } else {
          flash();
        }
      });
    }

    setupCopyButton(copyBtn, addressEl);
    setupCopyButton(copyBtnQr, addressElQr);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        close();
      }
    });
  }

  // ---------- init ----------
  function init() {
    const hideBtn = document.querySelector('[data-js-hide-balance-button]');
    if (hideBtn) {
      hideBtn.addEventListener('click', () => {
        state.isBalanceHidden = !state.isBalanceHidden;
        hideBtn.classList.toggle('is-active', state.isBalanceHidden);
        render();
      });
    }

    document.addEventListener('currency:changed', handleCurrencyChange);

    initNewsModal();
    initReceiveModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
