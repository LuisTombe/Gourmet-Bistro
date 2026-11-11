# PLAN — Hoja de ruta de desarrollo

## Sistema de pedidos para restaurante

| Control documental | Información |
|---|---|
| Documento | PLAN — Roadmap de desarrollo |
| Proyecto | Sistema de pedidos para restaurante |
| Versión | 1.0 |
| Fecha de elaboración | 10 de noviembre de 2026 |
| Estado | Especificación del plan consolidada a partir de la entrevista aprobada |
| Duración | Un mes; cuatro sprints de una semana |
| Metodología | Scrum simplificado |
| Enfoque | Desarrollo por capas con integración progresiva |
| Organización del trabajo | 18 bloques medianos con subtareas atómicas |
| Arquitectura | Tres microservicios Node.js, frontend React y MySQL |
| Decisión abierta | **Plataforma de alojamiento definitivo: PENDIENTE DE DEFINIR** |

> **Alcance invariable.** El proyecto es un MVP académico para **un solo restaurante**, con cuatro módulos (menú, pedidos, cocina y administración), tres roles (administrador, mesero y cocinero) y **18 requisitos funcionales**. No se planifican funciones extras, ampliaciones futuras dentro del mes ni módulos adicionales. Este documento planifica la implementación de lo aprobado en el PRD y el TRD; **no sustituye** al SRS, las historias de usuario ni los demás entregables académicos.

---

## Tabla de contenido

