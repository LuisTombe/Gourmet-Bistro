# Gourmet Bistro POS - Sistema de Gestión Gastronómica & KDS

Sistema Full-Stack de punto de venta (POS) y visualización de pedidos en cocina (KDS) para restaurantes, construido con arquitectura moderna en **React**, **Node.js (Express)** y **MySQL / MariaDB (XAMPP)**.

---

## 🚀 Stack Tecnológica

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Framer Motion.
- **Backend:** Node.js, Express, `mysql2/promise`, CORS, Dotenv.
- **Base de Datos:** MySQL / MariaDB (XAMPP por defecto en `localhost:3306`).
- **Control de Versiones:** Git (Flujo en ramas `main`, `Dev` y `QA`), módulo de versionamiento con snapshots y rollback en interfaz para el rol Administrador.

---

## 📁 Estructura del Proyecto

```plaintext
Gourmet-Bistro/
├── .env.example              # Plantilla de variables de entorno (rastreada en Git)
├── .env                      # Variables locales reales (ignorado en .gitignore)
├── .gitignore                # Reglas de exclusión de Git
├── package.json              # Dependencias y scripts globales de orquestación
├── database/
│   ├── schema.sql            # Definición DDL de tablas y datos semilla (Seed)
│   └── migrate.js            # Script automatizado de migración a MySQL
├── backend/
│   ├── package.json          # Configuración del servicio backend
│   ├── src/
│   │   ├── config/db.js      # Pool de conexiones a MySQL (mysql2/promise)
│   │   ├── controllers/      # Controladores de negocio (Auth, Tables, Products, Orders, Snapshots)
│   │   ├── routes/           # Rutas REST de la API (/api/users, /api/tables, /api/products, etc.)
│   │   └── server.js         # Servidor Express, middlewares y health check
│   └── tests/
│       └── e2e.test.js       # Pruebas de integración End-to-End contra MySQL
└── frontend/
    ├── package.json          # Configuración del cliente frontend
    ├── index.html            # Plantilla HTML principal
    ├── vite.config.ts        # Configuración de compilación Vite
    └── src/
        ├── components/       # Componentes React (Navbar, Login, TableCard, StatusBadge, etc.)
        ├── context/          # RestaurantContext con sincronización reactiva y API
        ├── data/             # MockData inicial y datos de respaldo
        ├── domain/           # Reglas de negocio puras y validaciones RBAC
        ├── services/         # Cliente HTTP (api.ts) que consume la API REST
        ├── types/            # Definiciones de TypeScript
        └── views/            # Vistas por rol (Mesas, Nuevo Pedido, KDS Cocina, Menú, Usuarios, Versionamiento)
```

---

## ⚙️ Configuración y Puesta en Marcha

### 1. Requisitos Previos
- **Node.js:** Versión 18 o superior (`node -v`).
- **XAMPP:** Con el módulo **MySQL** iniciado en el puerto `3306`.
- **Git:** Configurado en la rama `Dev`.

### 2. Variables de Entorno
El repositorio incluye un archivo [.env.example](file:///c:/Users/USER/Gourmet%20System/Gourmet-Bistro/.env.example). Cree una copia llamada `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Contenido por defecto de `.env`:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=gourmet_bistro

CLIENT_URL=http://localhost:3000
```

### 3. Instalación de Dependencias
Ejecute en la raíz del proyecto:
```bash
npm install
```

### 4. Creación y Migración de la Base de Datos
Asegúrese de que el servicio MySQL en XAMPP esté corriendo y ejecute:
```bash
npm run db:migrate
```
*Este comando crea la base de datos `gourmet_bistro`, todas sus tablas relacionales y carga los datos iniciales.*

---

## 🏃‍♂️ Ejecución de la Aplicación

Puede iniciar ambos servicios concurrentemente o por separado:

### Opción A: Modo Concurrente (Recomendado)
Inicia el Backend (puerto 5000) y el Frontend (puerto 3000) en paralelo:
```bash
npm run dev
```

### Opción B: Ejecución Independiente
- **Levantar Backend REST API:**
  ```bash
  npm run dev:backend
  # El servidor escucha en http://localhost:5000
  ```
- **Levantar Frontend React:**
  ```bash
  npm run dev:frontend
  # La aplicación abre en http://localhost:3000
  ```

---

## 🧪 Pruebas Automatizadas

1. **Pruebas Unitarias de Reglas de Negocio (Node Native Test):**
   ```bash
   npm test
   ```
2. **Pruebas de Integración End-to-End con la Base de Datos:**
   *(Con el backend y MySQL activos)*
   ```bash
   npm run test:e2e
   ```
3. **Verificación de Tipos y Compilación:**
   ```bash
   npm run build
   ```

---

## 🛡️ Módulo de Versionamiento e Histórico (Solo Admin)

Diseñado e integrado en cumplimiento de los requerimientos de la **Fase 1**:
- **Visibilidad:** Restringido exclusivamente al usuario con rol **Administrador** (`admin`).
- **Ubicación:** Acceso directo desde el menú de perfil en la barra de navegación: *Versionamiento & Histórico*.
- **Supervisión de Versiones:** Muestra la rama activa (`Dev`), estado de sincronización con `origin/Dev`, hash del commit actual e historial de cambios.
- **Puntos de Restauración (Snapshots):** El administrador puede generar un snapshot del estado completo de la base de datos y la aplicación antes de cambios críticos.
- **Capacidad de Rollback:** En caso de errores introducidos por miembros del equipo, el administrador puede seleccionar cualquier versión o snapshot anterior y ejecutar un **Rollback Inmediato**, restaurando de manera segura el estado previo del sistema.
