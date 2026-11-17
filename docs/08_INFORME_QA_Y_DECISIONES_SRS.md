# 08 — Informe de Auditoría de Requisitos (SRS IEEE 830), Diagramación UML y Control de Calidad (QA)

**Proyecto:** Sistema de Pedidos para Restaurantes — *Gourmet Bistro*  
**Rama Base Auditada:** `Dev` (`225291d`)  
**Rama de Control de Calidad Sincronizada:** `QA`  
**Documento SRS Consolidado:** `SRS_Sistema_Pedidos_Restaurante-v3.docx` (y `SRS_Sistema_Pedidos_Restaurante.docx`)  
**Fecha de Auditoría:** 17 de noviembre de 2026  

---

## 1. Resumen Ejecutivo

Se ejecutó una auditoría integral de ingeniería de requisitos (bajo el estándar **IEEE 830 / ISO/IEC/IEEE 29148**) y aseguramiento de calidad (**QA**) contrastando el documento `SRS_Sistema_Pedidos_Restaurante-v3.docx` contra el código fuente real del repositorio `Gourmet-Bistro`.

En una sola pasada se logró:
1. **Sincronizar las ramas `Dev` y `QA`** verificando que no se pierda ningún cambio previo.
2. **Corregir en el código (`Dev` → `QA`) todas las incoherencias detectadas frente al SRS** (`UsersAdminView.tsx`, `KitchenKDSView.tsx`, `RestaurantContext.tsx`).
3. **Incorporar al SRS todas las capacidades reales del código que no estaban documentadas** (Escena interactiva 3D PBR de 5 platos en `FoodPlate3D.tsx`/`Food3DModal.tsx` como `RF-19`/`HU-11`/`CU-11`/`RN-15`, Módulo de Versionamiento Git, Snapshots y Rollback en `VersionControlAdminView.tsx` como `RF-20`/`HU-12`/`CU-12`/`RN-16`, e infraestructura de alto rendimiento SQL/Brotli/OTel).
4. **Generar e incrustar los 19 diagramas técnicos y UML en alta resolución (`docs/diagrams/*.png` y dentro de `SRS_Sistema_Pedidos_Restaurante-v3.docx`)**, cumpliendo estrictamente la regla de **0 cruces de flechas y 0 colisiones** verificada por geometría computacional.

---

## 2. Registro de Decisiones de Criterio (SRS vs. Repositorio)

Cada discrepancia encontrada entre el SRS original y el repositorio fue analizada con evidencia directa en el código y resuelta bajo el siguiente registro de decisiones:

