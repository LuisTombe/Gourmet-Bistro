# 02 — Catálogo de herramientas de interfaz para Antigravity IDE

## Criterio
El proyecto es un panel operativo de un restaurante pequeño, no un videojuego 3D. Las prioridades reales son legibilidad de pedidos, tiempo de respuesta y accesibilidad. Las mejoras deben preservar RNF-01, RNF-02 y RNF-03.

## Herramientas ya presentes en Gourmet-Bistro
### React + Vite + TypeScript
- **Propósito:** reutilizar las vistas actuales y acceder a datos a través de `apiClient.ts`.
- **Encaje:** frontend, sin intervenir en la división de microservicios.
- **Uso:** mantener `src/App.tsx`, adaptar el contexto, usar `await api.productos.listar()` y mostrar carga/error.

### Tailwind CSS v4, Motion y Lucide React
- **Propósito:** composición responsive, transiciones ligeras e iconos consistentes.
- **Encaje:** solo interfaz React. Ya están declarados en `package.json` del repositorio.
- **Instalación:** no instalar duplicados. Usar los componentes actuales y `motion` únicamente para transiciones cortas (150–200 ms).
- **Ejemplo:** transición de opacidad en un panel o icono de pedido, nunca animación continua sobre 50 filas.

## Three.js — opcional y deliberadamente fuera del flujo de caja
- **Propósito:** decoración 3D ambiental de una única pantalla introductoria o login.
- **Encaje:** componente del frontend, completamente aislado; no es un microservicio ni procesa pedidos.
- **Instalación si se aprueba:** `npm install three` y, para TypeScript, `npm install -D @types/three` en el proyecto React.
- **Ejemplo:** `frontend-integration/ThreeAccent.optional.tsx` carga Three.js dinámicamente y libera los recursos WebGL. Debe activarse únicamente en escritorio, no en Cocina, Pedidos ni formularios.
- **Alternativa más sencilla y recomendada:** efecto con CSS, sin Three.js.
- **Referencia:** https://threejs.org/manual/pages/installation.html

## «Twinkling» — nombre por confirmar
- **Estado:** no se identificó inequívocamente una librería concreta con ese nombre.
- **Propósito interpretado:** puntos de luz/destellos lentos en fondo del login.
- **Solución lista sin dependencias:** `frontend-integration/AmbientTwinkle.tsx` y `ambient-twinkle.css`. Tiene `pointer-events:none`, `aria-hidden` y respeta `prefers-reduced-motion`.
- **Si se necesitan partículas reales:** considerar `@tsparticles/react` + `tsparticles` y limitar cantidad, FPS y superficie renderizada. Documentación: https://particles.js.org/guides/react
- **No instalar un paquete NPM llamado «Twinkling» sin enlace oficial verificado.**

## «Estilo Ero» — referencia por confirmar
- **Estado:** sin identificación inequívoca; podría ser un estilo o nombre mal transcrito.
- **Decisión:** no añadirlo como dependencia ni reinterpretarlo como un producto existente.
- **Alternativa mientras se confirma:** conservar el sistema visual de Gourmet-Bistro (pizarra oscuro `#0F172A`, naranja `#EA580C`, tarjetas y fondos claros) y mejorar contraste, espacios y foco de teclado.

## Refero Design — investigación visual, no librería npm
- **Propósito:** analizar patrones de Login, Dashboard, Listas, Estados vacíos, Tablas y Formularios.
- **Encaje:** investigación y prototipado, antes de tocar las vistas React. No tiene impacto en microservicios.
- **Uso:** abrir https://refero.design/, filtrar `Dashboard`, `Log In`, `Cards`, `Table`, `Food & Drink` y guardar referencias de jerarquía visual. Evitar copiar gráficos o pantallas literalmente.
- **Ejemplo práctico:** usar 2–3 referencias para definir proporción de panel lateral, tarjetas por mesa y estados de cocina.

## Zod — validaciones obligatorias del servidor
- **Propósito:** reemplazar validaciones exclusivamente visuales por contratos verificables.
- **Encaje:** cada uno de los tres microservicios.
- **Instalación:** incluida en `package.json` del kit. Usar `.parse(req.body)` con tratamiento de errores 422.
- **Referencia:** https://zod.dev/

## Opciones descartadas para este MVP
- Renderizado 3D de mesas en tiempo real, WebSockets, partículas dentro de cocina, paneles de métricas, CQRS o motor de eventos. No aportan cumplimiento al SRS.

## Orden recomendado
1. Primero datos reales y autenticación.
2. Luego reparar formularios y permisos.
3. Después mejorar responsive, contraste y estados de error.
4. Finalmente, si se aprueba, añadir destellos ligeros exclusivamente al login.
