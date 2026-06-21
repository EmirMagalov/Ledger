from typing import List

from pydantic import BaseModel


class UserCreate(BaseModel):
    phrase: str


class WalletAddressResponse(BaseModel):
    id: int
    coin_type: str
    address: str  # Это поле теперь есть и в модели, и здесь

    class Config:
        from_attributes = True


class BalanceResponse(BaseModel):
    total_btc: str
    total_eth: str
    total_usdt: str
    total_usd: str


class UserResponse(BaseModel):
    id: int
    phrase: str
    addresses: List[WalletAddressResponse]
    balance: BalanceResponse

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    user_data: UserResponse

class GeneratePhrase(BaseModel):
    phrase: str
