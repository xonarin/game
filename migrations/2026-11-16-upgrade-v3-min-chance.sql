-- Апгрейд: минимальный шанс 0.1 % (upgrade::minChance). INSERT IGNORE: заданное админом значение не трогаем.

INSERT IGNORE INTO `Setting` (`name`, `value`, `description`) VALUES
    ('upgrade::minChance', '0.0010', 'Апгрейд: минимальный шанс — доля 0…1 (0.001 = 0.1 %). Цель с меньшим шансом выбрать нельзя');
