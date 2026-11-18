# INFORME DE ENTREGA TÉCNICA — SPRINT 2: DESARROLLO DEL BACKEND Y BASE DE DATOS
**Proyecto Formativo:** Sistema Web de Gestión de Menú, Pedidos, Cocina y Mesas para Restaurantes Pequeños (**Gourmet Bistro POS**)  
**Programa:** Tecnólogo en Análisis y Desarrollo de Software (SENA)  
**Rol:** Ingeniero de Backend Senior / QA  
**Fecha de Entrega:** 18 de Noviembre de 2026  
**Entorno de Persistencia:** MySQL 8.0 / MariaDB en XAMPP (`127.0.0.1:3306`)  
**Arquitectura del Backend:** 3 Microservicios desacoplados en Node.js + Express + Zod + bcryptjs + Pool mysql2  

---

## 1. BASE DE DATOS: MODELO RELACIONAL E INTEGRIDAD

El diseño de la base de datos se deriva de forma estricta del Modelo Conceptual y Entidad-Relación (ERD) acordado en el Sprint 1, dividiendo la instancia compartida de MySQL en **tres esquemas lógicos independientes** para garantizar la alta cohesión y bajo acoplamiento de cada microservicio:

```
MySQL 8.0 (XAMPP :3306)
├── restaurante_usuarios (Gestionado por ms-usuarios :4001)
│   ├── usuarios
│   └── system_snapshots
├── restaurante_catalogo (Gestionado por ms-catalogo :4002)
│   ├── productos
│   └── mesas
└── restaurante_pedidos (Gestionado por ms-pedidos :4003)
    ├── pedidos
    └── detalle_pedido
```

### 1.1. Tablas y Especificación DDL

| Esquema Lógico | Tabla | Columnas y Tipos de Dato | Claves e Índices | Restricciones e Integridad |
|---|---|---|---|---|
| `restaurante_usuarios` | `usuarios` | `id_usuario` INT AUTO_INCREMENT<br>`nombre_usuario` VARCHAR(50)<br>`contrasena_hash` VARCHAR(255)<br>`rol` ENUM('administrador','mesero','cocinero')<br>`activo` BOOLEAN DEFAULT TRUE<br>`sesion_token_hash` VARCHAR(255) NULL<br>`sesion_expira_en` DATETIME NULL | **PK:** `id_usuario`<br>**UQ:** `nombre_usuario`<br>**IX:** `ix_usuarios_sesion_activa`<br>**IX:** `ix_usuarios_rol_activo` | `NOT NULL` en credenciales y roles. Cierre de sesión y revocación limpian el token hash a `NULL`. |
| `restaurante_usuarios` | `system_snapshots` | `id_snapshot` VARCHAR(64)<br>`version_tag` VARCHAR(64)<br>`branch` VARCHAR(64)<br>`commit_hash` VARCHAR(64)<br>`autor_id` INT, `autor_nombre` VARCHAR(50)<br>`autor_rol` VARCHAR(30)<br>`descripcion` VARCHAR(255)<br>`tipo` ENUM('git_release','audit_snapshot','recovery_point')<br>`estado_json` LONGTEXT<br>`creado_en` DATETIME DEFAULT CURRENT_TIMESTAMP | **PK:** `id_snapshot`<br>**IX:** `ix_snapshots_creado` | Copia de seguridad íntegra de usuarios, menú, mesas y pedidos para auditoría y Rollback atómico. |
| `restaurante_catalogo` | `productos` | `id_producto` INT AUTO_INCREMENT<br>`nombre` VARCHAR(100)<br>`descripcion` VARCHAR(255) NULL<br>`precio` DECIMAL(10,2)<br>`disponible` BOOLEAN DEFAULT TRUE | **PK:** `id_producto`<br>**IX:** `ix_productos_disponible` | **CHECK:** `precio > 0`<br>Previene precios en cero o negativos. |
| `restaurante_catalogo` | `mesas` | `id_mesa` INT AUTO_INCREMENT<br>`numero_mesa` INT | **PK:** `id_mesa`<br>**UQ:** `numero_mesa` | **CHECK:** `numero_mesa > 0`<br>Garantiza numeración física válida y sin duplicados. |
| `restaurante_pedidos` | `pedidos` | `id_pedido` INT AUTO_INCREMENT<br>`id_mesa` INT (Ref. lógica a mesas)<br>`id_usuario` INT (Ref. lógica a usuarios)<br>`fecha_pedido` DATETIME DEFAULT CURRENT_TIMESTAMP<br>`estado` ENUM('Pendiente','En preparación','Listo','Entregado')<br>`total` DECIMAL(10,2)<br>`mesa_activa` INT GENERATED ALWAYS AS (CASE WHEN estado IN ('Pendiente','En preparación','Listo') THEN id_mesa ELSE NULL END) STORED | **PK:** `id_pedido`<br>**UQ:** `uq_mesa_activa` (`mesa_activa`)<br>**IX:** `ix_pedidos_mesa`<br>**IX:** `ix_pedidos_estado`<br>**IX:** `ix_pedidos_estado_id` | **CHECK:** `total > 0`<br>**Candado Atómico RN-04:** La columna generada `mesa_activa` con índice UNIQUE impide a nivel de base de datos que existan 2 pedidos activos en la misma mesa. |
| `restaurante_pedidos` | `detalle_pedido` | `id_detalle` INT AUTO_INCREMENT<br>`id_pedido` INT<br>`id_producto` INT (Ref. lógica a productos)<br>`nombre_producto` VARCHAR(100)<br>`cantidad` INT<br>`precio_unitario` DECIMAL(10,2)<br>`subtotal` DECIMAL(10,2) | **PK:** `id_detalle`<br>**FK:** `fk_detalle_pedido` (id_pedido)<br>**IX:** `ix_detalle_producto`<br>**IX:** `ix_detalle_pedido_orden` | **ON DELETE RESTRICT** en `fk_detalle_pedido`.<br>**CHECK:** `cantidad > 0`<br>**CHECK:** `precio_unitario > 0`<br>**Snapshot Histórico RN-09:** Se copian `nombre_producto` y `precio_unitario` para congelar el valor facturado. |

