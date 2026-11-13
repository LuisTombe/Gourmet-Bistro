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
      style={{ boxShadow: 'rgba(0, 0, 0, 0.05) 0px -4px 16px 0px' }}
      className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-lg relative overflow-hidden flex flex-col justify-between ${
        status === 'Disponible'
          ? 'border-[#e7dcdb] hover:border-[#f73b20]'
          : isOverdue
          ? 'border-[#fb2d54]/40 bg-[#ffebee]/30'
          : 'border-[#f84d35]/30 bg-[#fdedea]/20'
      }`}
    >
      {/* Top Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl font-medium tracking-tight text-[#360802]">
                Mesa {table.tableNumber < 10 ? `0${table.tableNumber}` : table.tableNumber}
              </span>
              <StatusBadge status={status} size="sm" />
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-[#74514b] font-medium">
              <span className="inline-flex items-center gap-1 bg-[#fdedea] text-[#360802] px-2.5 py-0.5 rounded-full font-semibold border border-[#e7dcdb]">
                <Users className="w-3 h-3 text-[#f73b20]" />
                {table.capacity || 4} comensales
              </span>
              <span>•</span>
              <span>{table.area || 'Salón Principal'}</span>
            </div>
          </div>

          {status === 'Ocupada' && activeOrder && (
            <div className="text-right">
              <div className="text-[11px] font-bold text-[#74514b] uppercase tracking-wider">
                Pedido #{activeOrder.id}
              </div>
              <div className="text-sm font-black text-[#f73b20] mt-0.5 tabular-nums">
                ${activeOrder.total.toLocaleString('es-CO')}
              </div>
            </div>
          )}
        </div>

        {/* Active Order Details if occupied */}
        {status === 'Ocupada' && activeOrder ? (
          <div className="mt-4 pt-3.5 border-t border-[#e7dcdb] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-[#74514b]">
                <Clock className="w-3.5 h-3.5 text-[#f73b20]" />
                <span>Tiempo:</span>
                <span className={`font-bold ${isOverdue ? 'text-[#fb2d54]' : 'text-[#360802]'}`}>
                  {elapsed} min
                </span>
              </div>
              <StatusBadge status={activeOrder.status} size="sm" />
            </div>

            <div className="text-xs text-[#74514b] truncate">
              {activeOrder.items.length} {activeOrder.items.length === 1 ? 'ítem' : 'ítems'}:{' '}
              <span className="text-[#360802] font-semibold">
                {activeOrder.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-3.5 border-t border-[#e7dcdb] flex items-center justify-between text-xs text-[#74514b]">
            <span className="inline-flex items-center gap-1 text-[#34c771] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#34c771]" />
              Lista para comensales
            </span>
            <span className="text-[11px] text-[#ababab]">Sin comanda activa</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-[#fdedea]/30 border-t border-[#e7dcdb]">
        {status === 'Disponible' ? (
          <button
            onClick={() => onOpenOrder(table)}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl text-white bg-[#f73b20] hover:bg-[#e02f17] font-semibold text-xs tracking-wide shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Tomar Pedido
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewOrder(activeOrder!.id)}
              className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-white hover:bg-[#fdedea]/40 border border-[#e7dcdb] text-[#360802] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#f73b20]" />
              Ver Comanda
            </button>

            {activeOrder && activeOrder.status === 'Listo' && (currentUser?.role === 'mesero' || currentUser?.role === 'administrador') && (
              <button
                onClick={() => updateOrderStatus(activeOrder.id, 'Entregado')}
                className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-[#34c771] hover:bg-[#28a75a] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer animate-pulse"
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
