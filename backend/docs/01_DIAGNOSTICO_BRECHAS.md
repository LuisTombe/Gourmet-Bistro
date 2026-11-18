# 01 — Diagnóstico de brechas del repositorio Gourmet-Bistro vs SRS
**Fuente primaria:** SRS_Sistema_Pedidos_Restaurante-v3.docx (capítulos 2, 3, 5, 6, 7).  
**Código inspeccionado:** rama `main`, noviembre de 2026, https://github.com/LuisTombe/Gourmet-Bistro.  
**Alcance de la auditoría:** análisis estático de archivos visibles en GitHub; no se ha ejecutado el repositorio original contra MySQL.

## Evidencia observada
- `src/App.tsx` ya conecta `TablesFloorView`, `NewOrderView`, `KitchenKDSView`, `OrdersListView`, `MenuAdminView`, `TablesAdminView`, `UsersAdminView`, `LoginView` con un `RestaurantProvider`.
- `src/context/RestaurantContext.tsx` importa `INITIAL_*` desde `src/data/mockData.ts` y lee/escribe usuarios, pedidos, productos y mesas en `localStorage`; no contiene llamadas `fetch` a backend.
- `currentUser` usa inicialmente `INITIAL_USERS[1]` cuando no hay sesión: entra como mesero sin autenticación.
- `login(username)` solo compara nombre de usuario; `LoginView` recoge contraseña pero llama `login(username)`; botones de acceso rápido eluden la verificación.
- `createOrder` valida cantidades, disponibilidad y estados, pero modifica un array del navegador. No hay transacción SQL ni concurrencia entre dispositivos.
- `src/domain/rules.ts` tiene funciones puras reutilizables para cantidad, precio, total, permisos y estados.
- `package.json` usa React 19, TypeScript, Vite, Tailwind v4, Motion, Lucide y contiene Express, pero no hay evidencia de ejecución de los tres microservicios Node/MySQL del SRS.
- `src/types/index.ts` agrega campos visuales (categoría, estación, imagen, capacidad, área, notas) no presentes en las cinco tablas aprobadas. NO transformarlos en RF sin aprobación.

## Prioridades
| Nivel | RF | Brecha verificada | Solución incluida en el kit |
|---|---|---|---|
| P0 | RF-16, RF-17, RF-18 | Login sin contraseña, rol elegido en navegador, sesión local | ms-usuarios, bcrypt, cookie HttpOnly, verificación por servicio |
| P0 | RF-05 a RF-09 | Pedidos solo en navegador; sin integridad entre clientes | ms-pedidos, transacción, snapshot de precio y control de mesa activa |
| P0 | RF-10, RF-11 | Estado local sin autorización en servidor | Máquina de estados backend y permisos |
| P1 | RF-01 a RF-04 | CRUD de productos local | ms-catalogo, validación y borrado protegido |
| P1 | RF-12, RF-13 | Mesas locales y estado calculado en memoria | ms-catalogo + consulta interna de pedidos |
| P1 | RF-14, RF-15 | Administración de usuarios local | API para altas, edición, roles y desactivación |

## Qué sí se conserva
La interfaz existente, la organización en vistas, su identidad visual naranja/pizarra, los componentes React y las reglas puras del dominio. El kit propone cambiar la fuente de datos, NO reescribir las vistas desde cero.

## Limitaciones y riesgos
1. No se pudo descargar el árbol completo del repositorio en el entorno de edición. El kit aporta una implementación aislada y un adaptador, NO un commit ni una integración React completa ejecutada.
2. No se pudo ejecutar una prueba MySQL real en este entorno. Se ejecutaron las 5 pruebas unitarias sin dependencias y validación sintáctica de los servicios.
3. Las categorías, áreas, fotografías, estaciones y notas del frontend no existen en el SRS de cinco tablas. Antigravity debe retirar esas funciones del flujo persistente o tratarlas solo como ornamentación de pantalla, sin guardar datos ficticios.
4. La plataforma definitiva de hosting sigue pendiente.
5. En la interfaz actual, las operaciones del Context son síncronas; las API reales son asíncronas. Deben cambiarse formularios, estados de carga y mensajes para NO mostrar éxito antes de confirmación.

## Resultado de auditoría
La brecha principal NO es ausencia de pantallas, sino ausencia de backend, permisos reales y persistencia compartida. Para la entrega académica conviene integrar el código por capas: BD -> APIs -> React -> pruebas.
