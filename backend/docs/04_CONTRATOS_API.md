# 04 — Contratos REST del kit Gourmet-Bistro

**Un solo origen público:** el navegador consulta `/api/*`. El proxy dirige solicitudes a tres procesos. No exponer rutas `/internal/*` a internet. El usuario autenticado viaja en cookie `gb_session` HttpOnly, no en campos enviados por React.

## Contratos externos
| Servicio | Método y ruta | Rol | RF |
|---|---|---|---|
| Usuarios | POST `/api/auth/login` | Público | RF-16 |
| Usuarios | GET `/api/auth/me` | Autenticado | RF-16,17 |
| Usuarios | POST `/api/auth/logout` | Autenticado o sesión a limpiar | RF-18 |
| Usuarios | GET `/api/usuarios` | Administrador | RF-14 |
| Usuarios | POST `/api/usuarios` | Administrador | RF-14 |
| Usuarios | PATCH `/api/usuarios/:id` | Administrador | RF-15 |
| Usuarios | PATCH `/api/usuarios/:id/desactivar` | Administrador | RF-15 |
| Catálogo | GET `/api/productos` | Todos | RF-02 |
| Catálogo | POST `/api/productos` | Administrador | RF-01 |
| Catálogo | PUT `/api/productos/:id` | Administrador | RF-03 |
| Catálogo | PATCH `/api/productos/:id/disponibilidad` | Administrador | RF-04 |
| Catálogo | DELETE `/api/productos/:id` | Administrador | RF-04 |
| Catálogo | GET `/api/mesas` | Administrador, Mesero | RF-13 |
| Catálogo | POST `/api/mesas` | Administrador | RF-12 |
| Catálogo | PUT `/api/mesas/:id` | Administrador | RF-12 |
| Catálogo | DELETE `/api/mesas/:id` | Administrador | RF-12 |
| Pedidos | GET `/api/pedidos` | Todos | RF-08, RF-10 |
| Pedidos | GET `/api/pedidos/:id` | Todos | RF-08 |
| Pedidos | POST `/api/pedidos` | Mesero, Administrador | RF-05,06,07 |
| Pedidos | PATCH `/api/pedidos/:id/estado` | Según transición | RF-09,11 |

## Ejemplos mínimos
Login:
```http
POST /api/auth/login
Content-Type: application/json

{"nombre_usuario":"admin","contrasena":"(contraseña creada por seed)"}
```
Respuesta: `200 {"usuario":{"id_usuario":1,"nombre_usuario":"admin","rol":"administrador","activo":true}}` + cookie HttpOnly.

Crear producto:
```json
{"nombre":"Hamburguesa","descripcion":"Con queso","precio":18000}
```
Crear mesa:
```json
{"numero_mesa":3}
```

Registrar pedido:
```http
POST /api/pedidos
Content-Type: application/json

{"id_mesa":3,"items":[{"id_producto":1,"cantidad":2}],"total_confirmado":36000}
```
`total_confirmado` no autoriza confiar en el navegador; es únicamente la constancia del importe que el usuario vio. El servidor vuelve a obtener precios de catálogo. Si cambian, responde `409` con el total actual en un mensaje para que la UI muestre un nuevo resumen.

Avanzar estado:
```json
{"estado":"En preparación"}
```

## Respuestas y códigos
- `200`: consulta/actualización realizada.
- `201`: nuevo producto, mesa, usuario o pedido creado.
- `401`: sesión ausente, vencida o invalidada.
- `403`: usuario autenticado sin permisos.
- `404`: recurso inexistente.
- `409`: mesa ocupada, elemento con historial, estado incompatible o cambio de precio.
- `422`: datos inválidos según Zod.
- `503`: servicio dependiente temporalmente inaccesible.

## Contratos internos (clave privada `x-service-key`)
- POST `ms-usuarios/internal/auth/verify` `{token}` -> `{user:{id_usuario,nombre_usuario,rol,activo}}`
- POST `ms-catalogo/internal/catalog/snapshot` `{id_mesa,ids:[1,2]}` -> `{mesa,productos:[{id_producto,nombre,precio,disponible}]}`
- GET `ms-pedidos/internal/pedidos/active-table-ids` -> `{activeIds:[1,3]}`
- GET `ms-pedidos/internal/pedidos/product/:id/has-history` -> `{hasHistory:boolean}`
- GET `ms-pedidos/internal/pedidos/table/:id/has-history` -> `{hasHistory:boolean}`

## Notas de integridad
1. `detalle_pedido.id_pedido` sí tiene FK física. `pedidos.id_usuario`, `pedidos.id_mesa`, `detalle_pedido.id_producto` son referencias lógicas verificadas por API.
2. No se crea una tabla de categorías, áreas, notas, clientes ni pagos.
3. La columna generada `pedidos.mesa_activa` es un mecanismo SQL para la regla RN-04, no una sexta tabla ni nueva funcionalidad.
4. Confirmar una entrega no cobra ni factura: libera mesa y conserva historial.
