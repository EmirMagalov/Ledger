// // Проверка — открыто ли внутри Telegram Mini App
// function checkTelegramMiniApp() {
//     if (!window.Telegram || !window.Telegram.WebApp || !window.Telegram.WebApp.initDataUnsafe?.user) {
//         // Это обычный браузер → показываем заглушку
//         document.body.innerHTML = `
//                 <div style="text-align:center; margin-top:100px; font-family:sans-serif;">
//                     <h1 style="color:#ff3333;">Access denied</h1>
//                     <p>This site only works within the Telegram Mini App.</p>
//                     <p><a href="https://t.me/ledger_offlcial_bot" style="color:#229ed9;">Open the bot</a></p>
//                 </div>
//             `;
//         return false;
//     }
//
//     // Это Telegram Mini App — инициализируем
//     Telegram.WebApp.ready();
//     Telegram.WebApp.expand();
//     console.log("✅ Telegram Mini App detected");
//     return true;
// }
//
// // Запускаем проверку сразу
// window.onload = checkTelegramMiniApp;
