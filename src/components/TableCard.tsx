import React from 'react';
import { Table, TableStatus } from '../types/index.ts';
import { useRestaurant } from '../context/RestaurantContext.tsx';
import { StatusBadge } from './StatusBadge.tsx';
import { Users, Clock, PlusCircle, Eye, CheckCircle2, AlertCircle } from 'lucide-react';

interface TableCardProps {
  table: Table;
  onOpenOrder: (table: Table) => void;
  onViewOrder: (orderId: number) => void;
}

export const TableCard: React.FC<TableCardProps> = ({ table, onOpenOrder, onViewOrder }) => {
  const { getTableStatus, getActiveOrder, updateOrderStatus, currentUser } = useRestaurant();
  const status: TableStatus = getTableStatus(table.id);
  const activeOrder = getActiveOrder(table.id);

  // Calculate elapsed minutes if active order exists
  const getElapsedMinutes = () => {
    if (!activeOrder) return 0;
    const diffMs = Date.now() - new Date(activeOrder.createdAt).getTime();
    return Math.max(1, Math.floor(diffMs / (1000 * 60)));
  };

  const elapsed = getElapsedMinutes();
  const isOverdue = elapsed > 25 && status === 'Ocupada';

  return (
    <div
      className={`rounded-2xl transition-all duration-200 border-2 shadow-sm relative overflow-hidden flex flex-col justify-between ${
        status === 'Disponible'
          ? 'bg-[#FFFFFF] border-emerald-500/30 hover:border-emerald-500 hover:shadow-md'
          : isOverdue
          ? 'bg-[#FEF2F2] border-rose-500 shadow-rose-100/50 hover:shadow-md'
          : 'bg-[#FFFFFF] border-rose-400/40 hover:border-rose-500 hover:shadow-md'
      }`}
    >
      {/* Top Header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0F172A]">
                Mesa {table.tableNumber < 10 ? `0${table.tableNumber}` : table.tableNumber}
              </span>
              <StatusBadge status={status} size="sm" />
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                <Users className="w-3 h-3 text-slate-500" />
                {table.capacity} personas
              </span>
              <span className="text-slate-400">•</span>
              <span>{table.area}</span>
            </div>
          </div>

          {status === 'Ocupada' && activeOrder && (
            <div className="text-right">
              <div
                className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-semibold ${
                  isOverdue ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Clock className="w-3 h-3" />
                {elapsed}m
              </div>
            </div>
          )}
        </div>

        {/* Card Body */}
        {status === 'Ocupada' && activeOrder ? (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Ticket:</span>
              <span className="font-bold text-slate-800">#{activeOrder.id}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Estado cocina:</span>
              <StatusBadge status={activeOrder.status} size="sm" />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Mesero:</span>
              <span className="font-medium text-slate-700 truncate max-w-[120px]">
                {activeOrder.waiterName}
              </span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-200">
              <span className="text-xs font-semibold text-slate-600">Total cuenta:</span>
              <span className="text-base font-extrabold text-[#A33900] tabular-nums">
                ${activeOrder.total.toLocaleString('es-CO')}
              </span>
            </div>

            {/* Quick item count preview */}
            <div className="bg-slate-50 p-2 rounded-lg text-xs text-slate-600">
              <span className="font-semibold text-slate-700">{activeOrder.items.length} platos: </span>
              <span className="text-slate-500 truncate">
                {activeOrder.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-6 py-6 text-center rounded-xl bg-emerald-50/60 border border-emerald-100">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-emerald-800">Mesa Disponible</p>
            <p className="text-xs text-emerald-600/80 mt-0.5">Limpia y lista para recibir comensales</p>
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2">
        {status === 'Disponible' ? (
          <button
            onClick={() => onOpenOrder(table)}
            className="w-full min-h-[44px] px-4 py-2 bg-[#EA580C] hover:bg-[#CC4900] active:scale-[0.98] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Abrir Pedido
          </button>
        ) : activeOrder ? (
          <>
            <button
              onClick={() => onViewOrder(activeOrder.id)}
              className="flex-1 min-h-[44px] px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              Ver Ticket
            </button>

            {/* If order is 'Listo', allow Mesero / Admin to deliver directly */}
            {activeOrder.status === 'Listo' && (currentUser?.role === 'mesero' || currentUser?.role === 'administrador') ? (
              <button
                onClick={() => updateOrderStatus(activeOrder.id, 'Entregado')}
                className="flex-1 min-h-[44px] px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Entregar & Liberar
              </button>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium px-2 py-1 text-center flex-1">
                {activeOrder.status === 'Pendiente' ? 'En cola cocina' : 'En preparación'}
              </span>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};
