import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    # Pydantic сам сопоставит MNEMONIC в файле с этим полем
    token:str
    mnemonic: str
    api_key: str
    secret_key: str
    algorithm: str
    redis_host: str
    # Настройка: ищем файл строго в корне проекта
    model_config = SettingsConfigDict(
        env_file=os.path.join(BASE_DIR, ".env"),
        env_file_encoding='utf-8',
        extra='ignore'
    )


try:
    settings = Settings()
except Exception as e:
    print(f"Ошибка загрузки настроек: {e}")
    print(f"Ищу файл по пути: {os.path.join(BASE_DIR, '.env')}")
    raise e
