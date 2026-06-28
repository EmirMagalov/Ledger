class GeneratePhrase {
  // РљРѕСЂРѕС‚РєРёР№ РґРµРјРѕ-СЃР»РѕРІР°СЂСЊ. Р”Р»СЏ РїСЂРѕРґР° РїРѕРґРєР»СЋС‡Рё СЂРµР°Р»СЊРЅС‹Р№ BIP-39 wordlist.
  // static WORDS = [
  //   'witness', 'haircut', 'wallet', 'bottle', 'gym', 'kindness',
  //   'apple', 'key', 'energy', 'sleep', 'gravity', 'budget',
  //   'sleep', 'gravity', 'budget', 'sleep', 'gravity', 'budget',
  //   'sleep', 'gravity', 'budget', 'sleep', 'gravity', 'budget',
  // ];

  static EYE_OPEN_SVG = `
    <svg width="17" height="13" viewBox="0 0 17 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.08734 0C12.1991 0 15.2772 2.58217 16.1012 5.63193C16.2501 6.19051 16.2668 6.78076 16.1389 7.34815C15.3673 10.7887 11.8028 13 8.08734 13C4.46201 13 1.32104 10.915 0.216039 7.73395C-0.0607357 6.94053 -0.0712011 6.07498 0.182509 5.27527C1.17428 2.16052 4.11814 0 8.08734 0ZM8.08734 1.25806C4.6025 1.25806 2.18912 3.1221 1.38186 5.65689C1.20992 6.19807 1.21828 6.78495 1.40279 7.32068C2.31489 9.9406 4.93798 11.7419 8.08734 11.7419C11.3919 11.7419 14.3043 9.78208 14.9102 7.07284C14.9941 6.70758 14.9836 6.32408 14.8851 5.95945C14.2204 3.49092 11.6644 1.25806 8.08734 1.25806ZM8.08734 2.72581C10.096 2.72581 11.6519 4.45711 11.6519 6.5C11.6519 8.54289 10.096 10.2742 8.08734 10.2742C6.07863 10.2742 4.52282 8.54289 4.52282 6.5C4.52282 4.45711 6.07863 2.72581 8.08734 2.72581ZM8.08734 3.98387C6.85443 3.98387 5.78089 5.06874 5.78089 6.5C5.78089 7.93126 6.85443 9.01613 8.08734 9.01613C9.32234 9.01613 10.3938 7.93126 10.3938 6.5C10.3938 5.06874 9.32234 3.98387 8.08734 3.98387Z" fill="#858585"/>
    </svg>
  `;

  static EYE_CLOSED_SVG = `
    <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.716201 0.184058C0.964821 -0.0600984 1.36856 -0.061556 1.61718 0.180938L6.86369 5.27477C6.91469 5.3024 6.96142 5.3371 7.00392 5.37887L9.40726 7.7452L16.8106 14.9342C17.0614 15.1769 17.0635 15.5717 16.8148 15.8159C16.5662 16.0602 16.1625 16.0615 15.9139 15.819L13.3703 13.3508C11.9126 14.3119 10.0873 14.8571 8.19604 14.8571C4.52199 14.8571 1.3388 12.7908 0.218942 9.63841C-0.0615521 8.85212 -0.0721582 7.99435 0.184962 7.20183C0.692827 5.64671 1.70639 4.32058 3.11524 3.39299L0.720403 1.06573C0.469658 0.823028 0.467581 0.428214 0.716201 0.184058ZM4.04174 4.29191C2.75402 5.06968 1.84242 6.22084 1.40043 7.58022C1.22618 8.11653 1.23465 8.69794 1.42165 9.22884C2.34601 11.8252 5.00436 13.6104 8.19604 13.6104C9.75151 13.6104 11.2411 13.185 12.446 12.4517L10.8735 10.9257C10.219 11.6739 9.26915 12.1558 8.19604 12.1558C6.16033 12.1558 4.58361 10.4401 4.58361 8.41555C4.58361 7.40879 4.96819 6.48682 5.60568 5.80942L4.04174 4.29191ZM8.19604 1.97398C12.3631 1.97398 15.4825 4.53294 16.3176 7.55528C16.4685 8.10614 16.4876 8.68422 16.3771 9.24069C16.2496 9.87508 16.0265 10.3443 15.6164 10.9436C15.4209 11.2299 15.0257 11.307 14.7324 11.1158C14.4413 10.9246 14.3605 10.5375 14.556 10.2512C14.9003 9.74978 15.0384 9.43394 15.1255 9.00318C15.1999 8.62957 15.185 8.2437 15.0851 7.87986C14.4115 5.43352 11.8212 3.22074 8.19604 3.22074C7.84967 3.22074 7.51181 3.23861 7.18669 3.27331C6.83819 3.3105 6.52369 3.06322 6.48544 2.72099C6.44719 2.37876 6.70004 2.07103 7.04853 2.03383C7.42253 1.99435 7.80505 1.97398 8.19604 1.97398ZM6.51091 6.68921C6.11142 7.13368 5.85859 7.73918 5.85859 8.41555C5.85859 9.83394 6.94657 10.9091 8.19604 10.9091C8.88665 10.9091 9.52203 10.5861 9.95764 10.0548L8.50841 8.62936L6.51091 6.68921Z" fill="#858585" />
    </svg>
  `;

  constructor() {
    this.grid = document.querySelector('[data-js-phrase-grid]');
    this.card = document.querySelector('.create__card');
    this.generateBtn = document.querySelector('[data-js-generate]');
    this.switcherBtns = document.querySelectorAll('.create__switcher-btn');
    this.hideBtn = document.querySelector('.create__actions-hide-button');
    this.copyBtn = document.querySelector('.create__actions-copy-button');

    this.wordsCount = 12;
    this.isHidden = false;
    this.currentWords = [];

    if (!this.grid || !this.generateBtn) return;

    this.bindEvents();
    this.render();
  }

  bindEvents() {
    this.switcherBtns.forEach((btn) => {
      btn.addEventListener('click', () => this.onSwitch(btn));
    });

    this.generateBtn.addEventListener('click', () => this.goToVerify());

    if (this.hideBtn) {
      this.hideBtn.addEventListener('click', () => this.toggleHide());
    }

    if (this.copyBtn) {
      this.copyBtn.addEventListener('click', () => this.copyPhrase());
    }
  }

  goToVerify() {
    // РѕРїС†РёРѕРЅР°Р»СЊРЅРѕ: СЃРѕС…СЂР°РЅСЏРµРј С„СЂР°Р·Сѓ, С‡С‚РѕР±С‹ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РµС‘ РЅР° verify.html
    if (this.currentWords.length) {
      sessionStorage.setItem('seedPhrase', JSON.stringify(this.currentWords));
    }
    window.location.href = 'verify.html';
  }

  async onSwitch(activeBtn) {
    // 1. Обновляем визуальное состояние кнопок
    this.switcherBtns.forEach((btn) => {
      btn.classList.remove('is-active');
      btn.setAttribute('aria-selected', 'false');
    });
    activeBtn.classList.add('is-active');
    activeBtn.setAttribute('aria-selected', 'true');

    // 2. Устанавливаем новое значение
    this.wordsCount = Number(activeBtn.dataset.words);

    // 3. Динамически перезапрашиваем слова у сервера
    await this.render();

    this.applyHiddenState();
  }

  toggleHide() {
    this.isHidden = !this.isHidden;
    this.applyHiddenState();
  }

  applyHiddenState() {
    // Р±Р»СЋСЂ СЃРµС‚РєРё
    if (this.grid) {
      this.grid.classList.toggle('is-hidden', this.isHidden);
    }

    if (this.card) {
      this.card.classList.toggle('is-hidden', this.isHidden);
    }

    // РѕР±РЅРѕРІР»СЏРµРј SVG Рё С‚РµРєСЃС‚ РєРЅРѕРїРєРё
    if (this.hideBtn) {
      const svg = this.isHidden
        ? GeneratePhrase.EYE_CLOSED_SVG
        : GeneratePhrase.EYE_OPEN_SVG;
      const label = this.isHidden ? 'Show phrase' : 'Hide phrase';
      this.hideBtn.innerHTML = `${svg} ${label}`;
      this.hideBtn.classList.toggle('is-active', this.isHidden);
      this.hideBtn.setAttribute('aria-pressed', String(this.isHidden));
    }

    // is-active--alt С‚РѕР»СЊРєРѕ Р°РєС‚РёРІРЅРѕР№ РєРЅРѕРїРєРµ СЃРІРёС‚С‡РµСЂР°, РєРѕРіРґР° СЃРєСЂС‹С‚Рѕ
    this.switcherBtns.forEach((btn) => {
      const isActive = btn.classList.contains('is-active');
      btn.classList.toggle('is-active--alt', this.isHidden && isActive);
    });
  }

  async generateWords(count) {
    try {
      // Запрос к вашему Python серверу
      const response = await fetch(`${API_BASE_URL}/user/generate-phrase?count=${count}`);
      const data = await response.json();
      return data.phrase.split(' ');
    } catch (err) {
      console.error("Error while requesting server:", err);
      return Array(count).fill("error");
    }
  }

  // Обновленный рендер (так как генерация теперь асинхронная)
  async render() {
    this.currentWords = await this.generateWords(this.wordsCount);

    this.grid.dataset.count = String(this.wordsCount);
    this.grid.innerHTML = this.currentWords
        .map((word, i) => `
          <li class="create__word">
            <span class="create__word-index">${i + 1}.</span>
            <span class="create__word-text">${word}</span>
          </li>
        `).join('');
  }

  async copyPhrase() {
    if (!this.currentWords.length) return;

    const phrase = this.currentWords.join(' ');

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(phrase);
      } else {
        // С„РѕР»Р±СЌРє РґР»СЏ РЅРµР±РµР·РѕРїР°СЃРЅРѕРіРѕ РєРѕРЅС‚РµРєСЃС‚Р° / СЃС‚Р°СЂС‹С… Р±СЂР°СѓР·РµСЂРѕРІ
        const textarea = document.createElement('textarea');
        textarea.value = phrase;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      this.showCopied();
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }

  showCopied() {
    if (!this.copyBtn) return;

    const original = this.copyBtn.innerHTML;
    this.copyBtn.classList.add('is-copied');

    // СЃРѕС…СЂР°РЅСЏРµРј SVG, РјРµРЅСЏРµРј С‚РѕР»СЊРєРѕ С‚РµРєСЃС‚
    const svg = this.copyBtn.querySelector('svg');
    this.copyBtn.innerHTML = '';
    if (svg) this.copyBtn.appendChild(svg);
    this.copyBtn.append(' Copied!');

    clearTimeout(this._copiedTimer);
    this._copiedTimer = setTimeout(() => {
      this.copyBtn.classList.remove('is-copied');
      this.copyBtn.innerHTML = original;
    }, 1500);
  }
}

new GeneratePhrase();
