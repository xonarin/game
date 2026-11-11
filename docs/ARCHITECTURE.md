# Архитектура: три репозитория

Проект разделён на три независимых репозитория. **Игра — владелец данных** (единственная
с доступом к БД); остальные ходят к ней по GraphQL.

| Репозиторий | Что это | Порт (dev) | Доступ к БД |
|---|---|---|---|
| `game` (этот) | Игра + **GraphQL API** (игровой, admin, service) | 3100 | **прямой** |
| [`plant-auth`](../../plant-auth) | Центральный вход (IdP / SSO-брокер) | 3300 | нет → через GraphQL игры |
| [`plant-admin`](../../plant-admin) | Админка: BFF + Gravity UI SPA | 3200 (SPA dev 3201) | нет → через GraphQL игры |

Ожидается, что репозитории лежат рядом: `…/game`, `…/plant-auth`, `…/plant-admin`.

## GraphQL игры: три среза одной схемы `/graphql`

- **Игровой** — для игроков (как и раньше).
- **Admin** (`adminMe`, `adminUsers`, `adminAdjustBalance`, `adminSettings`,
  `adminDashboard`, `adminAuthClients`, …) — закрыт правилом `isAdmin` (роль Admin).
  Потребитель — `plant-admin`.
- **Service** (`serviceResolveSocialUser`, `serviceIsAllowedOrigin`) — закрыт правилом
  `isService` (общий токен в заголовке `X-Service-Token`). Потребитель — `plant-auth`.

## Поток входа (SSO)

```
сайт-клиент (игра/админка/зеркало)
   -> plant-auth /go?from=<сайт>&type=<google|vk|steam|tg|dev>
   -> провайдер -> plant-auth резолвит игрока через serviceResolveSocialUser (GraphQL игры)
   -> одноразовый код в Redis (TTL 60с) -> redirect <сайт>/auth/callback?code=...
сайт -> POST plant-auth /verify { code, secret } -> { userId, username, isNew }
     -> сайт ставит СВОЮ сессию
```

- Разрешённые источники (`from`) — allowlist «Домены», ведётся в админке
  (`adminAuthClients`), хранится в БД игры.
- Админка дополнительно проверяет роль: после `/verify` зовёт `adminMe` от имени
  пользователя; если не Admin — вход отклоняется.

## Общие секреты (должны совпадать между репозиториями)

| Переменная | Где | Назначение |
|---|---|---|
| `SERVICE_API_TOKEN` | game ↔ plant-auth | сервисный GraphQL (`X-Service-Token`) |
| `AUTH_SHARED_SECRET` | plant-auth ↔ клиенты | обмен одноразового кода (`/verify`) |
| `JWT_SECRET` (game) = `GAME_JWT_SECRET` (plant-admin) | game ↔ plant-admin | BFF подписывает Bearer админа |

`GAME_GRAPHQL_URL` в plant-auth/plant-admin указывает на `/graphql` игры.

В dev-сборках все эти секреты имеют одинаковые небезопасные дефолты, поэтому локально
всё поднимается без .env.

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
3. **plant-admin** (BFF + Vite):
   ```
   cd ../plant-admin && npm install && (cd client && npm install)
   AUTH_SERVICE_URL=http://localhost:3300 GAME_GRAPHQL_URL=http://localhost:3100/graphql npm run dev  # BFF :3200
   cd client && npm run dev                                                                            # SPA :3201
   ```

## Первичная настройка (bootstrap)

Allowlist и роль Admin — курица и яйцо: чтобы войти в админку, её origin должен быть в
allowlist, а управлять allowlist может только админ. Поэтому при первом запуске один раз
задаём их напрямую в БД игры:

```sql
-- разрешить origin'ы игры и админки для брокера
INSERT INTO AuthClient (origin,enabled,createdAt,updatedAt)
VALUES ('http://localhost:3100',1,NOW(),NOW()), ('http://localhost:3200',1,NOW(),NOW());

-- сделать dev-пользователя админом (socialId = dev-<имя> из dev-входа)
UPDATE User SET role='Admin' WHERE socialId='dev-admin';
```

Дальше всё управляется из самой админки (раздел «Домены», роли — по мере необходимости).

## Что пока НЕ перенесено (осознанно)

- Деплой-панель, режим обслуживания, прод docker-compose и runbook'и — были удалены при
  возврате игры к `76644ac`; переделываются под новую структуру позже (когда появятся
  домены). История доступна в ветке `backup/admin-auth-deploy`.
- Пуш трёх репозиториев в GitHub — по готовности.
