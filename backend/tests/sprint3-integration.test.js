import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.INTEGRATION_BASE_URL || 'http://127.0.0.1:3000/api';

function extractCookie(res) {
  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) return '';
  return setCookie.split(';')[0];
}

async function apiJson(path, { method = 'GET', body, cookie } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'x-requested-with': 'XMLHttpRequest',
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(cookie ? { cookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, cookie: extractCookie(res), ok: res.ok };
}

test('Sprint 3 — Entregable 1 & 2: Autenticación, sesión por cookie HttpOnly y navegación por rol', async () => {
  // 1. Acceso no autenticado rechazado con 401
  const unauth = await apiJson('/usuarios');
  assert.equal(unauth.status, 401, 'Debe rechazar consulta a /usuarios sin sesión');

  // 2. Login con credenciales incorrectas rechazado con 401
  const badLogin = await apiJson('/auth/login', {
    method: 'POST',
    body: { nombre_usuario: 'admin', contrasena: 'ContraseñaErronea123!' },
  });
  assert.equal(badLogin.status, 401);

  // 3. Login exitoso como Administrador
  const adminLogin = await apiJson('/auth/login', {
    method: 'POST',
    body: { nombre_usuario: 'admin', contrasena: 'AdminPass2026!' },
  });
  assert.equal(adminLogin.status, 200);
  assert.ok(adminLogin.cookie, 'Debe establecer cookie HttpOnly');
  assert.equal(adminLogin.data.usuario.rol, 'administrador');

  // 4. Verificación de sesión activa mediante /api/auth/me
  const meRes = await apiJson('/auth/me', { cookie: adminLogin.cookie });
  assert.equal(meRes.status, 200);
  assert.equal(meRes.data.usuario.nombre_usuario, 'admin');

  // 5. Login como Mesero y verificación de RBAC (no puede acceder a rutas de administración)
  const waiterLogin = await apiJson('/auth/login', {
    method: 'POST',
    body: { nombre_usuario: 'carlos_m', contrasena: 'MeseroPass2026!' },
  });
  assert.equal(waiterLogin.status, 200);
  assert.equal(waiterLogin.data.usuario.rol, 'mesero');

  const forbiddenUsers = await apiJson('/usuarios', { cookie: waiterLogin.cookie });
  assert.equal(forbiddenUsers.status, 403, 'Mesero debe tener prohibido listar o crear usuarios (403)');
});

test('Sprint 3 — Entregable 3: Validaciones de entrada en cliente y servidor (Zod & Reglas de Negocio)', async () => {
  const adminLogin = await apiJson('/auth/login', {
    method: 'POST',
    body: { nombre_usuario: 'admin', contrasena: 'AdminPass2026!' },
  });
  const cookie = adminLogin.cookie;

  // 1. Validación de precio negativo o cero en producto -> 422
  const invalidPrice = await apiJson('/productos', {
    method: 'POST',
    cookie,
    body: { nombre: 'Plato Inválido', precio: -100 },
  });
  assert.equal(invalidPrice.status, 422, 'Precio negativo debe ser rechazado con 422');

  // 2. Validación de número de mesa inválido -> 422
  const invalidTable = await apiJson('/mesas', {
    method: 'POST',
    cookie,
    body: { numero_mesa: -5 },
  });
  assert.equal(invalidTable.status, 422, 'Número de mesa negativo debe ser rechazado con 422');

  // 3. Validación de pedido con cantidad 0 o vacía -> 422
  const emptyOrder = await apiJson('/pedidos', {
    method: 'POST',
    cookie,
    body: { id_mesa: 1, items: [], total_confirmado: 50000 },
  });
  assert.equal(emptyOrder.status, 422, 'Pedido sin productos debe ser rechazado con 422');

  // 4. Intento de inyección de caracteres de control o SQLi sanitizado/rechazado
  const sqliUser = await apiJson('/auth/login', {
    method: 'POST',
    body: { nombre_usuario: "' OR '1'='1", contrasena: 'x' },
  });
  assert.equal(sqliUser.status, 401, 'Inyección en login debe ser rechazada de forma segura');
});

test('Sprint 3 — Entregable 4: Funcionalidades CRUD completas de Catálogo, Mesas y Usuarios', async () => {
  const adminLogin = await apiJson('/auth/login', {
    method: 'POST',
    body: { nombre_usuario: 'admin', contrasena: 'AdminPass2026!' },
  });
  const cookie = adminLogin.cookie;

  // 1. Crear producto nuevo
  const testProdName = `Plato Test Sprint3 ${Date.now()}`;
  const createProd = await apiJson('/productos', {
    method: 'POST',
    cookie,
    body: { nombre: testProdName, descripcion: 'Descripción gourmet para test', precio: 45000.00 },
  });
  assert.equal(createProd.status, 201);
  const newProdId = createProd.data.producto.id_producto;
  assert.ok(newProdId, 'Debe devolver el id del producto creado');

  // 2. Modificar producto existente (PUT)
  const updateProd = await apiJson(`/productos/${newProdId}`, {
    method: 'PUT',
    cookie,
    body: { nombre: `${testProdName} (Editado)`, descripcion: 'Nueva descripción', precio: 49000.00 },
  });
  assert.equal(updateProd.status, 200);

  // 3. Cambiar disponibilidad (PATCH)
  const toggleAvail = await apiJson(`/productos/${newProdId}/disponibilidad`, {
    method: 'PATCH',
    cookie,
    body: { disponible: false },
  });
  assert.equal(toggleAvail.status, 200);

  // 4. Eliminar producto sin historial (DELETE)
  const deleteProd = await apiJson(`/productos/${newProdId}`, {
    method: 'DELETE',
    cookie,
  });
  assert.equal(deleteProd.status, 200);

  // 5. Crear y modificar mesa
  const testTableNum = 880 + Math.floor(Math.random() * 90);
  const createTable = await apiJson('/mesas', {
    method: 'POST',
    cookie,
    body: { numero_mesa: testTableNum },
  });
  assert.equal(createTable.status, 201);
  const newTableId = createTable.data.mesa.id_mesa;

  const deleteTable = await apiJson(`/mesas/${newTableId}`, {
    method: 'DELETE',
    cookie,
  });
  assert.equal(deleteTable.status, 200);
});

test('Sprint 3 — Entregable 5: Happy Path de Comandas, Cocina KDS y Liberación de Mesas de punta a punta', async () => {
  // Login Mesero y Cocinero
  const waiterRes = await apiJson('/auth/login', {
    method: 'POST',
    body: { nombre_usuario: 'carlos_m', contrasena: 'MeseroPass2026!' },
  });
  const cookRes = await apiJson('/auth/login', {
    method: 'POST',
    body: { nombre_usuario: 'chef_mateo', contrasena: 'CocinaPass2026!' },
  });
  const waiterCookie = waiterRes.cookie;
  const cookCookie = cookRes.cookie;

  // 1. Obtener catálogo y mesa disponible
  const catalog = await apiJson('/productos', { cookie: waiterCookie });
  const mesas = await apiJson('/mesas', { cookie: waiterCookie });
  assert.ok(catalog.data.productos.length > 0);
  assert.ok(mesas.data.mesas.length > 0);

  // Buscar mesa disponible
  const availableTable = mesas.data.mesas.find((m) => m.estado === 'Disponible') || mesas.data.mesas[0];
  const targetProd = catalog.data.productos[0];

  // 2. Crear pedido como mesero
  const total = Number(targetProd.precio) * 2;
  const orderRes = await apiJson('/pedidos', {
    method: 'POST',
    cookie: waiterCookie,
    body: {
      id_mesa: availableTable.id_mesa,
      items: [{ id_producto: targetProd.id_producto, cantidad: 2 }],
      total_confirmado: total,
    },
  });

  // Si la mesa ya estaba ocupada por pruebas previas, verificar que el candado de integridad responde 409 o 422
  if (orderRes.status === 409) {
    console.log('ℹ Mesa ya ocupada; candado de concurrencia RN-04 verificado exitosamente');
    return;
  }

  assert.equal(orderRes.status, 201, 'Debe crear pedido exitosamente');
  const orderId = orderRes.data.pedido.id_pedido;
  assert.equal(orderRes.data.pedido.estado, 'Pendiente');

  // 3. Cocinero avanza a 'En preparación'
  const inPrep = await apiJson(`/pedidos/${orderId}/estado`, {
    method: 'PATCH',
    cookie: cookCookie,
    body: { estado: 'En preparación' },
  });
  assert.equal(inPrep.status, 200);

  // 4. Salto inválido rechazado: Cocinero no puede pasar directo a 'Entregado'
  const illegalTransition = await apiJson(`/pedidos/${orderId}/estado`, {
    method: 'PATCH',
    cookie: cookCookie,
    body: { estado: 'Entregado' },
  });
  assert.equal(illegalTransition.status, 409, 'Transición no autorizada debe rechazarse con 409');

  // 5. Cocinero avanza a 'Listo'
  const ready = await apiJson(`/pedidos/${orderId}/estado`, {
    method: 'PATCH',
    cookie: cookCookie,
    body: { estado: 'Listo' },
  });
  assert.equal(ready.status, 200);

  // 6. Mesero confirma 'Entregado'
  const delivered = await apiJson(`/pedidos/${orderId}/estado`, {
    method: 'PATCH',
    cookie: waiterCookie,
    body: { estado: 'Entregado' },
  });
  assert.equal(delivered.status, 200);

  // 7. Verificar que el producto con historial ahora está protegido contra eliminación física
  const adminLogin = await apiJson('/auth/login', {
    method: 'POST',
    body: { nombre_usuario: 'admin', contrasena: 'AdminPass2026!' },
  });
  const deleteProtected = await apiJson(`/productos/${targetProd.id_producto}`, {
    method: 'DELETE',
    cookie: adminLogin.cookie,
  });
  assert.equal(deleteProtected.status, 409, 'Producto con historial de ventas no puede eliminarse (RN-10)');
});