1. [Propósito y referencias del plan](#1-propósito-y-referencias-del-plan)
2. [Límites, decisiones aprobadas y pendientes](#2-límites-decisiones-aprobadas-y-pendientes)
3. [Definición del MVP y prioridades](#3-definición-del-mvp-y-prioridades)
4. [Metodología de trabajo y gobierno](#4-metodología-de-trabajo-y-gobierno)
5. [Estrategia de desarrollo y dependencias](#5-estrategia-de-desarrollo-y-dependencias)
6. [Cronograma maestro de cuatro semanas](#6-cronograma-maestro-de-cuatro-semanas)
7. [Sprint 1 — Análisis y diseño](#7-sprint-1--análisis-y-diseño)
8. [Sprint 2 — Backend y bases de datos](#8-sprint-2--backend-y-bases-de-datos)
9. [Sprint 3 — Frontend e integración](#9-sprint-3--frontend-e-integración)
10. [Sprint 4 — Pruebas, despliegue y entrega](#10-sprint-4--pruebas-despliegue-y-entrega)
11. [Catálogo y trazabilidad de los 18 bloques](#11-catálogo-y-trazabilidad-de-los-18-bloques)
12. [Puertas de calidad y criterios de parada](#12-puertas-de-calidad-y-criterios-de-parada)
13. [Gestión del Product Backlog y tareas](#13-gestión-del-product-backlog-y-tareas)
14. [Estrategia de pruebas y evidencias](#14-estrategia-de-pruebas-y-evidencias)
15. [Despliegue progresivo y retroalimentación](#15-despliegue-progresivo-y-retroalimentación)
16. [GitHub, documentación y uso de IA](#16-github-documentación-y-uso-de-ia)
17. [Riesgos, dependencias críticas y contingencias](#17-riesgos-dependencias-críticas-y-contingencias)
18. [Matriz de entregables obligatorios](#18-matriz-de-entregables-obligatorios)
19. [Listas de comprobación y cierre](#19-listas-de-comprobación-y-cierre)

---

## 1. Propósito y referencias del plan

### 1.1. Propósito

Organizar el trabajo necesario para desarrollar, verificar y entregar el Sistema de pedidos para restaurante dentro de **cuatro semanas**, fijando el orden de actividades, responsables por definir, dependencias, evidencias, criterios de terminación y controles de calidad. Los cuatro sprints deben producir una aplicación funcional, responsive y desplegada, con su documentación académica.

### 1.2. Referencias de especificación

- **PRD — `PRD_Sistema_Pedidos_Restaurante.md`:** problema, producto, roles, RF-01 a RF-18, RNF-01 a RNF-12, restricciones y criterios de aceptación.
- **TRD — `TRD_Sistema_Pedidos_Restaurante.md`:** arquitectura de tres microservicios, contratos REST, tres bases lógicas MySQL, sesiones revocables, seguridad, pruebas y requisitos del alojamiento.
- **USER FLOW — por generar:** navegación inicial, recorridos por rol, casos alternativos, estados de interfaz y confirmaciones, según la entrevista concluida.
- **Orientaciones académicas:** diez entregables y cronograma obligatorio de cuatro semanas.

En caso de discrepancia entre la programación de una tarea y el alcance del producto, **prevalecen los requisitos y decisiones expresamente aprobados**. Cualquier variación de alcance requiere revisión humana previa y actualización coordinada de documentos; una sugerencia de IA no constituye autorización.

### 1.3. Resultado esperado

Al finalizar el cuarto sprint, debe existir una aplicación web operativa que permita configurar productos, mesas y cuentas; registrar pedidos, consultar su preparación y marcarlos como entregados, conservando el historial y la disponibilidad correcta de mesas. Además, deben estar reunidas las pruebas, los diagramas, el código y la documentación solicitada por el instructor.

## 2. Límites, decisiones aprobadas y pendientes

### 2.1. Línea base del proyecto

| Ámbito | Decisión aprobada |
|---|---|
| Público objetivo | Personal interno de un restaurante pequeño; no se registran clientes. |
| Roles | Administrador, mesero, cocinero. |
| Módulos del producto | Menú, pedidos, cocina y administración. |
| Funciones transversales | Autenticación, autorización y cierre de sesión. |
| Stack | JavaScript, React + Vite + CSS, Node.js + Express, MySQL + `mysql2`. |
| Arquitectura | **Tres microservicios independientes:** Usuarios, Catálogo y Pedidos. |
| Datos | Una instancia MySQL, tres bases de datos lógicas y cinco tablas principales. |
| Sesiones | Tokens aleatorios revocables, con hash y expiración en dos campos adicionales de `usuarios`; una sesión activa por cuenta. |
| Validaciones | Zod en backend; comprobaciones básicas en React. |
| Pruebas | Funcionales manuales (A), integración con Postman (B) y unitarias mediante Node.js Test Runner (C). |
| Migraciones | Scripts SQL numerados y versionados. |
| Versionamiento | Repositorio GitHub con commits descriptivos y revisiones humanas. |
| Observabilidad | Logs estructurados, métricas del alojamiento si existen y endpoints `/health`. |
| Despliegue | Progresivo: local → prueba integrada → URL pública HTTPS. |
| Organización | Scrum simplificado; capas con integración progresiva; bloques medianos y subtareas atómicas. |

### 2.2. Decisión pendiente y momento de resolverla

**Plataforma de alojamiento definitivo: PENDIENTE DE DEFINIR.** No se considera aprobada Railway, IIS, Render ni ninguna otra solución. El plan obliga a **evaluar y elegir el alojamiento antes de comenzar el despliegue final de la semana 4**, idealmente durante la preparación de la semana 3.

La plataforma finalmente elegida debe permitir: React público por HTTPS, tres procesos Node.js, rutas `/api`, comunicación interna, una instancia MySQL persistente con tres bases lógicas, variables de entorno protegidas y un costo/operación compatibles con un mini proyecto. La instalación de IIS en Windows no equivale por sí sola a disponer de una aplicación accesible públicamente.

La elección se registrará en el TRD y el README cuando se tome. **No se fijan proveedor, dominio, precio, puertos públicos ni fechas calendario de despliegue por anticipado.**

### 2.3. Exclusiones expresas

No desarrollar pagos, facturación, caja, domicilios, reservas, inventario de ingredientes, registro de clientes, reportes financieros, predicciones mediante IA, notificaciones automáticas, WebSockets, impresoras, códigos QR, aplicaciones nativas, soporte multi-restaurante, nuevos estados de pedido ni microservicios adicionales. La IA es una ayuda al desarrollo, **no una función incluida para el usuario del restaurante**.

## 3. Definición del MVP y prioridades

### 3.1. Núcleo mínimo del producto

El MVP debe cubrir, sin excepciones, los siguientes comportamientos:

1. **Administrador:** crear y gestionar cuentas, productos y mesas; consultar/registrar pedidos y confirmar entregas cuando corresponda.
2. **Mesero:** autenticarse, consultar mesas y menú, registrar pedidos, consultar estados y confirmar la entrega cuando estén listos.
3. **Cocinero:** consultar pedidos y avanzar los estados `Pendiente → En preparación → Listo`.
4. **Sistema:** calcular el total en el servidor, guardar pedido y detalles de forma transaccional, mantener precios históricos, impedir pedidos activos duplicados por mesa y liberar la mesa tras la entrega.
5. **Interfaz:** rutas protegidas, mensajes comprensibles de carga, vacío, error y éxito; diseño responsive.
6. **Seguridad y datos:** sesiones revocables, acceso por rol, validación de entradas, consultas parametrizadas y persistencia MySQL.

### 3.2. Priorización

**Todos los RF-01 a RF-18 son obligatorios para declarar el MVP terminado**. La prioridad organiza el **orden de ejecución y la corrección de bloqueos**, no autoriza a excluir requisitos:

| Tipo de prioridad | Qué incluye | Tratamiento |
|---|---|---|
| Crítica para el flujo principal | Login y permisos, menú utilizable, mesas, registro de pedidos, integridad, preparación y entrega. | Desarrollar y probar antes de aprobar la integración. |
| Alta para completar la especificación | CRUD permitido de productos/mesas, administración de usuarios, desactivación, validaciones y diseño responsive. | Incluir en los sprints fijados; indispensable antes de la entrega. |
| De presentación y documentación | Mensajes claros, evidencias de pruebas, README, diagramas, sustentación. | Mantener a lo largo del proyecto y cerrar en la semana 4. |

### 3.3. Exclusión de iteraciones «nice-to-have»

**No hay fases de producto 2 o 3 con funciones nuevas.** Las semanas 2, 3 y 4 implementan, integran y verifican **el mismo MVP**. Si una actividad termina antes de lo previsto, el tiempo restante se usa para pruebas, corrección, accesibilidad de las pantallas y documentación aprobada.

### 3.4. Recorrido mínimo demostrable

`Configuración del restaurante → Login mesero → Mesa disponible → Productos y cantidades → Pedido Pendiente → Cocina En preparación → Listo → Entregado → Mesa Disponible`.

El pedido entregado permanece en MySQL; el sistema no admite cancelación de pedidos registrados ni múltiples pedidos activos simultáneos para una mesa.

## 4. Metodología de trabajo y gobierno

### 4.1. Scrum simplificado

Se trabajará con **cuatro sprints de una semana**, sin exigir ceremonias extensas ni crear roles que no hayan sido asignados. La práctica mínima será:

| Momento | Actividad | Resultado |
|---|---|---|
| Inicio del sprint | Elegir bloques ya aprobados y sus subtareas; comprobar dependencias. | Lista de trabajo de la semana. |
| Durante el sprint | Implementar una subtarea, revisar y comprobar; registrar avances en GitHub. | Incrementos revisables y evidencia. |
| Seguimiento breve | Revisar pendientes, bloqueos y riesgos. | Priorización de correcciones sin ampliar alcance. |
| Cierre del sprint | Demostrar entregables, aplicar su puerta de calidad y registrar observaciones. | Hito aprobado o incidencias pendientes. |

### 4.2. Responsabilidades

| Responsabilidad | Función | Asignación |
|---|---|---|
| Responsable de coordinación / Scrum Master | Seguimiento, organización de tareas y comprobación de hitos. | **Por asignar.** |
| Responsables de desarrollo | Implementación, pruebas iniciales y commits de frontend, backend y bases de datos. | **Por asignar.** |
| Responsable de aceptación / Product Owner | Validar que las funciones correspondan a lo solicitado. | **Por asignar o confirmar.** |
| Equipo completo | Revisar integraciones, evidencias y cambios generados por IA. | Participantes del proyecto. |

Una persona puede cumplir varias funciones si el equipo es pequeño. Este PLAN **no inventa nombres, número de integrantes ni disponibilidad horaria**.

### 4.3. Forma de seguimiento

Cada tarea se mantendrá en `Pendiente`, `En proceso` o `Terminado`, con identificador, referencia al requisito, sprint, responsable asignado, criterio de aceptación y evidencia. Las incidencias se documentarán con prioridad **Crítica / Media / Baja**.

## 5. Estrategia de desarrollo y dependencias

### 5.1. Enfoque aprobado

**Desarrollo por capas con integración progresiva**:

1. Definir requisitos, modelo de datos, diagramas y prototipos.
2. Crear scripts SQL, microservicios, autenticación y contratos REST.
3. Construir interfaces React y conectarlas con la API.
4. Ejecutar pruebas finales, corregir, desplegar y sustentar.

Se realizarán comprobaciones de integración **desde el Sprint 2**; no se esperará a que todo el frontend esté terminado para descubrir problemas de comunicación.

### 5.2. Dependencias técnicas dentro del backend

```text
SRS + ERD + contratos de datos
           |
           v
Scripts SQL de las 3 bases de datos
           |
           v
Microservicio USUARIOS (sesiones y permisos)
           |
           v
Microservicio CATÁLOGO (productos y mesas)
           |
           v
Microservicio PEDIDOS (registro, detalles, estados)
           |
           v
Pruebas de API y comunicación entre microservicios
           |
           v
React: login, administración, mesero y cocina
           |
           v
Integración funcional → pruebas finales → despliegue
```

**Responsabilidades:** Usuarios gestiona `usuarios`; Catálogo gestiona `productos` y `mesas`; Pedidos gestiona `pedidos` y `detalle_pedido`. Ningún servicio consulta tablas ajenas directamente. Las referencias entre bases se verifican mediante HTTP interno. La relación `pedidos`–`detalle_pedido` utiliza una FK física dentro de la misma base de datos.

### 5.3. Dependencias críticas no negociables

- La cuenta inicial del administrador debe prepararse **sin registro público** para habilitar las pruebas del personal.
- Se aplicarán primero los scripts SQL necesarios para cada microservicio.
- El servicio de Pedidos necesita verificar mesas y productos en Catálogo, y todos los servicios deben poder comprobar autenticación/roles mediante Usuarios.
- La regla de **un pedido activo por mesa** requiere protección atómica en la base de Pedidos, además de la validación de disponibilidad.
- Los productos y mesas relacionados con pedidos históricos no se eliminan sin una comprobación segura entre servicios; si esta no puede garantizarse, la eliminación se rechaza.
- El alojamiento público debe decidirse antes de iniciar el despliegue final.

## 6. Cronograma maestro de cuatro semanas

| Sprint | Semana | Objetivo | Bloques | Evidencia y puerta de calidad |
|---|---|---|---|---|
| **Sprint 1** | 1 | Análisis y diseño. | B-01 a B-04 | SRS, backlog, ERD, UML y prototipo; **Gate 1**. |
| **Sprint 2** | 2 | Backend, MySQL, seguridad y APIs. | B-05 a B-09 | Tres microservicios y pruebas con Postman; **Gate 2**. |
| **Sprint 3** | 3 | Interfaces e integración funcional. | B-10 a B-14 | Aplicación React integrada, recorrido del pedido y responsive; **Gate 3**. |
| **Sprint 4** | 4 | Pruebas finales, correcciones, despliegue y sustentación. | B-15 a B-18 | Resultados, aplicación pública y diez entregables; **Gate 4**. |

No se fijan fechas absolutas de inicio/fin porque **no se han establecido en la entrevista**. El calendario se anclará cuando el equipo comunique la fecha de inicio del primer sprint. La duración total acordada es de un mes.

### 6.1. Hitos de salida

| Hito | Fecha relativa | Condición principal |
|---|---|---|
| H-01 | Fin de semana 1 | Documentos y diseños revisados. |
| H-02 | Fin de semana 2 | Bases, endpoints y autenticación operativos. |
| H-03 | Fin de semana 3 | MVP integrado en entorno de desarrollo, probado por roles. |
| H-04 | Fin de semana 4 | MVP público, probado y sustentable; documentación completa. |

## 7. Sprint 1 — Análisis y diseño

**Objetivo:** convertir las decisiones de la entrevista en artefactos académicos y diseños coherentes con los 18 RF, 12 RNF, tres roles, cinco tablas y tres microservicios. **No corresponde aún construir nuevas funciones.**

### B-01. Elaborar el SRS

- Convertir el PRD aprobado en el documento de requisitos del software exigido por el instructor.
- Describir propósito, alcance, actores, requisitos RF-01…RF-18, RNF-01…RNF-12, restricciones, reglas de negocio y supuestos.
- Incorporar criterios de aceptación y referencias de trazabilidad a pruebas.
- Revisar que no aparezcan funciones excluidas.

**Terminado cuando:** el SRS esté completo, sea coherente con el PRD y haya sido revisado por el equipo. **Evidencia:** `docs/` con versión aprobada del SRS.

### B-02. Historias de usuario y Product Backlog

- Redactar historias en el formato «Como [rol], quiero [acción], para [beneficio]» a partir de los requisitos aprobados.
- Asociar a cada historia los RF correspondientes y sus criterios de aceptación.
- Priorizar la ejecución sin excluir requisitos obligatorios.
- Registrar los bloques y subtareas del plan en el Product Backlog.

**Terminado cuando:** las historias cubran todos los RF sin introducir nuevas capacidades y el backlog permita seguimiento por sprint. **Evidencia:** historias y Product Backlog versionados.

### B-03. Modelo entidad-relación y UML

- Elaborar el ERD de `usuarios`, `productos`, `mesas`, `pedidos`, `detalle_pedido`.
- Señalar la FK interna de detalle a pedido y las referencias lógicas entre servicios.
- Crear diagrama de casos de uso de los tres roles y sus operaciones aprobadas.
- Crear diagrama de clases coherente con la lógica del backend, sin añadir entidades de negocio innecesarias.
- Verificar relaciones, cardinalidades y restricciones de negocio.

**Terminado cuando:** el ERD, casos de uso y clases coincidan con SRS y TRD. **Evidencia:** tres diagramas revisados.

### B-04. Prototipos de interfaces

- Diseñar login y vistas principales de administrador, mesero y cocina.
- Representar gestión de productos, mesas, usuarios, registro/consulta de pedidos y avance de estados.
- Mostrar estados de carga, vacío, error y confirmación, además del comportamiento responsive.
- Registrar el uso de IA en la generación de interfaces, cuando corresponda.

**Terminado cuando:** el prototipo represente el flujo principal y los permisos aprobados sin pantallas adicionales. **Evidencia:** prototipos y registro de IA.

### Gate 1 — Aprobación de análisis

**Exigir:** SRS + historias/backlog + ERD + casos de uso + clases + prototipos, revisados y consistentes. Si hay contradicciones críticas, no se aprueba el hito hasta corregirlas. Pueden iniciarse tareas independientes mientras se corrigen observaciones, pero el sprint no se declara terminado.

## 8. Sprint 2 — Backend y bases de datos

**Objetivo:** disponer de las tres bases lógicas y tres microservicios Node.js funcionando localmente, con API REST, sesiones, validaciones y pruebas iniciales.

### B-05. Crear las tres bases de datos y scripts SQL

- Preparar una instancia MySQL y los esquemas `restaurante_usuarios`, `restaurante_catalogo` y `restaurante_pedidos`.
- Crear las cinco tablas aprobadas y los dos campos técnicos de sesión en `usuarios`.
- Definir tipos, claves, unicidad, FK interna, validaciones de integridad y control atómico de pedido activo por mesa.
- Numerar y versionar los scripts SQL por base de datos.
- Insertar únicamente los datos de prueba necesarios; preparar la cuenta administradora inicial de manera segura.

**Terminado cuando:** los scripts permiten crear un entorno nuevo, las tablas se corresponden con el TRD y los datos se consultan correctamente. **Evidencia:** scripts y resultados SQL.

### B-06. Microservicio de usuarios y autenticación

- Configurar un proceso Node.js/Express independiente conectado solo a `restaurante_usuarios`.
- Implementar login, consulta de usuario actual, logout revocable y administración básica de cuentas.
- Proteger contraseñas con bcrypt; tokens de sesión aleatorios, hash y expiración; cookie protegida.
- Aplicar Zod y comprobar los roles y el estado activo de la cuenta.
- Exponer comprobación interna de sesión y endpoint `/health` sin divulgar secretos.
- Ejecutar pruebas de acceso permitido, acceso denegado y cierre de sesión.

**Terminado cuando:** los tres roles pueden autenticarse de forma controlada y las sesiones invalidadas ya no autorizan operaciones. **Evidencia:** resultados de Postman y pruebas correspondientes.

### B-07. Microservicio de catálogo y mesas

- Crear el servicio Node.js/Express conectado solo a `restaurante_catalogo`.
- Implementar los endpoints de productos y mesas, operaciones CRUD permitidas y disponibilidad.
- Validar datos mediante Zod y permisos mediante Usuarios.
- Obtener la disponibilidad de mesas a partir de pedidos activos, no desde un campo duplicado.
- Proteger las eliminaciones para preservar referencias históricas: si no puede verificarse su seguridad entre servicios, rechazar la operación.
- Probar productos no disponibles, mesa duplicada, eliminaciones restringidas y errores de servicios externos.

**Terminado cuando:** el administrador gestiona menú/mesas, los roles consultan lo permitido y se respetan integridad e historial. **Evidencia:** endpoints y pruebas en Postman.

### B-08. Microservicio de pedidos y cocina

- Crear el servicio Node.js/Express conectado solo a `restaurante_pedidos` y verificar el esquema preparado en B-05.
- Implementar registro y consulta de pedidos, detalles, cantidades y total calculado en backend.
- Validar por API interna la mesa disponible y productos vigentes antes de confirmar.
- Registrar pedido y detalles en una **transacción local** y guardar nombre/precio históricos.
- Impedir **atómicamente** más de un pedido activo por mesa, incluso ante solicitudes simultáneas.
- Implementar `Pendiente → En preparación → Listo → Entregado` con permisos correctos y sin retrocesos.
- Exponer `/health`, manejar errores de comunicación y ejecutar pruebas específicas.

**Terminado cuando:** puede registrarse un pedido completo, consultarlo y avanzar sus estados sin romper permisos, precios históricos o integridad. **Evidencia:** pruebas de Postman, MySQL y unitarias pertinentes.

### B-09. Verificación y documentación de APIs

- Recorrer los endpoints públicos e internos de los tres servicios y documentar métodos, rutas, entradas, salidas y respuestas de error.
- Ejecutar pruebas desde Postman, incluidas autenticación, permisos y validaciones.
- Comprobar dependencias Usuarios ↔ Catálogo/Pedidos y Catálogo ↔ Pedidos.
- Probar fallos de conexión, rollback de pedido y bloqueo de segunda solicitud activa por mesa.
- Registrar incidencias y corregir los errores que impidan aprobar Gate 2.

**Terminado cuando:** los tres servicios interactúan correctamente en los casos principales y existe documentación reproducible de la API. **Evidencia:** colección/registro de Postman y resultados guardados.

### Gate 2 — Backend verificable

**Exigir:** scripts reproducibles, autenticación/roles, tres procesos operativos, endpoints críticos y persistencia correcta, pruebas iniciales y comunicación entre servicios verificadas. No basta con que `/health` responda: también deben funcionar la base de datos y las operaciones necesarias.

## 9. Sprint 3 — Frontend e integración

**Objetivo:** construir las vistas React autorizadas y conectarlas a los microservicios para obtener el **MVP integrado** al finalizar la semana.

### B-10. Inicio de sesión y navegación por roles

- Configurar React + Vite + CSS, sin framework visual obligatorio.
- Implementar `/login` con usuario y contraseña y comprobación de sesión vigente.
- Gestionar cookies de sesión según el TRD, cierre de sesión y rutas protegidas.
- Redirigir a `/admin`, `/mesero` o `/cocina` según el rol; ocultar opciones no permitidas.
- Mostrar carga, errores de credenciales, sesión expirada y confirmación de acceso.

**Terminado cuando:** cada rol ingresa a su pantalla, las rutas no autorizadas están protegidas y se respeta la sesión al recargar. **Evidencia:** demostración y pruebas de acceso.

### B-11. Interfaces de administración y menú

- Construir vistas de productos, mesas y usuarios con componentes y formularios reutilizables.
- Conectar registro, consulta, modificación, eliminación permitida y desactivación a las APIs correspondientes.
- Mostrar disponibilidad, restricciones y mensajes de carga/vacío/error/éxito.
- Verificar que solo el administrador vea controles de modificación; el backend mantiene la protección real.

**Terminado cuando:** las operaciones administrativas aprobadas se realizan desde React y los datos se actualizan correctamente. **Evidencia:** flujo de administración comprobado.

### B-12. Interfaces de mesero y cocina

- Construir panel de mesas y pedidos del mesero; formulario de nuevo pedido y listado de estados.
- Construir pantalla de cocina con pedidos Pendientes, En preparación y Listos.
- Permitir al cocinero avanzar preparación y al mesero/administrador confirmar la entrega.
- Mostrar productos, cantidades, totales y mensajes de error sin crear funciones extras.

**Terminado cuando:** mesero y cocinero completan sus operaciones desde las vistas autorizadas. **Evidencia:** demostración de flujo por rol.

### B-13. Integración completa React ↔ APIs

- Conectar los formularios y listados a rutas `/api` mediante Fetch API.
- Configurar el enrutamiento local para los tres servicios, respetando autenticación y cookies.
- Verificar alta de pedido, paso por cocina, entrega y disponibilidad final de la mesa.
- Gestionar respuestas HTTP, fallos de red y resultados de registro desconocidos sin enviar duplicados automáticamente.
- Ejecutar las seis pruebas de integración iniciales, corrigiendo fallos detectados.

**Terminado cuando:** el Happy Path completo funciona con datos persistentes y los tres servicios interactúan. **Evidencia:** recorrido funcional documentado y PI-01…PI-06 ejecutadas inicialmente.

### B-14. Validaciones visuales y diseño responsive

- Implementar comprobaciones de formulario en React y mensajes comprensibles; mantener validación definitiva en backend.
- Adaptar pantallas a computador, tableta y teléfono sin desbordamientos horizontales en vistas principales.
- Mostrar estados de carga, vacío, error y éxito, con bloqueo de botones en solicitudes pendientes.
- Probar las interfaces en Chrome y Edge.
- Realizar pruebas con personas representando los tres roles y registrar observaciones.

**Terminado cuando:** las vistas principales son utilizables en distintos tamaños y la retroalimentación identificada queda registrada o corregida. **Evidencia:** capturas y registro de observaciones.

### Gate 3 — MVP integrado

**Exigir:** interfaz React responsive, autenticación y navegación correctas, cuatro módulos funcionales, recorrido completo de pedido y primeras pruebas de integración satisfactorias. **El resultado es un MVP integrado en desarrollo**, no todavía una entrega pública aprobada.

## 10. Sprint 4 — Pruebas, despliegue y entrega

**Objetivo:** verificar integralmente el MVP, corregir errores, publicar la aplicación y preparar la sustentación con los diez entregables.

### B-15. Ejecutar pruebas funcionales, unitarias y de integración

- Ejecutar **CP-01 a CP-16** (16 pruebas funcionales).
- Ejecutar **PI-01 a PI-06** (seis pruebas de integración).
- Ejecutar **PU-01 a PU-05** (cinco pruebas unitarias con Node.js Test Runner).
- Comprobar sesiones, permisos, precios históricos, integridad, transacciones, disponibilidad de mesas y estados.
- Registrar resultado esperado, obtenido, estado, fecha y evidencia.

**Terminado cuando:** todas las pruebas críticas están ejecutadas y sus resultados son verificables. Para aprobar Gate 4, las **16/16 + 6/6 + 5/5** deben resultar satisfactorias. **Evidencia:** matriz de resultados y capturas/salidas.

### B-16. Corregir errores y aprobar calidad

- Clasificar incidencias como Críticas, Medias o Bajas.
- Resolver primero cualquier fallo que impida login, registro, persistencia, autorización, preparación o entrega.
- Repetir las pruebas relacionadas después de cada corrección.
- Revisar que no se hayan introducido funcionalidades no aprobadas ni dependencias innecesarias.
- Verificar las cuatro puertas de calidad y registrar la aprobación humana.

**Terminado cuando:** no quedan errores críticos conocidos, los criterios aceptados se cumplen y las regresiones están verificadas. **Evidencia:** incidencias cerradas y acta/resumen de revisión.

### B-17. Desplegar la aplicación definitiva

- **Confirmar previamente el alojamiento**, sin imponer proveedor de antemano.
- Desplegar React y los tres servicios Node.js, con enrutamiento `/api`, comunicación interna y HTTPS público.
- Configurar una instancia MySQL persistente con las tres bases lógicas y aplicar scripts SQL versionados.
- Guardar secretos en variables de entorno del servidor y comprobar que no existan en GitHub ni en frontend.
- Verificar `/health`, logs y métricas disponibles, sin asumir que representan por sí solos integración sana.
- Probar login, pedido completo, reinicio y persistencia desde un dispositivo distinto del de desarrollo.
- Registrar URL, procedimiento y evidencia del despliegue en README/documentación.

**Terminado cuando:** el sistema es públicamente accesible y supera sus pruebas críticas en el alojamiento seleccionado. **Evidencia:** URL, resultados de pruebas y documentación de despliegue. **Bloqueo declarado:** esta tarea no puede aprobarse si el alojamiento sigue pendiente.

### B-18. Consolidar documentos y sustentar

- Completar y revisar los diez entregables académicos, con coherencia entre SRS, diagramas, código y pruebas.
- Consolidar el registro de uso de IA: herramienta, tarea, alcance del cambio y validación humana.
- Verificar que el repositorio GitHub contiene historial de commits, scripts SQL y un README de ejecución.
- Preparar una demostración de configuración, registro, preparación y entrega.
- Comprobar el cumplimiento de Gate 4 y dejar evidencia de la versión entregada.

**Terminado cuando:** los diez entregables están disponibles y la sustentación puede demostrar el flujo principal. **Evidencia:** enlaces/documentos finales y aplicación funcional.

### Gate 4 — Entrega final

**Exigir:** **16/16 CP, 6/6 PI y 5/5 PU**, ausencia de fallos críticos conocidos, funcionamiento responsive, despliegue público seguro y persistente, GitHub con historial, documentación de IA y **diez entregables completos**. Si la plataforma pública no ha sido elegida o configurada, **el proyecto no se declarará terminado**.

## 11. Catálogo y trazabilidad de los 18 bloques

La numeración **B-01…B-18** representa **bloques de trabajo**, no se corresponde uno a uno con los 18 requisitos funcionales **RF-01…RF-18**.

| Bloque | Sprint | Propósito | Requisitos o compromisos cubiertos | Dependencias principales |
|---|---:|---|---|---|
| B-01 | 1 | SRS. | RF-01…18; RNF-01…12. | PRD aprobado. |
| B-02 | 1 | Historias y Product Backlog. | RF-01…18; metodología. | B-01 / PRD. |
| B-03 | 1 | ERD, casos de uso y clases. | Modelo de datos, roles y RF. | B-01. |
| B-04 | 1 | Prototipos. | Navegación, interfaz responsive y roles. | PRD, USER FLOW. |
| B-05 | 2 | MySQL y SQL versionado. | Persistencia e integridad. | B-03. |
| B-06 | 2 | Usuarios y autenticación. | RF-14…18; RNF-04/05. | B-05. |
| B-07 | 2 | Catálogo y mesas. | RF-01…04; RF-12/13. | B-05/06; contrato Pedidos. |
| B-08 | 2 | Pedidos y cocina. | RF-05…11; integridad. | B-05/06/07. |
| B-09 | 2 | Pruebas/documentación de APIs. | API REST, permisos, integración inicial. | B-06/07/08. |
| B-10 | 3 | React login/navegación. | RF-16…18; rutas. | B-06. |
| B-11 | 3 | React administración y menú. | RF-01…04; RF-12…15. | B-07/06. |
| B-12 | 3 | React mesero/cocina. | RF-05…11. | B-08/07/06. |
| B-13 | 3 | Integración React y APIs. | Happy Path, PI-01…06. | B-10/11/12, B-09. |
| B-14 | 3 | Validación UI y responsive. | RNF-01/02/07/08/11. | B-10…13. |
| B-15 | 4 | Pruebas finales. | CP-01…16; PI-01…06; PU-01…05. | B-13/14. |
| B-16 | 4 | Correcciones y calidad. | Gates y criterio de aceptación. | Hallazgos de B-15. |
| B-17 | 4 | Despliegue. | Aplicación pública, HTTPS, persistencia. | B-16 y alojamiento aprobado. |
| B-18 | 4 | Documentación y sustentación. | Diez entregables y evidencia IA. | Resultados de todos los sprints. |

Los bloques B-01 a B-04 deben mantener la correspondencia con el SRS académico. Los demás bloques serán la referencia para organizar los tickets de implementación, sin crear requisitos de producto nuevos.

## 12. Puertas de calidad y criterios de parada

### 12.1. Condiciones de cada gate

| Gate | Momento | Comprobación obligatoria | Evidencia mínima |
|---|---|---|---|
| **Gate 1** | Fin Sprint 1 | SRS, historias/backlog, ERD, UML y prototipos completos y coherentes. | Documentos revisados. |
| **Gate 2** | Fin Sprint 2 | Tres microservicios, tres bases lógicas, auth, API y reglas críticas funcionales. | Postman, consultas SQL, revisión. |
| **Gate 3** | Fin Sprint 3 | React integrado, roles, cuatro módulos, Happy Path y responsive. | Demostración y pruebas iniciales. |
| **Gate 4** | Fin Sprint 4 | Pruebas finales aprobadas, cero fallos críticos conocidos, aplicación pública y diez entregables. | Resultados, URL, GitHub y documentación. |

### 12.2. Qué ocurre si un gate falla

1. Registrar la incidencia y su efecto sobre el requisito asociado.
2. Clasificarla como **Crítica**, **Media** o **Baja**.
3. Corregir primero errores críticos de autenticación, registro, integridad, preparación y entrega.
4. Repetir las pruebas del área afectada y comprobar que no haya regresiones.
5. Obtener revisión humana y **solo después** aprobar el hito.

Se puede trabajar en tareas independientes si no se compromete la calidad, pero **un gate no aprobado no puede reportarse como completado**.

### 12.3. Definición de Terminado (Definition of Done)

**Para una subtarea:** objetivo cumplido, modificación delimitada, validación ejecutada cuando corresponda, sin secretos ni funciones extra; resultado revisado por una persona.

**Para un bloque:** subtareas integradas, criterios comprobados, evidencia registrada, cambios con historial en GitHub, sin errores críticos en su alcance.

**Para un sprint:** bloques comprometidos finalizados y gate respectivo revisado y aprobado.

**Para el proyecto:** RF-01…18, RNF aplicables, CP-01…16, PI-01…06, PU-01…05, URL pública segura, persistencia y diez entregables obligatorios. La redacción de un documento **no equivale** a superar una prueba.

### 12.4. Revisión humana (human-in-the-loop)

La supervisión humana intervendrá **antes** de autorizar una tarea asistida por IA, **después** de cada modificación relevante y **al cierre** de cada sprint. Ningún agente de IA puede declarar por sí solo que las pruebas están aprobadas ni introducir un cambio de alcance sin aceptación expresa.

## 13. Gestión del Product Backlog y tareas

### 13.1. Granularidad elegida

- **Bloques medianos:** agrupan el trabajo de un módulo o resultado verificable.
- **Subtareas atómicas:** unidades de implementación controladas, adecuadas para revisiones pequeñas y solicitudes precisas a IA.
- **Referencia orientativa, no compromiso horario:** una subtarea puede ocupar 1–3 horas; una tarea mediana medio día a un día; un bloque funcional uno o dos días según el equipo. Los tiempos concretos se ajustarán al asignar responsables y disponibilidad, **que aún no están definidos**.

### 13.2. Campos del ticket

| Campo | Uso |
|---|---|
| ID | Identificador único de tarea/subtarea (por ejemplo, `B-08.04`). |
| Título | Resultado concreto, en términos verificables. |
| Requisito relacionado | RF/RNF o entregable académico correspondiente. |
| Descripción | Qué debe hacerse y qué queda fuera. |
| Prioridad | Crítica, alta o normal según el riesgo y la dependencia. |
| Sprint | Una de las cuatro semanas. |
| Responsable | Asignar durante la planificación; no inventar nombre. |
| Dependencias | Bloques/subtareas que deben existir antes. |
| Aceptación | Condición comprobable para mover a Terminado. |
| Estado | Pendiente / En proceso / Terminado. |
| Evidencia | Prueba, captura, archivo o commit pertinente. |

### 13.3. Ejemplo de descomposición del bloque B-08

| Subtarea | Acción acotada | Criterio de verificación |
|---|---|---|
| B-08.01 | Conectar Pedidos con su base y rutas. | Proceso inicia y consulta esquema correcto. |
| B-08.02 | Registrar pedido y detalles en transacción. | O se guardan todos los datos o ninguno. |
| B-08.03 | Consultar Catálogo y calcular total. | Mesa/productos verificados; precios no vienen del cliente. |
| B-08.04 | Evitar pedidos activos simultáneos por mesa. | Segunda solicitud concurrente no duplica el pedido activo. |
| B-08.05 | Consultar pedidos y cambiar estados. | Solo transiciones y roles autorizados. |
| B-08.06 | Validar entradas y probar flujos. | Solicitudes inválidas se rechazan sin inconsistencias. |

Las tablas `pedidos` y `detalle_pedido` **se crean formalmente en B-05**; B-08 verifica y usa ese esquema, evitando duplicación de responsabilidades.

### 13.4. Instrucciones a herramientas de IA

Las solicitudes de código deberán señalar: **bloque + subtarea, requisito RF/RNF, archivos permitidos, comportamiento esperado, restricciones y prueba concreta**. No se solicitará «construir todo el sistema» en un solo prompt. La IA no debe instalar dependencias sin justificación ni modificar servicios ajenos a la tarea sin una revisión explícita.

## 14. Estrategia de pruebas y evidencias

### 14.1. Herramientas y alcance elegidos

| Mecanismo | Herramienta acordada | Alcance |
|---|---|---|
| Pruebas funcionales | Navegador y verificación manual. | Operaciones de los tres roles y cuatro módulos. |
| Pruebas de API/integración | Postman. | Contratos HTTP, roles, servicios y MySQL. |
| Pruebas unitarias | Node.js Test Runner. | Cálculos, entradas, estados y permisos. |
| Validación de datos | Zod. | Estructuras de entrada en los tres servicios. |
| Compilación | Vite. | Frontend compilable sin errores. |
| Persistencia e integridad | MySQL. | Transacciones, tablas y restricciones. |
| Observabilidad | Logs y `/health`; panel del proveedor si existe. | Fallos, errores de integración, disponibilidad básica. |
| Compatibilidad | Chrome y Edge; vista responsive. | Formularios y pantallas principales. |

**No es obligatorio** incorporar Playwright, Supertest, Jest, linters adicionales ni CI/CD empresarial. No se fija un porcentaje arbitrario de cobertura de código.

### 14.2. Plan de casos aprobados

**16 pruebas funcionales — CP-01 a CP-16:**

| Grupo | Casos | Qué cubren |
|---|---|---|
| Acceso y permisos | CP-01, CP-02, CP-03, CP-16 | Login correcto/incorrecto, accesos prohibidos, logout revocable. |
| Menú | CP-04, CP-05, CP-06, CP-07 | Alta, validación, modificación y eliminación permitida. |
| Pedidos | CP-08, CP-09, CP-10, CP-13 | Registro, valores inválidos, mesa ya ocupada, entrega/liberación. |
| Cocina | CP-11, CP-12 | Avance de preparación y rechazo de transiciones ilegales. |
| Administración | CP-14, CP-15 | Eliminación protegida de mesa, gestión y desactivación de usuarios. |

**Seis pruebas de integración — PI-01 a PI-06:** React↔API; API↔MySQL; Pedidos→Cocina; Cocina→Pedidos; Pedidos↔Mesas; Usuarios↔Autorización.

**Cinco pruebas unitarias — PU-01 a PU-05:** total, cantidades positivas, precios válidos, transiciones y permisos.

Además, se comprobarán los riesgos específicos del TRD: error de un servicio dependiente, registro transaccional y solicitudes simultáneas para una misma mesa. No añaden módulos ni un conjunto de pruebas extra obligatorio con numeración nueva.

### 14.3. Registro de resultados

| Dato por prueba | Contenido requerido |
|---|---|
| Identificador | `CP-08`, `PI-05`, etc. |
| Contexto | Módulo, rol, estado inicial y datos de prueba. |
| Resultado esperado | Comportamiento conforme al PRD/TRD. |
| Resultado real | Lo observado después de **ejecutar** la prueba. |
| Estado | Aprobada / Fallida / Pendiente de ejecución. |
| Evidencia | Captura, salida de prueba o petición/respuesta de Postman. |
| Corrección | Referencia a incidencia y a commit, si aplica. |

No se llenarán resultados reales ficticios. La IA puede proponer pruebas, pero **solo las ejecuciones observadas** sirven para aprobar Gates.

### 14.4. Datos mínimos de prueba

Como conjunto pequeño y ficticio: **un administrador, un mesero, un cocinero, tres mesas, cuatro productos** y varios pedidos para cubrir estados y restricciones. No se almacenarán datos reales de clientes.

## 15. Despliegue progresivo y retroalimentación

### 15.1. Tres etapas del despliegue

| Etapa | Momento | Entorno | Objetivo |
|---|---|---|---|
| **1. Desarrollo local** | Sprint 2 | Computador(es) de desarrollo. | Probar MySQL, los tres Node.js y APIs. |
| **2. Prueba integrada con usuarios** | Sprint 3 | Computador o red local correctamente configurada. | Validar React, roles y flujo completo con usuarios que representan al personal. |
| **3. Publicación final** | Sprint 4 | **Alojamiento todavía por seleccionar.** | URL pública HTTPS y persistencia, con pruebas finales. |

Una prueba en LAN o desde `localhost` **no** satisface por sí sola el entregable de aplicación pública. El alojamiento debe ofrecer conexión desde un dispositivo ajeno al equipo de desarrollo y mantener datos tras reinicios.

### 15.2. Selección del alojamiento: dependencia pendiente

Durante la semana 3 se evaluará el proveedor sin darlo por elegido. Son alternativas posibles (no aprobadas): Railway, Render, DigitalOcean, VPS con Docker Compose, Google Cloud Run + Cloud SQL o IIS sobre una infraestructura Windows adecuada. Solo se seleccionará una opción que cumpla las condiciones fijadas en la sección 2.2 y sea viable para el equipo.

**Decisión que se debe registrar:** plataforma elegida, condiciones de costo, forma de alojar React y los tres Node.js, MySQL persistente, rutas `/api`, HTTPS, secretos y procedimiento de prueba. Si no se toma, B-17/Gate 4 permanecen bloqueados.

### 15.3. Retroalimentación de roles

| Representante | Recorrido de prueba | Observación esperada |
|---|---|---|
| Administrador | Configurar productos, mesas y usuarios. | Claridad y funcionamiento de formularios/listados. |
| Mesero | Elegir mesa y registrar/entregar pedido. | Facilidad de registro, total y estados. |
| Cocinero | Consultar pedido y avanzar preparación. | Comprensión de las categorías y los cambios de estado. |
| Instructor | Revisar el flujo general y entregables. | Cumplimiento de los requisitos académicos. |

Las observaciones se registrarán con fecha, rol, función, problema, prioridad y estado. Solo se corregirán fallos y aspectos de claridad relacionados con el alcance aprobado; no se aceptarán nuevas funciones a través de esta retroalimentación.

### 15.4. Publicación y recuperación básica

1. Verificar localmente la versión que se publicará y guardar los cambios en GitHub.
2. Antes de cambios importantes sobre MySQL, conservar una copia de seguridad.
3. Aplicar scripts SQL versionados y configurar variables de entorno del alojamiento.
4. Publicar React, tres microservicios y una instancia MySQL con las tres bases lógicas.
5. Comprobar HTTPS, rutas, comunicaciones, login, pedido completo, reinicio y persistencia.
6. Registrar URL y resultados; ante un fallo, volver al código previamente probado y revisar datos/migraciones antes de restaurar respaldos.

No se requieren balanceadores avanzados, colas, Kubernetes, múltiples regiones ni procesos de recuperación empresarial.

## 16. GitHub, documentación y uso de IA

### 16.1. Organización del repositorio

```text
sistema-pedidos-restaurante/
├── frontend/
├── backend/
│   ├── usuarios/
│   ├── catalogo/
│   └── pedidos/
├── database/
│   ├── usuarios/
│   ├── catalogo/
│   └── pedidos/
├── docs/
│   ├── SRS y especificaciones
│   ├── historias y Product Backlog
│   ├── diagramas y prototipos
│   ├── pruebas y evidencias
│   └── registro de uso de IA
├── .gitignore
└── README.md
```

La estructura es referencial y mantiene **un repositorio único con tres servicios**, no tres repositorios diferentes. Los commits deberán ser descriptivos; las versiones integradas a la rama principal deben haberse revisado y probado. No se exige una estrategia compleja de ramas.

### 16.2. Registro obligatorio del uso de IA

| Campo | Qué documentar |
|---|---|
| Fecha | Cuándo se utilizó. |
| Herramienta | Herramienta de IA utilizada, cuando corresponda. |
| Bloque/subtarea | `B-04`, `B-08.03`, etc. |
| Propósito | Generar interfaz, validación, propuesta de prueba, revisar error o documentar. |
| Archivos implicados | Qué componente o archivo se modificó. |
| Revisión humana | Qué se revisó o corrigió respecto a la salida de IA. |
| Verificación | Prueba/resultado real realizado por el equipo. |

**Política:** ninguna salida de IA autoriza ampliaciones funcionales; ningún resultado generado automáticamente se marcará como comprobado si no fue ejecutado. Las contraseñas y secretos no se proporcionarán ni publicarán como evidencia.

### 16.3. Documentación técnica mínima

- README: propósito, requisitos locales, configuración del frontend y tres servicios, variables necesarias **sin valores secretos**, instalación de esquemas SQL y ejecución.
- Endpoints: método, ruta, permisos, datos esperados, respuesta y errores.
- ERD/UML y contratos: coherentes con las cinco tablas y 18 RF.
- Pruebas: identificadores, resultados observados y evidencias.
- Despliegue: pasos del alojamiento finalmente seleccionado y URL pública.
- Uso de IA: registro detallado del trabajo asistido durante los cuatro sprints.

## 17. Riesgos, dependencias críticas y contingencias

| Riesgo | Posible impacto | Prevención y respuesta |
|---|---|---|
| Tres microservicios en un mes | Retrasos y fallos de comunicación. | Limitar servicios a Usuarios, Catálogo y Pedidos; integrar desde Sprint 2. |
| Dependencias entre servicios | Un registro no se puede validar si otro servicio falla. | Timeouts, rechazo seguro, pruebas de fallo y mensajes claros. |
| Pedidos simultáneos en una mesa | Dos pedidos activos para la misma mesa. | Garantía atómica de unicidad en Pedidos y prueba de concurrencia. |
| Fallo en un detalle al registrar | Pedido incompleto o total inconsistente. | Transacción local que confirme todo o revierta todo. |
| Eliminación con historial | Referencias lógicas rotas entre servicios. | Comprobación segura antes de eliminar; ante incertidumbre, denegar. |
| Cambio de precio después de registrar | Historial alterado. | Guardar instantánea de nombre/precio en detalle_pedido. |
| IA modifica código fuera de la tarea | Regresiones y dependencias nuevas. | Subtareas acotadas, revisión humana y repetición de pruebas. |
| Alojamiento aún no definido | Riesgo de no entregar una URL pública. | Evaluar opciones en Sprint 3 y bloquear B-17 hasta aprobar una. |
| Secretos expuestos en GitHub | Acceso indebido a datos y sesiones. | `.gitignore`, variables externas, revisión de commits; nunca guardar tokens reales. |
| Falta de tiempo para pruebas | Entrega inestable. | Probar desde Sprint 2, priorizar Gates y no añadir extras. |

### 17.1. Replanificación sin expansión de alcance

Ante retrasos se revisará la distribución de **subtareas**, la asignación de responsables y la secuencia de integración. No se quitarán requisitos obligatorios ni se anunciará como terminado un entregable incompleto. No se contratarán servicios o agregarán herramientas sin una necesidad técnica real y aprobación humana.

### 17.2. Incidencias críticas vs. avances

- **Crítica:** afecta login, permisos, registro, persistencia, integridad, preparación o entrega; impide aprobar el gate.
- **Media:** limita una función obligatoria; debe corregirse antes de declararla terminada.
- **Baja:** afecta presentación o facilidad de uso sin impedir la operación; corregir antes de la entrega final.

## 18. Matriz de entregables obligatorios

| N.º | Entregable solicitado | Sprint principal | Evidencia final |
|---:|---|---|---|
| 1 | Documento de requisitos del software (**SRS**). | 1 | SRS revisado y versionado. |
| 2 | Historias de usuario y **Product Backlog**. | 1 | Historias y backlog con trazabilidad. |
| 3 | Modelo entidad-relación de la base de datos. | 1 | ERD con cinco tablas y relaciones lógicas/físicas. |
| 4 | Diagrama de casos de uso y diagrama de clases. | 1 | Ambos diagramas revisados. |
| 5 | Backend con **API REST**. | 2 | Tres servicios Node.js y contratos documentados. |
| 6 | Interfaz gráfica **responsive**. | 3 | React funcional en computador y móvil. |
| 7 | Pruebas funcionales y de integración. | 2, 3, 4 | Resultados CP/PI/PU con evidencia. |
| 8 | Repositorio GitHub con historial de cambios. | 1–4 | Repositorio y commits descriptivos. |
| 9 | Aplicación desplegada y funcional. | 4 | URL pública HTTPS y pruebas en alojamiento definitivo. |
| 10 | Documentación del uso de IA durante el desarrollo. | 1–4 | Registro consolidado de intervenciones y validaciones. |

El **PRD**, el **TRD**, este **PLAN** y el **USER FLOW** son documentos de especificación para orientar el trabajo. No reemplazan automáticamente el **SRS académico** ni el resto de las evidencias solicitadas.

## 19. Listas de comprobación y cierre

### 19.1. Cierre de cada sprint

**Sprint 1 / Gate 1**

- [ ] SRS finalizado y revisado.
- [ ] Historias y Product Backlog completos.
- [ ] ERD con cinco tablas y separación de servicios.
- [ ] Casos de uso y clases coherentes con requisitos.
- [ ] Prototipos de las pantallas principales.
- [ ] Evidencias y aprobación humana registradas.

**Sprint 2 / Gate 2**

- [ ] Scripts SQL versionados y reproducibles.
- [ ] Usuarios, Catálogo y Pedidos ejecutan sus APIs.
- [ ] Sesiones revocables y roles verificados.
- [ ] Registro transaccional y mesa activa única comprobados.
- [ ] Validaciones Zod y comunicación por HTTP comprobadas.
- [ ] Postman/documentación de endpoints disponible.

**Sprint 3 / Gate 3**

- [ ] Login y navegación protegida por rol.
- [ ] Administración, menú, mesero y cocina integrados.
- [ ] Happy Path completo demostrado.
- [ ] Carga, vacío, errores y confirmaciones implementados.
- [ ] Responsive y Chrome/Edge comprobados.
- [ ] Observaciones de pruebas con usuarios registradas.
- [ ] Alternativas de alojamiento evaluadas; elección preparada antes de Sprint 4.

**Sprint 4 / Gate 4**

- [ ] **16/16** pruebas funcionales aprobadas.
- [ ] **6/6** pruebas de integración aprobadas.
- [ ] **5/5** pruebas unitarias aprobadas.
- [ ] Sin incidencias críticas pendientes.
- [ ] Alojamiento seleccionado y documentado.
- [ ] URL pública HTTPS funcional y persistencia verificada.
- [ ] GitHub y los diez entregables académicos revisados.
- [ ] Registro de IA y sustentación completados.

### 19.2. Condición de cierre absoluto del proyecto

El proyecto se declarará **terminado** solo cuando el equipo confirme que los 18 RF y 12 RNF aplicables están satisfechos, el MVP funciona con sus tres roles y cuatro módulos, las pruebas críticas han sido **realmente ejecutadas y aprobadas**, el alojamiento está decidido y operativo, y se dispone de los **diez entregables exigidos**.

### 19.3. Registro de la decisión pendiente

| Decisión | Estado actual | Acción de cierre |
|---|---|---|
| Proveedor/servidor de alojamiento definitivo | **PENDIENTE DE DEFINIR** | Seleccionar una opción compatible, registrar su configuración y verificar el acceso público antes de aprobar B-17/Gate 4. |

No se incorpora una opción predeterminada. Este punto permanecerá abierto hasta que el usuario/equipo lo apruebe expresamente.

---

**Fin del PLAN — Sistema de pedidos para restaurante.**  
**Estado:** hoja de ruta aprobada para ejecución según la entrevista; **selección definitiva de alojamiento pendiente**.
