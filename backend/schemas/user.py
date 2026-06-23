from typing import List, Optional

from pydantic import BaseModel


class UserCreate(BaseModel):
    phrase: str
    tg_user_id: Optional[int] = None

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
    action: str
    tg_user_id: Optional[int] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    user_data: UserResponse

class GeneratePhrase(BaseModel):
    phrase: str