| ID | Área / Requisito | Evidencia Encontrada en el Repositorio | Criterio Aplicado y Decisión Tomada |
| :--- | :--- | :--- | :--- |
| **DEC-01** | **RF-14 / CU-10** (Creación y desactivación de usuarios) | En `backend/services/ms-usuarios/server.mjs` (línea 38), el esquema Zod exige `contrasena: z.string().min(8).max(128)`. Sin embargo, el modal de `src/views/UsersAdminView.tsx` no tenía un campo `<input type="password">` para que el administrador ingresara la clave del nuevo empleado, y al editar el estado a `Desactivado` dentro del modal no invocaba `PATCH /api/usuarios/:id/desactivar`. | **Faltante resuelto en código (`Dev` y `QA`):** Se añadió el campo obligatorio de contraseña (con validación `minLength={8}`) en `src/views/UsersAdminView.tsx` y se conectó la desactivación en `updateUser` (`src/context/RestaurantContext.tsx`) hacia `api.usuarios.desactivar(id)`. |
| **DEC-02** | **RF-11 / RN-06 / CU-08** (Exclusividad del rol Cocinero al avanzar preparación) | En `backend/services/shared/domain.mjs` (líneas 4–8), `transitionAllowed()` permite avanzar `Pendiente → En preparación → Listo` **únicamente** al rol `cocinero`. En `src/views/KitchenKDSView.tsx`, los botones de transición se mostraban activos también cuando el `administrador` abría la vista KDS, provocando un rechazo `409 Conflict` en el backend. | **Incoherencia resuelta en código (`Dev` y `QA`):** En `KitchenKDSView.tsx` se condicionaron los botones de transición a `currentUser?.role === 'cocinero'`, mostrando una etiqueta de modo supervisión para el Administrador, y en `RestaurantContext.tsx` se validó `canTransitionOrderStatus()` antes de aplicar la actualización optimista. |
| **DEC-03** | **RF-07 / CU-06** (Recálculo y confirmación cuando cambia un precio vigente) | En `backend/services/ms-pedidos/server.mjs` (línea 215), si el precio en `ms-catalogo` cambió mientras el mesero armaba la comanda, el servidor responde `409 Conflict` indicando el nuevo total vigente. En `src/context/RestaurantContext.tsx`, el bloque `catch` de `createOrder` mostraba el aviso pero no refrescaba el catálogo local. | **Faltante resuelto en código (`Dev` y `QA`):** Se agregó `if (err instanceof ApiError && err.status === 409) await refreshData();` en `createOrder` (`RestaurantContext.tsx`) para actualizar de inmediato los precios y el total de la comanda en pantalla. |
| **DEC-04** | **RF-17 / Matriz de permisos** (Consulta de mesas por rol) | En `backend/services/ms-catalogo/server.mjs` (línea 200), `GET /api/mesas` exige `requireRole('administrador', 'mesero')` conforme a la matriz de permisos del SRS. Sin embargo, `refreshData()` en `RestaurantContext.tsx` llamaba a `api.mesas.listar()` incluso cuando iniciaba sesión un `cocinero`. | **Incoherencia resuelta en código (`Dev` y `QA`):** Se ajustó `refreshData()` para consultar `api.mesas.listar()` solo si el rol activo es `administrador` o `mesero`. |
| **DEC-05** | **Nuevos RF-19 y RF-20** (Funcionalidades implementadas en código que no estaban en el SRS) | El repositorio implementa: <br>1. `src/components/3d/FoodPlate3D.tsx` y `Food3DModal.tsx`: 5 platos 3D interactivos con materiales PBR, giro 360°, zoom y selección con `Raycaster` integrados al flujo de pedidos.<br>2. `src/views/VersionControlAdminView.tsx`: Módulo exclusivo para `Administrador` con historial de versiones Git, creación de Snapshots y Rollback de estado.<br>3. `backend/sql/003_pedidos.sql` y `004_performance_indexes.sql`: Columna generada `mesa_activa` (`UNIQUE`) e índices compuestos. | **Agregado al SRS y a los diagramas UML:** Se incorporaron `HU-11`, `HU-12`, `RF-19`, `RF-20`, `CU-11`, `CU-12`, `RN-15`, `RN-16` y la sección 9 de auditoría dentro de `SRS_Sistema_Pedidos_Restaurante-v3.docx`. |
| **DEC-06** | **Secciones 2.1, 3.1, 4.1, 5.1, 5.3 y 6.1 del SRS** (Espacios reservados y diagramas UML con cruces) | El documento `SRS_Sistema_Pedidos_Restaurante-v3.docx` tenía flechas cruzadas en el diagrama general (`image2.png`) y en `CU-03` (`image5.png`), separaba innecesariamente `CU-01` y `CU-02`, omitía los diagramas por módulo y carecía de los diagramas de Dominio (`2.1`), Clases (`5.3`) y Arquitectura (`6.1`). | **Resuelto en el SRS y en `docs/diagrams/`:** Se diseñaron y generaron 19 diagramas PNG de alta resolución (15 diagramas UML de casos de uso con verificación automática de `Crossings: 0, NodeHits: 0` y 4 diagramas de Dominio, ERD, Clases y Arquitectura) y se incrustaron en el `.docx`. |

---

## 3. Catálogo de Diagramas Generados e Incrustados (`docs/diagrams/`)

Todos los diagramas de casos de uso siguen la estética de referencia (lienzo oscuro reticulado `#0B0D12`, límite de sistema rectangular blanco, actores fuera del rectángulo, óvalos de casos de uso con borde azul `#58A6FF` para casos principales y blanco para secundarios, y flechas punteadas con estereotipos `«include»` y `«extend»` sin ningún cruce ni superposición):

