# Dockerfile
FROM python:3.10.9

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем всё содержимое проекта
COPY . .

# Команду запуска мы определим в docker-compose