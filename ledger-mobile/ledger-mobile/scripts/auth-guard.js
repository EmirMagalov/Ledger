// scripts/auth-guard.js

async function checkAuthStatus(response) {
    if (response.status === 401) {
        localStorage.removeItem('access_token');
        // Исправлено: убрали /ledger-mobile/
        window.location.href = 'auth.html';
        return false;
    }
    return true;
}

// Проверка при загрузке страницы
(function() {
    const token = localStorage.getItem('access_token');
    const path = window.location.pathname;

    // Если токена нет и мы не на странице авторизации - уходим
    // Проверка включает 'auth.html', это нормально, если файл называется именно так
    if (!token && !path.includes('auth.html')) {
        // Исправлено: убрали /ledger-mobile/
        window.location.href = 'auth.html';
    }
})();