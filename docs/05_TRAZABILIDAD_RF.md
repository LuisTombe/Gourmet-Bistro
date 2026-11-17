# 05 — Matriz de Trazabilidad Completa (RF-01 a RF-20 y RNF-01 a RNF-12)

Esta matriz vincula cada requerimiento funcional y no funcional del **SRS consolidado (`SRS_Sistema_Pedidos_Restaurante-v3.docx`)** con los microservicios de backend, tablas MySQL, vistas React y casos de prueba ejecutados en la rama `QA`.

## 1. Requerimientos Funcionales (RF-01 a RF-20)

| RF | Nombre en el SRS | Microservicio / Endpoint Backend | Vista / Componente Frontend | Caso de Uso y Prueba | Estado en Rama `QA` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RF-01** | Registrar productos | `ms-catalogo` (`POST /api/productos`) | `src/views/MenuAdminView.tsx` | `CU-03` / `CP-04`, `PU-03` | **CUMPLIDO Y VERIFICADO** |
| **RF-02** | Consultar productos | `ms-catalogo` (`GET /api/productos`) | `MenuAdminView.tsx`, `NewOrderView.tsx`, `TablesFloorView.tsx` | `CU-03` / `CP-04`, `PI-02` | **CUMPLIDO Y VERIFICADO** |
| **RF-03** | Modificar productos | `ms-catalogo` (`PUT /api/productos/:id`) | `src/views/MenuAdminView.tsx` | `CU-03` / `CP-05`, `PU-03` | **CUMPLIDO Y VERIFICADO** |
| **RF-04** | Eliminar productos permitidos y controlar disponibilidad | `ms-catalogo` (`PATCH /api/productos/:id/disponibilidad`, `DELETE /api/productos/:id`) | `src/views/MenuAdminView.tsx` | `CU-04` / `CP-06`, `CP-07` | **CUMPLIDO Y VERIFICADO** |
| **RF-05** | Registrar pedidos asociados a mesas | `ms-pedidos` (`POST /api/pedidos`) | `src/views/NewOrderView.tsx`, `Food3DModal.tsx` | `CU-06` / `CP-10`, `CP-11`, `PI-03` | **CUMPLIDO Y VERIFICADO** |
| **RF-06** | Establecer cantidades de productos | `ms-pedidos` (Zod + `calcLines()`) | `src/views/NewOrderView.tsx`, `src/domain/rules.ts` | `CU-06` / `CP-09`, `PU-02` | **CUMPLIDO Y VERIFICADO** |
| **RF-07** | Calcular total del pedido y snapshot histórico | `ms-pedidos` (`calcLines()` + `/internal/catalog/snapshot`) | `src/views/NewOrderView.tsx`, `RestaurantContext.tsx` | `CU-06` / `CP-05`, `PU-01` | **CUMPLIDO Y VERIFICADO** |
| **RF-08** | Consultar pedidos | `ms-pedidos` (`GET /api/pedidos`, `GET /api/pedidos/:id`) | `src/views/OrdersListView.tsx` | `CU-07` / `CP-10`, `PI-03` | **CUMPLIDO Y VERIFICADO** |
| **RF-09** | Confirmar entrega del pedido (`Listo -> Entregado`) | `ms-pedidos` (`PATCH /api/pedidos/:id/estado`) | `src/views/OrdersListView.tsx`, `TablesFloorView.tsx` | `CU-07` / `CP-14`, `PI-04` | **CUMPLIDO Y VERIFICADO** |
| **RF-10** | Consultar pedidos para preparación (3 columnas) | `ms-pedidos` (`GET /api/pedidos`) | `src/views/KitchenKDSView.tsx` | `CU-08` / `CP-13` | **CUMPLIDO Y VERIFICADO** |
| **RF-11** | Actualizar estados de preparación (`Pendiente -> En prep. -> Listo`) | `ms-pedidos` (`PATCH /api/pedidos/:id/estado` + `transitionAllowed()`) | `src/views/KitchenKDSView.tsx` | `CU-08` / `CP-12`, `CP-13`, `PU-04` | **CUMPLIDO Y VERIFICADO** |
| **RF-12** | Gestionar mesas | `ms-catalogo` (`POST`, `PUT`, `DELETE /api/mesas`) | `src/views/TablesAdminView.tsx` | `CU-09` / `CP-08` | **CUMPLIDO Y VERIFICADO** |
| **RF-13** | Consultar disponibilidad derivada de mesas | `ms-catalogo` (`GET /api/mesas` + `/internal/pedidos/active-table-ids`) | `src/views/TablesFloorView.tsx`, `TablesAdminView.tsx` | `CU-05` / `PI-04` | **CUMPLIDO Y VERIFICADO** |
| **RF-14** | Registrar y consultar usuarios (con hash `bcrypt`) | `ms-usuarios` (`GET`, `POST /api/usuarios`) | `src/views/UsersAdminView.tsx` | `CU-10` / `PI-05` | **CUMPLIDO Y VERIFICADO** |
| **RF-15** | Modificar y desactivar cuentas de usuario | `ms-usuarios` (`PATCH /api/usuarios/:id`, `PATCH .../desactivar`) | `src/views/UsersAdminView.tsx` | `CU-10` / `CP-15` | **CUMPLIDO Y VERIFICADO** |
| **RF-16** | Iniciar sesión | `ms-usuarios` (`POST /api/auth/login`, `GET /api/auth/me`) | `src/components/LoginView.tsx` | `CU-01` / `CP-01`, `CP-02`, `PI-01` | **CUMPLIDO Y VERIFICADO** |
| **RF-17** | Restringir operaciones por rol (RBAC) | `guard()` / `requireRole()` en los 3 microservicios | `Navbar.tsx`, `App.tsx`, `KitchenKDSView.tsx`, `rules.ts` | `CU-01..CU-12` / `CP-03`, `PU-05`, `PI-05` | **CUMPLIDO Y VERIFICADO** |
| **RF-18** | Cerrar sesión revocando token y cookie | `ms-usuarios` (`POST /api/auth/logout`) | `src/components/Navbar.tsx` | `CU-02` / `CP-16` | **CUMPLIDO Y VERIFICADO** |
| **RF-19** | Explorar platos 3D interactivos y sincronizar con pedido *(Incorporado del código)* | Integrado con `ms-catalogo` y `ms-pedidos` | `src/components/3d/FoodPlate3D.tsx`, `Food3DModal.tsx` | `CU-11` / `HU-11` | **CUMPLIDO Y VERIFICADO** |
| **RF-20** | Gestionar puntos de restauración (Snapshots) y Rollback *(Incorporado del código)* | Estado íntegro en `RestaurantContext.tsx` | `src/views/VersionControlAdminView.tsx` | `CU-12` / `HU-12` | **CUMPLIDO Y VERIFICADO** |

