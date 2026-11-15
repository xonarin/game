-- Режим «Апгрейд»: настройки игры. Таблицы InventoryItem и UpgradeGame создаёт sequelize.sync() по моделям.
--
-- 1. upgrade::targetItemMarkup — минимальный множитель цели (цена скина ≥ ставка × 1.30).
-- 2. upgrade::frontendCoef — 1.02 давал RTP 102 % (казино в минусе); ставим 0.95, только если значение
--    ещё стандартное (заданное админом не трогаем).
-- 3. Описания: hiddenRTP не используется — шанс считается только через frontendCoef.

INSERT IGNORE INTO `Setting` (`name`, `value`, `description`) VALUES
    ('upgrade::targetItemMarkup', '1.30', 'Апгрейд: минимальный множитель цели — цена выигрываемого скина ≥ ставка × коэффициент (1.30)');

UPDATE `Setting` SET `value` = '0.9500' WHERE `name` = 'upgrade::frontendCoef' AND `value` = '1.0200';

UPDATE `Setting`
SET `description` = 'Апгрейд: коэффициент шанса. Шанс = (1 / множитель) × коэффициент; игрок видит ровно этот шанс. RTP = коэффициент (0.95 = 95 %)'
WHERE `name` = 'upgrade::frontendCoef';

UPDATE `Setting`
SET `description` = 'Апгрейд: не используется — шанс считается только через upgrade::frontendCoef'
WHERE `name` = 'upgrade::hiddenRTP';
