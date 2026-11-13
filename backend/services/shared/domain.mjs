export const ACTIVE_STATES = ['Pendiente', 'En preparación', 'Listo'];
export const ALL_STATES = [...ACTIVE_STATES, 'Entregado'];
export const ROLES = ['administrador', 'mesero', 'cocinero'];
export function transitionAllowed(from, to, role) {
  return (role === 'cocinero' && from === 'Pendiente' && to === 'En preparación') ||
    (role === 'cocinero' && from === 'En preparación' && to === 'Listo') ||
    (['mesero', 'administrador'].includes(role) && from === 'Listo' && to === 'Entregado');
}
export function asCents(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0 || Math.round(n * 100) !== n * 100 && Math.abs(Math.round(n * 100) - n * 100) > 1e-7)
    throw Object.assign(new Error('Precio inválido: usar máximo dos decimales y valor positivo'), {status: 422});
  return Math.round(n * 100);
}
export function calcLines(items) {
  if (!Array.isArray(items) || items.length < 1) throw Object.assign(new Error('El pedido requiere al menos un producto'), {status:422});
  let totalCents = 0;
  const result = items.map(({id_producto,nombre,cantidad,precio}) => {
    if (!Number.isSafeInteger(cantidad) || cantidad < 1) throw Object.assign(new Error('Cantidad inválida'), {status:422});
    const subtotalCents = cantidad * asCents(precio);
    if (!Number.isSafeInteger(subtotalCents)) throw Object.assign(new Error('Importe fuera de rango'), {status:422});
    totalCents += subtotalCents;
    return {id_producto, nombre_producto:nombre, cantidad, precio_unitario:asCents(precio)/100, subtotal:subtotalCents/100};
  });
  return {lines:result,total:totalCents/100};
}
