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

export const TableCard: React.FC<TableCardProps> = React.memo(
  ({ table, onOpenOrder, onViewOrder }) => {
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
        className={`jeton-card p-6 flex flex-col justify-between transition-all ${
          status === 'Disponible'
            ? 'border-[#e7dcdb] hover:border-[#f73b20]/60'
            : isOverdue
            ? 'border-[#fb2d54]/40 bg-[#ffebee]/20'
            : 'border-[#f73b20]/30 bg-[#fdedea]/25'
        }`}
      >
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl font-medium tracking-tight text-[#360802]">
                  Mesa {table.tableNumber < 10 ? `0${table.tableNumber}` : table.tableNumber}
                </span>
                <StatusBadge status={status} size="sm" />
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-[#74514b]">
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#f73b20]" />
                  {table.capacity || 4} personas
                </span>
                <span>·</span>
                <span>{table.area || 'Salón Principal'}</span>
              </div>
            </div>

            {status === 'Ocupada' && activeOrder && (
              <div className="text-right">
                <div className="text-[11px] font-medium text-[#74514b]">
                  #{activeOrder.id}
                </div>
                <div className="text-base font-medium text-[#f73b20] mt-0.5 tabular-nums">
                  ${activeOrder.total.toLocaleString('es-CO')}
                </div>
              </div>
            )}
          </div>

          {status === 'Ocupada' && activeOrder ? (
            <div className="mt-5 pt-4 border-t border-[#e7dcdb]/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[#74514b]">
                  <Clock className="w-3.5 h-3.5 text-[#f73b20]" />
                  <span className={isOverdue ? 'text-[#fb2d54] font-medium' : 'text-[#360802]'}>
                    {elapsed} min en servicio
                  </span>
                </div>
                <StatusBadge status={activeOrder.status} size="sm" />
              </div>

              <div className="text-xs text-[#74514b] truncate">
                <span className="text-[#360802] font-medium">
                  {activeOrder.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-5 pt-4 border-t border-[#e7dcdb]/80 flex items-center justify-between text-xs text-[#74514b]">
              <span className="inline-flex items-center gap-1.5 text-[#360802]">
                <span className="w-2 h-2 rounded-full bg-[#34c771]" />
                Disponible para asignar
              </span>
            </div>
          )}
        </div>

        <div className="mt-5 pt-3">
          {status === 'Disponible' ? (
            <button
              onClick={() => onOpenOrder(table)}
              className="w-full py-2.5 px-4 rounded-xl text-white bg-[#f73b20] hover:bg-[#f84d35] font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tomar Pedido</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewOrder(activeOrder!.id)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#ffffff] hover:bg-[#fdedea] border border-[#e7dcdb] text-[#360802] font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#f73b20]" />
                <span>Ver Comanda</span>
              </button>

              {activeOrder &&
                activeOrder.status === 'Listo' &&
                (currentUser?.role === 'mesero' || currentUser?.role === 'administrador') && (
                  <button
                    onClick={() => updateOrderStatus(activeOrder.id, 'Entregado')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#34c771] hover:opacity-95 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Confirmar entrega de platos a los comensales"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Entregar</span>
                  </button>
                )}
            </div>
          )}
        </div>
      </div>
    );
  }
);
