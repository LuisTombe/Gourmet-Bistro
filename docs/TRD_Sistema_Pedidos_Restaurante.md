# Documento de Requisitos Técnicos (TRD)

## Sistema de pedidos para restaurante

| Control documental | Información |
|---|---|
| Documento | Technical Requirements Document (TRD) |
| Proyecto | Sistema de pedidos para restaurante |
| Versión | 1.0 |
| Fecha | 10 de noviembre de 2026 |
| Estado | Especificación técnica consolidada de las decisiones aprobadas |
| Documento de referencia | `PRD_Sistema_Pedidos_Restaurante.md` |
| Alcance | MVP académico para un restaurante y tres roles internos |
| Metodología | Scrum simplificado, cuatro sprints de una semana |
| Decisión pendiente | **Plataforma de alojamiento definitivo: PENDIENTE DE DEFINIR** |

> **Límite del documento.** Este TRD explica **cómo** implementar los 18 requisitos funcionales (RF-01 a RF-18) y respetar los 12 requisitos no funcionales (RNF-01 a RNF-12) ya aprobados. No añade módulos de negocio, funciones comerciales ni tecnologías principales distintas de las acordadas. La elección de microservicios es una decisión expresa del proyecto, aunque supone mayor trabajo de integración que un monolito.

---

## Tabla de contenido

