# Contexto del Proyecto: Gourmet SysFood POS (SENA ADSO)

Este archivo configura el contexto operacional y las directivas para los agentes de Antigravity IDE que interactúan con este repositorio.

---

## 1. Identidad y Dominio del Sistema
- **Proyecto:** Gourmet SysFood POS (Sistema Web de Gestión de Menú, Pedidos, Cocina KDS y Mesas para Restaurantes Pequeños).
- **Idioma del Frontend y Documentación:** Español obligatorio (sin textos en inglés en la interfaz de usuario).
- **Entorno de Datos:** XAMPP MySQL / MariaDB local en el puerto `3306` (`127.0.0.1:3306`).

---

## 2. Arquitectura de Microservicios y Puertos
El sistema no es un monolito; utiliza 3 microservicios Express desacoplados comunicados con Vite mediante un reverse proxy:

1. **Frontend (`/` en `:3000`):**
   - React 19, TypeScript, Vite, Tailwind CSS.
   - Proxies configurados en `vite.config.ts`:
     - `/api/auth`, `/api/usuarios`, `/api/snapshots`, `/api/versionamiento` -> `http://127.0.0.1:4001`
     - `/api/productos`, `/api/mesas` -> `http://127.0.0.1:4002`
     - `/api/pedidos` -> `http://127.0.0.1:4003`

2. **Microservicio de Usuarios (`ms-usuarios` en `:4001`):**
   - Base de datos: `restaurante_usuarios` (usuario `gb_usuarios`).
   - Autenticación con `bcryptjs`, sesiones aleatorias SHA-256 en MySQL, cookies `HttpOnly` y `SameSite=Strict`.
   - Endpoints: `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`, `/api/usuarios/*`, `/api/snapshots/*`, `/api/versionamiento/*`.

3. **Microservicio de Catálogo (`ms-catalogo` en `:4002`):**
   - Base de datos: `restaurante_catalogo` (usuario `gb_catalogo`).
   - Gestión de platos, disponibilidad y mesas.
   - Endpoints: `/api/productos/*`, `/api/mesas/*`, `/internal/catalog/*`.

4. **Microservicio de Pedidos y Cocina (`ms-pedidos` en `:4003`):**
   - Base de datos: `restaurante_pedidos` (usuario `gb_pedidos`).
   - Transacciones ACID para comandas, cálculo de totales con centavos y control pesimista de estados KDS:
     - `Pendiente` -> `En preparación` (Cocinero)
     - `En preparación` -> `Listo` (Cocinero)
     - `Listo` -> `Entregado` (Mesero o Administrador)
   - Candado de ocupación de mesa a nivel de BD (`uq_mesa_activa`).

---

## 3. Comandos Oficiales del Proyecto
Todos los agentes deben invocar los scripts de Node.js y npm usando estas rutas:
- **Iniciar sistema completo (Servicios + Frontend):** `npm run dev`
- **Iniciar solo microservicios:** `npm run services`
- **Iniciar solo frontend:** `npm run dev:frontend`
- **Pruebas de dominio frontend:** `npm run test`
- **Pruebas unitarias backend:** `npm run test:services`
- **Pruebas de integración E2E:** `npm run test:e2e`
- **Verificación sintáctica de servicios:** `npm run check:services`
- **Chequeo de tipos TypeScript:** `npm run lint`
- **Inicialización de base de datos:** `npm run setup`

---

## 4. Reglas de Modificación de Código
1. **Preservación:** No reescribir `RestaurantContext.tsx` ni `apiClient.ts` desde cero. Utilizar las funciones ya existentes y extenderlas según el alcance.
2. **Seguridad:** Nunca hardcodear contraseñas en el repositorio. Mantener `.env` y `backend/.env` excluidos en `.gitignore`.
3. **Manejo de Errores:** Todas las llamadas asíncronas deben capturar `ApiError`, manejar estados de carga (`isSubmitting`/`loading`) y reportar retroalimentación mediante `showToast(msg, 'error' | 'success')`.
4. **Validación Dual:** Toda entrada de datos debe validarse en el cliente (`src/domain/rules.ts`) antes del envío, y ratificarse en el servidor con Zod (`.strict()`).
