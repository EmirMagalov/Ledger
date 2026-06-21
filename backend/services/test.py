import requests

# 1. Твой API ключ
TATUM_API_KEY = "t-6a0452e04bc4eff129422e73-4f58019093484877baee69ec"

# 2. Публичный адрес кошелька (твоего сгенерированного или любого другого)
# Для теста берем холодный кошелек Binance с кучей денег
public_address = "16KZGaZMsvQoJJjvAJUQ18f9xkZrPAgkVC"

# 3. Правильный URL для проверки баланса (REST API)
url = f"https://api.tatum.io/v3/bitcoin/address/balance/{public_address}"

headers = {
    "accept": "application/json",
    "x-api-key": TATUM_API_KEY
}

try:
    print(f"Стучимся в Tatum для проверки адреса {public_address}...")

    # Отправляем простой GET запрос
    response = requests.get(url, headers=headers)
    response.raise_for_status()  # Проверка на ошибки (например, неверный ключ)

    data = response.json()

    # Биткоин считается в сатоши (1 BTC = 100 000 000 сатоши)
    # НОВЫЙ ВАРИАНТ
    # Превращаем ответ API в числа с плавающей точкой (float)
    incoming = float(data.get("incoming", 0))
    outgoing = float(data.get("outgoing", 0))

    # Они уже в Биткоинах, поэтому просто вычитаем
    balance_btc = incoming - outgoing

    print("\n✅ Успешно!")
    print(f"Всего пришло : {incoming / 100_000_000} BTC")
    print(f"Всего ушло   : {outgoing / 100_000_000} BTC")
    print(f"Текущий баланс: **{balance_btc} BTC**")

except requests.exceptions.RequestException as e:
    print(f"Ошибка при запросе: {e}")