import React from 'react';
import { Table, TableStatus } from '../types/index.ts';
import { useRestaurant } from '../context/RestaurantContext.tsx';
import { StatusBadge } from './ui/StatusBadge.tsx';
import { Users, Clock, PlusCircle, Eye, CheckCircle2 } from 'lucide-react';

interface TableCardProps {
  table: Table;
  onOpenOrder: (table: Table) => void;
  onViewOrder: (orderId: number) => void;
}

export const TableCard: React.FC<TableCardProps> = ({ table, onOpenOrder, onViewOrder }) => {
  const { getTableStatus, getActiveOrder, updateOrderStatus, currentUser } = useRestaurant();
  const status: TableStatus = getTableStatus(table.id);
  const activeOrder = getActiveOrder(table.id);

  const getElapsedMinutes = () => {
    if (!activeOrder) return 0;
    const diffMs = Date.now() - new Date(activeOrder.createdAt).getTime();
    return Math.max(1, Math.floor(diffMs / (1000 * 60)));
  };

  const elapsed = getElapsedMinutes();
  const isOverdue = elapsed > 25 && status === 'Ocupada';

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md relative overflow-hidden flex flex-col justify-between ${
        status === 'Disponible'
          ? 'border-[#E3E7EF] hover:border-[#2554F4]'
          : isOverdue
          ? 'border-[#FBB4BD] bg-[#FFF5F6]'
          : 'border-[#FCE19B] bg-[#FFFDF5]'
      }`}
    >
      {/* Top Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl font-black tracking-tight text-[#141722]">
                Mesa {table.tableNumber < 10 ? `0${table.tableNumber}` : table.tableNumber}
              </span>
              <StatusBadge status={status} size="sm" />
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-[#626B7A] font-medium">
              <span className="inline-flex items-center gap-1 bg-[#F2F4F8] text-[#141722] px-2 py-0.5 rounded-md font-semibold">
                <Users className="w-3 h-3 text-[#626B7A]" />
                {table.capacity || 4} comensales
              </span>
              <span>•</span>
              <span>{table.area || 'Salón Principal'}</span>
            </div>
          </div>

          {status === 'Ocupada' && activeOrder && (
            <div className="text-right">
              <div className="text-[11px] font-bold text-[#626B7A] uppercase tracking-wider">
                Pedido #{activeOrder.id}
              </div>
              <div className="text-sm font-extrabold text-[#141722] mt-0.5">
                ${activeOrder.total.toLocaleString('es-CO')}
              </div>
            </div>
          )}
        </div>

        {/* Active Order Details if occupied */}
        {status === 'Ocupada' && activeOrder ? (
          <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-[#626B7A]">
                <Clock className="w-3.5 h-3.5" />
                <span>Tiempo:</span>
                <span className={`font-bold ${isOverdue ? 'text-[#B53B46]' : 'text-[#141722]'}`}>
                  {elapsed} min
                </span>
              </div>
              <StatusBadge status={activeOrder.status} size="sm" />
            </div>

            <div className="text-xs text-[#626B7A] truncate">
              {activeOrder.items.length} {activeOrder.items.length === 1 ? 'ítem' : 'ítems'}:{' '}
              <span className="text-[#141722] font-medium">
                {activeOrder.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-[#626B7A]">
            <span className="inline-flex items-center gap-1 text-[#16774D] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#16774D]" />
              Lista para comensales
            </span>
            <span className="text-[11px] text-[#94A3B8]">Sin pedido activo</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-[#F8F9FC] border-t border-[#E3E7EF]">
        {status === 'Disponible' ? (
          <button
            onClick={() => onOpenOrder(table)}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl text-white bg-[#2554F4] hover:bg-[#1741CF] font-bold text-xs tracking-wide shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Tomar Pedido
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewOrder(activeOrder!.id)}
              className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-[#E3E7EF] text-[#141722] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#626B7A]" />
              Ver Comanda
            </button>

            {activeOrder && activeOrder.status === 'Listo' && (currentUser?.role === 'mesero' || currentUser?.role === 'administrador') && (
              <button
                onClick={() => updateOrderStatus(activeOrder.id, 'Entregado')}
                className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-[#16774D] hover:bg-[#115E3C] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer animate-pulse"
                title="Confirmar entrega de platos a los comensales"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Entregar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
