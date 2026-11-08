-- GEN AURA database (import in phpMyAdmin) - use this OR "php artisan migrate", not both.
-- Admin login: admin / admin   (you will be forced to change it on first login)
CREATE DATABASE IF NOT EXISTS `gen_aura` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `gen_aura`;
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `order_items`, `orders`, `products`, `reviews`, `settings`, `admins`;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `admins` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `must_change_password` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL, `cat` VARCHAR(255) NULL, `sub` VARCHAR(255) NULL,
  `sizes` VARCHAR(255) NULL, `feat` VARCHAR(255) NULL, `description` TEXT NULL,
  `price` INT UNSIGNED NOT NULL, `old_price` INT UNSIGNED NOT NULL DEFAULT 0, `stock` INT UNSIGNED NOT NULL DEFAULT 0,
  `image` VARCHAR(255) NULL, `images` LONGTEXT NULL,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  KEY `products_cat_index` (`cat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL, `phone` VARCHAR(255) NOT NULL, `address` TEXT NOT NULL,
  `subtotal` INT UNSIGNED NOT NULL, `ship` INT UNSIGNED NOT NULL DEFAULT 0, `total` INT UNSIGNED NOT NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'Pending',
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  KEY `orders_status_index` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `order_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `order_id` BIGINT UNSIGNED NOT NULL, `product_id` BIGINT UNSIGNED NULL,
  `name` VARCHAR(255) NOT NULL, `size` VARCHAR(255) NULL, `qty` INT UNSIGNED NOT NULL, `price` INT UNSIGNED NOT NULL,
  CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `reviews` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL, `text` TEXT NOT NULL, `stars` TINYINT UNSIGNED NOT NULL DEFAULT 5,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `settings` (
  `key` VARCHAR(255) NOT NULL PRIMARY KEY, `value` TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `admins` (`username`,`password`,`created_at`,`updated_at`) VALUES
('admin','$2y$10$NObPFxp27CWk5hewdQw1IOM.3juZdrexg4eFwViqDyFCF6vRMbD3m',NOW(),NOW());

INSERT INTO `products` (`name`,`cat`,`sub`,`sizes`,`feat`,`description`,`price`,`old_price`,`stock`,`created_at`,`updated_at`) VALUES
('Classic Cotton T-Shirt','T-Shirt','Everyday Comfort','M,L,XL','100% Cotton,Breathable,Soft feel,Regular fit','Soft, breathable cotton tee for everyday wear.',650,850,20,NOW(),NOW()),
('Oxford Formal Shirt','Shirt','Office Ready','M,L,XL,XXL','Premium fabric,Wrinkle resistant,Slim fit,Easy care','Crisp, comfortable shirt for office and occasions.',1250,1550,20,NOW(),NOW()),
('Slim Fit Chino Pant','Pant','Stretch Fit','30,32,34,36','Stretch fabric,All-day comfort,Slim fit,Easy care','Stretch-fit chino with a clean, modern look.',1450,1800,20,NOW(),NOW()),
('Embroidered Panjabi','Panjabi','Festive Edition','M,L,XL,XXL','Fine embroidery,Soft fabric,Regular fit,Premium finish','Elegant panjabi with fine embroidery for Eid and festivities.',1990,2500,20,NOW(),NOW());