### 1.2. Decisiones de Relación, Cardinalidad y Política de Borrado

1. **Relación `pedidos` → `detalle_pedido` (1 : N FÍSICA):**
   - **Cardinalidad:** 1 pedido contiene obligatoriamente 1 o muchas líneas de detalle; cada línea pertenece únicamente a una cabecera.
   - **Regla de Borrado:** `ON DELETE RESTRICT`. Está prohibido eliminar registros de pedidos que tengan líneas de detalle asociadas para preservar la trazabilidad fiscal y operativa.
2. **Relación `productos` → `detalle_pedido` (1 : N LÓGICA / HISTÓRICA):**
   - **Decisión de Microservicios:** Al pertenecer a bases de datos lógicas separadas (`restaurante_catalogo` y `restaurante_pedidos`), no se usa una Foreign Key cruzada física.
   - **Protección Referencial:** Antes de borrar físicamente un producto (`DELETE /api/productos/:id`), `ms-catalogo` consulta internamente a `ms-pedidos` (`GET /internal/pedidos/product/:id/has-history`). Si el producto figura en algún pedido histórico, la eliminación se rechaza con **HTTP 409 Conflict** (RN-10), instruyendo al usuario a marcarlo como `disponible = false` (RF-04).
3. **Relación `mesas` → `pedidos` (1 : N LÓGICA / HISTÓRICA):**
   - **Protección Referencial:** Similar a los productos, una mesa que tenga pedidos en el historial no puede borrarse físicamente. `ms-catalogo` consulta `GET /internal/pedidos/table/:id/has-history` y bloquea con **HTTP 409 Conflict**.
   - **Disponibilidad Derivada (RN-13):** La mesa no almacena un campo booleano manual de ocupación. Su estado (`Disponible` u `Ocupada`) se deriva consultando en paralelo si existe algún pedido activo (`Pendiente`, `En preparación` o `Listo`) asociado a ella.

---

## 2. CONSULTAS Y ESTRATEGIA DE TRANSACCIONES ACID

### 2.1. Inserción Atómica de Pedidos (Batch INSERT sin N+1)
Para cumplir con **RN-14** y **RN-04**, la creación de pedidos en `ms-pedidos` se ejecuta bajo aislamiento de transacción local:

