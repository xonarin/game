-- Замена серверных сидов, созданных до перехода на CSPRNG (раньше generateSeed() брал Math.random —
-- такой сид можно предсказать). Новый сид — 32 случайных байта из RANDOM_BYTES (OpenSSL CSPRNG
-- MySQL) в виде 64 hex-символов, как у crypto.randomBytes(32).toString('hex'). nonce обнуляется,
-- как при updateServerSeed.
--
-- Сыгранные и текущие игры Mines не затрагиваются: поле и сиды каждой игры хранятся в её строке
-- (MinesGame.serverSeed/clientSeed/nonce), по ним прошлые игры по-прежнему проверяются.
-- clientSeed не меняется: он публичный и задаётся игроком.
-- Миграция выполняется один раз (schema_migrations), повторный запуск сиды не трогает.

UPDATE `User`
SET `serverSeed` = LOWER(HEX(RANDOM_BYTES(32))),
    `nonce` = 0;
