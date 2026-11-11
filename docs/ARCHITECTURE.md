# Архитектура: три репозитория

Проект разделён на три независимых репозитория. **Игра — владелец данных** (единственная
с доступом к БД); остальные ходят к ней по GraphQL.

| Репозиторий | Что это | Порт (dev) | Доступ к БД |
|---|---|---|---|
| `game` (этот) | Игра + **GraphQL API** (игровой, admin, service) | 3100 | **прямой** |
| [`plant-auth`](https://github.com/xonarin/plant-auth) | Центральный вход (IdP / SSO-брокер) | 3300 | нет → через GraphQL игры |
| [`plant-admin`](https://github.com/xonarin/plant-admin) | Админка: BFF + Gravity UI SPA | 3200 (SPA dev 3201) | нет → через GraphQL игры |

Ожидается, что локально репозитории лежат рядом: `…/game`, `…/plant-auth`, `…/plant-admin`.

## Кто как входит (важно)

- **Игроки** входят **прямо в игре**: игра сама крутит провайдеры (VK ID, Google, Steam,
  Telegram, dev) на своём домене. Это не изменилось — настраивается в `.env` игры
  (см. [DEPLOY.md §5](DEPLOY.md)).
- **Админы** входят через **plant-auth** (SSO): отдельный вход, где роль `Admin` проверяет
  сама игра. Туда же в будущем можно подключить зеркала — и, при желании, саму игру.

То есть провайдеры сейчас настраиваются в двух местах: в игре (для игроков) и в plant-auth
(для админки/зеркал). Это осознанно — игру не трогали, вынесли только админку и общий вход.

## GraphQL игры: три среза одного эндпоинта `/graphql`

Разграничение — правилами graphql-shield, по одному полю:

| Срез | Операции | Правило | Кто потребляет |
|---|---|---|---|
| игровой | `me`, `minesGame`, `chat`, … | как раньше | игроки |
| **admin** | `adminMe`, `adminUsers`, `adminAdjustBalance`, `adminSettings`, `adminDashboard`, `adminAuthClients`, `adminAdd/Set/RemoveAuthClient`, `adminUpdateSetting` | `isAdmin` (роль Admin) | `plant-admin` |
| **service** | `serviceResolveSocialUser`, `serviceIsAllowedOrigin` | `isService` (токен `X-Service-Token`) | `plant-auth` |

## Как админка связана с игрой по API

```
браузер --(cookie adminToken = game-JWT)--> plant-admin BFF (:3200)
   --(Authorization: Bearer <тот же game-JWT>)--> игра /graphql  (admin*)
```

- SPA общается только со своим BFF (`/graphql` на origin админки).
- BFF проксирует запрос в `/graphql` игры, добавляя заголовок `Authorization: Bearer <game-JWT>`.
  Этот JWT BFF **подписывает сам** секретом `GAME_JWT_SECRET` (= `JWT_SECRET` игры).
- Игра декодирует JWT → находит пользователя → правило `isAdmin` пускает, только если роль Admin.
- Вход в админку: BFF ведёт на plant-auth, получает одноразовый код, меняет его на `userId`
  через `/verify`, проверяет `adminMe` и ставит сессию.

## Как plant-auth связан с игрой по API

```
plant-auth --(X-Service-Token)--> игра /graphql
   serviceResolveSocialUser(type, socialId, username, avatar) -> { id, username, isNew }
   serviceIsAllowedOrigin(origin) -> Boolean    # allowlist «Домены»
```

У plant-auth нет доступа к БД: после провайдера он резолвит игрока через игру и кладёт
одноразовый код в Redis (TTL 60с).

## Поток входа в админку (SSO), целиком

```
админ -> plant-admin -> plant-auth /go?from=<origin админки>&type=<google|vk|steam|tg|dev>
      -> провайдер -> plant-auth: serviceResolveSocialUser (GraphQL игры)
      -> одноразовый код в Redis -> redirect <origin админки>/auth/callback?code=...
plant-admin BFF -> POST plant-auth /verify { code, secret } -> { userId }
      -> проверяет adminMe (роль Admin) -> ставит cookie adminToken
```

## Что где прописывать (переменные окружения)

**game** (`.env`, см. `.env.example`):

| Переменная | Назначение |
|---|---|
| `DATABASE_URL`, `REDIS_URL` | БД и Redis |
| `JWT_SECRET` | подпись сессий; **= `GAME_JWT_SECRET` в plant-admin** |
| `SERVICE_API_TOKEN` | сервисный API; **= `SERVICE_API_TOKEN` в plant-auth** |
| `VKID_APP_ID`, `GOOGLE_*`, `STEAM_API_KEY`, `TELEGRAM_*` | провайдеры **входа игроков** |

**plant-auth** (`.env`, см. его `.env.example`):

| Переменная | Назначение |
|---|---|
| `GAME_GRAPHQL_URL` | `/graphql` игры (напр. `http://game:3000/graphql`) |
| `SERVICE_API_TOKEN` | **= `SERVICE_API_TOKEN` игры** |
| `AUTH_SHARED_SECRET` | обмен кода `/verify`; **= `AUTH_SHARED_SECRET` в plant-admin** |
| `AUTH_PUBLIC_URL` | публичный адрес брокера (redirect URI провайдеров) |
| `VKID_APP_ID`, `GOOGLE_*`, `STEAM_API_KEY`, `TELEGRAM_*` | провайдеры **входа в админку/зеркала** |
| `DEV_LOGIN=1` | включает dev-вход (только dev) |

**plant-admin** (`.env`, см. его `.env.example`):

| Переменная | Назначение |
|---|---|
| `AUTH_SERVICE_URL` / `AUTH_SERVICE_INTERNAL_URL` | публичный / внутренний адрес plant-auth |
| `AUTH_SHARED_SECRET` | **= `AUTH_SHARED_SECRET` в plant-auth** |
| `GAME_GRAPHQL_URL` | `/graphql` игры |
| `GAME_JWT_SECRET` | **= `JWT_SECRET` игры** |

> Сводка совпадений: `SERVICE_API_TOKEN` (game↔auth), `AUTH_SHARED_SECRET` (auth↔admin),
> `JWT_SECRET` game = `GAME_JWT_SECRET` admin. В dev-сборках у всех этих значений одинаковые
> небезопасные дефолты, так что локально всё поднимается без `.env`.

## Запуск в dev

1. **Игра** (+ MySQL/Redis, порты проброшены на хост):
   ```
   docker compose -f docker-compose.dev.yml up -d
   ```
2. **plant-auth** (нужен `DEV_LOGIN=1` для dev-входа):
   ```
   cd ../plant-auth && npm install
   DEV_LOGIN=1 GAME_GRAPHQL_URL=http://localhost:3100/graphql npm run dev   # :3300
   ```
3. **plant-admin** (BFF + Vite, два процесса):
   ```
   cd ../plant-admin && npm install && (cd client && npm install)
   AUTH_SERVICE_URL=http://localhost:3300 GAME_GRAPHQL_URL=http://localhost:3100/graphql npm run dev  # BFF :3200
   cd client && npm run dev                                                                            # SPA :3201
   ```
   Открыть http://localhost:3201.

## Первичная настройка (bootstrap)

Allowlist и роль Admin — курица и яйцо: чтобы войти в админку, её origin должен быть в
allowlist, а управлять allowlist может только админ. Поэтому при первом запуске один раз
задаём их напрямую в БД игры:

```sql
-- разрешить origin'ы, которым plant-auth выдаёт вход (как минимум админка)
INSERT INTO AuthClient (origin,enabled,createdAt,updatedAt)
VALUES ('http://localhost:3200',1,NOW(),NOW());

-- сделать dev-пользователя админом (socialId = dev-<имя> из dev-входа)
UPDATE User SET role='Admin' WHERE socialId='dev-admin';
```

Дальше всё управляется из самой админки (раздел «Домены», роли — по мере необходимости).

## Что пока НЕ перенесено (осознанно)

- Деплой-панель, режим обслуживания, прод docker-compose и runbook'и — были удалены при
  возврате игры к `76644ac`; переделываются под новую структуру позже (когда появятся
  домены). Старый код доступен в ветке `backup/admin-auth-deploy`.
