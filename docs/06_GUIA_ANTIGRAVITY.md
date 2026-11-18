# 06 — Guía de implementación para Antigravity IDE

## Propósito
El archivo ZIP contiene backend y materiales **de integración**, no una copia completa del repositorio. Trabajar en una rama nueva y preservar `src/App.tsx`, todas las vistas y la identidad visual de Gourmet-Bistro.

## Orden de lectura en Antigravity
1. Adjuntar `01_DIAGNOSTICO_BRECHAS.md` junto con el SRS versión 3.
2. Adjuntar `03_PATRONES_DISENO.md` y `04_CONTRATOS_API.md`.
3. Adjuntar `05_TRAZABILIDAD_RF.md` para comprobar cobertura sin extras.
4. Adjuntar `02_CATALOGO_HERRAMIENTAS.md` solo después de la lógica de negocio.
5. Utilizar esta `06_GUIA_ANTIGRAVITY.md` como checklist de ejecución.

## Preparación local en Windows / VS Code / Antigravity
En una terminal PowerShell, dentro de una carpeta de trabajo:
```powershell
git clone https://github.com/LuisTombe/Gourmet-Bistro.git
cd Gourmet-Bistro
git switch -c feature/srs-microservicios
```
Copiar carpetas `services/`, `sql/`, `tests/`, `docs/` y el `package.json` del kit dentro de una carpeta independiente `backend/` del repositorio. No sobrescribir el `package.json` del frontend. La estructura final será:
```
Gourmet-Bistro/
  src/                   # Frontend original React, se conserva
  public/
  package.json           # Frontend original
  backend/
    package.json         # Del kit
    .env.example
    services/
      shared/
      ms-usuarios/
      ms-catalogo/
      ms-pedidos/
    sql/
    tests/
    docs/
```

## Bases de datos MySQL
1. Abrir MySQL 8 desde XAMPP/Docker/servidor local. Ejecutar `sql/001_usuarios.sql`, `002_catalogo.sql` y `003_pedidos.sql` en ese orden.
2. Crear **tres usuarios SQL** con permisos limitados exclusivamente a su base de datos. Ejemplo conceptual (sustituir contraseñas antes de ejecutar):
```sql
CREATE USER IF NOT EXISTS 'gb_usuarios'@'localhost' IDENTIFIED BY 'CAMBIAR_UNA_CLAVE_DISTINTA';
CREATE USER IF NOT EXISTS 'gb_catalogo'@'localhost' IDENTIFIED BY 'CAMBIAR_OTRA_CLAVE_DISTINTA';
CREATE USER IF NOT EXISTS 'gb_pedidos'@'localhost' IDENTIFIED BY 'CAMBIAR_TERCERA_CLAVE_DISTINTA';
GRANT SELECT,INSERT,UPDATE,DELETE ON restaurante_usuarios.* TO 'gb_usuarios'@'localhost';
GRANT SELECT,INSERT,UPDATE,DELETE ON restaurante_catalogo.* TO 'gb_catalogo'@'localhost';
GRANT SELECT,INSERT,UPDATE,DELETE ON restaurante_pedidos.* TO 'gb_pedidos'@'localhost';
```
3. El host de estos usuarios SQL (`localhost`, `127.0.0.1` o `%`) depende del modo de conexión de MySQL: comprobarlo y limitar acceso al host real de cada servicio.
4. Ir a `backend/`, ejecutar `npm install`, copiar `.env.example` a `.env` y configurar contraseñas, direcciones y `INTERNAL_SERVICE_KEY` aleatorio de al menos 32 caracteres. **No subir `.env`.**
5. Crear administrador inicial, con BD vacía y `ADMIN_PASSWORD` de al menos 12 caracteres:
```powershell
node services/ms-usuarios/seed-admin.mjs
```
Retirar `ADMIN_PASSWORD` después de crear el usuario.

## Arranque de tres procesos
En tres terminales diferentes, situadas en `Gourmet-Bistro/backend`:
```powershell
npm run users
npm run catalog
npm run orders
```
Verificar `http://127.0.0.1:4001/health`, `:4002/health`, `:4003/health`.

## Adaptación del frontend
1. Copiar `frontend-integration/apiClient.ts` a `src/services/apiClient.ts`.
2. Añadir los cinco proxies de `frontend-integration/vite.proxy.example.ts` a `vite.config.ts`, conservando los plugins preexistentes.
3. En `RestaurantContext.tsx`, eliminar importaciones de `mockData`, inicialización automática de `INITIAL_USERS[1]` y escrituras de negocio en `localStorage`.
4. Sustituir `login(username)` por `await api.auth.login(username,password)`. En `LoginView` eliminar los botones de acceso rápido y pasar contraseña real al servidor.
5. Al cargar la aplicación, llamar `api.auth.me()`, mostrar estado de carga antes de decidir entre Login y panel autorizado; no mostrar contenido privado antes de validar la sesión.
6. Migrar CRUD de productos, mesas, usuarios y pedidos **de uno en uno**; cada operación debe ser `async`, guardar solo después de la respuesta API y actualizar listas tras éxito. No usar datos simulados como respaldo silencioso si falla una consulta.
7. Actualizar `Navbar`: quitar `switchUser`, `resetToDefaults` y otras funciones de demostración que conceden privilegios desde React. Mantener pestañas autorizadas por rol; validar permisos en backend.
8. Eliminar o hacer exclusivamente decorativos los campos que NO existen en el SRS: categoría, estación, foto, capacidad/área de mesa y notas. No extender MySQL sin aprobación.
9. Adaptar `NewOrderView`: enviar `{id_mesa,items:[{id_producto,cantidad}],total_confirmado}`. Si API responde 409 por cambio de precio, mostrar el importe vigente para confirmación; no reenviar ciegamente.
10. Adaptar `KitchenKDSView` y `OrdersListView` a `api.pedidos.avanzar` y refrescar mediante consultas HTTP; no usar WebSockets.

## Pruebas
En `backend/`: `npm test` y `npm run check`. Después ejecutar tests de integración reales con Postman para estados, roles, mesa activa y rollback con MySQL (no están simuladas ni aprobadas por el mero hecho de que los unit tests pasen).

## Plantilla de instrucción para Antigravity
> Trabaja exclusivamente en la tarea RF-XX del SRS. Preserva las vistas existentes de Gourmet-Bistro y la arquitectura de tres microservicios. Lee los archivos 01, 03, 04 y 05 del kit. Sustituye solamente la lógica de `localStorage` involucrada por el endpoint indicado en la matriz. Ajusta la interfaz para operaciones asíncronas, errores de conexión y sesiones reales. No añadas campos, módulos ni librerías fuera del SRS. Muestra el diff y ejecuta pruebas de aceptación antes de hacer commit.

## Secuencia de commits sugerida
- `feat(backend): crear esquemas mysql y ms-usuarios`
- `feat(backend): implementar ms-catalogo y ms-pedidos`
- `feat(frontend): conectar login y me con cookies`
- `feat(frontend): integrar catalogo mesas y pedidos`
- `test: verificar permisos concurrencia y flujo completo`
- `style: pulir UI sin ampliar alcance`

## Precauciones
- El repositorio original no fue modificado ni se realizó un push desde este entorno.
- `npm install`, MySQL y pruebas integradas deberán ejecutarse localmente. El kit no certifica la operación desplegada hasta que esas pruebas pasen.
- El hosting definitivo sigue **pendiente** y requiere reverse proxy HTTPS con rutas `/api` y servicios internos NO publicados.
