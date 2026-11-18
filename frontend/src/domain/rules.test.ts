import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSubtotal,
  calculateOrderTotal,
  validateQuantity,
  validatePrice,
  canTransitionOrderStatus,
  canUserPerformAction,
  computeTableStatus,
  canDeleteProduct,
  canDeleteTable,
} from './rules.ts';
import { Order } from '../types/index.ts';

test('PU-01: calculateSubtotal calculates quantity * unitPrice correctly', () => {
  assert.equal(calculateSubtotal(2, 45000), 90000);
  assert.equal(calculateSubtotal(3, 12500.5), 37501.5);
  assert.equal(calculateSubtotal(0, 50000), 0);
  assert.equal(calculateSubtotal(-1, 20000), 0);
});

test('PU-01: calculateOrderTotal computes total accurately from items', () => {
  const items = [
    { quantity: 2, unitPrice: 35000 },
    { quantity: 1, unitPrice: 18000 },
    { quantity: 3, unitPrice: 8500 },
  ];
  // 70000 + 18000 + 25500 = 113500
  assert.equal(calculateOrderTotal(items), 113500);
  assert.equal(calculateOrderTotal([]), 0);
});

test('PU-02: validateQuantity ensures quantity is positive integer', () => {
  assert.equal(validateQuantity(1).valid, true);
  assert.equal(validateQuantity(5).valid, true);
  assert.equal(validateQuantity(0).valid, false);
  assert.equal(validateQuantity(-2).valid, false);
  assert.equal(validateQuantity(1.5).valid, false);
  assert.equal(validateQuantity('abc').valid, false);
  assert.equal(validateQuantity(null).valid, false);
});

test('PU-03: validatePrice ensures price is a valid positive number', () => {
  assert.equal(validatePrice(1000).valid, true);
  assert.equal(validatePrice(48500.5).valid, true);
  assert.equal(validatePrice(0).valid, false);
  assert.equal(validatePrice(-500).valid, false);
  assert.equal(validatePrice('invalido').valid, false);
  assert.equal(validatePrice('').valid, false);
});

test('PU-04: canTransitionOrderStatus allows strictly authorized step progression', () => {
  // Cocinero can advance preparation
  assert.equal(canTransitionOrderStatus('Pendiente', 'En preparación', 'cocinero').allowed, true);
  assert.equal(canTransitionOrderStatus('En preparación', 'Listo', 'cocinero').allowed, true);

  // Mesero or Admin cannot advance kitchen preparation states
  assert.equal(canTransitionOrderStatus('Pendiente', 'En preparación', 'mesero').allowed, false);
  assert.equal(canTransitionOrderStatus('En preparación', 'Listo', 'administrador').allowed, false);

  // Mesero or Admin can deliver a ready order
  assert.equal(canTransitionOrderStatus('Listo', 'Entregado', 'mesero').allowed, true);
  assert.equal(canTransitionOrderStatus('Listo', 'Entregado', 'administrador').allowed, true);

  // Cocinero cannot deliver order
  assert.equal(canTransitionOrderStatus('Listo', 'Entregado', 'cocinero').allowed, false);

  // Illegal jumps
  assert.equal(canTransitionOrderStatus('Pendiente', 'Listo', 'cocinero').allowed, false);
  assert.equal(canTransitionOrderStatus('Pendiente', 'Entregado', 'mesero').allowed, false);

  // Illegal rollbacks
  assert.equal(canTransitionOrderStatus('En preparación', 'Pendiente', 'cocinero').allowed, false);
  assert.equal(canTransitionOrderStatus('Listo', 'En preparación', 'cocinero').allowed, false);

  // Terminal state protection
  assert.equal(canTransitionOrderStatus('Entregado', 'Listo', 'administrador').allowed, false);
});

test('PU-05: RBAC permissions matrix correctly validates roles', () => {
  // Admin permissions
  assert.equal(canUserPerformAction('administrador', 'manage_menu'), true);
  assert.equal(canUserPerformAction('administrador', 'manage_tables'), true);
  assert.equal(canUserPerformAction('administrador', 'manage_users'), true);
  assert.equal(canUserPerformAction('administrador', 'create_order'), true);
  assert.equal(canUserPerformAction('administrador', 'confirm_delivery'), true);

  // Mesero permissions
  assert.equal(canUserPerformAction('mesero', 'manage_menu'), false);
  assert.equal(canUserPerformAction('mesero', 'manage_users'), false);
  assert.equal(canUserPerformAction('mesero', 'create_order'), true);
  assert.equal(canUserPerformAction('mesero', 'confirm_delivery'), true);
  assert.equal(canUserPerformAction('mesero', 'advance_kitchen_status'), false);

  // Cocinero permissions
  assert.equal(canUserPerformAction('cocinero', 'manage_menu'), false);
  assert.equal(canUserPerformAction('cocinero', 'create_order'), false);
  assert.equal(canUserPerformAction('cocinero', 'advance_kitchen_status'), true);
  assert.equal(canUserPerformAction('cocinero', 'confirm_delivery'), false);
});

test('computeTableStatus correctly derives occupancy from active orders', () => {
  const dummyOrders: Order[] = [
    {
      id: 1,
      tableId: 1,
      tableNumber: 1,
      userId: 2,
      waiterName: 'Carlos Mesero',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'En preparación',
      items: [{ id: 1, productId: 10, productName: 'Bife', quantity: 1, unitPrice: 45000, subtotal: 45000 }],
      total: 45000,
    },
    {
      id: 2,
      tableId: 2,
      tableNumber: 2,
      userId: 2,
      waiterName: 'Carlos Mesero',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Entregado',
      items: [{ id: 2, productId: 12, productName: 'Vino', quantity: 1, unitPrice: 30000, subtotal: 30000 }],
      total: 30000,
    },
  ];

  // Table 1 has an active order ('En preparación') -> Ocupada
  assert.equal(computeTableStatus(1, dummyOrders), 'Ocupada');

  // Table 2 only has a completed order ('Entregado') -> Disponible
  assert.equal(computeTableStatus(2, dummyOrders), 'Disponible');

  // Table 3 has no orders -> Disponible
  assert.equal(computeTableStatus(3, dummyOrders), 'Disponible');
});

test('canDeleteProduct and canDeleteTable protect historic records', () => {
  const ordersWithHistory: Order[] = [
    {
      id: 101,
      tableId: 5,
      tableNumber: 5,
      userId: 1,
      waiterName: 'Carlos Mesero',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Entregado',
      items: [{ id: 1, productId: 99, productName: 'Ojo de Bife', quantity: 1, unitPrice: 60000, subtotal: 60000 }],
      total: 60000,
    },
  ];

  // Product 99 is in order history -> cannot delete
  assert.equal(canDeleteProduct(99, ordersWithHistory).allowed, false);
  // Product 40 is not in history -> allowed
  assert.equal(canDeleteProduct(40, ordersWithHistory).allowed, true);

  // Table 5 has order history -> cannot delete
  assert.equal(canDeleteTable(5, ordersWithHistory).allowed, false);
  // Table 10 has no history -> allowed
  assert.equal(canDeleteTable(10, ordersWithHistory).allowed, true);
});
