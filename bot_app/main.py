import asyncio
from aiogram.types import MenuButtonWebApp, WebAppInfo
from aiogram import Bot, Dispatcher
from bot_app.config import settings
from bot_app.handlers.private import private_router
bot = Bot(token=settings.token)

dp = Dispatcher()
dp.include_router(private_router)

# async def scan_chats():
#     async with bot:
#         print("Сканирую диалоги...")
#         async for dialog in bot.get_dialogs():
#             print(f"Нашел чат: {dialog.chat.title} | ID: {dialog.chat.id}")
#             if dialog.chat.id == -1005470182025:
#                 print(">>> Группа найдена и добавлена в кэш!")
#
# import asyncio

async def main():
    print('Bot started')
    await bot.set_chat_menu_button(
        menu_button=MenuButtonWebApp(
            text="Open Wallet",
            web_app=WebAppInfo(url=settings.url)
        )
    )
    await dp.start_polling(bot)
if __name__ == "__main__":
    asyncio.run(main())
