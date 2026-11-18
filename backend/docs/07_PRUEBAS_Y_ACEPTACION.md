# 07 — QA y verificación del MVP

## Pruebas unitarias implementadas y ejecutadas
`npm test` ejecuta 5 casos PU-01 a PU-05 en `tests/domain.test.mjs`: cálculo de totales, cantidades enteras positivas, precios, transiciones y roles. El resultado de la ejecución del kit fue **5/5 PASAN**. `npm run check`: validación sintáctica de los tres servidores Node **PASÓ**.

## Pruebas funcionales manuales mínimas (plan de ejecución, NO realizadas)
1. Entrar sin sesión -> login, no panel de mesero.
2. Credenciales falsas -> 401.
3. Mesero intenta crear producto -> 403.
4. Admin crea producto válido y lo consulta.
5. Admin modifica precio -> detalles históricos no cambian.
6. Admin marca producto no disponible -> no puede ser pedido.
7. Admin intenta borrar producto con historial -> 409.
8. Admin registra mesa única; duplicado -> 409.
9. Mesero crea pedido con cantidad 0 -> 422.
10. Mesero crea pedido válido -> 201 + estado Pendiente + detalles y total.
11. Dos solicitudes de pedido concurrentes sobre la misma mesa -> una 201, otra 409.
12. Cocinero cambia Pendiente -> Listo directamente -> 409.
13. Cocinero cambia Pendiente -> En preparación -> Listo -> 200 cada una.
14. Mesero confirma Listo -> Entregado -> mesa disponible.
15. Admin desactiva usuario -> su token deja de funcionar.
16. Cerrar sesión -> acceso posterior a API -> 401.

## Integración con Postman — casos sugeridos PI-01 a PI-06
- PI-01: React y proxy envían cookie HttpOnly después de login.
- PI-02: ms-catalogo lee/escribe productos MySQL.
- PI-03: ms-pedidos valida catálogo y guarda cabecera y detalles en una transacción.
- PI-04: disponibilidad de mesa cambia con pedido activo y se libera al entregar.
- PI-05: permisos de ms-pedidos y ms-catalogo se verifican contra ms-usuarios.
- PI-06: si ms-catalogo está caído, ms-pedidos rechaza registrar nuevos pedidos sin crear registros parciales.

## Ensayos críticos adicionales
- Asegurar que las dos solicitudes concurrentes abran conexiones distintas y logren respectivamente `201` / `409`.
- Intentar borrar producto/mesa en paralelo al registro de pedido: candado con nombre del recurso debe impedir borrado de referencias registradas.
- Ejecutar `SELECT` de pedidos y detalles antes y después de reiniciar procesos Node; deben seguir presentes.
- Cortar red después de POST en frontend: NO reintentar sin verificar la lista de pedidos.
- Probar Chrome/Edge y móvil 360px; sin scroll horizontal que oculte la acción principal.

## Gate de aceptación
El prototipo no puede declararse conforme al SRS hasta aprobar pruebas API y UI. Los unit tests prueban funciones puras del kit, no demuestran que la app publicada ya esté operativa.
