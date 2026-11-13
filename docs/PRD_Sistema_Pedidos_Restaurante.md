# Documento de Requisitos del Producto (PRD)

## Sistema de pedidos para restaurante

| Control documental | Información |
|---|---|
| Documento | Product Requirements Document (PRD) |
| Proyecto | Sistema de pedidos para restaurante |
| Versión | 1.0 |
| Fecha | 10 de noviembre de 2026 |
| Estado | Especificación consolidada a partir de las decisiones aprobadas en la entrevista |
| Tipo de proyecto | Mini proyecto académico — producto mínimo viable (MVP) |
| Duración prevista | Cuatro semanas; Scrum simplificado |
| Decisión abierta | Plataforma de alojamiento definitivo: **pendiente de definir** |

> **Regla de alcance:** este documento establece únicamente las funciones acordadas durante el proceso de levantamiento de requisitos. No autoriza el desarrollo de características adicionales. La aplicación se diseñará para **un solo restaurante** y para uso **interno de su personal**.

---

## Tabla de contenido

1. [Propósito y alcance del documento](#1-propósito-y-alcance-del-documento)
2. [Problema, visión y objetivos](#2-problema-visión-y-objetivos)
3. [Usuarios, roles y permisos](#3-usuarios-roles-y-permisos)
4. [Alcance funcional del MVP](#4-alcance-funcional-del-mvp)
5. [Requisitos funcionales y criterios de aceptación](#5-requisitos-funcionales-y-criterios-de-aceptación)
6. [Reglas de negocio](#6-reglas-de-negocio)
7. [Recorridos principales y navegación](#7-recorridos-principales-y-navegación)
8. [Requisitos no funcionales](#8-requisitos-no-funcionales)
9. [Restricciones técnicas y de diseño](#9-restricciones-técnicas-y-de-diseño)
10. [Modelo de información de alto nivel](#10-modelo-de-información-de-alto-nivel)
11. [Validaciones, errores y estados de interfaz](#11-validaciones-errores-y-estados-de-interfaz)
12. [Exclusiones explícitas](#12-exclusiones-explícitas)
13. [Metas e indicadores de aceptación](#13-metas-e-indicadores-de-aceptación)
14. [Estrategia de verificación y pruebas](#14-estrategia-de-verificación-y-pruebas)
15. [Plan de entrega y evidencias académicas](#15-plan-de-entrega-y-evidencias-académicas)
16. [Uso permitido de inteligencia artificial](#16-uso-permitido-de-inteligencia-artificial)
17. [Dependencias, riesgos y decisiones pendientes](#17-dependencias-riesgos-y-decisiones-pendientes)
18. [Criterios de cierre y control de cambios](#18-criterios-de-cierre-y-control-de-cambios)

---

## 1. Propósito y alcance del documento

### 1.1. Propósito

Definir el producto que se desarrollará, sus destinatarios, sus funcionalidades, sus límites y las condiciones que permitirán comprobar que satisface las necesidades acordadas. Este PRD será la base para elaborar el documento académico SRS, las historias de usuario, el Product Backlog, los diagramas y las pruebas, sin reemplazar los documentos técnicos especializados.

### 1.2. Alcance de la solución

Aplicación web responsive para administrar el menú, las mesas y los pedidos de un restaurante pequeño, desde el registro de un pedido hasta su entrega. El personal ingresará con credenciales y utilizará funciones según su rol. El backend expondrá APIs REST y los datos persistirán en MySQL.

**Módulos aprobados:** menú, pedidos, cocina y administración. La autenticación y autorización son funciones transversales, no un quinto módulo de negocio.

**Usuarios internos:** administrador, mesero y cocinero. **Clientes:** beneficiarios indirectos, sin cuenta ni acceso al sistema.

### 1.3. Principios de producto

- Satisfacer los **18 requisitos funcionales aprobados**, sin expansión de alcance.
- Facilitar un flujo completo de atención de un pedido dentro del restaurante.
- Conservar la integridad de los datos y el historial de pedidos.
- Proporcionar una navegación sencilla, accesible desde computador, tableta y teléfono.
- Completar el MVP dentro de cuatro sprints de una semana.
- Utilizar IA solo como apoyo al desarrollo y documentar ese uso.

## 2. Problema, visión y objetivos

### 2.1. Problema a resolver

Los restaurantes pequeños suelen gestionar pedidos mediante papel o comunicación verbal entre el personal de atención y cocina. Esto puede generar pedidos incorrectos, confusiones sobre las mesas atendidas y dificultades para conocer el estado de preparación de los alimentos.

### 2.2. Propuesta de valor

Centralizar en una aplicación web la información del menú, las mesas, los pedidos y su preparación, facilitando la organización del trabajo entre administradores, meseros y cocineros.

### 2.3. Objetivo general

Desarrollar un sistema web de gestión de pedidos para restaurantes pequeños, utilizando React, Node.js y MySQL, que permita administrar el menú, las mesas, los pedidos y sus estados de preparación mediante una interfaz responsive.

### 2.4. Objetivos específicos

1. Permitir al administrador mantener el menú, las mesas y las cuentas de empleados.
2. Permitir al mesero registrar pedidos válidos para mesas disponibles y consultar su evolución.
3. Permitir al cocinero consultar los pedidos recibidos y actualizar los estados de preparación autorizados.
4. Registrar y conservar en MySQL pedidos, detalles, precios históricos y estados.
5. Aplicar autenticación y restricciones de acceso según los tres roles.
6. Verificar el cumplimiento de requisitos mediante pruebas funcionales y de integración y entregar una versión desplegada.

## 3. Usuarios, roles y permisos

### 3.1. Perfiles

| Rol | Necesidad principal | Responsabilidades |
|---|---|---|
| Administrador | Organizar los datos y el acceso del restaurante. | Gestionar productos, mesas y cuentas; consultar y registrar pedidos; confirmar entregas. |
| Mesero | Registrar y dar seguimiento a pedidos de las mesas. | Consultar menú y mesas, registrar pedidos, consultar estados y marcar pedidos listos como entregados. |
| Cocinero | Gestionar la preparación. | Consultar los productos y pedidos necesarios y avanzar estados de preparación. |

### 3.2. Matriz de permisos aprobada

| Operación | Administrador | Mesero | Cocinero |
|---|:---:|:---:|:---:|
| Iniciar y cerrar sesión | Sí | Sí | Sí |
| Consultar menú | Sí | Sí | Sí |
| Crear, modificar y eliminar productos permitidos | Sí | No | No |
| Modificar disponibilidad de productos | Sí | No | No |
| Crear, modificar y eliminar mesas permitidas | Sí | No | No |
| Consultar mesas y su disponibilidad | Sí | Sí | No |
| Registrar pedidos | Sí | Sí | No |
| Consultar pedidos | Sí | Sí | Sí |
| Cambiar **Pendiente → En preparación → Listo** | No | No | Sí |
| Marcar un pedido **Listo → Entregado** | Sí | Sí | No |
| Crear, consultar, modificar y desactivar usuarios | Sí | No | No |

El frontend mostrará únicamente las funciones correspondientes al rol, pero **el backend comprobará los permisos de cada operación protegida**, incluso si el usuario intenta llamar directamente a la API.

### 3.3. Acceso de usuarios

- No existe registro público ni cuentas para clientes.
- El administrador crea las cuentas del personal y les asigna uno de los tres roles.
- Se necesita una cuenta inicial de administrador antes de usar el sistema; su preparación se documentará en la implementación.
- Las cuentas desactivadas no pueden iniciar sesión.
- El inicio y cierre de sesión se realizarán mediante sesiones revocables.

## 4. Alcance funcional del MVP

### 4.1. Funcionalidad incluida

| Módulo | Funciones cubiertas | Requisitos |
|---|---|---|
| Menú | Crear, consultar, modificar y eliminar productos permitidos; controlar disponibilidad. | RF-01 a RF-04 |
| Pedidos | Registrar y consultar pedidos por mesa, cantidades y totales; confirmar entrega. | RF-05 a RF-09 |
| Cocina | Consultar pedidos de preparación y avanzar sus estados. | RF-10 a RF-11 |
| Administración | Gestionar mesas y usuarios del personal. | RF-12 a RF-15 |
| Acceso transversal | Iniciar sesión, restringir permisos y cerrar sesión. | RF-16 a RF-18 |

### 4.2. Flujo esencial

**Configuración del restaurante → Selección de mesa disponible → Registro de productos y cantidades → Pedido Pendiente → En preparación → Listo → Entregado → Mesa Disponible.**

El pedido entregado permanece registrado. Se admite **un solo pedido activo por mesa**; los pedidos históricos no impiden crear uno nuevo después de la entrega.

### 4.3. Definición de terminado del MVP

El MVP estará funcional cuando permita completar el recorrido anterior con los tres roles y persista correctamente los datos. La semana 3 se destinará a obtener la aplicación integrada; la semana 4, a pruebas finales, correcciones, despliegue y sustentación.

## 5. Requisitos funcionales y criterios de aceptación

Los códigos y el alcance de los requisitos se mantienen según la entrevista aprobada.

### 5.1. Módulo de menú

#### RF-01. Registrar productos

**Descripción.** El administrador podrá registrar un producto con nombre, descripción opcional y precio.

**Criterios de aceptación:**

- Solo un administrador autenticado podrá efectuar el registro.
- El nombre será obligatorio y el precio deberá ser numérico y mayor que cero.
- El producto se almacenará en MySQL y aparecerá en el menú tras una consulta exitosa.
- Los errores de validación impedirán guardar el registro e indicarán qué se debe corregir.

#### RF-02. Consultar productos

**Descripción.** Los tres roles podrán consultar el menú.

**Criterios de aceptación:**

- Se mostrarán los productos registrados, con sus datos básicos y disponibilidad.
- La consulta distinguirá entre un listado vacío y un error de conexión.
- Las opciones de modificación solo estarán disponibles para el administrador.

#### RF-03. Modificar productos

**Descripción.** El administrador podrá modificar la información de un producto existente.

**Criterios de aceptación:**

- Solo el administrador podrá efectuar cambios.
- El sistema comprobará la existencia del producto y la validez del nombre y precio.
- La información actualizada aparecerá al consultar el menú.
- Los cambios posteriores de precio o nombre **no modificarán los datos históricos** guardados en pedidos anteriores.

#### RF-04. Eliminar productos permitidos y controlar disponibilidad

**Descripción.** El administrador podrá eliminar productos sin referencias históricas y marcar productos como no disponibles.

**Criterios de aceptación:**

- Se permitirá eliminar físicamente un producto únicamente si no afecta pedidos registrados.
- Se rechazará la eliminación de un producto referenciado por pedidos históricos.
- Un producto no disponible no podrá agregarse a un nuevo pedido.
- Los cambios de disponibilidad no alterarán pedidos ya registrados.

### 5.2. Módulo de pedidos

#### RF-05. Registrar pedidos asociados a mesas

**Descripción.** Mesero y administrador podrán registrar pedidos para una mesa existente y disponible, seleccionando al menos un producto.

**Criterios de aceptación:**

- La mesa deberá existir y no tener otro pedido activo.
- El pedido deberá incluir al menos un producto existente y disponible.
- El registro completo incluirá pedido y detalles; ante un fallo, no quedarán registros parciales.
- El pedido se creará con estado **Pendiente** y la mesa se considerará **Ocupada**.
- Se impedirá que dos solicitudes simultáneas creen dos pedidos activos para la misma mesa.

#### RF-06. Establecer cantidades

**Descripción.** El usuario autorizado podrá establecer la cantidad solicitada de cada producto del pedido.

**Criterios de aceptación:**

- Solo se admitirán cantidades enteras mayores que cero.
- Las cantidades inválidas impedirán confirmar el pedido.
- Se registrará la cantidad correspondiente en cada detalle del pedido.

#### RF-07. Calcular total del pedido

**Descripción.** El sistema calculará el valor total de los productos seleccionados.

**Criterios de aceptación:**

- Cada subtotal será **cantidad × precio unitario**.
- El total será la suma de los subtotales.
- El backend obtendrá el precio vigente desde el catálogo y calculará el total; no confiará en importes suministrados por el navegador.
- El detalle conservará el nombre y el precio unitario en el momento del registro para proteger el historial.

#### RF-08. Consultar pedidos

**Descripción.** Los roles autorizados podrán consultar pedidos, productos asociados, cantidades, mesa y estado.

**Criterios de aceptación:**

- La consulta mostrará el identificador del pedido, la mesa, el detalle, el total y el estado.
- El estado reflejará los cambios almacenados por el módulo de cocina.
- Los pedidos entregados continuarán disponibles para consulta histórica.

#### RF-09. Confirmar entrega

**Descripción.** El mesero o administrador podrá marcar como entregado un pedido que se encuentre listo.

**Criterios de aceptación:**

- Únicamente se permitirá **Listo → Entregado**.
- No se permitirá entregar pedidos Pendientes o En preparación.
- La actualización se conservará en MySQL.
- Después de la entrega, la mesa aparecerá Disponible al no tener un pedido activo.

### 5.3. Módulo de cocina

#### RF-10. Consultar pedidos para preparación

**Descripción.** El cocinero podrá visualizar los pedidos **Pendientes**, **En preparación** y **Listos** junto con las mesas, productos y cantidades correspondientes.

**Criterios de aceptación:**

- Los pedidos registrados aparecerán al realizar o actualizar la consulta.
- La interfaz distinguirá las tres categorías de preparación.
- Cuando una categoría no tenga pedidos, se mostrará un mensaje de lista vacía.
- Esta consulta no exige notificaciones automáticas ni actualización en tiempo real por WebSockets.

#### RF-11. Actualizar estados de preparación

**Descripción.** El cocinero podrá avanzar el pedido de Pendiente a En preparación y después a Listo.

**Criterios de aceptación:**

- Solo el cocinero podrá realizar estas dos transiciones de preparación.
- Se rechazarán saltos, retrocesos y cambios sobre pedidos Entregados.
- Los estados se guardarán en MySQL y podrán consultarse desde el módulo de pedidos.
- Una solicitud basada en un estado ya desactualizado no sobrescribirá un cambio posterior.

### 5.4. Módulo de administración

#### RF-12. Gestionar mesas

**Descripción.** El administrador podrá registrar, consultar, modificar y eliminar mesas, cuando la eliminación no comprometa el historial.

**Criterios de aceptación:**

- Cada mesa tendrá un número entero positivo y único.
- Se podrán modificar los datos permitidos de una mesa existente.
- No se podrá eliminar una mesa vinculada a pedidos históricos.
- Los cambios válidos se reflejarán en la lista de mesas.

#### RF-13. Consultar disponibilidad de mesas

**Descripción.** Administrador y mesero podrán identificar las mesas Disponibles y Ocupadas.

**Criterios de aceptación:**

- Una mesa sin pedidos activos se mostrará Disponible.
- Una mesa con un pedido Pendiente, En preparación o Listo se mostrará Ocupada.
- Tras pasar su único pedido activo a Entregado, aparecerá Disponible.
- La disponibilidad será **derivada de los pedidos**, no un dato manual independiente susceptible de desincronizarse.

#### RF-14. Registrar y consultar usuarios

**Descripción.** El administrador podrá crear cuentas de empleados, consultarlas y asignarles el rol autorizado.

**Criterios de aceptación:**

- El nombre de usuario será único y obligatorio.
- La cuenta tendrá contraseña protegida mediante hash y uno de los tres roles definidos.
- Solo un administrador autenticado podrá crear o consultar el listado administrativo de cuentas.
- Los nuevos usuarios podrán autenticarse si su cuenta está activa y sus credenciales son correctas.

#### RF-15. Modificar y desactivar cuentas

**Descripción.** El administrador podrá modificar datos básicos, cambiar roles y desactivar usuarios.

**Criterios de aceptación:**

- Solo el administrador podrá realizar estas operaciones.
- Una cuenta desactivada no podrá iniciar sesión ni conservar acceso autorizado.
- Los cambios se reflejarán en los datos almacenados y en las verificaciones de permisos.
- No se requiere un sistema de permisos personalizados.

### 5.5. Autenticación y control de acceso

#### RF-16. Iniciar sesión

**Descripción.** Los empleados podrán ingresar mediante nombre de usuario y contraseña.

**Criterios de aceptación:**

- Las credenciales correctas de una cuenta activa permitirán crear una sesión válida.
- Las credenciales incorrectas o cuentas inactivas producirán rechazo y mensaje comprensible.
- El usuario autenticado será dirigido a su interfaz según el rol.
- La contraseña almacenada será un hash seguro, no texto plano.

#### RF-17. Restringir operaciones por rol

**Descripción.** La aplicación aplicará las reglas de acceso de la matriz de permisos.

**Criterios de aceptación:**

- Las pantallas mostrarán únicamente las opciones correspondientes al rol.
- El backend denegará acciones no autorizadas, aunque se soliciten directamente a la API.
- Las rutas protegidas exigirán autenticación y sesión válida.

#### RF-18. Cerrar sesión

**Descripción.** El usuario podrá terminar su sesión activa.

**Criterios de aceptación:**

- El cierre invalidará el acceso correspondiente.
- El navegador regresará a `/login`.
- No se permitirá seguir ejecutando operaciones protegidas con la sesión invalidada.

## 6. Reglas de negocio

| Código | Regla aprobada |
|---|---|
| RN-01 | La aplicación atiende a un solo restaurante y es exclusivamente de uso interno. |
| RN-02 | Solo existen los roles Administrador, Mesero y Cocinero. |
| RN-03 | Un pedido corresponde a una mesa existente y contiene al menos un producto. |
| RN-04 | Cada mesa puede tener, como máximo, un pedido activo. |
| RN-05 | Los estados válidos son **Pendiente, En preparación, Listo y Entregado**, en ese orden. |
| RN-06 | El cocinero avanza estados hasta Listo; el mesero o administrador confirma Entregado. |
| RN-07 | Un pedido Entregado es final y permanece en el historial. |
| RN-08 | Un producto no disponible no puede incluirse en nuevos pedidos. |
| RN-09 | Los precios y nombres almacenados en los detalles históricos no cambian si se actualiza el menú. |
| RN-10 | No se elimina físicamente un producto o una mesa referenciados por pedidos históricos. |
| RN-11 | Los precios deben ser mayores que cero y las cantidades enteras positivas. |
| RN-12 | El backend valida operaciones y permisos; React no constituye por sí solo una barrera de seguridad. |
| RN-13 | La disponibilidad de mesa se deriva del pedido activo: Pendiente, En preparación o Listo = Ocupada; sin pedido activo = Disponible. |
| RN-14 | El pedido y sus detalles se registran de manera atómica para evitar datos incompletos. |

## 7. Recorridos principales y navegación

### 7.1. Acceso inicial

- Un usuario sin sesión válida ve `/login`.
- Si las credenciales son válidas, el sistema identifica el rol y redirige a su panel.
- Un usuario con sesión válida conserva el acceso al actualizar el navegador.
- La sesión expirada o revocada obliga a iniciar sesión nuevamente.
- Las rutas y las operaciones protegidas verifican autenticación y permisos.

### 7.2. Rutas de interfaz propuestas

| Ruta | Pantalla | Rol autorizado |
|---|---|---|
| `/login` | Inicio de sesión | Sin sesión |
| `/admin` | Panel de administración | Administrador |
| `/admin/productos` | Gestión del menú | Administrador |
| `/admin/mesas` | Gestión de mesas | Administrador |
| `/admin/usuarios` | Gestión de usuarios | Administrador |
| `/mesero` | Panel de mesas y pedidos | Mesero |
| `/mesero/nuevo-pedido` | Registro de pedido | Mesero |
| `/mesero/pedidos` | Consulta de pedidos | Mesero |
| `/cocina` | Pedidos en preparación | Cocinero |

El administrador también puede realizar las operaciones de registro y consulta de pedidos reutilizando los componentes correspondientes, conforme a sus permisos, sin crear módulos adicionales.

### 7.3. Camino crítico o Happy Path

1. **Administrador:** registra el menú, las mesas y las cuentas del personal.
2. **Mesero:** inicia sesión, elige una mesa Disponible, selecciona productos y cantidades y confirma el pedido.
3. **Sistema:** valida los datos, calcula el total, guarda pedido y detalles y lo registra como Pendiente; la mesa queda Ocupada.
4. **Cocinero:** consulta el pedido, lo cambia a En preparación y posteriormente a Listo.
5. **Mesero:** consulta el pedido Listo y confirma la entrega.
6. **Sistema:** almacena Entregado, mantiene el historial y vuelve a considerar Disponible la mesa.

### 7.4. Cierre y continuidad del trabajo

- **Administrador:** después de crear o modificar registros, retorna al listado correspondiente con la información actualizada.
- **Mesero:** después de confirmar un pedido, puede ver sus detalles, consultar los pedidos o registrar uno nuevo en otra mesa disponible.
- **Cocinero:** después de avanzar un estado, continúa trabajando en la misma pantalla de cocina.
- **Cualquier rol:** al cerrar sesión, se revoca el acceso y se vuelve a `/login`.

No se requieren páginas extra de despedida, agradecimiento o recomendaciones.

## 8. Requisitos no funcionales

| Código | Requisito | Condición verificable |
|---|---|---|
| RNF-01 | Usabilidad | Funciones principales identificables mediante botones, menús y formularios claros. |
| RNF-02 | Responsive | Uso adecuado en computadores, tabletas y teléfonos, sin desbordamientos horizontales en pantallas principales. |
| RNF-03 | Rendimiento | Tiempo objetivo de respuesta de operaciones básicas de **3 segundos o menos** en condiciones normales de prueba y con pocos datos. |
| RNF-04 | Seguridad de acceso | Autenticación y permisos correspondientes a los tres roles. |
| RNF-05 | Protección de datos | Contraseñas con hash seguro y secretos fuera del código público. |
| RNF-06 | Integridad | Relaciones válidas, restricciones y ausencia de pedidos incompletos o mesa duplicada en ocupación activa. |
| RNF-07 | Validación | Rechazo de formularios con campos obligatorios vacíos y valores inválidos. |
| RNF-08 | Compatibilidad | Funcionamiento en versiones actuales de Google Chrome y Microsoft Edge. |
| RNF-09 | Mantenibilidad | Organización del código por responsabilidades y nombres comprensibles. |
| RNF-10 | Disponibilidad para evaluación | Acceso a la aplicación desplegada durante pruebas y sustentación. |
| RNF-11 | Manejo de errores | Mensajes claros y ausencia de registros incompletos tras fallos. |
| RNF-12 | Persistencia | Información conservada en MySQL después de cerrar/reabrir la aplicación y reiniciar servicios. |

**Alcance de calidad:** no se exige capacidad de carga masiva, alta disponibilidad, observabilidad empresarial ni operación sin conexión.

## 9. Restricciones técnicas y de diseño

### 9.1. Restricciones técnicas aprobadas

| Código | Restricción |
|---|---|
| RT-01 | Frontend con **React**. |
| RT-02 | Backend con **Node.js**. |
| RT-03 | Persistencia con **MySQL**. |
| RT-04 | Comunicación mediante **API REST**, solicitudes HTTP y JSON. |
| RT-05 | Control de versiones con **Git y GitHub**. |
| RT-06 | IA exclusivamente como apoyo para interfaces, validaciones y tareas de desarrollo documentadas. |
| RT-07 | Separación de frontend, backend y base de datos; arquitectura seleccionada de **microservicios mínimos**. |
| RT-08 | Plazo máximo planificado de **cuatro semanas**. |

### 9.2. Decisiones técnicas complementarias aprobadas

- JavaScript; React con Vite y CSS convencional.
- Backend Node.js con Express; acceso a MySQL mediante `mysql2`.
- Comunicación del frontend mediante Fetch API.
- Contraseñas con bcrypt, variables de entorno en desarrollo y despliegue, y validaciones de entrada con Zod.
- Tres microservicios: **Usuarios**, **Catálogo y mesas**, **Pedidos y cocina**.
- Una instancia MySQL con tres bases de datos lógicas: `restaurante_usuarios`, `restaurante_catalogo`, `restaurante_pedidos`.
- Migraciones mediante scripts SQL versionados.
- Sesiones revocables con token aleatorio, hash y expiración; cookie de sesión protegida.
- Sin APIs externas de terceros.
- Pruebas funcionales manuales, de integración con Postman y unitarias con Node.js Test Runner.
- Registros básicos, métricas disponibles del alojamiento y endpoints `/health`.
- **Alojamiento definitivo pendiente de definir**. IIS, Railway u otro proveedor no han sido aprobados como destino final.

Estas decisiones se desarrollarán en detalle dentro del TRD; aquí se incluyen solo para fijar las restricciones de producto.

### 9.3. Criterios de diseño

- Interfaz sobria, legible y consistente.
- Navegación diferenciada por roles sin menús excesivos.
- Formularios claros con mensajes de validación próximos al campo correspondiente.
- Pedidos con identificación de mesa, productos, cantidades y estado.
- Diseño responsive y controles utilizables en pantallas pequeñas.
- Sin animaciones complejas, gráficos avanzados ni personalización de temas como requisitos.
- El estilo visual y los colores definitivos se decidirán durante el prototipado, sin alterar el alcance funcional.

## 10. Modelo de información de alto nivel

Se aprueba un modelo conceptual con **cinco tablas principales** distribuidas en tres bases de datos lógicas. La definición detallada del esquema, las relaciones y los scripts SQL corresponde al TRD y al modelo entidad-relación.

| Base de datos lógica | Tabla | Campos principales |
|---|---|---|
| `restaurante_usuarios` | `usuarios` | `id_usuario`, `nombre_usuario`, `contrasena_hash`, `rol`, `activo`, `sesion_token_hash`, `sesion_expira_en` |
| `restaurante_catalogo` | `productos` | `id_producto`, `nombre`, `descripcion`, `precio`, `disponible` |
| `restaurante_catalogo` | `mesas` | `id_mesa`, `numero_mesa` |
| `restaurante_pedidos` | `pedidos` | `id_pedido`, `id_mesa`, `id_usuario`, `fecha_pedido`, `estado`, `total` |
| `restaurante_pedidos` | `detalle_pedido` | `id_detalle`, `id_pedido`, `id_producto`, `nombre_producto`, `cantidad`, `precio_unitario`, `subtotal` |

**Relaciones conceptuales:** Usuario 1:N Pedido; Mesa 1:N Pedido histórico; Pedido 1:N Detalle; Producto 1:N Detalle. En diferentes bases de datos, los identificadores son **referencias lógicas**, no claves foráneas físicas entre servicios. La clave foránea `detalle_pedido.id_pedido` sí corresponde a la misma base de datos de pedidos.

**Datos derivados:** la disponibilidad de mesa se obtiene de los pedidos activos; no se almacena un estado independiente que deba sincronizarse manualmente. El cálculo del total y la validación de referencias se realizan desde el backend.

## 11. Validaciones, errores y estados de interfaz

### 11.1. Estados visuales

| Estado | Comportamiento |
|---|---|
| Carga | Indicar que se está consultando o enviando información; impedir envíos duplicados durante una operación pendiente. |
| Vacío | Indicar que no existen registros **solo después de una consulta exitosa**. |
| Error | Explicar el problema en lenguaje claro; conservar datos corregibles y ofrecer volver a consultar cuando corresponda. |
| Éxito | Confirmar exclusivamente después de una respuesta válida del backend, actualizando el listado o estado correspondiente. |

### 11.2. Reglas transversales de interacción

1. Las rutas protegidas esperan la validación de sesión antes de mostrar información restringida.
2. Las validaciones de campos aparecen próximas a los datos incorrectos.
3. Los botones de confirmación permanecen deshabilitados durante el envío pendiente de esa operación.
4. Una consulta fallida nunca se representa como un listado vacío.
5. Los errores técnicos no revelan contraseñas, consultas SQL ni secretos.
6. Los formularios conservan los datos cuando el error puede corregirse.
7. Ante respuesta desconocida tras registrar un pedido, se solicita **consultar primero los pedidos existentes** para evitar duplicados antes de reintentar.
8. Los estados de cocina pueden consultarse de nuevo manualmente; no se requiere actualización por WebSockets.
9. Los mensajes son legibles también desde un teléfono.
10. Cancelar un formulario sin guardar descarta únicamente la entrada no confirmada; **no existe cancelación de pedidos ya registrados**.

### 11.3. Escenarios alternativos cubiertos

| Área | Situaciones principales y respuesta requerida |
|---|---|
| Autenticación | Credenciales incorrectas, cuenta desactivada, sesión expirada o cierre: rechazar o invalidar acceso y conducir a `/login` cuando corresponda. |
| Autorización | Intento de ruta o endpoint restringido: denegar la operación y mantener navegación acorde al rol. |
| Menú | Nombre vacío, precio inválido, producto no disponible o referenciado: validar y bloquear operaciones que comprometan integridad. |
| Mesas | Número duplicado, mesa inexistente, ocupada o con pedidos históricos: impedir registro/eliminación indebidos. |
| Pedidos | Lista vacía, cantidades inválidas, producto inexistente, cambio de precio, envío repetido y concurrencia: validar de nuevo antes de guardar. |
| Persistencia | Si falla el registro de un detalle, revertir el pedido completo y no confirmar éxito. |
| Cocina | Impedir saltos, retrocesos, cambios con estado desactualizado y modificaciones después de Entregado. |
| Conectividad | Si fallan API, MySQL o microservicios dependientes, informar el fallo, no guardar datos inconsistentes ni presentar éxito falso. |

## 12. Exclusiones explícitas

Se excluyen del MVP las siguientes funcionalidades:

| Exclusión | Motivo de alcance |
|---|---|
| Facturación electrónica | El sistema organiza pedidos, no facturación tributaria. |
| Pagos en línea y caja registradora | No procesa transacciones monetarias. |
| Domicilios y envíos | Solo hay pedidos asociados a mesas del restaurante. |
| Inventario de ingredientes | Solo se registra disponibilidad de productos del menú. |
| Reserva anticipada de mesas | Solo se consulta la disponibilidad operativa. |
| Registro o portal de clientes | Acceso exclusivo del personal. |
| Estadísticas y reportes financieros avanzados | Fuera de los cuatro módulos mínimos. |
| Notificaciones automáticas y alertas sonoras | Los estados se consultan desde la interfaz. |
| WebSockets y sincronización en tiempo real | Se utilizan consultas normales a la API REST. |
| Aplicación móvil nativa | Solo aplicación web responsive. |
| Integraciones con impresoras o códigos QR | No requeridas. |
| Gestión de múltiples restaurantes | Solo un establecimiento. |
| IA incorporada como predictor/recomendador | La IA es herramienta de desarrollo, no una función de negocio. |
| Cancelación de pedidos ya confirmados | Estados aprobados solo Pendiente, En preparación, Listo y Entregado. |
| Autenticación social, registro público y roles personalizados | Fuera del control de acceso mínimo. |
| Microservicios adicionales, colas o infraestructura compleja | Fuera de la arquitectura mínima seleccionada. |

No se reservarán iteraciones dentro de este proyecto para introducir estas funciones. Si sobra tiempo, se dedicará a corregir errores y completar pruebas y documentación.

## 13. Metas e indicadores de aceptación

Los indicadores son **metas de prueba del MVP**, no resultados comerciales medidos ni compromisos de escala productiva.

| Indicador | Meta o comprobación |
|---|---|
| Gestión del menú | Crear, consultar, modificar, controlar disponibilidad y eliminar productos permitidos correctamente. |
| Registro de pedidos | Guardar **100 % de pedidos válidos de las pruebas** y rechazar entradas inválidas. |
| Gestión de mesas | Asociar correctamente cada pedido a una mesa existente y respetar una ocupación activa. |
| Estados de preparación | Aplicar y consultar la secuencia aprobada sin saltos ni retrocesos. |
| Integridad de información | Persistencia en MySQL, conservación histórica y ausencia de pedidos parciales. |
| Flujos críticos | Superar **100 % de las pruebas críticas** definidas para el MVP. |
| Accesibilidad práctica | Usar las funciones principales en computador y teléfono, además de verificar tabletas. |
| Tiempo de respuesta objetivo | Operaciones básicas en **3 segundos o menos** en un entorno de prueba normal, con pocos registros. |

## 14. Estrategia de verificación y pruebas

### 14.1. Flujos críticos

| Código | Flujo |
|---|---|
| FC-01 | Autenticación y control de acceso. |
| FC-02 | Gestión del menú. |
| FC-03 | Registro de pedidos. |
| FC-04 | Preparación y actualización de estados. |
| FC-05 | Gestión y disponibilidad de mesas. |
| FC-06 | Administración de usuarios. |

### 14.2. Pruebas funcionales obligatorias

| ID | Escenario | Resultado esperado |
|---|---|---|
| CP-01 | Inicio de sesión válido | Acceso según rol. |
| CP-02 | Credenciales inválidas o cuenta desactivada | Rechazo con mensaje. |
| CP-03 | Intento de usar funciones ajenas al rol | Operación denegada por el backend. |
| CP-04 | Registro de producto válido | Persistencia y aparición en menú. |
| CP-05 | Producto sin nombre o precio inválido | Registro rechazado. |
| CP-06 | Modificación de producto | Cambios persistentes. |
| CP-07 | Eliminación de producto sin pedidos asociados | Eliminación permitida. |
| CP-08 | Registro de pedido válido | Pedido Pendiente y total correcto. |
| CP-09 | Pedido sin productos o cantidades inválidas | Registro rechazado. |
| CP-10 | Segundo pedido activo para la misma mesa | Duplicado impedido. |
| CP-11 | Actualizar preparación | Pendiente → En preparación → Listo. |
| CP-12 | Transición no permitida | Cambio rechazado. |
| CP-13 | Entregar pedido Listo | Entregado; mesa Disponible. |
| CP-14 | Eliminar mesa con pedidos asociados | Eliminación rechazada. |
| CP-15 | Crear y desactivar usuario | Cuenta registrada e inhabilitada cuando corresponda. |
| CP-16 | Cerrar sesión | Sesión invalidada. |

### 14.3. Pruebas de integración

| ID | Integración | Comprobación |
|---|---|---|
| PI-01 | React ↔ API REST | Envío y recepción correctos. |
| PI-02 | API REST ↔ MySQL | Persistencia y consulta correctas. |
| PI-03 | Pedidos ↔ Cocina | Pedido registrado visible para preparación. |
| PI-04 | Cocina ↔ Pedidos | Estado actualizado consultable. |
| PI-05 | Pedidos ↔ Mesas | Disponibilidad derivada correctamente. |
| PI-06 | Usuarios ↔ Autorización | Permisos respetados en los servicios. |

Por la arquitectura de microservicios, se probará además el rechazo seguro ante fallo de comunicación indispensable, la concurrencia por mesa y la reversión del registro de pedidos incompletos.

### 14.4. Pruebas unitarias mínimas

| ID | Comprobación |
|---|---|
| PU-01 | Total calculado como suma de subtotales. |
| PU-02 | Cantidades enteras mayores que cero. |
| PU-03 | Precios numéricos mayores que cero. |
| PU-04 | Transiciones válidas de estado. |
| PU-05 | Permisos permitidos y denegados por rol. |

**Herramientas aprobadas:** comprobaciones manuales, Postman, Node.js Test Runner y Zod. No se exige Playwright, Jest ni una plataforma avanzada de CI/CD.

### 14.5. Criterio general de aceptación de pruebas

- **16/16** pruebas funcionales obligatorias aprobadas.
- **6/6** pruebas de integración aprobadas.
- **5/5** pruebas unitarias mínimas aprobadas.
- Ningún error crítico pendiente para la entrega.
- Resultados y evidencias documentados; no se consideran aprobados por mera opinión de una herramienta de IA.

## 15. Plan de entrega y evidencias académicas

### 15.1. Cronograma de cuatro semanas

| Sprint | Semana | Trabajo principal | Evidencia |
|---|---|---|---|
| 1 | Análisis y diseño | Requisitos, historias, backlog, ER, UML y prototipos. | SRS, backlog, diagramas y prototipo. |
| 2 | Backend y base de datos | Tres microservicios, bases MySQL, autenticación, CRUD, validaciones, API. | Backend probado, scripts SQL, endpoints. |
| 3 | Frontend e integración | Interfaces React por rol, comunicación con APIs, validaciones, responsive. | MVP integrado y funcional. |
| 4 | Pruebas y despliegue | Pruebas finales, corrección de errores, publicación y sustentación. | Aplicación desplegada y documentación final. |

**Forma de trabajo aprobada:** desarrollo por capas con integración progresiva, cuatro puertas de calidad y Product Backlog organizado en **18 bloques medianos**, subdivididos en tareas atómicas. La cantidad de bloques de trabajo no debe confundirse con los 18 RF.

### 15.2. Diez entregables obligatorios

1. Documento de requisitos del software (SRS).
2. Historias de usuario y Product Backlog.
3. Modelo entidad-relación de la base de datos.
4. Diagrama de casos de uso y diagrama de clases.
5. Backend con API REST.
6. Interfaz gráfica responsive.
7. Pruebas funcionales y de integración.
8. Repositorio GitHub con historial de cambios.
9. Aplicación desplegada y funcional.
10. Documentación de los usos de IA durante el desarrollo.

### 15.3. Puertas de calidad

| Puerta | Condición de aprobación |
|---|---|
| Gate 1 | SRS, backlog, ER, diagramas y prototipos revisados. |
| Gate 2 | Bases de datos y tres microservicios funcionando; endpoints, permisos y validaciones probados. |
| Gate 3 | React integrado; flujo de pedido completo y pantallas responsive verificadas. |
| Gate 4 | Pruebas críticas superadas, aplicación desplegada y diez entregables completos. |

Cada hito deberá contar con evidencia real. Se permitirá avanzar en trabajo independiente si surge un inconveniente, pero no se declarará completado un hito con fallos obligatorios pendientes.

## 16. Uso permitido de inteligencia artificial

La IA se utilizará como apoyo para generar interfaces, validar entradas, proponer pruebas, identificar errores y organizar documentación. No será una funcionalidad dentro de la aplicación para clientes o empleados.

**Condiciones:**

- Trabajar únicamente sobre tareas y archivos necesarios para un requisito aprobado.
- No introducir dependencias, servicios o módulos adicionales sin justificación y aprobación.
- No eliminar ni reestructurar funcionalidades terminadas sin verificar el impacto.
- No publicar credenciales, tokens ni variables sensibles.
- Revisar, ejecutar y probar el código generado antes de integrarlo.
- Registrar herramienta utilizada, tarea, resultado y evidencia del uso de IA.
- Mantener el control humano sobre la aceptación de resultados y puertas de calidad.

El registro se conservará durante los cuatro sprints y se consolidará para la entrega final.

## 17. Dependencias, riesgos y decisiones pendientes

### 17.1. Dependencias del producto

| Dependencia | Consecuencia |
|---|---|
| Existencia de cuenta inicial de administrador | Necesaria para crear cuentas del personal y preparar el restaurante. |
| Menú y mesas registrados | Necesarios para generar pedidos válidos. |
| Servicio de usuarios operativo | Necesario para validar acceso y roles. |
| Catálogo operativo | Necesario para verificar productos y mesas al registrar pedidos. |
| Persistencia MySQL operativa | Necesaria para guardar y recuperar información. |
| Comunicación entre microservicios | Necesaria para validar referencias lógicas sin acceso cruzado a tablas. |

### 17.2. Riesgos que deben controlarse

| Riesgo | Tratamiento aprobado |
|---|---|
| Complejidad de tres microservicios en cuatro semanas | Limitar a tres servicios, una instancia de MySQL y APIs REST sencillas. |
| Dos registros simultáneos en una mesa | Controlar concurrencia para admitir solo un pedido activo. |
| Error al guardar detalles del pedido | Transacción local y reversión completa ante fallos. |
| Servicio dependiente no disponible | Rechazar operaciones que no puedan validarse sin comprometer datos. |
| Cambios generados por IA fuera de alcance | Revisar archivos afectados y ejecutar pruebas antes de integrar. |
| Dificultades/costos del alojamiento | Evaluar proveedor por compatibilidad, acceso HTTPS, persistencia, costo y facilidad de despliegue. |

### 17.3. Decisión abierta

**Plataforma de alojamiento definitivo: PENDIENTE DE DEFINIR.**

La estrategia de despliegue progresivo sí está aprobada: pruebas locales durante el desarrollo, pruebas con los tres roles en la semana 3 y publicación final en la semana 4. La plataforma concreta (IIS, Railway u otra alternativa) se elegirá antes del despliegue, según compatibilidad con React, tres servicios Node.js, una instancia MySQL persistente con tres bases lógicas, HTTPS, seguridad y costo.

Esta decisión abierta **no autoriza cambiar el resto de requisitos o el stack tecnológico**.

## 18. Criterios de cierre y control de cambios

### 18.1. Cierre del producto

El MVP estará listo para sustentación cuando:

1. Se cumplan los 18 RF y los 12 RNF aprobados.
2. Se complete el flujo de registro, preparación y entrega sin inconsistencia de datos.
3. Se respeten los permisos y las sesiones de los tres roles.
4. Se ejecuten y superen las pruebas críticas acordadas.
5. React funcione con los tres microservicios y las bases MySQL.
6. La aplicación sea responsive y accesible en el entorno desplegado.
7. El repositorio contenga historial de cambios y los diez entregables académicos estén disponibles.
8. La documentación de IA registre efectivamente las tareas realizadas con esas herramientas.

### 18.2. Gobierno del alcance

- Cualquier cambio a un requisito aprobado deberá documentarse y evaluarse antes de implementarlo.
- Los cambios no podrán convertir el proyecto en una solución de facturación, inventarios, domicilios, múltiples restaurantes o gestión empresarial avanzada.
- Los diagramas, el SRS, el backlog y las pruebas deberán conservar trazabilidad con los RF y RNF de este PRD.
- El equipo y el responsable de aceptación revisarán los resultados al finalizar cada sprint.
- La elección futura del alojamiento se actualizará de forma explícita sin modificar silenciosamente otras decisiones.

---

**Fin del documento PRD — Sistema de pedidos para restaurante.**

**Estado:** alcance de producto aprobado; **plataforma de alojamiento pendiente**.
