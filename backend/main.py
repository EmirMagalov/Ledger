from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise
from backend.routers.user import user_router
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis
from backend.config import settings
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("App started")
    redis = aioredis.from_url(settings.redis_host, encoding="utf8")
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")
    yield
    await redis.close()
    print("App ended")


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://sync-ledger.live",  # Твой боевой фронтенд
        "http://sync-ledger.live",
    ],
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
