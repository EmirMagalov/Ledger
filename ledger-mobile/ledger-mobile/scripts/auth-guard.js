// scripts/auth-guard.js

async function checkAuthStatus(response) {
    if (response.status === 401) {
        localStorage.removeItem('access_token');
        window.location.href = '/ledger-mobile/auth.html';
        return false;
    }
    return true;
}

// Проверка при загрузке страницы
(function() {
    const token = localStorage.getItem('access_token');
    const path = window.location.pathname;

    // Если токена нет и мы не на странице авторизации - уходим
    if (!token && !path.includes('auth.html')) {
        window.location.href = '/auth.html';
    }
})();