# 05 — Trazabilidad de los 18 RF a componentes y endpoints

Los archivos de `services/` son **código propuesto e implementado en este kit**, pero aún deben integrarse y ejecutarse contra MySQL en el proyecto original. La vista React que se cita es un componente que ya existe en `main` y requiere adaptación asíncrona.

| RF | Funcionalidad SRS | API/proceso del kit | Vista real del repositorio | Estado |
|---|---|---|---|---|
| RF-01 | Registrar productos | ms-catalogo `POST /api/productos` | `MenuAdminView` | Backend preparado; UI por integrar |
| RF-02 | Consultar productos | ms-catalogo `GET /api/productos` | `MenuAdminView`, `NewOrderView` | Backend preparado; UI por integrar |
| RF-03 | Modificar productos | ms-catalogo `PUT /api/productos/:id` | `MenuAdminView` | Backend preparado; UI por integrar |
| RF-04 | Disponibilidad y eliminación | `PATCH .../disponibilidad`; `DELETE ...` | `MenuAdminView` | Backend preparado; UI por integrar |
| RF-05 | Registrar pedido por mesa | ms-pedidos `POST /api/pedidos` | `NewOrderView`, `TablesFloorView` | Backend preparado; UI por integrar |
| RF-06 | Cantidades positivas | Zod + `calcLines()` | `NewOrderView` | Prueba unitaria aprobada |
| RF-07 | Total y precio histórico | `calcLines()`, snapshot catálogo y transacción SQL | `NewOrderView` | Prueba unitaria aprobada; SQL no ejecutado |
| RF-08 | Consultar pedidos | `GET /api/pedidos`, `GET .../:id` | `OrdersListView` | Backend preparado; UI por integrar |
| RF-09 | Confirmar entrega | `PATCH /api/pedidos/:id/estado` | `OrdersListView` | Backend preparado; UI por integrar |
| RF-10 | Tablero de cocina | `GET /api/pedidos?estado=...` | `KitchenKDSView` | Backend preparado; UI por integrar |
| RF-11 | Preparación secuencial | `transitionAllowed()`, PATCH estado | `KitchenKDSView` | Prueba unitaria aprobada |
| RF-12 | CRUD mesas | ms-catalogo `POST`, `PUT`, `DELETE /api/mesas` | `TablesAdminView` | Backend preparado; UI por integrar |
| RF-13 | Disponibilidad derivada | ms-catalogo `GET /api/mesas` y ms-pedidos consulta interna | `TablesFloorView` | Backend preparado; UI por integrar |
| RF-14 | Crear/listar usuarios | ms-usuarios `GET`, `POST /api/usuarios` | `UsersAdminView` | Backend preparado; UI por integrar |
| RF-15 | Editar/desactivar usuarios | ms-usuarios `PATCH .../:id`, `/desactivar` | `UsersAdminView` | Backend preparado; UI por integrar |
| RF-16 | Autenticación | ms-usuarios `POST /api/auth/login`, `GET /api/auth/me` | `LoginView` | Backend preparado; UI existente es insegura hasta integrarse |
| RF-17 | Permisos por rol | `requireRole()`/`guard()` en cada API | `Navbar`, `App` | Backend preparado; rutas/pantallas por adaptar |
| RF-18 | Cierre y revocación | ms-usuarios `POST /api/auth/logout` | `Navbar` | Backend preparado; UI por integrar |

## Las 12 condiciones no funcionales
RNF-01 y 02: revisar contraste, responsive, teclado. RNF-03: verificar objetivo 3 s bajo carga representativa. RNF-04 y 05: cookies, hash, secretos (cubiertos a nivel de diseño; pentest pendiente). RNF-06: transacción y unicidad de mesa activa implementadas en SQL (ejecutar prueba concurrente real). RNF-07: Zod en 3 servicios. RNF-08: prueba Chrome y Edge pendiente. RNF-09: carpetas por servicio y SQL numerados. RNF-10: `/health` implementado en 3 servicios; hosting pendiente. RNF-11: mensajes y códigos HTTP, frontend pendiente. RNF-12: persistencia MySQL y snapshots definidos; verificación tras reinicio pendiente.
