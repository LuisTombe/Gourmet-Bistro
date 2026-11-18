import { Order, OrderStatus, TableStatus, UserRole } from '../types/index.ts';

/**
 * PU-01: Calcula el subtotal para una línea de pedido (cantidad * precio_unitario)
 */
export function calculateSubtotal(quantity: number, unitPrice: number): number {
  if (quantity <= 0 || unitPrice <= 0 || !Number.isFinite(quantity) || !Number.isFinite(unitPrice)) {
    return 0;
  }
  return Math.round(quantity * unitPrice * 100) / 100;
}

/**
 * PU-01: Calcula el total del pedido sumando los subtotales de cada item
 */
export function calculateOrderTotal(items: { quantity: number; unitPrice: number }[]): number {
  if (!items || items.length === 0) return 0;
  const total = items.reduce((sum, item) => sum + calculateSubtotal(item.quantity, item.unitPrice), 0);
  return Math.round(total * 100) / 100;
}

/**
 * PU-02: Valida que la cantidad sea un entero estrictamente positivo
 */
export function validateQuantity(qty: unknown): { valid: boolean; error?: string } {
  if (qty === null || qty === undefined || qty === '') {
    return { valid: false, error: 'La cantidad es obligatoria' };
  }
  const num = Number(qty);
  if (!Number.isInteger(num)) {
    return { valid: false, error: 'La cantidad debe ser un número entero' };
  }
  if (num <= 0) {
    return { valid: false, error: 'La cantidad debe ser mayor a cero' };
  }
  return { valid: true };
}

/**
 * PU-03: Valida que el precio sea numérico, positivo y finito
 */
export function validatePrice(price: unknown): { valid: boolean; error?: string } {
  if (price === null || price === undefined || price === '') {
    return { valid: false, error: 'El precio es obligatorio' };
  }
  const num = Number(price);
  if (isNaN(num) || !Number.isFinite(num)) {
    return { valid: false, error: 'El precio debe ser un número válido' };
  }
  if (num <= 0) {
    return { valid: false, error: 'El precio debe ser mayor a cero' };
  }
  return { valid: true };
}

/**
 * PU-04: Transiciones autorizadas de estado del pedido
 * Flujo estricto: Pendiente -> En preparación -> Listo -> Entregado
 * Cocinero: Pendiente -> En preparación -> Listo
 * Mesero o Administrador: Listo -> Entregado
 */
export function canTransitionOrderStatus(
  current: OrderStatus,
  next: OrderStatus,
  role: UserRole
): { allowed: boolean; reason?: string } {
  if (current === 'Entregado') {
    return { allowed: false, reason: 'Un pedido entregado es final y no puede cambiar de estado.' };
  }

  if (current === next) {
    return { allowed: false, reason: `El pedido ya se encuentra en estado '${current}'.` };
  }

  // Pendiente -> En preparación
  if (current === 'Pendiente' && next === 'En preparación') {
    if (role === 'cocinero') {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Solo el personal de cocina puede iniciar la preparación del pedido.' };
  }

  // En preparación -> Listo
  if (current === 'En preparación' && next === 'Listo') {
    if (role === 'cocinero') {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Solo el personal de cocina puede marcar el pedido como listo.' };
  }

  // Listo -> Entregado
  if (current === 'Listo' && next === 'Entregado') {
    if (role === 'mesero' || role === 'administrador') {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Solo el mesero o administrador puede confirmar la entrega.' };
  }

  // Jumps or illegal backwards transitions
  if (current === 'Pendiente' && next === 'Listo') {
    return { allowed: false, reason: 'No se puede saltar directamente de Pendiente a Listo sin pasar por preparación.' };
  }
  if (current === 'Pendiente' && next === 'Entregado') {
    return { allowed: false, reason: 'No se puede entregar un pedido que aún no ha sido preparado.' };
  }
  if (current === 'En preparación' && next === 'Pendiente') {
    return { allowed: false, reason: 'No se permite retroceder el estado del pedido a Pendiente.' };
  }
  if (current === 'Listo' && next === 'En preparación') {
    return { allowed: false, reason: 'No se permite retroceder un pedido Listo a preparación.' };
  }

  return { allowed: false, reason: `Transición no válida de '${current}' a '${next}'.` };
}

/**
 * PU-05: Matriz de permisos RBAC según el rol
 */
export function canUserPerformAction(
  role: UserRole,
  action:
    | 'manage_menu'
    | 'manage_tables'
    | 'manage_users'
    | 'create_order'
    | 'view_orders'
    | 'advance_kitchen_status'
    | 'confirm_delivery'
): boolean {
  switch (action) {
    case 'manage_menu':
    case 'manage_tables':
    case 'manage_users':
      return role === 'administrador';

    case 'create_order':
      return role === 'mesero' || role === 'administrador';

    case 'view_orders':
      return true; // Todos los roles pueden consultar pedidos en sus vistas

    case 'advance_kitchen_status':
      return role === 'cocinero';

    case 'confirm_delivery':
      return role === 'mesero' || role === 'administrador';

    default:
      return false;
  }
}

/**
 * RN-13: La disponibilidad de mesa se deriva de los pedidos activos.
 * Si tiene pedido Pendiente, En preparación o Listo -> Ocupada.
 * Sin pedido activo o solo pedidos Entregados -> Disponible.
 */
export function computeTableStatus(tableId: number, orders: Order[]): TableStatus {
  const hasActiveOrder = orders.some(
    (order) => order.tableId === tableId && (order.status === 'Pendiente' || order.status === 'En preparación' || order.status === 'Listo')
  );
  return hasActiveOrder ? 'Ocupada' : 'Disponible';
}

/**
 * Obtiene el pedido activo de una mesa, si existe
 */
export function getActiveOrderForTable(tableId: number, orders: Order[]): Order | undefined {
  return orders.find(
    (order) => order.tableId === tableId && (order.status === 'Pendiente' || order.status === 'En preparación' || order.status === 'Listo')
  );
}

/**
 * RN-10: No se puede eliminar físicamente un producto si está referenciado en pedidos históricos
 */
export function canDeleteProduct(
  productId: number,
  orders: Order[]
): { allowed: boolean; reason?: string } {
  const isReferenced = orders.some((order) =>
    order.items.some((item) => item.productId === productId)
  );
  if (isReferenced) {
    return {
      allowed: false,
      reason: 'No se puede eliminar un producto con pedidos históricos asociados. Desmárquelo como no disponible.',
    };
  }
  return { allowed: true };
}

/**
 * RN-10: No se puede eliminar físicamente una mesa si tiene pedidos históricos asociados
 */
export function canDeleteTable(
  tableId: number,
  orders: Order[]
): { allowed: boolean; reason?: string } {
  const isReferenced = orders.some((order) => order.tableId === tableId);
  if (isReferenced) {
    return {
      allowed: false,
      reason: 'No se puede eliminar una mesa que tiene pedidos históricos asociados.',
    };
  }
  return { allowed: true };
}
