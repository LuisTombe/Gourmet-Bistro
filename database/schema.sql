-- =====================================================================
-- Script de Creación y Poblado de Base de Datos para Gourmet Bistro POS
-- Stack: MariaDB / MySQL en XAMPP (localhost:3306)
-- Base de datos: gourmet_bistro
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `gourmet_bistro`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `gourmet_bistro`;

-- Desactivar llaves foráneas temporalmente para permitir reconstrucción limpia
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `restaurant_tables`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `system_version_snapshots`;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Tabla de Usuarios y Roles (RBAC)
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL DEFAULT '',
  `name` VARCHAR(100) NOT NULL,
  `role` ENUM('administrador', 'mesero', 'cocinero') NOT NULL,
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de Mesas del Salón
CREATE TABLE `restaurant_tables` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `table_number` INT NOT NULL UNIQUE,
  `capacity` INT NOT NULL DEFAULT 4,
  `area` ENUM('Salón Principal', 'Terraza Gourmet', 'Zona VIP') NOT NULL DEFAULT 'Salón Principal',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Productos del Menú
CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10, 2) NOT NULL,
  `category` ENUM('Entradas', 'Carnes & Grill', 'Pastas & Risottos', 'Postres', 'Bebidas & Bar') NOT NULL,
  `available` BOOLEAN NOT NULL DEFAULT TRUE,
  `image` VARCHAR(255) DEFAULT NULL,
  `station` ENUM('Cocina', 'Parrilla', 'Pastelería', 'Bar') NOT NULL DEFAULT 'Cocina',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla de Pedidos / Comandas
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `table_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `status` ENUM('Pendiente', 'En preparación', 'Listo', 'Entregado') NOT NULL DEFAULT 'Pendiente',
  `total` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_orders_status` (`status`),
  INDEX `idx_orders_table` (`table_id`),
  INDEX `idx_orders_user` (`user_id`),
  CONSTRAINT `fk_orders_table` FOREIGN KEY (`table_id`) REFERENCES `restaurant_tables` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabla de Ítems de Pedidos
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10, 2) NOT NULL,
  `subtotal` DECIMAL(10, 2) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_order_items_order` (`order_id`),
  INDEX `idx_order_items_product` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabla de Puntos de Control y Rollback (Versionamiento & Histórico)
CREATE TABLE `system_version_snapshots` (
  `id` VARCHAR(64) PRIMARY KEY,
  `version_tag` VARCHAR(50) NOT NULL,
  `branch` VARCHAR(50) NOT NULL DEFAULT 'Dev',
  `commit_hash` VARCHAR(40) NOT NULL,
  `author` VARCHAR(100) NOT NULL,
  `author_role` VARCHAR(50) NOT NULL,
  `description` TEXT NOT NULL,
  `type` VARCHAR(30) NOT NULL DEFAULT 'recovery_point',
  `state_backup` LONGTEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- Datos Iniciales / Semilla (Seed Data)
-- =====================================================================

-- Usuarios
INSERT INTO `users` (`id`, `username`, `password_hash`, `name`, `role`, `active`, `avatar`) VALUES
(1, 'admin', 'admin123', 'Valentina Rossi', 'administrador', 1, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'),
(2, 'carlos_m', 'carlos123', 'Carlos Mendoza', 'mesero', 1, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'),
(3, 'sofia_g', 'sofia123', 'Sofía Guerrero', 'mesero', 1, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'),
(4, 'chef_mateo', 'chef123', 'Mateo Silvestri', 'cocinero', 1, 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80'),
(5, 'lucia_k', 'lucia123', 'Lucía Restrepo', 'cocinero', 1, 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=150&q=80');

-- Mesas
INSERT INTO `restaurant_tables` (`id`, `table_number`, `capacity`, `area`) VALUES
(1, 1, 2, 'Salón Principal'),
(2, 2, 4, 'Salón Principal'),
(3, 3, 4, 'Salón Principal'),
(4, 4, 6, 'Salón Principal'),
(5, 5, 2, 'Terraza Gourmet'),
(6, 6, 4, 'Terraza Gourmet'),
(7, 7, 4, 'Terraza Gourmet'),
(8, 8, 8, 'Zona VIP'),
(9, 9, 6, 'Zona VIP');

-- Productos
INSERT INTO `products` (`id`, `name`, `description`, `price`, `category`, `available`, `image`, `station`) VALUES
(1, 'Carpaccio de Res Trufado', 'Finas láminas de lomo con aceite de trufa blanca, alcaparras baby y virutas de parmesano reggiano 24 meses.', 38000.00, 'Entradas', 1, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', 'Cocina'),
(2, 'Burrata Pugliese con Higos', 'Burrata fresca sobre cama de rúcula silvestre, higos caramelizados al balsámico de Módena y crocante de pistacho.', 34000.00, 'Entradas', 1, 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=600&q=80', 'Cocina'),
(3, 'Tartar de Atún Rojo & Palta', 'Atún aleta amarilla marinado en sésamo y ponzu con emulsión de wasabi sobre colchón de aguacate hass.', 42000.00, 'Entradas', 1, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80', 'Cocina'),
(4, 'Ojo de Bife Angosto (400g)', 'Corte premium madurado 28 días en seco, terminado a la leña con manteca de chimichurri ahumado.', 89000.00, 'Carnes & Grill', 1, 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80', 'Parrilla'),
(5, 'Costillas de Cordero Patagónico', 'Costillas asadas al romero fresco y ajo negro acompañadas de puré de camote rústico.', 84000.00, 'Carnes & Grill', 1, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', 'Parrilla'),
(6, 'Salmón Austral Glaseado', 'Filete de salmón salvaje sellado con glaseado teriyaki de naranja y jengibre sobre espárragos grillados.', 72000.00, 'Carnes & Grill', 1, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80', 'Parrilla'),
(7, 'Risotto ai Frutti di Mare', 'Arroz carnaroli con caldo de langosta concentrado, calamares tiernos, camarones tigre y mejillones al vino blanco.', 62000.00, 'Pastas & Risottos', 1, 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80', 'Cocina'),
(8, 'Ravioli de Ossobuco Braseado', 'Masa artesanal rellena de ossobuco estofado al Barolo, bañados en salsa demi-glace y gremolata de limón.', 56000.00, 'Pastas & Risottos', 1, 'https://images.unsplash.com/photo-1587740908075-9e245070dfaa?auto=format&fit=crop&w=600&q=80', 'Cocina'),
(9, 'Pappardelle al Ragu de Jabalí', 'Cintas anchas caseras con ragú cocinado a fuego lento durante 8 horas con hierbas toscanas.', 54000.00, 'Pastas & Risottos', 0, 'https://images.unsplash.com/photo-1621996346565-e3d5d6281788?auto=format&fit=crop&w=600&q=80', 'Cocina'),
(10, 'Tiramisú Tradizionale', 'Capas de savoiardi empapados en café espresso fuerte y licor amaretto con crema sedosa de mascarpone.', 24000.00, 'Postres', 1, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80', 'Pastelería'),
(11, 'Esfera de Chocolate Valrhona', 'Rellena de mousse praliné de avellanas con vertido tibio de ganache de cacao amargo al 70%.', 28000.00, 'Postres', 1, 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80', 'Pastelería'),
(12, 'Cóctel Smoked Old Fashioned', 'Bourbon añejo, bitter de angostura, piel de naranja y humo de roble aromático servido bajo campana de cristal.', 36000.00, 'Bebidas & Bar', 1, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80', 'Bar'),
(13, 'Gin Tonic Botánico', 'Ginebra artesanal macerada con frutos rojos, enebro fresco y agua tónica premium mediterránea.', 32000.00, 'Bebidas & Bar', 1, 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80', 'Bar'),
(14, 'Limonada de Hierbabuena & Jengibre', 'Extracto natural de limón mandarino, hierbabuena fresca machacada y un toque suave de jarabe de jengibre.', 14000.00, 'Bebidas & Bar', 1, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80', 'Bar');

-- Pedidos
INSERT INTO `orders` (`id`, `table_id`, `user_id`, `status`, `total`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 'En preparación', 127000.00, 'El cliente es intolerante al gluten leve en las entradas.', DATE_SUB(NOW(), INTERVAL 25 MINUTE), DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(2, 4, 3, 'Pendiente', 235000.00, 'Mesa de aniversario. Por favor coordinar salida conjunta.', DATE_SUB(NOW(), INTERVAL 8 MINUTE), DATE_SUB(NOW(), INTERVAL 8 MINUTE)),
(3, 6, 2, 'Listo', 96000.00, 'Comensales con prisa para evento cercano.', DATE_SUB(NOW(), INTERVAL 35 MINUTE), DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
(4, 2, 2, 'Entregado', 62000.00, NULL, DATE_SUB(NOW(), INTERVAL 90 MINUTE), DATE_SUB(NOW(), INTERVAL 40 MINUTE));

-- Ítems de Pedidos
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `unit_price`, `subtotal`, `notes`) VALUES
(1, 1, 1, 1, 38000.00, 38000.00, 'Sin tostaditas de trigo adicionales'),
(2, 1, 4, 1, 89000.00, 89000.00, 'Término medio estricto'),
(3, 2, 2, 2, 34000.00, 68000.00, NULL),
(4, 2, 7, 1, 62000.00, 62000.00, 'Bien al dente'),
(5, 2, 5, 1, 84000.00, 84000.00, 'Punto jugoso'),
(6, 2, 12, 1, 36000.00, 36000.00, NULL),
(7, 2, 13, 1, 32000.00, 32000.00, NULL),
(8, 3, 8, 1, 56000.00, 56000.00, NULL),
(9, 3, 3, 1, 42000.00, 42000.00, 'Sin cebollín extra'),
(10, 4, 2, 1, 34000.00, 34000.00, NULL),
(11, 4, 14, 2, 14000.00, 28000.00, NULL);

-- Versiones e Histórico Inicial
INSERT INTO `system_version_snapshots` (`id`, `version_tag`, `branch`, `commit_hash`, `author`, `author_role`, `description`, `type`) VALUES
('snap-001', 'v1.0.0-rc1', 'main', 'e95edec', 'Luis Tombe', 'administrador', 'Versión base funcional del prototipo interactivo (Mesas, KDS, Pedidos, Menú)', 'git_release'),
('snap-002', 'v1.0.0-docs', 'main', 'affd3ec', 'Luis Tombe', 'administrador', 'Documentación técnica del sistema: SRS, PRD, TRD y User Flow', 'git_release'),
('snap-003', 'v0.1.0-init', 'Dev', '01a744b', 'Luis Tombe', 'administrador', 'Initial commit: Configuración inicial del repositorio en rama Dev', 'git_release');

