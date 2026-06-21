from tortoise import fields
from tortoise.models import Model


class User(Model):
    id = fields.IntField(pk=True)
    phrase = fields.TextField()
    addresses: fields.ReverseRelation["WalletAddress"]

    class Meta:
        table = "users"


class WalletAddress(Model):
    id = fields.IntField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="addresses")
    coin_type = fields.CharField(max_length=10)  # 'BTC', 'ETH', 'TRX'
    address = fields.CharField(max_length=100)  # ЭТА СТРОКА ДОЛЖНА БЫТЬ
    class Meta:
        table = "wallet_addresses"
