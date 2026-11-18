# Gourmet Bistro POS - Sistema de Gestión Gastronómica & KDS (SENA)

Sistema Full-Stack de gestión de menú, mesas, pedidos y cocina (KDS) para restaurantes pequeños, desarrollado siguiendo la especificación formal del documento SRS versión 3 (SENA - Tecnólogo en Análisis y Desarrollo de Software).

---

## 🚀 Arquitectura y Stack Tecnológica

El sistema implementa una arquitectura desacoplada basada en microservicios, seguridad con cookies HttpOnly y persistencia relacional estricta:

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Framer Motion y efecto ambiental `AmbientTwinkle`.
- **Backend (3 Microservicios en Node.js + Express):**
  - **`ms-usuarios` (Puerto 4001):** Autenticación con bcrypt, sesiones revocables en MySQL, cookies HttpOnly y gestión de personal (`/api/auth/*`, `/api/usuarios/*`).
  - **`ms-catalogo` (Puerto 4002):** Catálogo de productos y gestión de mesas con verificación de disponibilidad derivada (`/api/productos/*`, `/api/mesas/*`).
  - **`ms-pedidos` (Puerto 4003):** Registro de pedidos y detalles bajo transacciones SQL atómicas, cálculo de subtotales y totales, máquina de estados estricta (`Pendiente` → `En preparación` → `Listo` → `Entregado`) y candados de integridad (`/api/pedidos/*`).
- **Base de Datos (MySQL / MariaDB en XAMPP):**
  - Instancia compartida dividida en 3 bases de datos lógicas con aislamiento de usuarios SQL:
    - `restaurante_usuarios` (usuario `gb_usuarios`)
    - `restaurante_catalogo` (usuario `gb_catalogo`)
    - `restaurante_pedidos` (usuario `gb_pedidos`)
- **Control de Versiones & Rollback (Fase 1 / Admin):** Módulo en panel administrativo para supervisar ramas Git, commits, generar snapshots de estado y ejecutar rollback seguro ante errores.

---

## 📁 Estructura del Repositorio

```plaintext
Gourmet-Bistro/
├── docs/                     # Documentación técnica, diseño y trazabilidad (SRS Kit)
│   ├── 01_DIAGNOSTICO_BRECHAS.md
│   ├── 02_CATALOGO_HERRAMIENTAS.md
│   ├── 03_PATRONES_DISENO.md
│   ├── 04_CONTRATOS_API.md
│   ├── 05_TRAZABILIDAD_RF.md
│   ├── 06_GUIA_ANTIGRAVITY.md
│   └── 07_PRUEBAS_Y_ACEPTACION.md
├── backend/                  # Servicios de backend y bases de datos
│   ├── package.json          # Dependencias (bcryptjs, express, mysql2, zod, dotenv)
│   ├── .env.example          # Plantilla de variables de entorno de servicios
│   ├── sql/                  # Scripts DDL de las 3 bases de datos
│   │   ├── 001_usuarios.sql
│   │   ├── 002_catalogo.sql
│   │   └── 003_pedidos.sql
│   ├── services/
│   │   ├── shared/           # Reglas de dominio puras (domain.mjs) e infraestructura (infra.mjs)
│   │   ├── ms-usuarios/      # Microservicio de Usuarios y Autenticación (Puerto 4001)
│   │   ├── ms-catalogo/      # Microservicio de Catálogo y Mesas (Puerto 4002)
│   │   └── ms-pedidos/       # Microservicio de Pedidos y Cocina (Puerto 4003)
│   └── tests/
│       └── domain.test.mjs   # Pruebas unitarias PU-01 a PU-05
├── src/                      # Código fuente del Frontend React
│   ├── components/           # Componentes (Navbar, LoginView, AmbientTwinkle, StatusBadge, etc.)
│   ├── context/              # RestaurantContext integrado con apiClient.ts
│   ├── domain/               # Reglas de negocio del frontend
│   ├── services/             # apiClient.ts (adaptador HTTP con cookies HttpOnly)
│   ├── types/                # Definiciones TypeScript
│   └── views/                # Vistas por rol (Mesas, Nuevo Pedido, Cocina KDS, Menú, Usuarios, Versionamiento)
├── vite.config.ts            # Configuración de Vite con reverse proxy a los 3 microservicios
└── package.json              # Orquestación global del proyecto
```

---

## ⚙️ Puesta en Marcha

### 1. Requisitos Previos
- Node.js 18+ instalado.
- XAMPP con **MySQL** activo en el puerto `3306`.

### 2. Configuración de Base de Datos y Semilla
Los scripts de creación y poblado se ejecutan directamente con:
```powershell
# En la raíz o backend:
cd backend
npm install
node services/ms-usuarios/seed-admin.mjs
node services/ms-catalogo/seed-catalogo.mjs
cd ..
```

### 3. Cuentas de Acceso Preconfiguradas en MySQL
El sistema incluye las cuentas con hash seguro `bcrypt` para validar los 3 roles:
- **Administrador:** Usuario: `admin` | Contraseña: `AdminPass2026!`
- **Mesero:** Usuario: `carlos_m` | Contraseña: `MeseroPass2026!`
- **Cocinero:** Usuario: `chef_mateo` | Contraseña: `CocinaPass2026!`

---

## 🏃‍♂️ Ejecución del Sistema

### Modo Completo (Servicios + Frontend en Paralelo):
```powershell
npm run dev
```
*(Inicia los tres microservicios en los puertos 4001, 4002 y 4003, y el frontend de Vite en el puerto 3000 con proxy transparente a `/api/*`)*.

### O ejecutar de forma independiente:
- **Microservicios Backend:**
  ```powershell
  npm run services
  ```
- **Frontend React:**
  ```powershell
  npm run dev:frontend
  ```

---

## 🧪 Pruebas Automatizadas

- **Pruebas Unitarias del SRS Kit (PU-01 a PU-05):**
  ```powershell
  npm run test:services
  ```
- **Comprobación Sintáctica de los 3 Microservicios:**
  ```powershell
  npm run check:services
  ```
- **Pruebas de Reglas de Negocio en Frontend:**
  ```powershell
  npm test
  ```
- **Compilación de Producción:**
  ```powershell
  npm run build
  ```
