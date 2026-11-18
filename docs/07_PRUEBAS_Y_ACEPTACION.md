# 07 — Plan y Resultados de Pruebas y Aceptación (QA)

## 1. Pruebas Unitarias Automatizadas (13/13 Aprobadas en Rama `QA`)

- **Frontend (`npm test` -> `src/domain/rules.test.ts`):** **8/8 PASAN**
  - `PU-01`: Cálculo exacto de subtotal (`cantidad * precio_unitario`) y total general del pedido.
  - `PU-02`: Validación de cantidades enteras estrictamente positivas.
  - `PU-03`: Validación de precios numéricos positivos.
  - `PU-04`: Máquina de estados estricta (`Pendiente -> En preparación -> Listo -> Entregado`) según el rol.
  - `PU-05`: Matriz de permisos RBAC por rol (`administrador`, `mesero`, `cocinero`).
  - `RN-13`: Cálculo derivado del estado de mesa (`Disponible` / `Ocupada`).
  - `RN-10`: Protección de borrado físico de productos y mesas con historial.
- **Backend Microservicios (`npm run test:services` -> `backend/tests/domain.test.mjs`):** **5/5 PASAN**
  - `PU-01`: Totales en centavos e instantánea histórica (*snapshot*).
  - `PU-02`: Cantidades enteras positivas.
  - `PU-03`: Precios positivos de máximo 2 decimales.
  - `PU-04`: Máquina de estados por rol en `ms-pedidos`.
  - `PU-05`: Roles aceptados según acción.
- **Verificación de Tipos y Sintaxis (`npm run lint` & `npm run check:services`):** **Aprobado (Código 0)**.

## 2. Casos de Prueba Funcionales (CP-01 a CP-16) + Casos Extendidos (CP-17 y CP-18)

| ID | Caso de Prueba Funcional | Requisito | Resultado en `QA` |
| :--- | :--- | :--- | :--- |
| **CP-01** | Acceso sin sesión redirige a `LoginView` | RF-16, RF-17 | **APROBADO** |
| **CP-02** | Credenciales inválidas devuelven `401` con mensaje claro | RF-16, RNF-11 | **APROBADO** |
| **CP-03** | Mesero o cocinero intentando crear producto recibe `403` | RF-01, RF-17 | **APROBADO** |
| **CP-04** | Administrador registra producto válido (`precio > 0`) y aparece en catálogo | RF-01, RF-02 | **APROBADO** |
| **CP-05** | Modificar precio de producto conserva intactos los precios históricos en `detalle_pedido` | RF-03, RF-07, RN-09 | **APROBADO** |
| **CP-06** | Producto marcado como `No disponible` no puede añadirse a pedidos nuevos | RF-04, RN-08 | **APROBADO** |
| **CP-07** | Intento de eliminar producto con historial de pedidos es rechazado con `409` | RF-04, RN-10 | **APROBADO** |
| **CP-08** | Registro de mesa con `numero_mesa` único y rechazo de duplicados (`409`) | RF-12 | **APROBADO** |
| **CP-09** | Rechazo de cantidades cero, negativas o decimales (`422`) | RF-06, RN-11 | **APROBADO** |
| **CP-10** | Registro de pedido válido en transacción SQL en estado `Pendiente` ocupando la mesa | RF-05, RF-07, RN-14 | **APROBADO** |
| **CP-11** | Bloqueo atómico (`uq_mesa_activa` + `namedLocks`) de segundo pedido activo en la misma mesa (`409`) | RF-05, RN-04, RNF-06 | **APROBADO** |
| **CP-12** | Rechazo de salto `Pendiente -> Listo` o retroceso de estados (`409`) | RF-11, RN-05 | **APROBADO** |
| **CP-13** | Avance secuencial `Pendiente -> En preparación -> Listo` exclusivo por rol `cocinero` | RF-10, RF-11, RN-06 | **APROBADO** |
| **CP-14** | Confirmación de entrega `Listo -> Entregado` por `mesero`/`administrador` libera la mesa | RF-09, RN-07, RN-13 | **APROBADO** |
| **CP-15** | Desactivación de cuenta de empleado (`activo = 0`) revoca su sesión inmediatamente | RF-15, RNF-04 | **APROBADO** |
| **CP-16** | Cierre de sesión limpia `sesion_token_hash`, expira cookie `HttpOnly` y bloquea acceso posterior | RF-18 | **APROBADO** |
| **CP-17** | Selección de plato en escena 3D (`FoodPlate3D`) abre `Food3DModal` y agrega sus productos al pedido | RF-19, CU-11 | **APROBADO** |
| **CP-18** | Creación de Snapshot y ejecución de Rollback en `VersionControlAdminView` exclusivo para Admin | RF-20, CU-12 | **APROBADO** |

## 3. Pruebas de Integración entre Microservicios (PI-01 a PI-06)

- **PI-01 (`ms-usuarios` <-> Frontend):** Emisión y lectura de cookie `HttpOnly` tras `POST /api/auth/login` y validación en `GET /api/auth/me` — **APROBADO**.
- **PI-02 (`ms-catalogo` <-> MySQL `restaurante_catalogo`):** Persistencia y caché L1 con invalidación automática en `/api/productos` y `/api/mesas` — **APROBADO**.
- **PI-03 (`ms-pedidos` -> `ms-catalogo` -> MySQL `restaurante_pedidos`):** Validación HTTP interna `/internal/catalog/snapshot` y guardado atómico con Batch `INSERT` — **APROBADO**.
- **PI-04 (`ms-catalogo` -> `ms-pedidos`):** Derivación en tiempo real de estado `Disponible` / `Ocupada` vía `/internal/pedidos/active-table-ids` — **APROBADO**.
- **PI-05 (`ms-catalogo` & `ms-pedidos` -> `ms-usuarios`):** Verificación de sesión y rol vía `/internal/auth/verify` — **APROBADO**.
- **PI-06 (Tolerancia a fallos y bloqueo de borrado histórico):** Consulta a `/internal/pedidos/product/:id/has-history` y `/internal/pedidos/table/:id/has-history` antes de `DELETE` físico — **APROBADO**.
