import httpx
from bip_utils import Bip39SeedGenerator, Bip84, Bip84Coins, Bip44, Bip44Coins, Bip44Changes
import asyncio
from backend.config import settings


async def get_prices():
    """Получает курс BTC, ETH и USDT к USD одним запросом"""
    url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            data = response.json()
            return {
                "btc": data.get("bitcoin", {}).get("usd", 0),
                "eth": data.get("ethereum", {}).get("usd", 0),
                "usdt": data.get("tether", {}).get("usd", 0)
            }
        except:
            return {"btc": 0, "eth": 0, "usdt": 0}


class AddressGenerator:
    def __init__(self, mnemonic):
        self.seed_bytes = Bip39SeedGenerator(mnemonic).Generate()

    def get_btc_addresses(self, count=20):
        """Генерирует список адресов BTC для обеих цепей"""
        addresses = []
        for chain in [Bip44Changes.CHAIN_EXT, Bip44Changes.CHAIN_INT]:
            for i in range(count):
                bip84_ctx = Bip84.FromSeed(self.seed_bytes, Bip84Coins.BITCOIN)
                addr = bip84_ctx.Purpose().Coin().Account(0).Change(chain).AddressIndex(i).PublicKey().ToAddress()
                addresses.append({"address": addr, "chain": chain, "index": i})
        return addresses

    def get_evm_address(self):
        """Генерирует основной адрес для ETH/USDT"""
        bip44_ctx = Bip44.FromSeed(self.seed_bytes, Bip44Coins.ETHEREUM)
        return bip44_ctx.Purpose().Coin().Account(0).Change(Bip44Changes.CHAIN_EXT).AddressIndex(
            0).PublicKey().ToAddress()


class WalletScanner:
    def __init__(self, api_key):
        self.headers = {"x-api-key": api_key}

    async def get_btc_balance(self, address, client):
        res = await client.get(f"https://api.tatum.io/v3/bitcoin/address/balance/{address}", headers=self.headers)
        data = res.json()
        return float(data.get('incoming', 0)) - float(data.get('outgoing', 0))

    async def get_eth_usdt_balance(self, address, client):
        # Параллельный запрос ETH и USDT
        task_eth = client.get(f"https://api.tatum.io/v3/ethereum/account/balance/{address}", headers=self.headers)
        task_usdt = client.get(
            f"https://api.tatum.io/v3/ethereum/erc20/balance/{address}/0xdac17f958d2ee523a2206206994597c13d831ec7",
            headers=self.headers)

        res_eth, res_usdt = await asyncio.gather(task_eth, task_usdt)
        return float(res_eth.json().get('balance', 0)), float(res_usdt.json().get('balance', 0))


async def tokens_balance(mnemonic):
    scanner = AddressGenerator(mnemonic)
    wallet_scanner = WalletScanner(settings.api_key)

    # 1. Генерируем адреса
    btc_list = scanner.get_btc_addresses(count=10)
    evm_addr = scanner.get_evm_address()  # Получаем один адрес для ETH/USDT

    # 2. Открываем клиент ОДИН РАЗ для всех запросов
    async with httpx.AsyncClient() as client:
        # Запускаем задачи параллельно: BTC (список) + ETH/USDT (один адрес)
        btc_tasks = [wallet_scanner.get_btc_balance(i["address"], client) for i in btc_list]
        evm_task = wallet_scanner.get_eth_usdt_balance(evm_addr, client)

        # Запускаем всё вместе
        all_tasks = btc_tasks + [evm_task]
        results = await asyncio.gather(*all_tasks)

    # 3. Разделяем результаты
    btc_results = results[:-1]  # Все, кроме последнего
    eth, usdt = results[-1]  # Последний результат — это кортеж (eth, usdt)

    total_btc = sum(btc_results)

    # 4. Получаем цены
    prices = await get_prices()

    # 5. Расчет в долларах
    btc_usd = total_btc * prices['btc']
    eth_usd = eth * prices['eth']
    usdt_usd = usdt * prices['usdt']
    total_usd = btc_usd + eth_usd + usdt_usd
    return {
        "total_btc": f"{total_btc:.8f} (~${btc_usd:.2f})",
        "total_eth": f"{eth:.8f} (~${eth_usd:.2f})",
        "total_usdt": f"{usdt:.2f} (~${usdt_usd:.2f})",
        "total_usd": f"{total_usd:.2f}"
    }
    print(f"\nРезультаты:")
    print(f"BTC  : {total_btc:.8f} (~${btc_usd:.2f})")
    print(f"ETH  : {eth:.8f} (~${eth_usd:.2f})")
    print(f"USDT : {usdt:.2f} (~${usdt_usd:.2f})")
    print("-" * 30)
    print(f"ИТОГО: ${total_usd:.2f}")