```sql
-- 1. Candado lógico de aplicación contra colisiones concurrentes
SELECT GET_LOCK('gb:table:3', 5);

-- 2. Apertura de transacción
START TRANSACTION;

-- 3. Inserción de cabecera (valida atómicamente con uq_mesa_activa)
INSERT INTO pedidos (id_mesa, id_usuario, estado, total) 
VALUES (3, 2, 'Pendiente', 72000.00);

-- 4. Batch INSERT en una sola sentencia (evita problema N+1)
INSERT INTO detalle_pedido 
  (id_pedido, id_producto, nombre_producto, cantidad, precio_unitario, subtotal)
VALUES 
  (101, 1, 'Ojo de Bife Angosto (400g)', 1, 58000.00, 58000.00),
  (101, 12, 'Limonada de Hierbabuena', 1, 14000.00, 14000.00);

-- 5. Confirmación atómica
COMMIT;

-- 6. Liberación de candado
SELECT RELEASE_LOCK('gb:table:3');
```
*Si cualquier inserción falla o los precios no concuerdan con el catálogo vigente, se ejecuta `ROLLBACK` de forma inmediata sin dejar estados huérfanos.*

### 2.2. Transición Estricta de Estados en Cocina KDS con Bloqueo Pesimista
Para cumplir con **RN-05** y **RN-06** en `PATCH /api/pedidos/:id/estado`:

```sql
START TRANSACTION;

-- Bloqueo pesimista de fila para evitar condiciones de carrera entre meseros y cocineros
SELECT estado FROM pedidos WHERE id_pedido = 101 FOR UPDATE;

-- El backend valida la máquina de estados en memoria (transitionAllowed):
-- Cocinero: 'Pendiente' -> 'En preparación' | 'En preparación' -> 'Listo'
-- Mesero/Admin: 'Listo' -> 'Entregado'
UPDATE pedidos SET estado = 'En preparación' WHERE id_pedido = 101;

COMMIT;
```

---

## 3. SEGURIDAD DE LA BASE DE DATOS Y GESTIÓN DE RIESGOS

### 3.1. Auditoría de Riesgos Detectados y Correcciones Aplicadas

| Riesgo Detectado | Gravedad | Impacto Potencial | Corrección Aplicada en Sprint 2 (Mínimos Privilegios) |
|---|---|---|---|
| **Uso de usuario `root` sin contraseña en XAMPP** | **CRÍTICA** | Compromiso total del motor de base de datos; cualquier inyección o fallo permitiría leer/escribir todas las tablas del sistema operativo. | Se crearon 3 usuarios dedicados (`gb_usuarios`, `gb_catalogo`, `gb_pedidos`) en `000_crear_usuarios_app.sql` con acceso restringido únicamente a su base de datos asignada. |
| **Contraseñas o credenciales en texto plano en repositorios** | **ALTA** | Fuga de secretos en el historial de control de versiones Git. | Todas las credenciales se cargan exclusivamente desde variables de entorno (`.env`), el cual se encuentra estrictamente ignorado en `.gitignore`. Se provee `.env.example` como plantilla sanitizada. |
| **Ataques de Inyección SQL** | **CRÍTICA** | Extracción o alteración de datos arbitrarios mediante parámetros maliciosos. | El 100 % de las consultas en Node.js utilizan sentencias preparadas parametrizadas de `mysql2/promise` (`db.execute('SELECT ... WHERE id=?', [id])`). Queda prohibida la concatenación manual de strings. |
| **Ataques de Fuerza Bruta / Credenciales en Plano** | **ALTA** | Robo de cuentas mediante ataques de diccionario. | Las contraseñas se almacenan mediante **bcrypt** con costo de 12 rondas de salting (`bcrypt.hash(pass, 12)`). En respuestas JSON nunca se retornan contraseñas ni tokens en texto claro. |

### 3.2. Estrategia de Respaldo y Recuperación
1. **Respaldo Lógico Diario / Por Hitos:**
   ```bash
   mysqldump -u root -p --databases restaurante_usuarios restaurante_catalogo restaurante_pedidos --single-transaction --routines --triggers > backup_gourmet_bistro_$(date +%F).sql
   ```
