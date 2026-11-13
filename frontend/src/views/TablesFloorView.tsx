import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext.tsx';
import { Table, TableStatus } from '../types/index.ts';
import { TableCard } from '../components/TableCard.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import {
  LayoutGrid,
  Filter,
  PlusCircle,
  X,
  Clock,
  User,
  CheckCircle2,
  Receipt,
  AlertTriangle,
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

  const areas = ['all', ...Array.from(new Set(tables.map((t) => t.area)))];

  const handleOpenOrder = (table: Table) => {
    setSelectedTableForOrder(table);
    setActiveView('nuevo-pedido');
  };

  const handleViewOrder = (orderId: number) => {
    setInspectedOrderId(orderId);
  };

  const occupiedCount = tables.filter((t) => getTableStatus(t.id) === 'Ocupada').length;
  const availableCount = tables.length - occupiedCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Plano de Mesas & Salón
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {tables.length} mesas
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Gestione comensales, consulte tiempos en cocina y confirme la entrega de platos listos.
          </p>
        </div>

        {/* Quick New Order CTA */}
        <button
          onClick={() => {
            setSelectedTableForOrder(null);
            setActiveView('nuevo-pedido');
          }}
          className="min-h-[48px] px-5 py-2.5 bg-[#EA580C] hover:bg-[#CC4900] active:scale-[0.98] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          Registrar Pedido
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Estado:
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              statusFilter === 'all'
                ? 'bg-[#0F172A] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas ({tables.length})
          </button>
          <button
            onClick={() => setStatusFilter('Disponible')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              statusFilter === 'Disponible'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Disponibles ({availableCount})
          </button>
          <button
            onClick={() => setStatusFilter('Ocupada')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              statusFilter === 'Ocupada'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Ocupadas ({occupiedCount})
          </button>
        </div>

        {/* Area Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Sector:
          </span>
          {areas.map((area) => (
            <button
              key={area}
              onClick={() => setAreaFilter(area)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                areaFilter === area
                  ? 'bg-amber-100 text-[#904D00] border border-amber-300'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {area === 'all' ? 'Todos los sectores' : area}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Tables */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            onOpenOrder={handleOpenOrder}
            onViewOrder={handleViewOrder}
          />
        ))}
      </div>

      {filteredTables.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 mt-6">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-slate-800">No hay mesas con los filtros seleccionados</p>
          <p className="text-xs text-slate-500 mt-1">Pruebe seleccionando "Todas" o cambiando el sector.</p>
        </div>
      )}

      {/* Inspected Order Modal / Slide-over */}
      {inspectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#1E293B] text-white p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold tracking-tight">
                    Mesa {inspectedOrder.tableNumber < 10 ? `0${inspectedOrder.tableNumber}` : inspectedOrder.tableNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Ticket #{inspectedOrder.id}
                  </span>
                </div>
                <div className="text-xs text-slate-300 flex items-center gap-2 mt-1">
                  <span>Atendido por: {inspectedOrder.waiterName}</span>
                  <span>•</span>
                  <span>{new Date(inspectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <button
                onClick={() => setInspectedOrderId(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Estado actual del pedido
                </span>
                <StatusBadge status={inspectedOrder.status} size="md" />
              </div>

              {inspectedOrder.notes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Observaciones del cliente: </span>
                    {inspectedOrder.notes}
                  </div>
                </div>
              )}

              {/* Items List */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Desglose de Platos ({inspectedOrder.items.length})
                </h4>
                <div className="space-y-2">
                  {inspectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          <span className="text-[#EA580C] mr-1.5">{item.quantity}x</span>
                          {item.productName}
                        </div>
                        {item.notes && (
                          <div className="text-[11px] text-[#904D00] font-semibold mt-0.5 bg-amber-50 inline-block px-1.5 py-0.5 rounded">
                            Nota: {item.notes}
                          </div>
                        )}
                        <div className="text-[11px] text-slate-400 mt-1">
                          Unitario: ${item.unitPrice.toLocaleString('es-CO')}
                        </div>
                      </div>

                      <div className="font-extrabold text-slate-900 text-sm tabular-nums">
                        ${item.subtotal.toLocaleString('es-CO')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Total Facturado
                  </span>
                  <span className="text-[11px] text-slate-400">Precios históricos consolidados</span>
                </div>
                <span className="text-2xl font-black text-[#A33900] tabular-nums">
                  ${inspectedOrder.total.toLocaleString('es-CO')}
                </span>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setInspectedOrderId(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100"
              >
                Cerrar Detalle
              </button>

              {/* Action if ready */}
              {inspectedOrder.status === 'Listo' &&
                (currentUser?.role === 'mesero' || currentUser?.role === 'administrador') && (
                  <button
                    onClick={() => {
                      updateOrderStatus(inspectedOrder.id, 'Entregado');
                      setInspectedOrderId(null);
                    }}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs flex items-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmar Entrega y Liberar Mesa
                  </button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
