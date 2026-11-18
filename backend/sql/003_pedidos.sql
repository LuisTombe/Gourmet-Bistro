CREATE DATABASE IF NOT EXISTS restaurante_pedidos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE restaurante_pedidos;
CREATE TABLE IF NOT EXISTS pedidos (
  id_pedido INT PRIMARY KEY AUTO_INCREMENT,
  id_mesa INT NOT NULL COMMENT 'Referencia lógica a restaurante_catalogo.mesas',
  id_usuario INT NOT NULL COMMENT 'Referencia lógica a restaurante_usuarios.usuarios',
  fecha_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('Pendiente','En preparación','Listo','Entregado') NOT NULL DEFAULT 'Pendiente',
  total DECIMAL(10,2) NOT NULL,
  mesa_activa INT GENERATED ALWAYS AS (CASE WHEN estado IN ('Pendiente','En preparación','Listo') THEN id_mesa ELSE NULL END) STORED,
  CONSTRAINT chk_total_pedido CHECK(total > 0),
  UNIQUE KEY uq_mesa_activa (mesa_activa),
  INDEX ix_pedidos_mesa (id_mesa),
  INDEX ix_pedidos_estado (estado),
  INDEX ix_pedidos_estado_id (estado, id_pedido DESC)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS detalle_pedido (
  id_detalle INT PRIMARY KEY AUTO_INCREMENT,
  id_pedido INT NOT NULL,
  id_producto INT NOT NULL COMMENT 'Referencia lógica a restaurante_catalogo.productos',
  nombre_producto VARCHAR(100) NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_detalle_pedido FOREIGN KEY(id_pedido) REFERENCES pedidos(id_pedido) ON DELETE RESTRICT,
  CONSTRAINT chk_cantidad CHECK(cantidad > 0),
  CONSTRAINT chk_precio_unitario CHECK(precio_unitario > 0),
  INDEX ix_detalle_producto (id_producto),
  INDEX ix_detalle_pedido_orden (id_pedido, id_detalle)
) ENGINE=InnoDB;