1. [Objetivo, alcance y principios técnicos](#1-objetivo-alcance-y-principios-técnicos)
2. [Stack tecnológico aprobado](#2-stack-tecnológico-aprobado)
3. [Arquitectura seleccionada y responsabilidades](#3-arquitectura-seleccionada-y-responsabilidades)
4. [Organización de código y entornos](#4-organización-de-código-y-entornos)
5. [Modelo de datos y persistencia](#5-modelo-de-datos-y-persistencia)
6. [Contratos de API REST](#6-contratos-de-api-rest)
7. [Comunicación entre microservicios](#7-comunicación-entre-microservicios)
8. [Autenticación, autorización y protección de secretos](#8-autenticación-autorización-y-protección-de-secretos)
9. [Reglas técnicas, validaciones y consistencia](#9-reglas-técnicas-validaciones-y-consistencia)
10. [Frontend React y navegación](#10-frontend-react-y-navegación)
11. [Pruebas y calidad](#11-pruebas-y-calidad)
12. [Despliegue, DevOps y observabilidad](#12-despliegue-devops-y-observabilidad)
13. [Cronograma, dependencias y entregables](#13-cronograma-dependencias-y-entregables)
14. [Riesgos, decisiones abiertas y límites](#14-riesgos-decisiones-abiertas-y-límites)
15. [Trazabilidad y criterios de aceptación del TRD](#15-trazabilidad-y-criterios-de-aceptación-del-trd)
16. [Uso controlado de inteligencia artificial](#16-uso-controlado-de-inteligencia-artificial)

---

## 1. Objetivo, alcance y principios técnicos

### 1.1. Objetivo

Establecer una especificación técnica implementable y verificable para el sistema web interno que administra productos del menú, mesas, pedidos y estados de preparación. El sistema debe operar con tres roles —**administrador, mesero y cocinero**— y conservar los datos en MySQL.

### 1.2. Alcance y correspondencia con el PRD

| Módulo del producto | Requisitos | Alcance técnico |
|---|---|---|
| Menú | RF-01 a RF-04 | CRUD permitido de productos, consulta y disponibilidad. |
| Pedidos | RF-05 a RF-09 | Registro y consulta por mesa, cantidades, totales y entrega. |
| Cocina | RF-10 a RF-11 | Consulta y avance autorizado de estados de preparación. |
| Administración | RF-12 a RF-15 | CRUD permitido de mesas y gestión de cuentas del personal. |
| Autenticación transversal | RF-16 a RF-18 | Inicio de sesión, autorización por rol y cierre de sesión revocable. |

**Exclusiones técnicas y funcionales:** pagos, caja o facturación electrónica; domicilios; reservas; inventario de ingredientes; registro público o cuentas de clientes; reportes financieros; notificaciones automáticas; WebSockets; aplicación móvil nativa; códigos QR o impresoras; soporte multi-restaurante; predicción o recomendaciones con IA; mensajería distribuida, Kubernetes y demás infraestructura no necesaria para el MVP.

### 1.3. Principios de implementación

1. Mantener la arquitectura de **tres microservicios** previamente elegida, sin descomponerla en más servicios.
2. Usar exclusivamente **React, Node.js y MySQL** como tecnologías centrales.
3. Mantener una sola instancia de MySQL con tres bases de datos lógicas separadas por responsabilidad.
4. Exponer APIs REST con HTTP y JSON, con validación obligatoria en el backend.
5. Proteger sesiones, credenciales y permisos sin introducir proveedores externos de autenticación.
6. Desarrollar por **capas con integración progresiva** y pruebas desde el segundo sprint.
7. Implementar las funcionalidades acordadas; no ampliar el alcance por sugerencia de herramientas de IA.

## 2. Stack tecnológico aprobado

| Capa / necesidad | Elección | Responsabilidad |
|---|---|---|
| Lenguaje | JavaScript | Lenguaje del frontend y de los microservicios. |
| Frontend | React | Componentes, formularios y navegación según rol. |
| Construcción frontend | Vite | Desarrollo local y compilación de React. |
| Diseño | CSS convencional | Interfaz responsive sin framework visual obligatorio. |
| Comunicación de React | Fetch API | Solicitudes HTTP/JSON a las rutas `/api`. |
| Ejecución backend | Node.js | Ejecutar los tres servicios. |
| Framework backend | Express | Definir rutas, controladores y middleware. |
| Persistencia | MySQL | Una instancia; tres bases de datos lógicas. |
| Conector | `mysql2` | Acceso a MySQL mediante consultas parametrizadas y transacciones. |
| Validación | Zod | Validar contratos de entrada en los servicios. |
| Contraseñas | bcrypt | Crear y comprobar hashes seguros de contraseñas. |
| Configuración local | dotenv y archivos `.env` | Cargar configuración no incluida en el repositorio. |
| Versiones y colaboración | Git y GitHub | Historial, revisiones y evidencia de avances. |
| Pruebas de endpoints | Postman | Probar API REST y comunicación entre servicios. |
| Pruebas unitarias | Node.js Test Runner (`node:test`) | Validar funciones críticas sin framework adicional. |
| Editor | Visual Studio Code | Desarrollo y edición del proyecto. |

Las versiones exactas y compatibles se fijarán en `package.json` al iniciar la implementación; no se declaran números de versión arbitrarios en este documento. No se introduce ORM, BaaS, caché distribuida, framework de estilos adicional ni librerías de HTTP innecesarias.

## 3. Arquitectura seleccionada y responsabilidades

### 3.1. Decisión: microservicios mínimos

Se aprobó expresamente la **arquitectura D: microservicios**, no la alternativa monolítica inicialmente recomendada. Para hacerla viable dentro de cuatro semanas se limita a **tres procesos Node.js independientes**, con una API y una base de datos lógica por servicio. Los cuatro módulos funcionales del producto **no** se traducen en cuatro microservicios.

```text
NAVEGADOR
  |
  | HTTPS: aplicación React y rutas públicas /api
  v
FRONTEND REACT + ENTRADA WEB / ENRUTAMIENTO HTTP
  |                    |                     |
  | /api/auth          | /api/productos      | /api/pedidos
  | /api/usuarios      | /api/mesas          |
  v                    v                     v
SERVICIO USUARIOS   SERVICIO CATÁLOGO    SERVICIO PEDIDOS
(Node.js/Express)   (Node.js/Express)    (Node.js/Express)
  |                    |                     |
  v                    v                     v
BD usuarios          BD catálogo           BD pedidos
                  (misma instancia MySQL)

Las llamadas entre microservicios se realizan mediante HTTP interno.
```

La entrada web publica React y dirige `/api` al servicio correspondiente; **no constituye un cuarto microservicio de negocio**. En local, se puede utilizar el proxy de Vite; en el alojamiento final se configurará el enrutamiento HTTPS equivalente. La elección del servidor o proveedor para esa entrada permanece pendiente.

### 3.2. Responsabilidades y propiedad de datos

| Servicio | Responsabilidades exclusivas | Base lógica | Tablas propias |
|---|---|---|---|
| **Usuarios** | Autenticación, sesiones, permisos y administración del personal. | `restaurante_usuarios` | `usuarios` |
| **Catálogo** | Productos del menú, disponibilidad de productos y administración de mesas. | `restaurante_catalogo` | `productos`, `mesas` |
| **Pedidos** | Registro y consulta de pedidos, detalle, total, entrega y estados de cocina. | `restaurante_pedidos` | `pedidos`, `detalle_pedido` |

Reglas de propiedad:

- Cada microservicio consulta y modifica **solo sus propias tablas** mediante una cuenta MySQL restringida a la base correspondiente.
- Los servicios **no** comparten conexiones SQL para acceder a tablas ajenas.
- La información administrada por otro servicio se consulta mediante una API interna.
- No se usan transacciones distribuidas, colas, eventos asíncronos, servicio de descubrimiento ni gateway de negocio adicional.

### 3.3. Responsabilidad de módulos y roles

| Acción | Administrador | Mesero | Cocinero |
|---|:---:|:---:|:---:|
| Iniciar/cerrar sesión | Sí | Sí | Sí |
| Consultar menú | Sí | Sí | Sí |
| Crear, modificar, eliminar productos permitidos; ajustar disponibilidad | Sí | No | No |
| Consultar mesas/disponibilidad | Sí | Sí | No |
| Crear, modificar y eliminar mesas permitidas | Sí | No | No |
| Registrar pedidos | Sí | Sí | No |
| Consultar pedidos | Sí | Sí | Sí |
| Avanzar `Pendiente → En preparación → Listo` | No | No | Sí |
| Marcar `Listo → Entregado` | Sí | Sí | No |
| Crear, consultar, modificar y desactivar usuarios | Sí | No | No |

Las opciones visibles en React obedecerán esta matriz, pero **la verificación obligatoria será siempre del backend**.

## 4. Organización de código y entornos

### 4.1. Repositorio único con servicios separados

```text
sistema-pedidos-restaurante/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   └── package.json
├── backend/
│   ├── usuarios/
│   │   ├── src/        # rutas, controladores, middleware y config
│   │   └── package.json
│   ├── catalogo/
│   │   ├── src/
│   │   └── package.json
│   └── pedidos/
│       ├── src/
│       └── package.json
├── database/
│   ├── usuarios/        # scripts SQL versionados
│   ├── catalogo/
│   └── pedidos/
├── docs/                 # SRS, PRD, TRD, PLAN, USER FLOW,
│                         # historias, backlog, diagramas y pruebas
├── .gitignore
└── README.md
```

La organización interna de cada `src/` será pequeña: rutas, controladores, validaciones, acceso a datos, middleware y configuración según necesidad. La estructura no impone capas complejas ni patrones adicionales.

### 4.2. Entornos

| Entorno | Uso | Condiciones |
|---|---|---|
| **Local** | Desarrollo y verificación de APIs y React. | Procesos Node.js, Vite y MySQL en los computadores del equipo; secretos en `.env` ignorados por Git. |
| **Prueba integrada** | Validación del MVP en semana 3. | Puede ejecutarse localmente o en red local; participan los tres roles con datos ficticios. |
| **Desplegado final** | Pruebas finales y sustentación en semana 4. | URL pública HTTPS, tres servicios activos y MySQL persistente; **proveedor por definir**. |

Se utilizará la misma estructura de API y de datos entre entornos, con configuración externa a través de variables de entorno. No se exige una infraestructura adicional de *staging* ni un sistema avanzado de CI/CD.

## 5. Modelo de datos y persistencia

### 5.1. Motor y esquema aprobado

- **Motor:** MySQL (decisión aprobada).
- **Instancias:** una.
- **Bases de datos lógicas:** tres, separadas por microservicio.
- **Tablas principales:** cinco.
- **Migraciones:** scripts SQL versionados, sin ORM.
- **Datos personales:** únicamente cuentas del personal; no existen clientes registrados.

### 5.2. Diccionario técnico de tablas

#### Base `restaurante_usuarios` — Tabla `usuarios`

| Campo | Tipo propuesto | Restricción / uso |
|---|---|---|
| `id_usuario` | INT | PK, autoincremental. |
| `nombre_usuario` | VARCHAR(50) | Obligatorio, único. |
| `contrasena_hash` | VARCHAR(255) | Obligatorio; hash bcrypt, no contraseña en claro. |
| `rol` | ENUM('administrador','mesero','cocinero') | Obligatorio; solo tres valores autorizados. |
| `activo` | BOOLEAN | Obligatorio; controla acceso a la cuenta. |
| `sesion_token_hash` | VARCHAR(255), NULL | Hash del token aleatorio de sesión activa. |
| `sesion_expira_en` | DATETIME, NULL | Límite temporal de la sesión. |

**Decisión aprobada:** los dos últimos campos se añaden a la tabla `usuarios` para soportar sesiones revocables **sin crear una sexta tabla**. El diseño admite **una sesión activa por cuenta**. La duración exacta de la sesión es configurable, no se inventa un tiempo en esta especificación.

#### Base `restaurante_catalogo` — Tabla `productos`

| Campo | Tipo propuesto | Restricción / uso |
|---|---|---|
| `id_producto` | INT | PK, autoincremental. |
| `nombre` | VARCHAR(100) | Obligatorio. |
| `descripcion` | VARCHAR(255), NULL | Opcional. |
| `precio` | DECIMAL(10,2) | Obligatorio y mayor que cero. |
| `disponible` | BOOLEAN | Obligatorio; habilita o impide nuevos pedidos. |

La eliminación física solo se permitirá cuando el producto **no** esté asociado a detalles de pedidos históricos. Para productos utilizados antes y que ya no se ofrecen, se usará `disponible = false`.

#### Base `restaurante_catalogo` — Tabla `mesas`

| Campo | Tipo propuesto | Restricción / uso |
|---|---|---|
| `id_mesa` | INT | PK, autoincremental. |
| `numero_mesa` | INT | Obligatorio, entero positivo y único. |

**No existe un campo de estado de mesa.** La mesa es *Ocupada* si tiene un pedido activo (`Pendiente`, `En preparación` o `Listo`) y es *Disponible* si no lo tiene. La disponibilidad se calcula consultando al servicio de pedidos.

La eliminación física está prohibida si la mesa aparece en cualquier pedido histórico.

#### Base `restaurante_pedidos` — Tabla `pedidos`

| Campo | Tipo propuesto | Restricción / uso |
|---|---|---|
| `id_pedido` | INT | PK, autoincremental. |
| `id_mesa` | INT | Identificador lógico de una mesa del catálogo. |
| `id_usuario` | INT | Identificador lógico del usuario que registra el pedido. |
| `fecha_pedido` | DATETIME | Fecha y hora del registro. |
| `estado` | ENUM('Pendiente','En preparación','Listo','Entregado') | Obligatorio; empieza en `Pendiente`. |
| `total` | DECIMAL(10,2) | Total calculado en servidor. |

El estado `Entregado` cierra el pedido. **No se agregan estados** `Cancelado`, `Devuelto`, `Rechazado` u otros.

#### Base `restaurante_pedidos` — Tabla `detalle_pedido`

| Campo | Tipo propuesto | Restricción / uso |
|---|---|---|
| `id_detalle` | INT | PK, autoincremental. |
| `id_pedido` | INT | FK **física** hacia `pedidos.id_pedido`. |
| `id_producto` | INT | Identificador lógico del producto en catálogo. |
| `nombre_producto` | VARCHAR(100) | Copia del nombre cuando se registró el pedido. |
| `cantidad` | INT | Entero positivo. |
| `precio_unitario` | DECIMAL(10,2) | Copia del precio vigente durante el registro. |
| `subtotal` | DECIMAL(10,2) | `cantidad × precio_unitario`. |

El detalle conserva nombre y precio históricos aunque el catálogo cambie después. El total de `pedidos` deberá coincidir con la suma de los subtotales de sus detalles.

### 5.3. Relaciones y límites referenciales

```text
usuarios (1)  - - -  (N) pedidos
mesas    (1)  - - -  (N) pedidos
pedidos  (1)  ------- (N) detalle_pedido
productos(1)  - - -  (N) detalle_pedido

------ relación con FK física dentro de una misma BD
- - -  relación lógica entre bases y microservicios
```

| Relación | Cardinalidad | Mecanismo |
|---|---|---|
| Usuario / pedidos | 1:N | Validación lógica por API de Usuarios. |
| Mesa / pedidos | 1:N histórico | Validación lógica por API de Catálogo. |
| Pedido / detalle | 1:N | FK física interna a la BD Pedidos. |
| Producto / detalle | 1:N histórico | Validación lógica por API de Catálogo. |

No deben crearse claves foráneas entre bases de distintos microservicios, porque romperían su separación de responsabilidades. Los identificadores externos se verifican mediante APIs internas y controles de negocio.

### 5.4. Restricciones de consistencia

1. `usuarios.nombre_usuario` y `mesas.numero_mesa` son únicos.
2. Los precios son mayores que cero; las cantidades son enteros mayores que cero.
3. Cada pedido contiene al menos un detalle.
4. Cada mesa admite **máximo un pedido activo**. Esta regla debe hacerse cumplir **atómicamente** en la BD del servicio Pedidos, no solo mediante una consulta previa. Una alternativa técnica compatible con MySQL es un índice único sobre un valor derivado para `id_mesa` únicamente cuando `estado <> 'Entregado'`, definido dentro del script SQL de Pedidos. Así se evita una carrera entre dos solicitudes simultáneas sin crear otra tabla de negocio.
5. El registro de pedido y detalles se realiza dentro de **una transacción local** en `restaurante_pedidos`: se confirma todo o se revierte todo.
6. Los precios se obtienen del Catálogo al confirmar, no se confía en importes enviados por React.
7. El detalle conserva la instantánea de nombre y precio; cambios posteriores del menú no alteran pedidos históricos.
8. Las transiciones permitidas son exactamente `Pendiente → En preparación → Listo → Entregado`.
9. No se eliminan físicamente productos o mesas con referencias históricas.
10. Los datos persisten tras cerrar/reabrir la aplicación y reiniciar servicios.

**Límite de consistencia distribuida:** no existe una transacción MySQL compartida entre servicios. La validación por HTTP de productos, mesas y referencias históricas debe realizarse inmediatamente antes de la operación y los cambios concurrentes deben probarse. En particular, una simple secuencia «consultar referencias y después eliminar» no garantiza por sí sola ausencia de carreras entre servicios: las eliminaciones se habilitarán únicamente cuando el servicio pueda asegurar el control de referencias durante la operación; de lo contrario se rechazarán de forma segura. No se promete una garantía distribuida inexistente.

### 5.5. Migraciones SQL versionadas

- Guardar scripts `.sql` numerados y ordenados bajo `database/usuarios`, `database/catalogo` y `database/pedidos`.
- Cada carpeta contendrá las instrucciones de creación y cambios de **su** esquema.
- Registrar en GitHub cada modificación de estructuras o restricciones.
- Aplicar los scripts sobre entornos nuevos en su orden documentado.
- Antes de modificar un esquema con datos, realizar una copia de seguridad básica.
- No hacer modificaciones directas no documentadas a la base final.
- Mantener la **misma estructura lógica** de los esquemas entre desarrollo y despliegue.

El mecanismo elegido es **SQL versionado (alternativa A)**; no se utilizarán Prisma Migrate, Sequelize, Knex ni Liquibase como requisito de este proyecto.

## 6. Contratos de API REST

### 6.1. Convenciones comunes

- **Formato de intercambio:** JSON.
- **Protocolos:** HTTP en redes internas protegidas; HTTPS para el acceso público.
- **Prefijo público:** `/api`.
- **Autenticación:** cookie de sesión HttpOnly; permisos revisados por el backend.
- **Entrada:** se validará con Zod y comprobaciones de negocio.
- **Salida:** respuestas consistentes, sin exponer SQL, contraseñas ni secretos.
- **Métodos:** GET (consulta), POST (creación), PUT (modificación de recurso), PATCH (cambio parcial/estado), DELETE (eliminación autorizada).

### 6.2. Microservicio Usuarios

| Método | Ruta pública | Función | Permiso |
|---|---|---|---|
| POST | `/api/auth/login` | Verificar credenciales y crear sesión. | Sin sesión |
| POST | `/api/auth/logout` | Revocar sesión activa. | Autenticado |
| GET | `/api/auth/me` | Consultar sesión y datos básicos del usuario. | Autenticado |
| GET | `/api/usuarios` | Consultar cuentas. | Administrador |
| POST | `/api/usuarios` | Crear cuenta con rol permitido. | Administrador |
| PATCH | `/api/usuarios/:id` | Modificar datos básicos o rol. | Administrador |
| PATCH | `/api/usuarios/:id/desactivar` | Desactivar cuenta e invalidar su sesión. | Administrador |

No se implementan registro público, recuperación por correo ni inicio de sesión con terceros. La primera cuenta administradora se prepara mediante un procedimiento técnico inicial controlado, no mediante un endpoint público de autorregistro.

### 6.3. Microservicio Catálogo y mesas

| Método | Ruta pública | Función | Permiso |
|---|---|---|---|
| GET | `/api/productos` | Consultar menú. | Administrador, mesero, cocinero |
| POST | `/api/productos` | Registrar producto. | Administrador |
| PUT | `/api/productos/:id` | Modificar producto. | Administrador |
| PATCH | `/api/productos/:id/disponibilidad` | Activar/desactivar disponibilidad. | Administrador |
| DELETE | `/api/productos/:id` | Eliminar producto sin historial asociado. | Administrador |
| GET | `/api/mesas` | Consultar mesas y disponibilidad derivada. | Administrador, mesero |
| POST | `/api/mesas` | Registrar mesa. | Administrador |
| PUT | `/api/mesas/:id` | Modificar mesa. | Administrador |
| DELETE | `/api/mesas/:id` | Eliminar mesa sin historial asociado. | Administrador |

La consulta de disponibilidad de mesas depende de la situación de pedidos activos. Cuando no sea posible comprobarla, el servicio no debe inventar un estado *Disponible*.

### 6.4. Microservicio Pedidos y cocina

| Método | Ruta pública | Función | Permiso |
|---|---|---|---|
| GET | `/api/pedidos` | Consultar pedidos; filtrado por estado cuando se solicite. | Tres roles |
| GET | `/api/pedidos/:id` | Consultar detalle de un pedido. | Tres roles |
| POST | `/api/pedidos` | Crear pedido con productos y cantidades. | Administrador, mesero |
| PATCH | `/api/pedidos/:id/estado` | Avanzar estado según rol. | Cocinero (preparación); administrador/mesero (entrega) |

No existe `DELETE /api/pedidos` ni edición del contenido de pedidos ya registrados porque no fueron aprobados.

### 6.5. Ejemplo de contrato para registrar un pedido

**Entrada esperada (ejemplo ilustrativo):**

```json
{
  "id_mesa": 3,
  "productos": [
    { "id_producto": 1, "cantidad": 2 },
    { "id_producto": 4, "cantidad": 1 }
  ]
}
```

`id_usuario` procede de la sesión validada, no de un valor de confianza enviado por el navegador. Los precios, nombre histórico, subtotales y total se obtienen o calculan en el backend.

**Respuesta exitosa (ejemplo ilustrativo):**

```json
{
  "mensaje": "Pedido registrado correctamente",
  "pedido": {
    "id_pedido": 15,
    "id_mesa": 3,
    "estado": "Pendiente",
    "total": 45000
  }
}
```

Los identificadores y cantidades de estos ejemplos son ficticios; no se refieren a registros reales.

### 6.6. Convención mínima de errores

| HTTP | Uso |
|---|---|
| 200 | Consulta o modificación exitosa. |
| 201 | Recurso creado. |
| 400 | Datos o formato inválidos. |
| 401 | Sin autenticación o sesión inválida. |
| 403 | Sin permisos para la operación. |
| 404 | Registro inexistente. |
| 409 | Conflicto de negocio: mesa ocupada o nombre/número duplicado. |
| 500 | Error interno del servidor. |

El cuerpo de error contendrá un mensaje comprensible y, cuando corresponda, el campo inválido. Los errores de dependencias indisponibles se comunicarán como fallos del servidor sin confirmar operaciones ni revelar detalles sensibles.

## 7. Comunicación entre microservicios

### 7.1. Dependencias aprobadas

| Origen | Destino | Motivo |
|---|---|---|
| Pedidos | Usuarios | Verificar sesión, rol y cuenta activa. |
| Catálogo | Usuarios | Verificar sesión y permisos en operaciones protegidas. |
| Pedidos | Catálogo | Comprobar mesa, productos disponibles, precios y nombres vigentes. |
| Catálogo | Pedidos | Consultar ocupación de mesas y referencias históricas antes de permitir eliminación. |
| Frontend | Servicios vía `/api` | Ejecutar operaciones autorizadas sin conectarse directamente a MySQL. |

### 7.2. Reglas de comunicación

1. Las comunicaciones internas son HTTP entre servicios, usando direcciones privadas/configuradas.
2. Las rutas internas no deben publicarse sin protección al internet abierto.
3. Los servicios validan el origen/autorización de las solicitudes internas; no confían en encabezados de rol suministrados por el navegador.
4. Las peticiones internas tendrán tiempo máximo de espera configurado.
5. Si una validación imprescindible depende de un servicio caído, **la operación se rechaza** y no se presenta éxito falso.
6. No habrá WebSockets, colas, procesos de sincronización offline ni cache distribuida.
7. Cuando el resultado de una creación sea desconocido por fallo de red, la UI facilitará consultar el pedido antes de reintentar para reducir duplicados.

### 7.3. Consistencia y concurrencia

- **Dos meseros, misma mesa:** la restricción de unicidad de pedido activo se controla de forma atómica dentro de Pedidos. El segundo intento recibe una respuesta de conflicto.
- **Error durante creación:** transacción local deshace el pedido y sus detalles.
- **Producto cambiado tras seleccionar:** al confirmar, Pedidos consulta el catálogo y usa el precio vigente; la interfaz debe permitir revisar el nuevo total antes de una confirmación distinta si el precio cambió durante la preparación del formulario.
- **Producto o mesa referenciados por pedidos:** las eliminaciones físicas se rechazan, asegurando que el historial no quede huérfano.
- **Estado modificado por otra persona:** se valida el estado persistido antes de actualizar; no se permiten saltos, retrocesos ni cambios después de `Entregado`.

## 8. Autenticación, autorización y protección de secretos

### 8.1. Estrategia aprobada: sesión revocable

1. Un usuario envía nombre de usuario y contraseña desde React.
2. Usuarios comprueba cuenta activa y hash bcrypt.
3. Si los datos son correctos, genera un **token de sesión aleatorio**.
4. Almacena **solo el hash del token** y su expiración en los dos campos adicionales de `usuarios`.
5. Envía el token al navegador mediante cookie con `HttpOnly` y `SameSite`; `Secure` cuando la conexión es HTTPS (obligatoria en despliegue público).
6. Los servicios protegidos comprueban la sesión y el rol mediante Usuarios; el navegador no define su propio rol confiable.
7. En el cierre de sesión se invalida el token guardado en el servidor y se elimina la cookie.
8. Si se desactiva una cuenta, también se invalida su sesión.

**Restricción asumida y aprobada:** un único token de sesión activo por cuenta. El segundo inicio de sesión podrá sustituir el token previo. El tiempo exacto de expiración será una configuración de seguridad del entorno, no una nueva funcionalidad.

### 8.2. Protección en tránsito y de operaciones

- HTTPS para la aplicación publicada.
- Un mismo origen público para frontend y rutas `/api`, mediante el enrutamiento web, para simplificar las cookies.
- Verificación del origen de solicitudes de modificación y configuración adecuada de `SameSite` para reducir CSRF.
- Revisión de roles en rutas protegidas y en la transición de estados.
- Contraseñas con bcrypt y consultas parametrizadas con `mysql2`.
- Mensajes genéricos al usuario para fallos técnicos; logs sin contraseñas ni tokens.
- Si el cierre de sesión remoto no puede confirmarse por un fallo de red, el frontend puede borrar su cookie local, **pero no debe afirmar que el servidor revocó el token** sin confirmación.

### 8.3. Configuración de secretos

**Estrategia seleccionada: A + B.** Archivos `.env` excluidos del repositorio en desarrollo y variables de entorno suministradas por la plataforma en despliegue.

Los valores configurables incluirán, según el proceso: conexión y credenciales MySQL de cada servicio, puertos, direcciones internas de microservicios, credencial de comunicación interna si se utiliza y parámetros de sesión. Nunca se incorporarán claves o contraseñas reales a la documentación, React o GitHub.

No se requieren Docker Secrets, HashiCorp Vault ni un administrador de secretos independiente.

### 8.4. Primera cuenta administradora

La aplicación requiere una cuenta inicial para crear las demás. El procedimiento técnico de aprovisionamiento deberá introducir credenciales de forma controlada y generar su hash con bcrypt. No se habilitará registro público ni se distribuirán credenciales predeterminadas en el repositorio.

## 9. Reglas técnicas, validaciones y consistencia

### 9.1. Validación seleccionada: Zod

Se eligió **Zod (alternativa A)** para validar la estructura y los valores de entrada en Node.js. React realizará verificaciones sencillas para guiar al usuario, pero nunca reemplazará la validación del backend.

| Datos | Validación básica | Validación de negocio |
|---|---|---|
| Usuario | Nombre, contraseña requerida al crear, rol entre tres opciones. | Usuario único, cuenta activa y rol autorizado. |
| Producto | Nombre obligatorio, precio numérico mayor que cero, descripción opcional. | Disponibilidad para nuevos pedidos y eliminación restringida por historial. |
| Mesa | Número entero positivo. | Número único y ausencia de referencias históricas para eliminar. |
| Pedido | Mesa indicada, lista no vacía, identificadores y cantidades positivas. | Mesa existente y libre, productos existentes/disponibles, precios de catálogo. |
| Cambio de estado | Estado recibido de los cuatro permitidos. | Transición inmediata válida y rol con permiso. |

### 9.2. Máquina de estados

| Estado actual | Siguiente permitido | Actor autorizado |
|---|---|---|
| Pendiente | En preparación | Cocinero |
| En preparación | Listo | Cocinero |
| Listo | Entregado | Mesero o administrador |
| Entregado | Ninguno | Ninguno |

El pedido se crea en `Pendiente`. No puede pasar directamente de Pendiente a Listo, retroceder de Listo a En preparación ni cambiar una vez Entregado.

### 9.3. Formato monetario y cálculos

- Los precios, subtotales y totales se almacenarán en `DECIMAL(10,2)`, no en números de punto flotante para persistencia monetaria.
- `subtotal = cantidad × precio_unitario`.
- `total = suma de subtotales`.
- El backend obtiene los precios del catálogo y calcula el total; React muestra un resumen, pero no decide el importe definitivo.
- La interfaz puede presentar el total en pesos colombianos (COP) sin agregar módulo de cobros.

### 9.4. Eliminación y conservación histórica

- No borrar productos o mesas que aparezcan en pedidos ya registrados.
- Los pedidos entregados y sus detalles permanecen registrados.
- Desactivar usuario mantiene sus referencias históricas y revoca su acceso.
- No implementar cancelación o eliminación de pedidos registrados.

## 10. Frontend React y navegación

### 10.1. Páginas y rutas aprobadas

| Ruta | Función | Acceso |
|---|---|---|
| `/login` | Inicio de sesión. | No autenticado |
| `/admin` | Panel administrativo. | Administrador |
| `/admin/productos` | Gestión del menú. | Administrador |
| `/admin/mesas` | Gestión de mesas. | Administrador |
| `/admin/usuarios` | Gestión del personal. | Administrador |
| `/mesero` | Mesas y pedidos. | Mesero |
| `/mesero/nuevo-pedido` | Registro de pedido. | Mesero |
| `/mesero/pedidos` | Consulta y confirmación de entrega. | Mesero |
| `/cocina` | Lista y preparación de pedidos. | Cocinero |

El administrador reutilizará componentes y operaciones de pedidos desde su panel, sin duplicar lógica. La estructura no obliga a un framework de routing específico; la solución elegida al implementarse deberá mantener estas rutas y permisos.

### 10.2. Comportamiento de inicio y sesión

- Sin sesión válida: mostrar `/login`.
- Con sesión válida: dirigirse al panel correspondiente al rol.
- Mientras se comprueba sesión: mostrar carga, **sin enseñar brevemente pantallas protegidas**.
- Sin permiso: denegar la operación y llevar al usuario a su panel permitido.
- Tras cierre o expiración: regresar a `/login`.

### 10.3. Estados visuales aprobados

| Estado | Regla de UI |
|---|---|
| **Carga** | Indicador durante consulta/envío; evitar doble envío de formularios. |
| **Vacío** | Mensaje descriptivo tras consulta exitosa sin registros. |
| **Error** | Mensaje claro, campos identificados si corresponde y posibilidad de corregir/reconsultar. |
| **Éxito** | Confirmación solo después de respuesta válida del servidor; actualización de lista o estado. |

Los errores técnicos no se mostrarán como «lista vacía». Si la respuesta de un registro se pierde, la interfaz no supondrá éxito ni reenviará automáticamente la solicitud; permitirá revisar si el pedido existe.

### 10.4. Flujo principal aprobado

1. Administrador registra productos, mesas y cuentas.
2. Mesero selecciona mesa **Disponible** y crea un pedido con productos y cantidades.
3. Pedidos valida, calcula y guarda el pedido en **Pendiente**; la mesa se considera **Ocupada**.
4. Cocinero consulta y avanza el pedido a **En preparación**, después a **Listo**.
5. Mesero o administrador marca el pedido **Entregado**.
6. El pedido histórico permanece; la mesa se considera nuevamente **Disponible**.

La actualización de listas se hará mediante consultas HTTP normales; no es requisito tener refresco automático en tiempo real.

### 10.5. Diseño responsive

- Interfaces legibles en computadora, tableta y teléfono.
- Formularios y acciones accesibles desde pantallas pequeñas, sin desbordamientos horizontales en las pantallas principales.
- Navegación diferenciada por rol, botones claros y mensajes próximos al campo incorrecto.
- Verificar en versiones actuales de Chrome y Edge.
- No usar efectos, gráficas o pantallas extra ajenos al alcance.

## 11. Pruebas y calidad

### 11.1. Herramientas elegidas

| Alternativa aprobada | Tipo | Uso |
|---|---|---|
| A | Pruebas funcionales manuales | Verificar los recorridos reales por navegador. |
| B | Pruebas de integración con Postman | Verificar endpoints, persistencia y comunicación. |
| C | Pruebas unitarias con Node.js Test Runner | Comprobar funciones críticas aisladas. |

No se exige Playwright, Supertest, Jest, cobertura porcentual obligatoria ni plataformas externas de testing.

### 11.2. Casos funcionales obligatorios (CP-01 a CP-16)

| ID | Comprobación | Aceptación |
|---|---|---|
| CP-01 | Inicio de sesión correcto | Entra según rol. |
| CP-02 | Credenciales erróneas o cuenta desactivada | Acceso rechazado. |
| CP-03 | Operación sin permiso | Backend la deniega. |
| CP-04 | Alta de producto válido | Persistencia y consulta correctas. |
| CP-05 | Producto sin nombre o precio inválido | Validación lo rechaza. |
| CP-06 | Modificar producto | Cambios persistidos. |
| CP-07 | Eliminar producto sin historial | Eliminación permitida. |
| CP-08 | Registrar pedido válido | Total correcto y estado Pendiente. |
| CP-09 | Pedido vacío o cantidades inválidas | Registro rechazado. |
| CP-10 | Segundo pedido activo en la misma mesa | Conflicto y ausencia de duplicado. |
| CP-11 | Avanzar preparación | Pendiente → En preparación → Listo. |
| CP-12 | Transición ilegal | Rechazada sin alterar el estado. |
| CP-13 | Entregar pedido listo | Estado Entregado y mesa Disponible. |
| CP-14 | Eliminar mesa con historial | Operación rechazada. |
| CP-15 | Crear/desactivar cuenta | Alta válida; cuenta desactivada no accede. |
| CP-16 | Cerrar sesión | Sesión revocada e imposibilidad de seguir operando. |

### 11.3. Pruebas de integración (PI-01 a PI-06)

| ID | Comunicación | Resultado esperado |
|---|---|---|
| PI-01 | React ↔ API REST | Envío y recepción válidos. |
| PI-02 | API REST ↔ MySQL | Escritura, lectura y persistencia correctas. |
| PI-03 | Pedidos → Cocina | Nuevo pedido visible para preparación. |
| PI-04 | Cocina → Pedidos | Cambio de estado visible al consultar. |
| PI-05 | Pedidos ↔ Mesas | Ocupación y liberación coherentes. |
| PI-06 | Usuarios ↔ Autorización | Rol y sesión respetados en operaciones protegidas. |

Por la elección de microservicios, verificar además: servicio dependiente no disponible, concurrencia de dos pedidos para una misma mesa y reversión ante fallo al guardar detalles. Son comprobaciones de integridad de los mismos requisitos, no nuevas funciones.

### 11.4. Pruebas unitarias mínimas (PU-01 a PU-05)

| ID | Lógica |
|---|---|
| PU-01 | Total como suma de subtotales. |
| PU-02 | Cantidades enteras y mayores que cero. |
| PU-03 | Precios numéricos y mayores que cero. |
| PU-04 | Transiciones autorizadas de estado. |
| PU-05 | Matriz de permisos por rol. |

### 11.5. Calidad y criterios de aprobación

- Superar **16/16** pruebas funcionales críticas, **6/6** de integración y **5/5** unitarias propuestas.
- No dejar errores críticos conocidos sin corregir.
- Comprobar persistencia, sesión y permisos en el entorno integrado.
- Verificar diseño responsive y navegadores acordados.
- Tomar como objetivo para operaciones básicas **hasta 3 segundos** en pruebas normales con pocos datos, sin declarar capacidad de alta carga.
- Registrar por prueba: ID, condición, resultado esperado, resultado obtenido, estado y evidencia.
- Ninguna prueba se considera aprobada porque la IA lo afirme: debe ejecutarse.

## 12. Despliegue, DevOps y observabilidad

### 12.1. Estado de la decisión de alojamiento

**PENDIENTE DE DEFINIR.** El usuario aprobó el enfoque de despliegue progresivo y las condiciones técnicas, **pero no aprobó Railway ni IIS como destino definitivo**. Tampoco se ha seleccionado otro proveedor.

Las alternativas revisadas incluyen Railway, Render, DigitalOcean App Platform, servidor VPS con Docker Compose, Google Cloud Run + Cloud SQL e IIS en Windows. **No son una decisión tomada.** No se introducirán instrucciones exclusivas de una plataforma como requisito fijo.

### 12.2. Requisitos que deberá satisfacer el alojamiento elegido

1. Publicar React mediante HTTPS y una URL pública.
2. Ejecutar **tres procesos Node.js/Express** independientes.
3. Dirigir las rutas públicas `/api` al servicio correspondiente.
4. Ofrecer conexiones internas protegidas entre microservicios.
5. Ejecutar o conectar una **instancia MySQL persistente con tres bases lógicas**.
6. Permitir variables de entorno para secretos y configuración.
7. Conservar datos cuando se reinicien o actualicen procesos.
8. Permitir consultar registros y, si la plataforma lo ofrece, métricas básicas.
9. Mantener un costo y esfuerzo de configuración adecuados al proyecto académico.

**IIS:** puede servir como servidor web/proxy en Windows, pero por sí solo no ejecuta la arquitectura completa, no suministra MySQL ni hace pública automáticamente una instalación local. Se requeriría ejecutar los servicios Node.js por separado y configurar su alojamiento, enrutamiento, HTTPS y red pública si se elige esta opción.

### 12.3. Etapas de despliegue aprobadas

| Etapa | Momento | Objetivo |
|---|---|---|
| Desarrollo local | Semana 2 | Ejecutar y probar MySQL y las APIs. |
| Prueba integrada | Semana 3 | Ejecutar React con servicios y obtener feedback de tres roles, local o por red local. |
| Despliegue final | Semana 4 | Publicar la versión probada con HTTPS y persistencia. |

En la semana 3, antes de ejecutar la última etapa, deberá quedar seleccionada la plataforma, según compatibilidad, costo y facilidad de configuración. Si la decisión continúa abierta, no podrá declararse cumplido el entregable de aplicación pública.

### 12.4. GitHub y control de entregas

- Repositorio único con carpetas por servicio, frontend, scripts SQL y documentación.
- Commits descriptivos que permitan auditar cambios.
- Subir a la rama principal versiones revisadas y probadas.
- Conservar scripts y cambios de esquema en el historial.
- Verificar el despliegue tras aplicar una versión; en caso de fallo, recuperar código previamente probado y evaluar restauración de datos desde el respaldo.
- No exigir canalización CI/CD empresarial ni configuración compleja de ramas.

### 12.5. Observabilidad aprobada: A + B + C

| Alternativa | Mecanismo | Implementación mínima |
|---|---|---|
| **A** | Logs estructurados en Node.js | Fecha, servicio, nivel, mensaje y contexto no sensible. |
| **B** | Logs y métricas del proveedor | Revisar panel de registros y recursos **si el alojamiento elegido los ofrece**. |
| **C** | Endpoints `/health` | Cada servicio responde que su proceso está activo. |

Los endpoints `/health` corresponden a Usuarios, Catálogo y Pedidos. Una respuesta HTTP 200 significa que el proceso responde; **no prueba por sí sola que MySQL o los demás servicios funcionen**. Eso se verificará en pruebas de integración.

Registros mínimos: inicio de proceso, solicitudes HTTP (ruta, método, código, duración), validaciones fallidas, errores de MySQL, fallos de comunicación y excepciones. **No registrar contraseñas, tokens, cookies ni cadenas de conexión con secretos.**

Las métricas de CPU, memoria, disco y red se consultarán cuando estén disponibles; no se instalarán Sentry, Prometheus, Grafana, Redis ni sistemas de alertas obligatorios.

### 12.6. Condiciones de aceptación del despliegue

- URL pública HTTPS accesible desde un dispositivo ajeno al equipo de desarrollo.
- Los tres servicios responden y pueden colaborar entre sí.
- Inicio de sesión, permisos, registro, preparación y entrega operan en el entorno publicado.
- Datos y estados permanecen tras reiniciar servicios.
- Secretos fuera del repositorio y de los archivos públicos de React.
- Se ejecutan pruebas funcionales y de integración en la versión desplegada.
- GitHub documenta los pasos de ejecución/despliegue y el alojamiento finalmente seleccionado.

## 13. Cronograma, dependencias y entregables

### 13.1. Plan por capas con integración progresiva

| Sprint | Actividades técnicas principales | Evidencia |
|---|---|---|
| **1. Análisis y diseño** | SRS, historias, backlog, ERD, UML, prototipos. | Documentación aprobada. |
| **2. Backend y datos** | Scripts SQL, Usuarios, Catálogo, Pedidos, auth, Zod, endpoints y Postman. | Tres servicios probados y bases operativas. |
| **3. Frontend e integración** | Interfaces React por rol, Fetch, validación, flujo completo, responsive. | MVP integrado. |
| **4. Pruebas y despliegue** | Ejecutar CP/PI/PU, corregir errores, desplegar y sustentar. | Aplicación pública, resultados y documentación. |

El desarrollo seguirá **capas**, no un ciclo de nuevas funcionalidades. La implementación del backend seguirá el orden **Usuarios → Catálogo → Pedidos**, verificando integración en cuanto exista una dependencia.

### 13.2. Gates de calidad

| Puerta | Criterio de salida |
|---|---|
| Gate 1 | Requisitos, modelos, diagramas, backlog y prototipos revisados. |
| Gate 2 | Tres servicios y MySQL funcionales; autenticación y endpoints probados. |
| Gate 3 | Interfaces React integradas; flujo completo y responsive. |
| Gate 4 | Pruebas críticas superadas, despliegue público y entregables completos. |

Las tareas del backlog se organizarán en **18 bloques medianos con subtareas atómicas**, según el PLAN aprobado. La supervisión humana revisará cambios y evidencias antes de dar una tarea por terminada.

### 13.3. Entregables académicos obligatorios

1. Documento SRS.
2. Historias de usuario y Product Backlog.
3. Modelo entidad-relación.
4. Diagramas de casos de uso y clases.
5. Backend con API REST.
6. Interfaz gráfica responsive.
7. Pruebas funcionales y de integración.
8. Repositorio GitHub con historial.
9. Aplicación desplegada y funcional.
10. Documentación del uso de IA durante el desarrollo.

Este TRD complementa al SRS, pero no sustituye los entregables de diagramas, código, pruebas o despliegue.

## 14. Riesgos, decisiones abiertas y límites

### 14.1. Riesgos técnicos controlables

| Riesgo | Impacto | Respuesta acordada |
|---|---|---|
| Complejidad de microservicios en cuatro semanas | Retraso en integración. | Mantener solo tres servicios y HTTP simple. |
| Dependencia entre servicios | Operaciones bloqueadas si alguno falla. | Timeouts, fallos seguros y pruebas de integración. |
| Dos solicitudes simultáneas sobre una mesa | Pedido activo duplicado. | Protección atómica de unicidad en Pedidos. |
| Fallo a mitad del registro | Datos incompletos. | Transacción local pedido + detalles. |
| Eliminación de entidades con historial | Referencias inválidas. | Restringir eliminación y asegurar verificación entre servicios. |
| Uso de IA fuera de instrucciones | Cambios no solicitados. | Subtareas, revisión humana y pruebas. |
| Plataforma definitiva no elegida | Riesgo en entrega pública. | Resolver antes de publicar en semana 4. |
| Secretos incluidos por error en GitHub | Exposición de credenciales. | `.gitignore`, variables externas y revisión de commits. |

### 14.2. Única decisión de producto/despliegue pendiente

**Elegir el alojamiento definitivo.** Se deberá documentar la plataforma elegida y comprobar que soporta tres Node.js, React, MySQL persistente, HTTPS, secretos y acceso público dentro del presupuesto. **No se presume Railway, IIS ni cualquier otra opción.**

Los detalles operativos (puertos concretos, nombres de variables, versión exacta de dependencias, tiempo de expiración configurable y configuración específica del proveedor) se fijarán durante la implementación sin alterar las decisiones de alcance. No son autorizaciones para introducir módulos de negocio nuevos.

### 14.3. Exclusiones inamovibles para el MVP

No incorporar facturación/pagos, domicilios, reservas, inventario de ingredientes, clientes registrados, estadísticas empresariales, servicios externos de correo/OAuth/POS, WebSockets, notificaciones automáticas, aplicación nativa ni múltiples restaurantes. La IA sirve para **crear y revisar software**, no como función predictiva incluida en la aplicación.

## 15. Trazabilidad y criterios de aceptación del TRD

### 15.1. Matriz de trazabilidad de requisitos

| Requisito | Servicio / componente | Evidencia técnica |
|---|---|---|
| RF-01 a RF-04 | Catálogo + interfaz de menú | Endpoints de productos, validaciones y CP-04 a CP-07. |
| RF-05 a RF-08 | Pedidos + Catálogo + interfaz de mesero | Pedido/detalles, total, integridad y CP-08 a CP-10. |
| RF-09 | Pedidos + interfaz de mesero/admin | Cambio `Listo → Entregado`, CP-13. |
| RF-10 y RF-11 | Pedidos + interfaz cocina | Lista por estado y actualización, CP-11 y CP-12. |
| RF-12 y RF-13 | Catálogo + consulta a Pedidos | CRUD de mesas y disponibilidad, CP-14 y PI-05. |
| RF-14 y RF-15 | Usuarios + administración | Gestión del personal, CP-15. |
| RF-16 a RF-18 | Usuarios + middleware de tres servicios | Sesión, roles y revocación, CP-01 a CP-03 y CP-16. |
| RNF-01 y RNF-02 | Frontend React | Usabilidad y responsive. |
| RNF-03 | API y frontend | Objetivo de respuesta en ambiente de pruebas controlado. |
| RNF-04 y RNF-05 | Usuarios y demás servicios | Autenticación, secretos, bcrypt, cookies, permisos. |
| RNF-06 y RNF-07 | Pedidos/MySQL/Zod | Consistencia, validaciones y transacciones. |
| RNF-08 y RNF-09 | Frontend y repositorio | Chrome/Edge y código organizado. |
| RNF-10 | Despliegue final | URL pública operativa en sustentación. |
| RNF-11 y RNF-12 | APIs, MySQL y UI | Errores controlados y persistencia. |

### 15.2. Definición de terminado técnico

El TRD se considera satisfecho **en la implementación**, no por el solo hecho de redactar el documento, cuando:

1. Existen los tres microservicios Node.js independientes con sus respectivas bases lógicas y APIs.
2. Los 18 requisitos funcionales aprobados operan conforme al PRD.
3. Las validaciones, restricciones, transacciones, precios históricos y estados se cumplen.
4. Las sesiones revocables y los roles impiden operaciones no autorizadas.
5. React se comunica con los servicios y responde adecuadamente ante cargas, datos vacíos y fallos.
6. Se superan CP-01 a CP-16, PI-01 a PI-06 y PU-01 a PU-05, sin incidencias críticas pendientes.
7. La aplicación se despliega por HTTPS con MySQL persistente en una **plataforma finalmente elegida y documentada**.
8. Se dispone de GitHub con historial de cambios y documentación de pruebas y uso de IA.

## 16. Uso controlado de inteligencia artificial

La IA se empleará como apoyo para **generación de interfaces, validaciones, propuestas de pruebas, revisión de errores y documentación del proceso**, sin ejecutar automáticamente cambios de alcance.

Toda tarea asistida por IA seguirá esta pauta:

1. Indicar el bloque/subtarea y el RF o RNF relacionado.
2. Delimitar archivos y servicio que puede modificar.
3. Prohibir la incorporación de funciones no aprobadas o dependencias innecesarias.
4. Solicitar criterios de aceptación y pruebas verificables.
5. Revisar el código y ejecutar las pruebas antes de aceptar el cambio.
6. Registrar herramienta, propósito, fecha, cambio efectuado y validación como evidencia académica.

**Control de cambios:** si una decisión técnica futura afecta un requisito aprobado, el equipo deberá registrar y aprobar el cambio antes de aplicarlo. Una elección de alojamiento no altera por sí misma el esquema de cinco tablas, los tres servicios ni los requisitos de producto.

---

**Fin del TRD — Sistema de pedidos para restaurante.**  
**Estado final del documento:** especificación técnica aprobada y consolidada; **proveedor de alojamiento definitivo pendiente de definir**.
