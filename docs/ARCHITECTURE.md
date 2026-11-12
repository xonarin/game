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
| **каталог** | `cronJobs`, `cronJob`, `syncRuns`, `catalogStats` | `isAdmin` **или** `isAdminService` (токен `X-Admin-Service-Token`) | `plant-admin` (UI и крон) |
| **каталог** | `updateCronJob` | `isAdmin` (пишется в `AdminAction`) | `plant-admin` (UI) |

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

## Каталог скинов: приём от plant-admin

Импорт каталога CS2 выполняет воркер plant-admin (у него нет доступа к БД). Данные он отправляет
в игру отдельными REST-маршрутами рядом с GraphQL — не через `/graphql`:

```
plant-admin --POST /internal/sync/catalog/start  {runId, trigger, sourceTotal, duplicatesCollapsed, batchCount}
            --POST /internal/sync/catalog/batch  {runId, batchIndex, rows[≤2000]}   × batchCount (gzip)
            --POST /internal/sync/catalog/finish {runId, status, error?}
```

- Контракт (типы, коды ошибок, схема подписи) — `src/interfaces/catalogSync.ts`; копия в plant-admin
  `src/contracts/catalogSync.ts`, менять синхронно.
- Защита: HMAC-SHA256 сырого JSON-тела + `X-Sync-Timestamp` (±60 с), секрет `SYNC_HMAC_SECRET`;
  тело до 5 МБ после распаковки, `Content-Encoding: gzip` поддерживается. Allowlist IP пока нет.
- Код: `src/services/catalogSync/` (router — подпись и разбор, validate, service — транзакции).
- Пачка — один `INSERT … ON DUPLICATE KEY UPDATE`; `price` / `is_available` / `price_updated_at`
  импорт не трогает. Повтор пачки идемпотентен (`sync_run_batch`). Отсутствующие в импорте
  предметы не удаляются — finish возвращает их число (`notSeenCount`).
- Одновременно — один прогон каталога; `running` старше часа при следующем start становится `failed`.
- Расписание хранится в `cron_job` (game), выполняет его plant-admin; правит админ через `updateCronJob`.
- Таблицы каталога (`Item`, `sync_run`, `sync_run_batch`, `cron_job`) создаёт `sequelize.sync()` по моделям,
  изменения — идемпотентными миграциями (docs/DEPLOY.md «Как менять схему»).
- Источник импорта — настройка `catalog::sourceUrl` (таблица `Setting`, страница «Настройки» админки).
  Воркер читает её запросом `catalogSourceUrl` в начале каждого прогона. Ссылка проверяется при
  сохранении и при чтении: только `https`, без логина/порта, хост из `CATALOG_SOURCE_HOSTS` (защита от SSRF).

## Что где прописывать (переменные окружения)

**game** (`.env`, см. `.env.example`):

| Переменная | Назначение |
|---|---|
| `DATABASE_URL`, `REDIS_URL` | БД и Redis |
| `JWT_SECRET` | подпись сессий; **= `GAME_JWT_SECRET` в plant-admin** |
| `SERVICE_API_TOKEN` | сервисный API; **= `SERVICE_API_TOKEN` в plant-auth** |
| `SYNC_HMAC_SECRET` | подпись `/internal/sync/*`; **= `SYNC_HMAC_SECRET` в plant-admin** |
| `ADMIN_SERVICE_TOKEN` | GraphQL каталога без сессии (крон админки); **= `ADMIN_SERVICE_TOKEN` в plant-admin** |
| `CATALOG_SOURCE_HOSTS` | хосты для настройки `catalog::sourceUrl` через запятую (пусто = `raw.githubusercontent.com`) |
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

## Запуск и первичная настройка

Пошаговая инструкция — локально и на продакшене, включая разрешённые домены и первого
админа — в [DEPLOY.md](DEPLOY.md).
