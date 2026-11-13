import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext.tsx';
import { Table, TableStatus } from '../types/index.ts';
import { TableCard } from '../components/TableCard.tsx';
import { StatusBadge } from '../components/ui/StatusBadge.tsx';
import { PageHeader } from '../components/ui/PageHeader.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import {
  LayoutGrid,
  Filter,
  PlusCircle,
  X,
  Clock,
  User,
  CheckCircle2,
  Receipt,
  UtensilsCrossed,
  Sparkles,
} from 'lucide-react';

export const TablesFloorView: React.FC = () => {
  const {
    tables,
    orders,
    getTableStatus,
    getActiveOrder,
    updateOrderStatus,
    setActiveView,
    setSelectedTableForOrder,
    currentUser,
  } = useRestaurant();

  const [statusFilter, setStatusFilter] = useState<'all' | 'Disponible' | 'Ocupada'>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [inspectedOrderId, setInspectedOrderId] = useState<number | null>(null);

  const inspectedOrder = orders.find((o) => o.id === inspectedOrderId);

  // Filter tables
  const filteredTables = tables.filter((t) => {
    const status = getTableStatus(t.id);
    if (statusFilter !== 'all' && status !== statusFilter) return false;
    if (areaFilter !== 'all' && t.area !== areaFilter) return false;
    return true;
  });

  const areas = ['all', ...Array.from(new Set(tables.map((t) => t.area || 'Salón Principal')))];

  const handleOpenOrder = (table: Table) => {
    setSelectedTableForOrder(table);
    setActiveView('nuevo-pedido');
  };

  const handleViewOrder = (orderId: number) => {
    setInspectedOrderId(orderId);
  };

  const occupiedCount = tables.filter((t) => getTableStatus(t.id) === 'Ocupada').length;
  const availableCount = tables.length - occupiedCount;
  const readyOrdersCount = orders.filter((o) => o.status === 'Listo').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Gestión de Mesas & Salón"
        subtitle="Monitoreo en tiempo real de la disponibilidad y estado de las mesas del restaurante."
        badge={
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#fdedea] text-[#f73b20] border border-[#f84d35]/20">
            {tables.length} mesas registradas
          </span>
        }
        actions={
          (currentUser?.role === 'mesero' || currentUser?.role === 'administrador') && (
            <button
              onClick={() => {
                const firstAvailable = tables.find((t) => getTableStatus(t.id) === 'Disponible');
                if (firstAvailable) handleOpenOrder(firstAvailable);
                else setActiveView('nuevo-pedido');
              }}
              className="min-h-[44px] py-2.5 px-4 rounded-xl text-white bg-[#f73b20] hover:bg-[#e02f17] font-semibold text-xs tracking-wide shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Nuevo Pedido
            </button>
          )
        }
      />

      {/* Metric Cards estilo Jeton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          style={{ boxShadow: 'rgba(0, 0, 0, 0.05) 0px -4px 16px 0px' }}
          className="bg-white p-5 rounded-2xl border border-[#e7dcdb] flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-[#74514b] uppercase tracking-wider">
              Mesas Libres
            </span>
            <div className="mt-1 text-2xl font-black text-[#34c771]">
              {availableCount}
            </div>
            <div className="text-xs text-[#74514b] mt-0.5">Listas para comensales</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#e6fbf0] text-[#34c771] flex items-center justify-center font-black text-lg">
            ✓
          </div>
        </div>

        <div
          style={{ boxShadow: 'rgba(0, 0, 0, 0.05) 0px -4px 16px 0px' }}
          className="bg-white p-5 rounded-2xl border border-[#e7dcdb] flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-[#74514b] uppercase tracking-wider">
              Mesas Ocupadas
            </span>
            <div className="mt-1 text-2xl font-black text-[#f73b20]">
              {occupiedCount}
            </div>
            <div className="text-xs text-[#74514b] mt-0.5">Con servicio activo</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#fdedea] text-[#f73b20] flex items-center justify-center font-black text-lg">
            🍽️
          </div>
        </div>

        <div
          style={{ boxShadow: 'rgba(0, 0, 0, 0.05) 0px -4px 16px 0px' }}
          className="bg-white p-5 rounded-2xl border border-[#e7dcdb] flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-[#74514b] uppercase tracking-wider">
              Pedidos Listos
            </span>
            <div className="mt-1 text-2xl font-black text-[#477ee9]">
              {readyOrdersCount}
            </div>
            <div className="text-xs text-[#74514b] mt-0.5">Esperando entrega</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#eaf0ff] text-[#477ee9] flex items-center justify-center font-black text-lg">
            ★
          </div>
        </div>

        <div
          style={{ boxShadow: 'rgba(0, 0, 0, 0.05) 0px -4px 16px 0px' }}
          className="bg-white p-5 rounded-2xl border border-[#e7dcdb] flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-[#74514b] uppercase tracking-wider">
              Ocupación del Salón
            </span>
            <div className="mt-1 text-2xl font-black text-[#360802]">
              {tables.length > 0 ? Math.round((occupiedCount / tables.length) * 100) : 0}%
            </div>
            <div className="text-xs text-[#74514b] mt-0.5">Capacidad en uso</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#fdedea] text-[#360802] flex items-center justify-center font-black text-lg">
            %
          </div>
        </div>
      </div>

      {/* Filtros estilo Tabs/Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#e7dcdb]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`min-h-[38px] px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-[#f73b20] text-white shadow-xs'
                : 'text-[#74514b] hover:text-[#360802] hover:bg-[#fdedea]'
            }`}
          >
            Todas ({tables.length})
          </button>
          <button
            onClick={() => setStatusFilter('Disponible')}
            className={`min-h-[38px] px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'Disponible'
                ? 'bg-[#34c771] text-white shadow-xs'
                : 'text-[#74514b] hover:text-[#360802] hover:bg-[#fdedea]'
            }`}
          >
            Libres ({availableCount})
          </button>
          <button
            onClick={() => setStatusFilter('Ocupada')}
            className={`min-h-[38px] px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'Ocupada'
                ? 'bg-[#f73b20] text-white shadow-xs'
                : 'text-[#74514b] hover:text-[#360802] hover:bg-[#fdedea]'
            }`}
          >
            Ocupadas ({occupiedCount})
          </button>
        </div>

        {/* Filtro por Áreas si hay múltiples */}
        {areas.length > 2 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#74514b] font-medium">Área:</span>
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="text-xs bg-[#fdedea]/40 border border-[#e7dcdb] rounded-xl px-3 py-1.5 font-semibold text-[#360802] focus:outline-none focus:ring-2 focus:ring-[#f73b20]"
            >
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a === 'all' ? 'Todas las áreas' : a}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Grid de Mesas */}
      {filteredTables.length === 0 ? (
        <EmptyState
          icon={<LayoutGrid className="w-7 h-7" />}
          title="No hay mesas con el filtro seleccionado"
          description="Ajuste los filtros de estado o área para visualizar las mesas del salón."
          action={
            <button
              onClick={() => {
                setStatusFilter('all');
                setAreaFilter('all');
              }}
              className="text-xs font-bold text-[#2554F4] hover:underline cursor-pointer"
            >
              Restablecer filtros
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
          {filteredTables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onOpenOrder={handleOpenOrder}
              onViewOrder={handleViewOrder}
            />
          ))}
        </div>
      )}

      {/* Modal de Inspección de Pedido */}
      {inspectedOrder && (
        <div className="fixed inset-0 z-50 bg-[#141722]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E3E7EF] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-black text-[#141722]">
                    Comanda #{inspectedOrder.id} • Mesa {inspectedOrder.tableNumber}
                  </h3>
                  <StatusBadge status={inspectedOrder.status} size="sm" />
                </div>
                <div className="text-xs text-[#626B7A] mt-1 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(inspectedOrder.createdAt).toLocaleTimeString()}</span>
                  <span>•</span>
                  <span>{inspectedOrder.waiterName}</span>
                </div>
              </div>
              <button
                onClick={() => setInspectedOrderId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
              {inspectedOrder.items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-[#141722] mr-2">{item.quantity}x</span>
                    <span className="text-slate-800 font-medium">{item.productName}</span>
                  </div>
                  <span className="font-mono text-slate-700 font-bold">
                    ${item.subtotal.toLocaleString('es-CO')}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-[#626B7A] uppercase">Total Comanda</span>
              <span className="text-xl font-black text-[#141722]">
                ${inspectedOrder.total.toLocaleString('es-CO')}
              </span>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setInspectedOrderId(null)}
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-[#626B7A] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              {inspectedOrder.status === 'Listo' && (currentUser?.role === 'mesero' || currentUser?.role === 'administrador') && (
                <button
                  onClick={() => {
                    updateOrderStatus(inspectedOrder.id, 'Entregado');
                    setInspectedOrderId(null);
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#16774D] hover:bg-[#115E3C] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmar Entrega en Mesa
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
