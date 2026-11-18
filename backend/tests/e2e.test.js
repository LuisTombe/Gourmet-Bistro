import assert from 'node:assert/strict';

const BASE_URL = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000/api';

function extractCookie(res) {
  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) return '';
  return setCookie.split(';')[0];
}

async function apiJson(path, { method = 'GET', body, cookie } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(cookie ? { cookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, cookie: extractCookie(res) };
}

async function runTests() {
  console.log('🧪 Iniciando pruebas E2E contra los 3 microservicios...');

  // 1. Login como Administrador
  const adminLogin = await apiJson('/auth/login', {
    method: 'POST',
    body: { nombre_usuario: 'admin', contrasena: 'AdminPass2026!' },
  });
  assert.equal(adminLogin.status, 200);
  assert(adminLogin.cookie, 'Debe emitir cookie HttpOnly de sesión');
  const adminCookie = adminLogin.cookie;
  console.log('✔ 1. Login Administrador OK');

  // 2. Login como Mesero para probar RBAC (403 en snapshots)
  const waiterLogin = await apiJson('/auth/login', {
    method: 'POST',
    body: { nombre_usuario: 'carlos_m', contrasena: 'MeseroPass2026!' },
  });
  assert.equal(waiterLogin.status, 200);
  const waiterSnap = await apiJson('/snapshots', {
    method: 'POST',
    cookie: waiterLogin.cookie,
    body: { descripcion: 'Intento no autorizado' },
  });
  assert.equal(waiterSnap.status, 403);
  console.log('✔ 2. RBAC 403 bloquea creación de snapshots para rol Mesero OK');

  // 3. Consultar productos y mesas
  const prodRes = await apiJson('/productos', { cookie: adminCookie });
  assert.equal(prodRes.status, 200);
  assert(Array.isArray(prodRes.data.productos) && prodRes.data.productos.length > 0);
  const targetProd = prodRes.data.productos[0];

  const mesasRes = await apiJson('/mesas', { cookie: adminCookie });
  assert.equal(mesasRes.status, 200);
  assert(Array.isArray(mesasRes.data.mesas) && mesasRes.data.mesas.length > 0);
  console.log(
    `✔ 3. Catálogo (${prodRes.data.productos.length} productos, ${mesasRes.data.mesas.length} mesas) OK`
  );

  // 4. Consultar Git real y crear Snapshot persistente en MySQL
  const gitRes = await apiJson('/versionamiento/git', { cookie: adminCookie });
  assert.equal(gitRes.status, 200);
  assert(typeof gitRes.data.branch === 'string');

  const snapRes = await apiJson('/snapshots', {
    method: 'POST',
    cookie: adminCookie,
    body: {
      descripcion: 'Snapshot E2E antes de cambio de precio',
      version_tag: `v-e2e-${Date.now()}`,
    },
  });
  assert.equal(snapRes.status, 201);
  const snapshotId = snapRes.data.snapshot.id;
  console.log(`✔ 4. Snapshot '${snapRes.data.snapshot.versionTag}' persistido en MySQL OK`);

  // 5. Modificar precio de un producto y verificar el cambio
  const newPrice = Number((targetProd.precio + 5000).toFixed(2));
  const editRes = await apiJson(`/productos/${targetProd.id_producto}`, {
    method: 'PUT',
    cookie: adminCookie,
    body: {
      nombre: targetProd.nombre,
      descripcion: targetProd.descripcion,
      precio: newPrice,
    },
  });
  assert.equal(editRes.status, 200);
  console.log(`✔ 5. Precio modificado temporalmente a ${newPrice} OK`);

  // 6. Ejecutar Rollback en MySQL y verificar que el precio volvió al original
  const rollbackRes = await apiJson(`/snapshots/${snapshotId}/rollback`, {
    method: 'POST',
    cookie: adminCookie,
  });
  assert.equal(rollbackRes.status, 200, `Rollback falló: ${JSON.stringify(rollbackRes.data)}`);
  assert.equal(rollbackRes.data.ok, true);

  const afterRollback = await apiJson('/productos', { cookie: adminCookie });
  const restoredProd = afterRollback.data.productos.find(
    (p) => p.id_producto === targetProd.id_producto
  );
  assert.equal(restoredProd.precio, targetProd.precio);
  console.log(`✔ 6. Rollback verificado en MySQL: precio restaurado a ${restoredProd.precio} OK`);

  // 7. Logout
  const logoutRes = await apiJson('/auth/logout', { method: 'POST', cookie: adminCookie });
  assert.equal(logoutRes.status, 200);
  console.log('✔ 7. Logout seguro OK');

  console.log('🎉 ¡Todas las 7 pruebas E2E pasaron exitosamente!');
}

runTests().catch((err) => {
  console.error('❌ Error en pruebas E2E:', err);
  process.exit(1);
});
