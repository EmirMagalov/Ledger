// Используем addEventListener — это позволяет нескольким скриптам работать вместе
window.addEventListener('load', () => {
    // Даем объекту Telegram микросекунду на инициализацию SDK
    setTimeout(checkTelegramMiniApp, 100);
});

function checkTelegramMiniApp() {
    // Добавим больше отладки, чтобы вы видели в консоли, почему проверка проваливается
    console.log("🔍 Checking Telegram environment...");

    if (!window.Telegram || !window.Telegram.WebApp) {
        console.error("❌ window.Telegram is undefined");
        showAccessDenied();
        return false;
    }

    if (!window.Telegram.WebApp.initData || window.Telegram.WebApp.initData === "") {
        console.warn("⚠️ WebApp.initData is empty (Are you in browser?)");
        showAccessDenied();
        return false;
    }

    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    console.log("✅ Telegram Mini App detected and initialized");
    return true;
}

function showAccessDenied() {
    document.body.innerHTML = `
        <div style="text-align:center; margin-top:100px; font-family:sans-serif;">
            <h1 style="color:#ff3333;">Access denied</h1>
            <p>Please open the app via the official bot.</p>
        </div>
    `;
}