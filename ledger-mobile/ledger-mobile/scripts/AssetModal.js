class AssetModal {
  static ASSETS = [
    { name: 'Bitcoin',  ticker: 'BTC', icon: './icons/home/bitcoin.png'},
    { name: 'Ethereum', ticker: 'ETH', icon: './icons/home/ethereum.png'},
    { name: 'Monero',   ticker: 'XMR', icon: './icons/home/monero.png' },
    { name: 'XRP',      ticker: 'XRP', icon: './icons/home/xrp.png' },
    { name: 'Tron',     ticker: 'TRX', icon: './icons/home/tron.png' },
    { name: 'Cardano',  ticker: 'ADA', icon: './icons/home/cardano.png' },
  ];

  constructor() {
    this.modal = document.querySelector('[data-js-asset-modal]');
    this.openBtn = document.querySelectorAll('[data-js-accounts-button]');
    this.list = document.querySelector('[data-js-asset-list]');
    this.searchInput = document.querySelector('[data-js-asset-search]');

    if (!this.modal || !this.openBtn) return;

    this.closeEls = this.modal.querySelectorAll('[data-js-asset-modal-close]');
    this.query = '';

    this.bindEvents();
    this.render();
  }

  bindEvents() {
    this.openBtn.forEach(btn => {
      btn.addEventListener('click', () => this.open())
    })

    this.closeEls.forEach((el) => {
      el.addEventListener('click', () => this.close());
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) this.close();
    });

    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.query = e.target.value.trim().toLowerCase();
        this.render();
      });
    }

    // делегирование клика по кнопкам Select
    this.list.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-js-asset-select]');
      if (!btn) return;
      const ticker = btn.dataset.jsAssetSelect;
      this.onSelect(ticker);
    });
  }

  isOpen() {
    return this.modal.classList.contains('is-open');
  }

  open() {
    this.modal.classList.add('is-open');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-modal-open');
    if (this.searchInput) this.searchInput.focus();
  }

  close() {
    this.modal.classList.remove('is-open');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-modal-open');
    if (this.searchInput) this.searchInput.value = '';
    this.query = '';
    this.render();
  }

  getFilteredAssets() {
    if (!this.query) return AssetModal.ASSETS;
    return AssetModal.ASSETS.filter((a) =>
      a.name.toLowerCase().includes(this.query) ||
      a.ticker.toLowerCase().includes(this.query)
    );
  }

  render() {
    const assets = this.getFilteredAssets();

    if (!assets.length) {
      this.list.innerHTML = `
        <li class="asset-modal__item" style="justify-content:center;color:#858585;">
          Nothing found
        </li>
      `;
      return;
    }

    this.list.innerHTML = assets
      .map(
        (a) => `
        <li class="asset-modal__item">
          <div class="asset-modal__asset">
            <span class="asset-modal__asset-icon">
              <img src="${a.icon}" alt="${a.name}">
            </span>
            <div class="asset-modal__asset-info">
              <span class="asset-modal__asset-name">${a.name}</span>
              <span class="asset-modal__asset-ticker">${a.ticker}</span>
            </div>
          </div>
          <button
            type="button"
            class="asset-modal__select"
            data-js-asset-select="${a.ticker}"
          >
            Select
          </button>
        </li>
      `,
      )
      .join('');
  }

  onSelect(ticker) {
    const asset = AssetModal.ASSETS.find((a) => a.ticker === ticker);
    if (!asset) return;

    // тут твоя логика добавления аккаунта
    console.log('Selected asset:', asset);

    this.close();
  }
}

new AssetModal();