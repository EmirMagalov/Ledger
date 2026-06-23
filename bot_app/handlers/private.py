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
            builder.button(text=text, url='https://t.me/ledger_mobile')

    return builder.adjust(1).as_markup()


text = """🚀Ledger Wallet Mini App is now live on Telegram

Track, manage, and secure your crypto — all in one place.

Get early access to new Mini App features and beta community releases.

Follow our official channel for security insights, product updates, and integration news."""


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
