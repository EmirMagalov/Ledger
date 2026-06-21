(function () {
  const root = document.querySelector('[data-js-discover]');
  if (!root) return;

  const selectEl     = root.querySelector('[data-js-discover-select]');
  const trigger      = root.querySelector('[data-js-discover-select-trigger]');
  const list         = root.querySelector('[data-js-discover-select-list]');
  const valueEl      = root.querySelector('[data-js-discover-select-value]');
  const searchInput  = root.querySelector('[data-js-discover-search]');
  const grid         = document.querySelector('[data-js-discover-grid]');

  if (!selectEl || !trigger || !list || !valueEl || !grid) return;

  const options = Array.from(list.querySelectorAll('.discover__select-option'));
  const cards   = Array.from(grid.querySelectorAll('.discover-card'));

  // Текущее состояние фильтров
  let currentCategory = 'all';
  let currentSearch   = '';

  // Инициализируем выбранную опцию, исходя из aria-selected в разметке
  const initiallySelected = options.find(o => o.getAttribute('aria-selected') === 'true');
  if (initiallySelected) {
    currentCategory = initiallySelected.dataset.value || 'all';
    valueEl.textContent = initiallySelected.textContent.trim().replace(/\s+/g, ' ');
    initiallySelected.classList.add('is-active');
  } else {
    const allOpt = options.find(o => o.dataset.value === 'all');
    if (allOpt) {
      allOpt.setAttribute('aria-selected', 'true');
      allOpt.classList.add('is-active');
    }
  }

  // ---------- Открытие / закрытие селекта ----------
  function openList() {
    list.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
  }

  function closeList() {
    list.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  }

  function toggleList() {
    if (list.hidden) openList();
    else closeList();
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleList();
  });

  // Клик вне селекта закрывает список
  document.addEventListener('click', (e) => {
    if (!selectEl.contains(e.target)) closeList();
  });

  // Esc закрывает список
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeList();
  });

  // ---------- Выбор опции ----------
  options.forEach((option) => {
    option.addEventListener('click', () => {
      // Снимаем флаги со всех
      options.forEach((o) => {
        o.setAttribute('aria-selected', 'false');
        o.classList.remove('is-active');
      });

      // Ставим на выбранную
      option.setAttribute('aria-selected', 'true');
      option.classList.add('is-active');

      currentCategory = option.dataset.value || 'all';
      valueEl.textContent = option.textContent.trim().replace(/\s+/g, ' ');

      closeList();
      applyFilters();
    });
  });

  // ---------- Поиск ----------
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  // ---------- Применение фильтров ----------
  function applyFilters() {
    cards.forEach((card) => {
      const categories = (card.dataset.category || '')
        .split(',')
        .map((c) => c.trim().toLowerCase())
        .filter(Boolean);

      const name = (card.dataset.name || '').toLowerCase();

      const matchCategory =
        currentCategory === 'all' || categories.includes(currentCategory.toLowerCase());

      const matchSearch = currentSearch === '' || name.includes(currentSearch);

      const visible = matchCategory && matchSearch;

      card.hidden = !visible;
      card.classList.toggle('is-hidden', !visible);
    });
  }

  // Применяем фильтр сразу (на случай, если по умолчанию выбрана не "All")
  applyFilters();
})();