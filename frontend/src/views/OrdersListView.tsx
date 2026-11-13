import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext.tsx';
import { Order, OrderStatus } from '../types/index.ts';
import { StatusBadge } from '../components/StatusBadge.tsx';
import {
  ClipboardList,
  Search,
  CheckCircle2,
  Eye,
  X,
  FileText,
  Clock,
  Filter,
  Check,
  AlertTriangle,
} from 'lucide-react';

export const OrdersListView: React.FC = () => {
  const { orders, updateOrderStatus, currentUser } = useRestaurant();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedOrderId, setInspectedOrderId] = useState<number | null>(null);

  const inspectedOrder = orders.find((o) => o.id === inspectedOrderId);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (selectedStatus !== 'Todos' && order.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = String(order.id).includes(q);
      const matchTable = `mesa ${order.tableNumber}`.toLowerCase().includes(q) || String(order.tableNumber) === q;
      const matchWaiter = order.waiterName.toLowerCase().includes(q);
      const matchItem = order.items.some((i) => i.productName.toLowerCase().includes(q));
      return matchId || matchTable || matchWaiter || matchItem;
    }
    return true;
  });

  const statuses: (OrderStatus | 'Todos')[] = [
    'Todos',
    'Pendiente',
    'En preparación',
    'Listo',
    'Entregado',
  ];

  const canDeliver = currentUser?.role === 'mesero' || currentUser?.role === 'administrador';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Gestión & Historial de Pedidos
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {orders.length} comandas
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Auditoría de tickets, avance de entrega de platos listos y registro histórico.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Status Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {statuses.map((st) => {
            const count = st === 'Todos' ? orders.length : orders.filter((o) => o.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  selectedStatus === st
                    ? 'bg-[#0F172A] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{st}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    selectedStatus === st ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por ticket, mesa o mesero..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
          />
        </div>
      </div>

      {/* Orders Table & Cards */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Ticket / Hora</th>
                <th className="py-3.5 px-4">Mesa</th>
                <th className="py-3.5 px-4">Mesero</th>
                <th className="py-3.5 px-4">Platos</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ClipboardList className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-600">No se encontraron pedidos</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Pruebe con otros filtros o registre un nuevo pedido.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isReady = order.status === 'Listo';

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isReady ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      {/* Ticket ID & Time */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-extrabold text-slate-900 text-sm">#{order.id}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Mesa */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900">
                          Mesa {order.tableNumber < 10 ? `0${order.tableNumber}` : order.tableNumber}
                        </span>
                      </td>

                      {/* Mesero */}
                      <td className="py-4 px-4 text-slate-600 font-medium">
                        {order.waiterName}
                      </td>

                      {/* Platos summary */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800 truncate">
                          {order.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {order.items.reduce((s, i) => s + i.quantity, 0)} ítems en comanda
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-4 px-4">
                        <span className="font-extrabold text-[#A33900] text-sm tabular-nums">
                          ${order.total.toLocaleString('es-CO')}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={order.status} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setInspectedOrderId(order.id)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Ver detalle del ticket"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Action if ready */}
                          {isReady && canDeliver && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'Entregado')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Entregar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspected Order Modal */}
      {inspectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="bg-[#1E293B] text-white p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold tracking-tight">
                    Ticket #{inspectedOrder.id}
                  </span>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-bold">
                    Mesa {inspectedOrder.tableNumber}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Tomado por: {inspectedOrder.waiterName} • {new Date(inspectedOrder.createdAt).toLocaleString()}
                </div>
              </div>

              <button
                onClick={() => setInspectedOrderId(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-xs font-bold text-slate-600 uppercase">Estado:</span>
                <StatusBadge status={inspectedOrder.status} size="md" />
              </div>

              {inspectedOrder.notes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Observación: </span>
                    {inspectedOrder.notes}
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Platos del Ticket
                </h4>
                <div className="space-y-2">
                  {inspectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          <span className="text-[#EA580C] mr-1.5">{item.quantity}x</span>
                          {item.productName}
                        </div>
                        {item.notes && (
                          <div className="text-[11px] text-[#904D00] font-semibold mt-0.5 bg-amber-100/70 inline-block px-1.5 py-0.5 rounded">
                            Nota: {item.notes}
                          </div>
                        )}
                        <div className="text-[11px] text-slate-400 mt-1">
                          Precio histórico: ${item.unitPrice.toLocaleString('es-CO')}
                        </div>
                      </div>

                      <div className="font-extrabold text-slate-900 text-sm tabular-nums">
                        ${item.subtotal.toLocaleString('es-CO')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Total Consolidado:</span>
                <span className="text-2xl font-black text-[#A33900] tabular-nums">
                  ${inspectedOrder.total.toLocaleString('es-CO')}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setInspectedOrderId(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
              >
                Cerrar
              </button>

              {inspectedOrder.status === 'Listo' && canDeliver && (
                <button
                  onClick={() => {
                    updateOrderStatus(inspectedOrder.id, 'Entregado');
                    setInspectedOrderId(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmar Entrega
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