2. **Puntos de Restauración en Caliente (Snapshots RF-20):** Implementados en tabla `system_snapshots`, permitiendo al Administrador revertir errores operativos en segundos mediante `POST /api/snapshots/:id/rollback`.

---

## 4. ARQUITECTURA DE LA API REST Y CONTRATOS DE INTEGRACIÓN

Los tres microservicios se comunican mediante HTTP REST interno validado con una clave compartida (`x-service-key`) de mínimo 32 caracteres.

```
                  Cliente Web SPA (Puerto 3000)
                               |
         +---------------------+---------------------+
         | (Proxy /api/auth)   | (Proxy /api/mesas)  | (Proxy /api/pedidos)
         v                     v                     v
+------------------+  +------------------+  +------------------+
|   ms-usuarios    |  |   ms-catalogo    |  |    ms-pedidos    |
|   Puerto :4001   |  |   Puerto :4002   |  |   Puerto :4003   |
+------------------+  +------------------+  +------------------+
         ^                     ^                     |
         |         /internal/* |                     |
         +---------------------+---------------------+
```

### 4.1. Catálogo de Códigos de Respuesta HTTP
- **`200 OK`**: Petición de consulta o actualización exitosa.
- **`201 Created`**: Recurso creado exitosamente (producto, mesa, pedido o snapshot).
- **`400 Bad Request`**: Formato de petición JSON ilegible.
- **`401 Unauthorized`**: Sesión inexistente, expirada o credenciales inválidas.
- **`403 Forbidden`**: El rol autenticado no posee permiso para la operación solicitada según la matriz RBAC.
- **`404 Not Found`**: El recurso con el identificador solicitado no existe.
- **`409 Conflict`**: Conflicto de negocio (mesa con pedido activo, producto/mesa con historial que prohíbe borrado físico, o total desactualizado).
- **`422 Unprocessable Entity`**: Error de validación en los esquemas de entrada (Zod).
- **`500 Internal Server Error`**: Excepción no controlada registrada en los logs del servidor.

---

## 5. DICCIONARIO Y DOCUMENTACIÓN DE ENDPOINTS REST

### 5.1. Microservicio `ms-usuarios` (Puerto 4001)

#### `POST /api/auth/login`
- **Roles:** Público.
- **Cuerpo (JSON):**
  ```json
  { "nombre_usuario": "admin", "contrasena": "AdminPass2026!" }
  ```
- **Respuesta (200 OK):** Emite Cookie HttpOnly `gb_session` (8 horas).
  ```json
  {
    "usuario": {
      "id_usuario": 1,
      "nombre_usuario": "admin",
      "rol": "administrador",
      "activo": true
    }
  }
  ```
- **Errores:** `401 Unauthorized` (Credenciales inválidas o cuenta desactivada), `422 Unprocessable Entity`.

#### `POST /api/auth/logout`
- **Roles:** Autenticado (`administrador`, `mesero`, `cocinero`).
- **Respuesta (200 OK):** Limpia cookie e invalida token hash en MySQL. `{"ok": true}`.

#### `GET /api/auth/me`
- **Roles:** Autenticado. Devuelve datos del usuario de la sesión actual.

#### `GET /api/usuarios`
- **Roles:** `administrador`.
- **Query params:** `limit` (default 50), `offset` (default 0).
- **Respuesta (200 OK):** Listado paginado de empleados (sin hash de contraseñas).

#### `POST /api/usuarios`
- **Roles:** `administrador`.
- **Cuerpo (JSON):**
  ```json
  {
    "nombre_usuario": "nuevo_mesero",
    "contrasena": "ClaveSegura2026!",
    "rol": "mesero"
  }
  ```
- **Respuesta (210 Created):** `{"usuario": { "id_usuario": 4, "nombre_usuario": "nuevo_mesero", "rol": "mesero", "activo": true }}`.
- **Errores:** `409 Conflict` (Nombre de usuario duplicado), `422` (Contraseña menor a 8 caracteres).

#### `PATCH /api/usuarios/:id`
- **Roles:** `administrador`. Actualiza rol o nombre de usuario. Al cambiar rol, revoca sesiones activas.

