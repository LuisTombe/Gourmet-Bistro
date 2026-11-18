CREATE DATABASE IF NOT EXISTS restaurante_catalogo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE restaurante_catalogo;
CREATE TABLE IF NOT EXISTS productos (
  id_producto INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255) NULL,
  precio DECIMAL(10,2) NOT NULL,
  disponible BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT chk_producto_precio CHECK(precio > 0),
  INDEX ix_productos_disponible (disponible, id_producto)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS mesas (
  id_mesa INT PRIMARY KEY AUTO_INCREMENT,
  numero_mesa INT NOT NULL UNIQUE,
  CONSTRAINT chk_numero_mesa CHECK(numero_mesa > 0)
) ENGINE=InnoDB;
