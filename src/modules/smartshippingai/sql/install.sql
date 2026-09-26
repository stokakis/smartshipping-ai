CREATE TABLE IF NOT EXISTS `PREFIX_smartshipping_classes` (
    `id_class` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(64) NOT NULL,
    `base_price` DECIMAL(10, 2) NOT NULL DEFAULT '0.00',
    `absorption_power` INT(11) NOT NULL DEFAULT 1,
    `date_add` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `date_upd` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_class`)
) ENGINE=ENGINE_TYPE DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `PREFIX_smartshipping_product` (
    `id_product` INT(11) UNSIGNED NOT NULL,
    `id_product_attribute` INT(11) UNSIGNED NOT NULL DEFAULT 0,
    `id_class` INT(11) UNSIGNED NOT NULL DEFAULT 1,
    `is_approved` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
    `confidence_score` DECIMAL(5, 2) NULL DEFAULT NULL,
    `ai_notes` VARCHAR(255) NULL DEFAULT NULL,
    `date_upd` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_product`, `id_product_attribute`),
    KEY `idx_class` (`id_class`),
    KEY `idx_approved` (`is_approved`)
) ENGINE=ENGINE_TYPE DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `PREFIX_smartshipping_geo_zones` (
    `id_zone_rule` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `zip_code` VARCHAR(32) NOT NULL,
    `zone_type` ENUM('A', 'B', 'C') NOT NULL DEFAULT 'A',
    `multiplier` DECIMAL(5, 2) NOT NULL DEFAULT '1.00',
    `label` VARCHAR(128) NULL DEFAULT NULL,
    `date_upd` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_zone_rule`),
    KEY `idx_zip` (`zip_code`)
) ENGINE=ENGINE_TYPE DEFAULT CHARSET=utf8mb4;