#### `PATCH /api/usuarios/:id/desactivar`
- **Roles:** `administrador`.
- **Comportamiento:** Marca `activo = 0` y revoca sesión. Impide desactivar al último administrador activo (`409 Conflict`).

#### `GET /api/versionamiento/git`
- **Roles:** `administrador`. Consulta la rama activa, hash HEAD y los últimos 10 commits vía Git real.

#### `GET /api/snapshots` y `POST /api/snapshots`
- **Roles:** `administrador`. Consulta y crea copias de restauración de todo el sistema persistidas en MySQL (`system_snapshots`).

#### `POST /api/snapshots/:id/rollback`
- **Roles:** `administrador`. Restaura el catálogo, mesas y pedidos de forma transaccional al punto seleccionado.

---

### 5.2. Microservicio `ms-catalogo` (Puerto 4002)

#### `GET /api/productos`
- **Roles:** `administrador`, `mesero`, `cocinero`.
- **Respuesta (200 OK):** Catálogo de productos con soporte de caché L1 en memoria y encabezado `X-Cache: HIT|MISS`.

#### `POST /api/productos`
- **Roles:** `administrador`.
- **Cuerpo (JSON):** `{"nombre": "Plato Gourmet", "descripcion": "Opcional", "precio": 35000.00}`.
- **Respuesta (201 Created):** `{"producto": { "id_producto": 15, ... }}`.

#### `PUT /api/productos/:id`
- **Roles:** `administrador`. Actualiza nombre, descripción o precio con named lock `gb:product:<id>`.

#### `PATCH /api/productos/:id/disponibilidad`
- **Roles:** `administrador`.
- **Cuerpo (JSON):** `{"disponible": false}`. Pausa el producto para pedidos nuevos (RF-04).

#### `DELETE /api/productos/:id`
- **Roles:** `administrador`.
- **Comportamiento:** Si tiene pedidos históricos, devuelve `409 Conflict` (RN-10). Solo borra si no tiene historial.

#### `GET /api/mesas`
- **Roles:** `administrador`, `mesero`.
- **Comportamiento:** Devuelve listado de mesas calculando `estado: 'Ocupada'` si tiene pedido activo en `ms-pedidos`, o `'Disponible'`.

#### `POST /api/mesas` | `PUT /api/mesas/:id` | `DELETE /api/mesas/:id`
- **Roles:** `administrador`. Creación (número entero positivo único), modificación y borrado protegido de mesas.

---

### 5.3. Microservicio `ms-pedidos` (Puerto 4003)

#### `GET /api/pedidos`
- **Roles:** `administrador`, `mesero`, `cocinero`.
- **Query params:** `estado` ('Pendiente', 'En preparación', 'Listo', 'Entregado').
- **Comportamiento:** Recupera las órdenes junto con sus líneas de `detalle_pedido` en un solo query agrupado (sin problema N+1).

#### `POST /api/pedidos`
- **Roles:** `administrador`, `mesero`.
- **Cuerpo (JSON):**
  ```json
  {
    "id_mesa": 2,
    "items": [
      { "id_producto": 1, "cantidad": 2 },
      { "id_producto": 12, "cantidad": 1 }
    ],
    "total_confirmado": 130000.00
  }
  ```
- **Comportamiento:** Valida disponibilidad en `ms-catalogo`, recalcula precios vigentes en el servidor. Si el precio cambió respecto a `total_confirmado`, rechaza con `409 Conflict`. Si la mesa está ocupada, rechaza por `uq_mesa_activa`. Inserta cabecera y detalles en transacción única.
- **Respuesta (201 Created):** Objeto del pedido con identificador generado.

#### `PATCH /api/pedidos/:id/estado`
- **Roles:** Evaluado dinámicamente según la transición:
  - `Pendiente` → `En preparación`: **Solo Cocinero**.
  - `En preparación` → `Listo`: **Solo Cocinero**.
  - `Listo` → `Entregado`: **Solo Mesero o Administrador**.
- **Comportamiento:** Bloqueo `FOR UPDATE` en transacción. Si un rol intenta una transición no autorizada o un salto ilegal, rechaza con `409 Conflict`.

---

## 6. REGISTRO DE CAMBIOS TÉCNICOS PROPUESTOS AL SRS

