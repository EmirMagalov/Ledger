document.addEventListener('DOMContentLoaded', () => {
    const verifyBtn = document.querySelector('[data-js-verify-button]');
    const verifyInput = document.querySelector('[data-js-verify-input]');

    verifyBtn.addEventListener('click', async () => {
        // 1. Получаем фразу из sessionStorage
        const savedPhrase = sessionStorage.getItem('seedPhrase');
        if (!savedPhrase) {
            alert('Error: Phrase not found. Try creating your wallet again.');
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
            const tg = window.Telegram.WebApp;
            const initData = tg.initData;
            if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
                userId = tg.initDataUnsafe.user.id;
            } else {
                console.warn("Приложение открыто не в Telegram");
                // Тут можно добавить логику для "обычных" браузеров
            }
            const response = await fetch(`${API_BASE_URL}/user/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Telegram-Init-Data': initData // Передаем данные в заголовке
                },
                body: JSON.stringify({phrase: phraseArray.join(' '), tg_user_id: userId}),
            });

            if (response.ok) {
                const data = await response.json();
                window.location.href = 'created.html';
                localStorage.setItem('access_token', data.access_token);
                window.location.href = '/index.html';
            } else {
                alert('Error registering on the server.');
            }
        } catch (err) {
            console.error('Registration failed:', err);
            alert('Server connection error.');
        } finally {
            verifyBtn.textContent = 'Verify';
            verifyBtn.disabled = false;
        }
    });
});