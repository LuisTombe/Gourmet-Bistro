import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Iniciando pruebas E2E de la API REST...');

  // 1. Health
  const healthRes = await fetch(`${BASE_URL}/health`);
  const health = await healthRes.json();
  assert.equal(health.status, 'UP');
  assert.match(health.database, /MySQL/);
  console.log('✔ 1. Health check OK:', health.service);

  // 2. Mesas
  const tablesRes = await fetch(`${BASE_URL}/tables`);
  const tables = await tablesRes.json();
  assert(Array.isArray(tables));
  assert(tables.length >= 9);
  console.log(`✔ 2. Mesas consultadas OK (${tables.length} mesas)`);

  // 3. Productos
  const productsRes = await fetch(`${BASE_URL}/products`);
  const products = await productsRes.json();
  assert(Array.isArray(products));
  assert(products.length >= 14);
  console.log(`✔ 3. Productos consultados OK (${products.length} platos)`);

  // 4. Crear Pedido en Mesa 3
  const orderRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tableId: 3,
      userId: 2,
      items: [
        { productId: 1, quantity: 2, notes: 'Sin sal' },
        { productId: 12, quantity: 1 },
      ],
      notes: 'Comanda de prueba automatizada',
    }),
  });
  const orderData = await orderRes.json();
  assert.equal(orderData.success, true);
  const createdOrderId = orderData.order.id;
  assert(createdOrderId > 0);
  assert.equal(orderData.order.status, 'Pendiente');
  console.log(`✔ 4. Pedido #${createdOrderId} creado en MySQL exitosamente`);

  // 5. Actualizar estado del pedido: Pendiente -> En preparación
  const updateRes = await fetch(`${BASE_URL}/orders/${createdOrderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'En preparación' }),
  });
  const updateData = await updateRes.json();
  assert.equal(updateData.success, true);
  assert.equal(updateData.status, 'En preparación');
  console.log(`✔ 5. Transición a 'En preparación' OK en pedido #${createdOrderId}`);

  // 6. Crear Snapshot de Versionamiento (Admin)
  const snapRes = await fetch(`${BASE_URL}/snapshots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: 'Punto de restauración automático de prueba E2E',
      versionTag: 'v1.5.0-e2e',
      author: 'Test Runner',
      authorRole: 'administrador',
    }),
  });
  const snapData = await snapRes.json();
  assert.equal(snapData.success, true);
  const snapshotId = snapData.snapshot.id;
  console.log(`✔ 6. Snapshot de versionamiento '${snapData.snapshot.versionTag}' guardado en MySQL (${snapshotId})`);

  // 7. Rollback al Snapshot (Admin)
  const rollbackRes = await fetch(`${BASE_URL}/snapshots/${snapshotId}/rollback`, {
    method: 'POST',
  });
  const rollbackData = await rollbackRes.json();
  assert.equal(rollbackData.success, true);
  console.log('✔ 7. Rollback a versión previa ejecutado con éxito en MySQL');

  console.log('🎉 ¡Todas las 7 pruebas E2E pasaron exitosamente!');
}

runTests().catch((err) => {
  console.error('❌ Error en pruebas E2E:', err);
  process.exit(1);
});

