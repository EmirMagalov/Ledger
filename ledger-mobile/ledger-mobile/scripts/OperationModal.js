class OperationModal {
  constructor() {
    this.modal = document.querySelector('[data-js-operation-modal]');
    this.openBtns = document.querySelectorAll('[data-js-open-operation-button]');

    if (!this.modal || !this.openBtns.length) return;

    this.closeEls = this.modal.querySelectorAll('[data-js-operation-modal-close]');

    this.bindEvents();
  }

  bindEvents() {
    this.openBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        // данные берём из data-атрибутов кнопки (опционально)
        const data = this.getDataFromBtn(btn);
        this.open(data);
      });
    });

    this.closeEls.forEach((el) => {
      el.addEventListener('click', () => this.close());
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) this.close();
    });
  }

  getDataFromBtn(btn) {
    // если на кнопке есть data-атрибуты — берём их,
    // иначе используем дефолтные моковые данные
    if (!btn.dataset.jsOpType) return null;

    return {
      type: btn.dataset.jsOpType,
      amountCrypto: btn.dataset.jsOpAmountCrypto,
      amountFiat: btn.dataset.jsOpAmountFiat,
      feeCrypto: btn.dataset.jsOpFeeCrypto,
      feeFiat: btn.dataset.jsOpFeeFiat,
      status: btn.dataset.jsOpStatus,
      account: btn.dataset.jsOpAccount,
      accountIcon: btn.dataset.jsOpAccountIcon,
      date: btn.dataset.jsOpDate,
      txid: btn.dataset.jsOpTxid,
      from: btn.dataset.jsOpFrom,
      to: btn.dataset.jsOpTo,
    };
  }

  fillData(data) {
    if (!data) return;

    const isReceived = data.type === 'Received';

    // иконка и цвет заголовка
    const iconEl = this.modal.querySelector('.operation-modal__icon');
    const amountEl = this.modal.querySelector('[data-js-op-amount]');

    iconEl.classList.toggle('operation-modal__icon--received', isReceived);
    iconEl.classList.toggle('operation-modal__icon--sent', !isReceived);
    amountEl.classList.toggle('operation-modal__amount--positive', isReceived);
    amountEl.classList.toggle('operation-modal__amount--negative', !isReceived);

    // текстовые поля
    this.setText('[data-js-op-type]', data.type);
    this.setText('[data-js-op-type-value]', data.type);
    this.setText('[data-js-op-amount]', `${isReceived ? '+' : '-'}${data.amountCrypto}`);
    this.setText('[data-js-op-fiat]', `${isReceived ? '+' : '-'}${data.amountFiat}`);
    this.setText('[data-js-op-fee-crypto]', data.feeCrypto);
    this.setText('[data-js-op-fee-fiat]', data.feeFiat);
    this.setText('[data-js-op-status]', data.status);
    this.setText('[data-js-op-account]', data.account);
    this.setText('[data-js-op-date]', data.date);
    this.setText('[data-js-op-txid]', data.txid);
    this.setText('[data-js-op-from]', data.from);
    this.setText('[data-js-op-to]', data.to);

    // иконка аккаунта
    const accountIconEl = this.modal.querySelector('[data-js-op-account-icon]');
    if (accountIconEl && data.accountIcon) {
      accountIconEl.innerHTML = `<img src="${data.accountIcon}" alt="${data.account}">`;
    }
  }

  setText(selector, value) {
    if (value === undefined) return;
    const el = this.modal.querySelector(selector);
    if (el) el.textContent = value;
  }

  isOpen() {
    return this.modal.classList.contains('is-open');
  }

  open(data) {
    if (data) this.fillData(data);

    this.modal.classList.add('is-open');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-modal-open');
  }

  close() {
    this.modal.classList.remove('is-open');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-modal-open');
  }
}

new OperationModal();