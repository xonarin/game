# Обновление боевого сервера до ветки `plant`

Ветка `plant` переводит проект с Node 12 / MySQL 5.7 / Redis 6 на Node 24 / MySQL 8.4 / Redis 7,
меняет авторизацию (VK ID + Telegram вместо заблокированного приложения ВК) и убирает секреты из кода.
Ниже — порядок действий для существующего сервера с живой базой.

## 0. Перевыпустить все ключи

Старые ключи лежат в истории git (`src/config.ts`, `oaoaoa.js` в ветках `master`/`dev`) и должны считаться
скомпрометированными, даже если репозиторий приватный:

- **FreeKassa**: секретные слова 1 и 2 (`FK_SECRET`, `FK_SECRET2`) в кабинете мерчанта.
- **FKWallet**: API-ключ (`FK_API_KEY`).
- **ВКонтакте**: токены группы и сервисного приложения (`VK_GROUP_TOKEN`, `VK_APP_TOKEN`, `VK_USER_TOKEN`).
- **MySQL**: пароль пользователя базы.
- **JWT**: новый `JWT_SECRET` (`openssl rand -hex 32`). После смены все пользователи один раз войдут заново.

## 1. Переменные окружения

Полный список с пояснениями — в [`.env.example`](../.env.example). Без `DATABASE_URL` и `JWT_SECRET`
(не короче 32 символов) сервер в продакшене не стартует и пишет причину в лог.
Платёжные и ВК-интеграции без своих переменных просто выключены.

## 2. База данных: MySQL 5.7 → 8.4

Обновить 5.7 сразу до 8.4 «на месте» нельзя, поэтому база переносится дампом:

```bash
# 1) остановить приложение и снять дамп со старого сервера
mysqldump -u <user> -p --single-transaction --routines --triggers \
  --default-character-set=utf8mb4 --set-gtid-purged=OFF playtime > playtime-57.sql

# 2) поднять MySQL 8.4, создать базу и пользователя
mysql -u root -p -e "CREATE DATABASE playtime CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p -e "CREATE USER 'playtime'@'%' IDENTIFIED BY '<новый пароль>';
                     GRANT ALL PRIVILEGES ON playtime.* TO 'playtime'@'%';"

# 3) залить дамп
mysql -u root -p --default-character-set=utf8mb4 playtime < playtime-57.sql
```

Затем миграции из папки `migrations/` по порядку:

| Файл | Обязательно | Что делает |
|---|---|---|
| `2026-11-06-telegram-auth.sql` | **да**, до запуска нового кода | добавляет `Telegram` в `User.socialType` |
| `2026-11-09-remove-modules-cleanup.sql` | нет | удаляет таблицы Classic и Qiwi, колонку анти-минуса; **необратимо**, сначала бэкап |

Таблицы создаются автоматически (`sequelize.sync()`), но существующие колонки он не меняет —
поэтому любые изменения схемы оформляются отдельным SQL-файлом в `migrations/`.

## 3. Redis 6 → 7

В Redis хранятся только временные данные (онлайн, лента игр, лимиты запросов, pub/sub чата),
переносить их не нужно: достаточно поднять Redis 7 и указать его в `REDIS_URL`.

## 4. Сборка и запуск

```bash
yarn install --frozen-lockfile
yarn build --release          # результат в build/
docker build -t plant .       # Dockerfile собирает образ из build/ (node:24-bookworm-slim)
docker run --env-file .env -p 3000:3000 plant
```

Сайт и WebSocket (`/graphql`) работают на одном порту. За обратным прокси (Cloudflare Tunnel, nginx)
задайте `TRUST_PROXY`, иначе лимиты запросов будут считаться по IP прокси.

## 5. Авторизация

- **VK ID**: создать веб-приложение в кабинете VK ID, доверенный redirect URL
  `https://<домен>/auth/vk/return`, ID приложения — в `VKID_APP_ID`.
- **Telegram**: бот из @BotFather, домен сайта через `/setdomain`,
  токен и имя бота — в `TELEGRAM_BOT_TOKEN` / `TELEGRAM_BOT_USERNAME`.

Старые пользователи ВК сохраняют аккаунты: VK ID возвращает тот же ID пользователя ВКонтакте.

## 6. Проверка после выкладки

С любого компьютера с Node 18+ (для локального Docker-окружения — без аргументов):

```bash
node tools/smoke-test.mjs https://<домен> wss://<домен>/graphql
```

Скрипт выдаёт баланс тестовому пользователю через локальный MySQL-контейнер, поэтому против боевого
сервера часть проверок (Mines) упадёт — смотрите на разделы pages, auth, chat и websocket.
