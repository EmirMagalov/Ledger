// ===== Market: РїРѕРёСЃРє =====
(() => {
  const input = document.querySelector('[data-js-market-search]');
  const list  = document.querySelector('[data-js-market-list]');
  if (!input || !list) return;

  const rows = Array.from(list.querySelectorAll('.market__row'));
  const normalize = (str) => (str || '').toLowerCase().trim();

  input.addEventListener('input', (e) => {
    const query = normalize(e.target.value);

    rows.forEach((row) => {
      const name   = normalize(row.dataset.name);
      const ticker = normalize(row.dataset.ticker);
      const match  = !query || name.includes(query) || ticker.includes(query);
      row.classList.toggle('is-hidden', !match);
    });

    list.scrollTop = 0;
  });
})();

// ===== Market: Р·РІС‘Р·РґРѕС‡РєР° (РёР·Р±СЂР°РЅРЅРѕРµ) =====
(() => {
  const list = document.querySelector('[data-js-market-list]');
  if (!list) return;

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-js-market-fav]');
    if (!btn) return;

    const isActive = btn.classList.toggle('is-active');
    btn.setAttribute('aria-pressed', String(isActive));
  });
})();

// ===== Market: СЃРµР»РµРєС‚С‹ (Currency / Range) =====
(() => {
  const selects = document.querySelectorAll('[data-js-market-select]');
  if (!selects.length) return;

  const closeAll = (except = null) => {
    selects.forEach((select) => {
      if (select === except) return;
      const trigger = select.querySelector('[data-js-market-select-trigger]');
      const listEl  = select.querySelector('[data-js-market-select-list]');
      trigger?.setAttribute('aria-expanded', 'false');
      listEl?.setAttribute('hidden', '');
    });
  };

  selects.forEach((select) => {
    const trigger = select.querySelector('[data-js-market-select-trigger]');
    const value   = select.querySelector('[data-js-market-select-value]');
    const listEl  = select.querySelector('[data-js-market-select-list]');
    if (!trigger || !value || !listEl) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      closeAll(select);
      trigger.setAttribute('aria-expanded', String(!isOpen));
      listEl.toggleAttribute('hidden', isOpen);
    });

    listEl.addEventListener('click', (e) => {
      const option = e.target.closest('.market-select__option');
      if (!option) return;

      listEl.querySelectorAll('.market-select__option').forEach((o) => {
        o.classList.remove('is-selected');
        o.setAttribute('aria-selected', 'false');
      });
      option.classList.add('is-selected');
      option.setAttribute('aria-selected', 'true');

      value.textContent = option.dataset.label || option.textContent;
      trigger.setAttribute('aria-expanded', 'false');
      listEl.setAttribute('hidden', '');
    });
  });

  document.addEventListener('click', () => closeAll());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });
})();
