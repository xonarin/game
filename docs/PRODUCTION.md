# Запуск на VPS

Два сценария: **по IP для теста** (быстро, без домена/HTTPS) и **боевой** (домен + HTTPS).

---

## A. Быстрый запуск на VPS по IP (тест/стейджинг)

На голом `http://<IP>` реальные соц-входы (Google/VK ID/Steam/Telegram) не работают —
провайдеры требуют HTTPS и домен для redirect-URI. Поэтому поднимаем **dev-режим**:
там включён **Dev-вход**, HTTPS не нужен.

### 1. Подготовка VPS
```
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
# git — если нет: apt-get install -y git
```

### 2. Код
```
git clone https://github.com/xonarin/game.git
cd game
git checkout plant
```
(приватный репозиторий — нужен deploy-key или token.)

### 3. `.env` рядом с docker-compose.dev.yml
Минимум для запуска (dev использует безопасные дефолты для остального):
```
# свои значения, если есть; иначе можно оставить пустыми для теста
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=
```
Остальные секреты в dev-режиме берут dev-дефолты из config.ts (для теста годится; для боевого — раздел B).

### 4. Запуск
```
docker compose -f docker-compose.dev.yml up -d
```
Первый старт ставит зависимости и собирает (несколько минут). Логи:
```
docker compose -f docker-compose.dev.yml logs -f app
```

### 5. Фаервол (открыть порты)
```
ufw allow 3100   # игра
ufw allow 3200   # админка
ufw allow 3300   # auth-брокер
```

### 6. Проверка
- Игра: `http://<IP>:3100` → войти через **Dev-вход**.
- Сделать себя админом (socialId = `dev-<имя>`, которое вводили в Dev-входе):
```
docker compose -f docker-compose.dev.yml exec mysql \
  mysql -uroot -pdev playtime -e "UPDATE User SET role='Admin' WHERE socialId='dev-<имя>';"
```
- Админка: `http://<IP>:3200` → Dev-вход тем же именем → попадаете в панель.

### 7. Настроить брокер и панель в админке
- Раздел **«Домены»**: добавить `http://<IP>:3100` и `http://<IP>:3200` (разрешённые источники для auth-брокера).
- Раздел **«Деплой»**: таргеты можно добавить позже (в одном compose они видят друг друга по именам `app:3000`, `admin:3200`, `authservice:3300`).

> Это dev-режим (webpack watch) — для теста ок. Для публичного боевого — раздел B.

---

## B. Боевой запуск (домен + HTTPS)

Нужны домены и HTTPS, иначе соц-входы и безопасные cookie не заработают.

### 1. DNS
A-записи на IP VPS:
```
plant.cash          -> <IP>
auth.plant.cash     -> <IP>
admin.plant.cash    -> <IP>
```

### 2. `.env` (боевые значения, СИЛЬНЫЕ секреты)
```
# секреты: по 32+ случайных символа (openssl rand -hex 32)
JWT_SECRET=...
ADMIN_JWT_SECRET=...
AUTH_SHARED_SECRET=...
MYSQL_ROOT_PASSWORD=...
DATABASE_URL=mysql://root:<MYSQL_ROOT_PASSWORD>@mysql:3306/playtime
REDIS_URL=redis://redis:6379

PUBLIC_URL=https://plant.cash
AUTH_PUBLIC_URL=https://auth.plant.cash
AUTH_SERVICE_URL=https://auth.plant.cash
AUTH_SERVICE_INTERNAL_URL=http://auth:3300
ADMIN_PUBLIC_URL=https://admin.plant.cash

# провайдеры (заводятся на домене auth.plant.cash)
VKID_APP_ID=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
STEAM_API_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=
TELEGRAM_BONUS_CHANNEL=
TELEGRAM_WEBHOOK_SECRET=

# панель деплоя (опц.)
GITHUB_REPO=xonarin/game
GITHUB_BRANCH=plant
GITHUB_TOKEN=
DEPLOY_AGENT_SECRET=...
```

### 3. Провайдеры — redirect URIs на домен auth
- Google/VK ID/Steam: redirect URI `https://auth.plant.cash/auth/<provider>/return`.
- Telegram: @BotFather `/setdomain` → `auth.plant.cash`.

### 4. HTTPS (reverse proxy)
Поставьте перед сервисами Caddy (авто-Let's Encrypt) или проксируйте через Cloudflare.
Маршруты: `plant.cash -> game:3000`, `auth.plant.cash -> auth:3300`,
`admin.plant.cash -> admin:3200` (админку — за VPN/IP-allowlist).

### 5. Запуск (собранные образы)
```
GIT_SHA=$(git rev-parse HEAD) docker compose -f docker-compose.prod.yml up -d --build
```

### 6. Первый старт
- Миграции применить к БД (см. docs/DEPLOY.md, раздел миграций) — с бэкапом.
- Назначить админа (как в A.6).
- В «Домены» добавить `https://plant.cash` и `https://admin.plant.cash`.
- Бэкапы MySQL (`mysqldump` по cron) — обязательно.

### 7. Два VPS (позже)
Вынести админку на второй VPS: поднять там только сервис `admin`, а его
`DATABASE_URL`/`REDIS_URL` навести на **приватный адрес** VPS с БД (VPC/WireGuard).
Публичные порты 3306/6379 держать закрытыми. Подробнее — docs/DEPLOY.md, раздел 6.
