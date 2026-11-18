-- ============================================================================
-- PROYECTO FORMATIVO: Gourmet Bistro POS (SENA ADSO)
-- SCRIPT DE SEGURIDAD: Creación de Usuarios de Aplicación y Mínimos Privilegios
-- Motor: MySQL 8.0 / MariaDB (XAMPP)
-- ============================================================================
-- Este script reemplaza el uso de la cuenta 'root' en la aplicación y asegura
-- el aislamiento lógico de esquemas entre los 3 microservicios.
-- Ejecutar este archivo una sola vez como administrador (root) en MySQL.
-- ============================================================================

-- 1. Microservicio ms-usuarios (Puerto :4001)
-- Solo accede al esquema restaurante_usuarios
CREATE USER IF NOT EXISTS 'gb_usuarios'@'127.0.0.1' IDENTIFIED BY 'UsuariosPass2026!';
CREATE USER IF NOT EXISTS 'gb_usuarios'@'localhost' IDENTIFIED BY 'UsuariosPass2026!';

GRANT SELECT, INSERT, UPDATE ON restaurante_usuarios.* TO 'gb_usuarios'@'127.0.0.1';
GRANT SELECT, INSERT, UPDATE ON restaurante_usuarios.* TO 'gb_usuarios'@'localhost';
-- Permisos DDL específicos para creación idempotente de tabla de snapshots si aplica
GRANT CREATE, ALTER ON restaurante_usuarios.system_snapshots TO 'gb_usuarios'@'127.0.0.1';
GRANT CREATE, ALTER ON restaurante_usuarios.system_snapshots TO 'gb_usuarios'@'localhost';

-- 2. Microservicio ms-catalogo (Puerto :4002)
-- Solo accede al esquema restaurante_catalogo
CREATE USER IF NOT EXISTS 'gb_catalogo'@'127.0.0.1' IDENTIFIED BY 'CatalogoPass2026!';
CREATE USER IF NOT EXISTS 'gb_catalogo'@'localhost' IDENTIFIED BY 'CatalogoPass2026!';

GRANT SELECT, INSERT, UPDATE, DELETE ON restaurante_catalogo.* TO 'gb_catalogo'@'127.0.0.1';
GRANT SELECT, INSERT, UPDATE, DELETE ON restaurante_catalogo.* TO 'gb_catalogo'@'localhost';

-- 3. Microservicio ms-pedidos (Puerto :4003)
-- Solo accede al esquema restaurante_pedidos
CREATE USER IF NOT EXISTS 'gb_pedidos'@'127.0.0.1' IDENTIFIED BY 'PedidosPass2026!';
CREATE USER IF NOT EXISTS 'gb_pedidos'@'localhost' IDENTIFIED BY 'PedidosPass2026!';

GRANT SELECT, INSERT, UPDATE, DELETE ON restaurante_pedidos.* TO 'gb_pedidos'@'127.0.0.1';
GRANT SELECT, INSERT, UPDATE, DELETE ON restaurante_pedidos.* TO 'gb_pedidos'@'localhost';

-- 4. Aplicar privilegios en memoria de MySQL
FLUSH PRIVILEGES;
