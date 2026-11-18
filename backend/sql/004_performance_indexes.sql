-- Migración idempotente de índices de alto rendimiento (Fase Optimización)
-- 1. Índice compuesto para validación de sesión en cada request HTTP:
--    SELECT id_usuario,nombre_usuario,rol,activo FROM usuarios WHERE sesion_token_hash=? AND sesion_expira_en>NOW() AND activo=1 LIMIT 1
USE restaurante_usuarios;
CREATE INDEX IF NOT EXISTS ix_usuarios_sesion_activa ON usuarios (sesion_token_hash, activo, sesion_expira_en);

-- 2. Índice compuesto para verificación de último administrador activo:
--    SELECT COUNT(*) AS n FROM usuarios WHERE rol='administrador' AND activo=1
CREATE INDEX IF NOT EXISTS ix_usuarios_rol_activo ON usuarios (rol, activo);

-- 3. Índice para filtrado y snapshot de productos disponibles:
--    SELECT id_producto,nombre,precio,disponible FROM productos WHERE id_producto IN (...) / WHERE disponible=1
USE restaurante_catalogo;
CREATE INDEX IF NOT EXISTS ix_productos_disponible ON productos (disponible, id_producto);

-- 4. Índice compuesto para listado paginado por estado y orden descendente:
--    SELECT id_pedido,id_mesa,id_usuario,fecha_pedido,estado,total FROM pedidos WHERE estado=? ORDER BY id_pedido DESC LIMIT ?
USE restaurante_pedidos;
CREATE INDEX IF NOT EXISTS ix_pedidos_estado_id ON pedidos (estado, id_pedido);

-- 5. Índice compuesto para carga por lote (eager loading sin N+1) de líneas de pedido:
--    SELECT id_detalle,id_pedido,id_producto,nombre_producto,cantidad,precio_unitario,subtotal FROM detalle_pedido WHERE id_pedido IN (...) ORDER BY id_detalle
CREATE INDEX IF NOT EXISTS ix_detalle_pedido_orden ON detalle_pedido (id_pedido, id_detalle);

