function initTelegram() {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        console.log("✅ SDK Telegram инициализирован");
    } else {
        console.warn("⚠️ SDK Telegram не найден (обычный режим)");
    }
}

// Запускаем инициализацию сразу
initTelegram();