---

## 2. Requerimientos No Funcionales (RNF-01 a RNF-12)

| RNF | Atributo de Calidad | Mecanismo Implementado en el Repositorio | Estado en Rama `QA` |
| :--- | :--- | :--- | :--- |
| **RNF-01** | Usabilidad y claridad | Estética editorial Jeton sin ruido visual, jerarquía clara y menús filtrados por rol (`Navbar.tsx`). | **CUMPLIDO** |
| **RNF-02** | Diseño web responsive | Grid adaptable en React 19 + Tailwind CSS v4 y Portal DOM para modales (`Food3DModal.tsx`). | **CUMPLIDO** |
| **RNF-03** | Tiempo de respuesta y rendimiento | Code-splitting (`React.lazy`), caché L1/TTL, compresión Brotli/Gzip, Batch INSERT e índices SQL (`004_performance_indexes.sql`). | **CUMPLIDO** |
| **RNF-04** | Seguridad de acceso y sesiones | Token aleatorio SHA-256 en MySQL (`sesion_token_hash`), cookie `HttpOnly` y verificación por request. | **CUMPLIDO** |
| **RNF-05** | Protección de contraseñas y secretos | `bcryptjs` (12 rondas) en `ms-usuarios` y variables de entorno (`.env.example`). | **CUMPLIDO** |
| **RNF-06** | Integridad transaccional de pedidos | Transacción ACID (`beginTransaction`/`commit`/`rollback`), `namedLocks` y columna generada `mesa_activa UNIQUE`. | **CUMPLIDO** |
| **RNF-07** | Validación estricta de datos | Esquemas `zod` estrictos en `ms-usuarios`, `ms-catalogo` y `ms-pedidos` + validaciones en `src/domain/rules.ts`. | **CUMPLIDO** |
| **RNF-08** | Compatibilidad con navegadores | Estándar ES2022 + WebGL Three.js compatible con Chrome y Edge en escritorio y móvil. | **CUMPLIDO** |
| **RNF-09** | Mantenibilidad y orden del código | Separación limpia en `src/`, `backend/services/ms-*`, `backend/sql/001..004` y `docs/diagrams/`. | **CUMPLIDO** |
| **RNF-10** | Disponibilidad para sustentación | Endpoints `/health` y `/metrics` activos en los 3 microservicios. Hosting cloud externo con HTTPS público marcado como **PENDIENTE** para despliegue de Semana 4. | **PARCIAL (Hosting externo pendiente)** |
| **RNF-11** | Manejo claro de errores | Mensajes en español claro, reversión automática en Optimistic UI y distinción entre error de red y lista vacía. | **CUMPLIDO** |
| **RNF-12** | Persistencia e inmutabilidad histórica | Snapshots `nombre_producto` y `precio_unitario` en `detalle_pedido` y bloqueo `409` ante borrado con historial. | **CUMPLIDO** |