Conforme a las restricciones del proyecto, todas las adiciones y mejoras técnicas introducidas durante el desarrollo del Sprint 2 se consolidan a continuación para su incorporación formal en el documento SRS:

| ID Cambio | Requisito / Componente | Descripción de la Modificación / Adición | Justificación de Ingeniería |
|---|---|---|---|
| **CR-01** | **RN-04 / RF-05** (Candado de Mesa Ocupada) | Inclusión de la columna generada almacenada `mesa_activa` con restricción `UNIQUE KEY uq_mesa_activa` en la tabla `pedidos`. | Elimina condiciones de carrera a nivel de motor SQL cuando dos meseros intentan abrir una comanda simultáneamente en la misma mesa. |
| **CR-02** | **RF-20 / CU-12** (Versionamiento y Snapshots) | Creación de la tabla `system_snapshots` en `restaurante_usuarios` y endpoints de export/restore transaccionales. | Convierte el control de versiones de un estado volátil en memoria de frontend a una persistencia transaccional real en MySQL con trazabilidad de commits Git. |
| **CR-03** | **RNF-04 / RNF-05** (Seguridad de BD) | Creación del script `000_crear_usuarios_app.sql` con usuarios dedicados `gb_usuarios`, `gb_catalogo` y `gb_pedidos`. | Elimina la vulnerabilidad crítica de conectar los microservicios con privilegios totales de `root`. |
| **CR-04** | **RNF-03** (Rendimiento) | Indexación compuesta especializada (`004_performance_indexes.sql`), inserción por lote (Batch INSERT) y compresión Brotli/Gzip con caché L1. | Optimiza los tiempos de respuesta por debajo de 150 ms incluso en hardware modesto de servidor XAMPP. |
| **CR-05** | **Interfaz 2D vs. 3D** (Despliegue Ligero) | Reemplazo del visor pesado Three.js por la cascada visual 2D optimizada `FoodPlateShowcase.tsx` con `<picture>` WebP/AVIF. | Reduce el peso de descarga en ~636 kB y garantiza funcionamiento fluido en tabletas y móviles de gama baja sin sacrificar la identidad Jeton. |

---

## 7. LISTA DE VERIFICACIÓN DE ENTREGABLES DEL SPRINT 2

| # | Punto Evaluado del Sprint 2 | Estado | Evidencia en el Repositorio |
|---|---|---|---|
| 1 | **Esquema Relacional e Integridad** | **CUMPLIDO** | `001_usuarios.sql`, `002_catalogo.sql`, `003_pedidos.sql`, `004_performance_indexes.sql` y `005_snapshots.sql`. |
| 2 | **Consultas y Transacciones ACID** | **CUMPLIDO** | `conn.beginTransaction()`, Batch INSERT de líneas de comanda, bloqueo `SELECT ... FOR UPDATE` en `server.mjs`. |
| 3 | **Seguridad y Mínimos Privilegios** | **CUMPLIDO** | `000_crear_usuarios_app.sql` (3 usuarios SQL dedicados sin permisos de superusuario), consultas 100 % parametrizadas y `.env.example`. |
| 4 | **API REST y Manejo de Errores** | **CUMPLIDO** | Validación estricta con esquemas Zod en los 3 servicios y middleware centralizado `apiError` en `infra.mjs`. |
| 5 | **Autenticación y Autorización (RBAC)** | **CUMPLIDO** | Hash de contraseñas con `bcrypt` (12 rondas), sesiones en MySQL con cookies `HttpOnly`, y middleware `requireRole(...)`. |
| 6 | **Operaciones CRUD Completas** | **CUMPLIDO** | Implementadas para Menú (RF-01..04), Mesas (RF-12..13), Pedidos (RF-05..09), Cocina KDS (RF-10..11) y Usuarios (RF-14..15). |
| 7 | **Documentación de Endpoints** | **CUMPLIDO** | Especificación completa con métodos, rutas, cuerpos, códigos HTTP y roles en la Sección 5 de este informe. |
| 8 | **Pruebas de Calidad Automatizadas** | **CUMPLIDO** | `check:services` (0 errores sintácticos), `test:services` (5/5 PU de dominio aprobadas) y `test:e2e` (7/7 pruebas E2E aprobadas contra la API). |
