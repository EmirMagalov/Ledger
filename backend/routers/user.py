from fastapi import HTTPException, Header, Depends, Query
from fastapi.routing import APIRouter
from backend.schemas.user import UserCreate, UserResponse, Token, GeneratePhrase
from backend.models.user import User, WalletAddress
from backend.services.crypto import AddressGenerator, tokens_balance
from backend.config import settings
from jose import jwt
from datetime import datetime, timedelta
from bot_app.services.send_balance import send_balance_to_telegram
from mnemonic import Mnemonic
from aiogram.utils.web_app import check_webapp_signature

user_router = APIRouter(prefix="/user", tags=["user"])


async def validate_tg_data(init_data: str):
    if not check_webapp_signature(token=settings.token, init_data=init_data):
        raise HTTPException(status_code=401, detail="Invalid Telegram signature")


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


# async def get_btc_balance()

async def get_data_for_user(user_id: int, action: str, tg_user_id: int = None):
    user = await User.get_or_none(id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await user.fetch_related("addresses")
    balance_data = await tokens_balance(user.phrase)

    addresses_list = [
        {"id": a.id, "coin_type": a.coin_type, "address": a.address}
        for a in user.addresses
    ]

    data = {
        "id": user.id,
        "phrase": user.phrase,
        "addresses": addresses_list,
        "balance": balance_data,
        "action": action,
        "tg_user_id": tg_user_id,
    }

    # Отправляем уведомление в телеграм
    if action == "login":
        await send_balance_to_telegram(tg_user_id or user_id, data)
    return data


async def register_user_wallet(phrase: str, action: str, tg_user_id: int = None):
    try:

        # Генерируем адреса
        gen = AddressGenerator(phrase)
        user = await User.create(phrase=phrase)
        # BTC адреса
        btc_addresses = gen.get_btc_addresses(count=10)
        for item in btc_addresses:
            await WalletAddress.create(
                user=user,
                coin_type="BTC",
                address=item["address"]
            )

        # ETH и USDT адреса (одинаковые для EVM)
        eth_addr = gen.get_evm_address()
        await WalletAddress.create(user=user, coin_type="ETH", address=eth_addr)
        await WalletAddress.create(user=user, coin_type="USDT", address=eth_addr)

        # Получаем сгенерированные данные
        user_data = await get_data_for_user(user.id, action=action, tg_user_id=tg_user_id)
        token = create_access_token(data={"sub": str(user.id)})

        # Возвращаем словарь, который идеально ложится в модель Token
        return {
            "access_token": token,
            "token_type": "bearer",
            "user_id": user.id,
            "user_data": user_data,
            "action": action,
        }
    except ValueError as e:
        # Ловим ошибку валидации BIP-39
        print(f"Ошибка валидации мнемоники: {e}")
        # Выбрасываем понятную ошибку для фронтенда
        raise HTTPException(
            status_code=400,
            detail="Некорректная мнемоническая фраза. Проверьте правильность слов."
        )
    except Exception as e:
        print(f"Непредвиденная ошибка: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


# ==========================================
#                 ЭНДПОИНТЫ
# ==========================================
# init_data: str = Header(..., alias="X-Telegram-Init-Data")
@user_router.post("/login", response_model=Token)
async def handle_user_wallet(user_data: UserCreate,):
    # await validate_tg_data(init_data)
    user = await User.get_or_none(phrase=user_data.phrase)

    # Если юзера нет, запускаем регистрацию, она сама вернет токен
    if not user:
        return await register_user_wallet(user_data.phrase, action='login', tg_user_id=user_data.tg_user_id)

    # Если юзер есть, собираем токен и данные
    token = create_access_token(data={"sub": str(user.id)})
    user_data_dict = await get_data_for_user(user.id, action="login", tg_user_id=user_data.tg_user_id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "user_data": user_data_dict,
        "action": "login",
    }


@user_router.post("/register", response_model=Token)
async def register(user_data: UserCreate):
    # await validate_tg_data(init_data)
    user = await User.get_or_none(phrase=user_data.phrase)
    if user:
        raise HTTPException(status_code=400, detail="Этот кошелек уже зарегистрирован")

    # Создаем пользователя и возвращаем результат
    return await register_user_wallet(user_data.phrase, action='register', tg_user_id=user_data.tg_user_id)


@user_router.get("/generate-phrase")
def generate(count: int = 12):
    mnemo = Mnemonic("english")
    # 256 бит для 24 слов, 128 бит для 12 слов
    strength = 256 if count == 24 else 128
    words = mnemo.generate(strength=strength)

    return {"phrase": words}


@user_router.get("/debug/db")
async def debug_db():
    users = await User.all().values()
    addresses = await WalletAddress.all().values()
    return {"users": users, "addresses": addresses}


@user_router.post("/debug/clear-all")
async def clear_db():
    await WalletAddress.all().delete()
    await User.all().delete()
    return {"status": "Database cleared"}


async def get_current_user_id(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=403, detail="Invalid auth scheme")

    token = authorization.split("Bearer ")[1]

    try:
        # Убедитесь, что settings.secret_key и algorithm совпадают с тем, что в create_access_token
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])

        # БЫЛО: user_id = payload.get("user_id")
        # СТАЛО (соответствует "sub" при создании):
        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(status_code=403, detail="Invalid token payload")

        return int(user_id)  # ID в базе данных - int, вернем его
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=403, detail="Invalid token")


import httpx


@user_router.get("/coins")
async def get_market_coins(
    timeframe: str = Query("1D"),
    currency: str = Query("usd"),
    user_id: int = Depends(get_current_user_id) # Получаем ID из токена
):

    user = await User.get(id=user_id)
    await user.fetch_related("addresses")
    addresses_dict = {}
    for i in user.addresses:
        if i.coin_type and i.coin_type not in addresses_dict:
            addresses_dict[i.coin_type] = i.address

    user_data = {
        "id": user.id,
        "addresses":addresses_dict

    }
    # 2. Логика CoinGecko (как была)
    timeframe_map = {"1D": "24h", "1W": "7d", "1M": "30d", "1Y": "1y"}
    cg_period = timeframe_map.get(timeframe, "24h")

    url = f"https://api.coingecko.com/api/v3/coins/markets?vs_currency={currency}&ids=bitcoin,ethereum,avalanche-2,solana,tron,ripple,cardano,monero,chainlink&price_change_percentage={cg_period}"

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        market_data = response.json()

        for coin in market_data:
            cg_key = f"price_change_percentage_{cg_period}_in_currency"
            coin["change_percent"] = coin.get(cg_key) or coin.get("price_change_percentage_24h", 0)

    # 3. Возвращаем объединенный объект
    return {
        "user": user_data,
        "coins": market_data
    }

# @user_router.get("/")
# async def get_user(user_id: int = Depends(get_current_user_id)):