1. **[DCU_00_General_Sistema.png](file:///c:/Users/USER/Gourmet%20System/Gourmet-Bistro/docs/diagrams/DCU_00_General_Sistema.png)**: Diagrama UML General de Casos de Uso del Sistema (`CU-01` a `CU-12`).
2. **[DCU_M1_Acceso_y_Seguridad.png](file:///c:/Users/USER/Gourmet%20System/Gourmet-Bistro/docs/diagrams/DCU_M1_Acceso_y_Seguridad.png)**: Diagrama del Módulo 1 — Acceso y Seguridad (agrupa los casos de uso simples `CU-01 Iniciar Sesión` y `CU-02 Cerrar Sesión`).
3. **[DCU_M2_Gestion_Menu_y_3D.png](file:///c:/Users/USER/Gourmet%20System/Gourmet-Bistro/docs/diagrams/DCU_M2_Gestion_Menu_y_3D.png)**: Diagrama del Módulo 2 — Gestión del Menú y Catálogo 3D (`CU-03`, `CU-04`, `CU-11`).
4. **[DCU_M3_Pedidos_y_Comedor.png](file:///c:/Users/USER/Gourmet%20System/Gourmet-Bistro/docs/diagrams/DCU_M3_Pedidos_y_Comedor.png)**: Diagrama del Módulo 3 — Pedidos y Comedor (`CU-05`, `CU-06`, `CU-07`).
5. **[DCU_M4_Preparacion_Cocina_KDS.png](file:///c:/Users/USER/Gourmet%20System/Gourmet-Bistro/docs/diagrams/DCU_M4_Preparacion_Cocina_KDS.png)**: Diagrama del Módulo 4 — Preparación en Cocina KDS (`CU-08`).
6. **[DCU_M5_Administracion_y_Versionamiento.png](file:///c:/Users/USER/Gourmet%20System/Gourmet-Bistro/docs/diagrams/DCU_M5_Administracion_y_Versionamiento.png)**: Diagrama del Módulo 5 — Administración del Restaurante y Versionamiento (`CU-09`, `CU-10`, `CU-12`).
7. **[DCU_CU03_Registrar_Editar_Productos.png](file:///c:/Users/USER/Gourmet%20System/Gourmet-Bistro/docs/diagrams/DCU_CU03_Registrar_Editar_Productos.png)**: Diagrama individual `CU-03`.
8. **[DCU_CU04_Disponibilidad_Eliminar_Producto.png](file:///c:/Users/USER/Gourmet%20System/Gourmet-Bistro/docs/diagrams/DCU_CU04_Disponibilidad_Eliminar_Producto.png)**: Diagrama individual `CU-04`.
9. **[DCU_CU05_Consultar_Mesas_Disponibilidad.png](file:///c:/Users/USER/Gourmet%20System/Gourmet-Bistro/docs/diagrams/DCU_CU05_Consultar_Mesas_Disponibilidad.png)**: Diagrama individual `CU-05`.
10. **[DCU_CU06_Registrar_Nuevo_Pedido.png](file:///c:/Users/USER/Gourmet%20System/Gourmet-Bistro/docs/diagrams/DCU_CU06_Registrar_Nuevo_Pedido.png)**: Diagrama individual `CU-06`.
11. **[DCU_CU07_Consultar_Pedidos_Confirmar_Entrega.png](file:///c:/Users/USER/Gourmet%20System/Gourmet-Bistro/docs/diagrams/DCU_CU07_Consultar_Pedidos_Confirmar_Entrega.png)**: Diagrama individual `CU-07`.
12. **[DCU_CU08_Tablero_Cocina_Avanzar_Estado.png](file:///c:/Users/USER/Gourmet%20System/Gourmet-Bistro/docs/diagrams/DCU_CU08_Tablero_Cocina_Avanzar_Estado.png)**: Diagrama individual `CU-08`.
13. **[DCU_CU09_Gestionar_Mesas.png](file:///c:/Users/USER/Gourmet%20System/Gourmet-Bistro/docs/diagrams/DCU_CU09_Gestionar_Mesas.png)**: Diagrama individual `CU-09`.
14. **[DCU_CU10_Gestionar_Cuentas_Personal.png](file:///c:/Users/USER/Gourmet%20System/Gourmet-Bistro/docs/diagrams/DCU_CU10_Gestionar_Cuentas_Personal.png)**: Diagrama individual `CU-10`.
15. **[DCU_CU11_CU12_Platos3D_y_Versionamiento.png](file:///c:/Users/USER/Gourmet%20System/Gourmet-Bistro/docs/diagrams/DCU_CU11_CU12_Platos3D_y_Versionamiento.png)**: Diagrama de `CU-11` y `CU-12`.
16. **[DIAG_Dominio_y_Conceptual.png](file:///c:/Users/USER/Gourmet%20System/Gourmet-Bistro/docs/diagrams/DIAG_Dominio_y_Conceptual.png)**: Diagrama de Dominio y Modelo Conceptual (Secciones 2.1 y 5.1).
17. **[DIAG_ERD_Base_Datos.png](file:///c:/Users/USER/Gourmet%20System/Gourmet-Bistro/docs/diagrams/DIAG_ERD_Base_Datos.png)**: Diagrama Entidad-Relación (ERD) de los 3 esquemas MySQL 8.0 (Sección 5.2).
18. **[DIAG_Clases_UML.png](file:///c:/Users/USER/Gourmet%20System/Gourmet-Bistro/docs/diagrams/DIAG_Clases_UML.png)**: Diagrama de Clases UML del Dominio (Sección 5.3).
19. **[DIAG_Arquitectura_Microservicios.png](file:///c:/Users/USER/Gourmet%20System/Gourmet-Bistro/docs/diagrams/DIAG_Arquitectura_Microservicios.png)**: Diagrama de Arquitectura de los 3 Microservicios + Frontend React 19/Three.js (Sección 6.1).

---

## 4. Faltantes Resueltos vs. Faltantes Pendientes

### 4.1. Faltantes Resueltos en esta Iteración
- **Resuelto en código (`Dev` y `QA`):** Campo de contraseña con validación mínima de 8 caracteres en el alta de personal (`UsersAdminView.tsx` — `RF-14`/`CU-10`) y desactivación conectada a `PATCH /api/usuarios/:id/desactivar` (`RF-15`).
- **Resuelto en código (`Dev` y `QA`):** Bloqueo visual en `KitchenKDSView.tsx` y validación previa en `RestaurantContext.tsx` para que solo el rol `cocinero` ejecute las transiciones `Pendiente → En preparación → Listo` (`RF-11`/`RN-06`).
- **Resuelto en código (`Dev` y `QA`):** Sincronización automática del catálogo (`refreshData()`) cuando `POST /api/pedidos` devuelve `409 Conflict` por cambio de precios vigentes (`RF-07`).
- **Resuelto en documento SRS (`SRS_Sistema_Pedidos_Restaurante-v3.docx`):** Incorporación de las secciones `2.1`, `3.1.1–3.1.4`, `HU-11`, `HU-12`, `RF-19`, `RF-20`, `CU-11`, `CU-12`, `RN-15`, `RN-16`, sección `9` de decisiones de auditoría y los 19 diagramas UML/ERD/Arquitectura.

### 4.2. Faltantes Pendientes (Documentados Transparentemente)
- **Despliegue en servidor cloud público externo con HTTPS (`RNF-10` / Objetivo Específico 8 de la Semana 4):**
  - **Estado:** Los tres microservicios (`ms-usuarios`, `ms-catalogo`, `ms-pedidos`), sus endpoints `/health` y `/metrics`, la base de datos MySQL en XAMPP y el build de producción de Vite (`dist/`) funcionan y están verificados al 100 % en el entorno local. Queda marcado como **PENDIENTE DE INFRAESTRUCTURA EXTERNA** la contratación/aprovisionamiento de la URL pública con certificado HTTPS en un proveedor cloud (Railway / Render / VPS) para la sustentación final de la Semana 4.

---

## 5. Evidencia de Verificaciones Ejecutadas en la Rama `QA`

### 5.1. Verificación Estática de Tipos TypeScript (`npm.cmd run lint`)
- **Comando:** `tsc --noEmit`
- **Resultado:** `Código de salida 0` (0 errores de tipos en `src/` y `frontend/src/`).

### 5.2. Pruebas Unitarias de Reglas de Negocio Frontend (`npm.cmd test`)
- **Comando:** `tsx --test src/domain/rules.test.ts`
- **Resultado:** **8/8 pruebas aprobadas (`pass 8, fail 0`)**:
  - `✔ PU-01: calculateSubtotal calculates quantity * unitPrice correctly`
  - `✔ PU-01: calculateOrderTotal computes total accurately from items`
  - `✔ PU-02: validateQuantity ensures quantity is positive integer`
  - `✔ PU-03: validatePrice ensures price is a valid positive number`
  - `✔ PU-04: canTransitionOrderStatus allows strictly authorized step progression`
  - `✔ PU-05: RBAC permissions matrix correctly validates roles`
  - `✔ computeTableStatus correctly derives occupancy from active orders`
  - `✔ canDeleteProduct and canDeleteTable protect historic records`

### 5.3. Verificación Sintáctica y Pruebas Unitarias de Microservicios Backend (`npm.cmd run check:services` y `npm.cmd run test:services`)
- **Comando:** `node --check backend/services/ms-usuarios/server.mjs && node --check backend/services/ms-catalogo/server.mjs && node --check backend/services/ms-pedidos/server.mjs` → **Aprobado (Código 0)**.
- **Comando:** `node --test backend/tests/*.test.mjs`
- **Resultado:** **5/5 pruebas aprobadas (`pass 5, fail 0`)**:
  - `✔ PU-01 totales con centavos y snapshot`
  - `✔ PU-02 cantidades enteras positivas`
  - `✔ PU-03 precios positivos de máximo 2 decimales`
  - `✔ PU-04 máquina de estados por rol`
  - `✔ PU-05 roles aceptados según acción`

### 5.4. Verificación de Compilación de Producción (`npm.cmd run build`) y Validación OpenXML del SRS
- **Comando:** `vite build` → **Aprobado (`built in 1.13s`)**, generando chunks separados por página y paquetes `vendor-three` y `vendor-ui`.
- **Validación XML de `SRS_Sistema_Pedidos_Restaurante-v3.docx`:** Los 17 archivos internos `.xml` y `.rels` del paquete OpenXML fueron validados con `System.Xml.XmlDocument` sin errores de esquema.
- **Validación Geométrica de Diagramas UML:** Los 15 diagramas de casos de uso (`DCU_*.png`) pasaron el verificador automático de intersección de segmentos y elipses con **`Crossings: 0, NodeHits: 0`**.
