from contextlib import asynccontextmanager


from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise
from backend.routers.user import user_router
from bot_app.main import bot


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- STARTUP: Запускаем то, что нужно при старте ---
    # await bot.start()
    import os
    print(f"РАБОЧАЯ ДИРЕКТОРИЯ: {os.getcwd()}")
    print("Бот запущен и готов к отправке сообщений!")

    yield  # Здесь приложение работает (обрабатывает запросы)

    # --- SHUTDOWN: Закрываем то, что нужно при выключении ---
    # await bot.stop()
    print("Бот остановлен.")


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
register_tortoise(
    app,
    db_url="sqlite://backend/storage.sqlite",
    modules={"models": ["backend.models.user"]},
    generate_schemas=True,
    add_exception_handlers=True,
)
app.include_router(user_router)
