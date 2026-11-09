# PlayTime / Willy

Сайт мини-игр: лобби, игра Mines, чат, турниры, партнёрская программа, бонусы.
Стек: Node 24, React 19 (SSR), Apollo Server 5 + graphql-ws, Express 5, Sequelize 6 + MySQL 8.4, Redis 7, webpack 5.

## Локальная разработка

Нужен только Docker:

```bash
docker compose -f docker-compose.dev.yml up -d
```

- сайт: http://localhost:3100 (вход для разработки — кнопка «Dev вход» на `/login`)
- WebSocket: `ws://localhost:3002/graphql`
- публичный адрес через Cloudflare Tunnel: `docker compose -f docker-compose.dev.yml --profile tunnel up -d`

Секреты для локального запуска — в файле `.env` рядом с compose-файлом (список переменных: `.env.example`).

## Проверки

```bash
yarn smoke       # сценарии: страницы, вход, Mines, чат, WebSocket, отказ поддельных платежей
yarn typecheck   # TypeScript
yarn lint        # ESLint + Stylelint
```

## Выкладка

См. [docs/DEPLOY.md](docs/DEPLOY.md): переменные окружения, перенос MySQL 5.7 → 8.4, миграции, перевыпуск ключей.
