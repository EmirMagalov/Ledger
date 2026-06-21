class MoodGauge {
  // геометрия дуги в координатах viewBox 55×28:
  // центр окружности — снизу по центру, радиус ≈ 25 (берём среднюю линию дуги)
  static CENTER_X = 27.5;
  static CENTER_Y = 27.5;
  static RADIUS = 25;

  // физические размеры svg-дуги в px (width/height)
  static ARC_W = 55;
  static ARC_H = 28;

  // размер точки (px)
  static DOT_SIZE = 10;

  constructor(root) {
    this.root = root;
    this.dot = root.querySelector('.explore__mood-dot');
    this.valueEl = root.querySelector('.explore__mood-value');
    this.labelEl = root.querySelector('.explore__percent');

    this.value = Math.max(0, Math.min(100, Number(root.dataset.mood) || 0));
    this.update();
  }

  update() {
    // 0 → слева (π), 50 → вверх (π/2), 100 → справа (0)
    const angle = Math.PI - (this.value / 100) * Math.PI;

    // координаты точки на дуге в системе viewBox
    const x = MoodGauge.CENTER_X + MoodGauge.RADIUS * Math.cos(angle);
    const y = MoodGauge.CENTER_Y - MoodGauge.RADIUS * Math.sin(angle);

    // т.к. viewBox совпадает с реальным размером (55×28), x/y = пиксели
    // центрируем кружок (вычитаем половину его размера)
    const left = x - MoodGauge.DOT_SIZE / 2;
    const top = y - MoodGauge.DOT_SIZE / 2;

    this.dot.style.left = `${left}px`;
    this.dot.style.top = `${top}px`;
    this.dot.style.transform = 'none';

    this.valueEl.textContent = this.value;
    if (this.labelEl) this.labelEl.textContent = this.getLabel(this.value);
  }

  getLabel(v) {
    if (v < 25) return 'Bearish';
    if (v < 45) return 'Fear';
    if (v < 55) return 'Neutral';
    if (v < 75) return 'Greed';
    return 'Bullish';
  }
}

document.querySelectorAll('.explore__item--mood').forEach((el) => new MoodGauge(el));