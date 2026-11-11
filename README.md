# PlayTime / Willy — игра (ядро)

Сайт мини-игр: лобби, игра Mines, Classic, чат, турниры, партнёрская программа, бонусы.
Стек: Node 24, React 19 (SSR), Apollo Server 5 + graphql-ws, Express 5, Sequelize 6 + MySQL 8.4, Redis 7, webpack 5.

Проект разделён на **три репозитория**. Этот (`game`) — **ядро и владелец данных**:
единственный с доступом к БД, отдаёт всё по GraphQL.

| Репозиторий | Что это | Доступ к БД |
|---|---|---|
| **game** (этот) | Игра + GraphQL API (игровой, admin, service) | прямой |
| [plant-auth](https://github.com/xonarin/plant-auth) | Центральный вход (IdP / SSO-брокер) для админки и зеркал | нет → через GraphQL игры |
| [plant-admin](https://github.com/xonarin/plant-admin) | Админка: BFF + Gravity UI SPA | нет → через GraphQL игры |

Полная картина, потоки и список общих секретов — в [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Локальная разработка

Нужен только Docker:

```bash
docker compose -f docker-compose.dev.yml up -d
```

- сайт: http://localhost:3100 (вход для разработки — кнопка «Dev вход» на `/login`)
- WebSocket: `ws://localhost:3002/graphql`
- публичный адрес через Cloudflare Tunnel: `docker compose -f docker-compose.dev.yml --profile tunnel up -d`

Секреты для локального запуска — в файле `.env` рядом с compose-файлом (список переменных: `.env.example`).
В dev-сборке секреты берут безопасные дефолты, так что игра поднимается и без `.env`.

## GraphQL API

Один эндпоинт `/graphql`, три среза (разграничение — через правила graphql-shield):

- **игровой** — для игроков (как и раньше);
- **admin** (`adminMe`, `adminUsers`, `adminAdjustBalance`, `adminSettings`, `adminDashboard`,
  `adminAuthClients`, …) — только роль `Admin`; это потребляет **plant-admin**;
- **service** (`serviceResolveSocialUser`, `serviceIsAllowedOrigin`) — только по токену
  `X-Service-Token`; это потребляет **plant-auth**.

Чтобы внешние приложения могли подключиться, задайте в игре:
- `SERVICE_API_TOKEN` — общий токен сервисного API (его же прописать в plant-auth);
- `JWT_SECRET` — им же plant-admin подписывает Bearer админа (его значение идёт в
  `GAME_JWT_SECRET` плант-админа).

Вход игроков остаётся **собственным** (провайдеры настраиваются прямо здесь, см.
[docs/DEPLOY.md](docs/DEPLOY.md) §5). plant-auth — отдельный вход для админки/зеркал.

## Проверки

```bash
yarn smoke       # сценарии: страницы, вход, Mines, чат, WebSocket, отказ поддельных платежей
yarn typecheck   # TypeScript
yarn lint        # ESLint + Stylelint
```

## Выкладка

См. [docs/DEPLOY.md](docs/DEPLOY.md): переменные окружения, перенос MySQL 5.7 → 8.4, миграции, перевыпуск ключей.
Архитектура трёх репозиториев и связка по API — [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
