async function checkTelegramMiniApp() {
    // Ждем, пока объект Telegram появится и наполнится данными
    for (let i = 0; i < 20; i++) {
        if (window.Telegram?.WebApp?.initData) {
            console.log("✅ Telegram Mini App detected and data ready");
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100)); // Ждем 100мс
    }

    // Если прошло 2 секунды, а данных нет — только тогда показываем заглушку
    console.warn("⚠️ Telegram Mini App data not found");
    // Не делай здесь document.body.innerHTML = '', 
    // лучше просто оставь всё как есть или покажи поверх плашку
    return false;
}

// Запуск
checkTelegramMiniApp();