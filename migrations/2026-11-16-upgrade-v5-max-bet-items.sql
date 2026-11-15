-- Апгрейд: несколько своих скинов в одной ставке — не больше upgrade::maxBetItems (по умолчанию 10).
-- Таблицу UpgradeGameBetItem (снимки поставленных скинов) создаёт sequelize.sync() по модели.

INSERT IGNORE INTO `Setting` (`name`, `value`, `description`) VALUES
    ('upgrade::maxBetItems', '10', 'Апгрейд: сколько своих скинов можно поставить в одну игру (целое, 1…100)');
