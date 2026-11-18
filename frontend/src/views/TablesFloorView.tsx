import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useRestaurant } from '../context/RestaurantContext.tsx';
import { Table } from '../types/index.ts';
import { TableCard } from '../components/TableCard.tsx';
import { StatusBadge } from '../components/ui/StatusBadge.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import { OptimizedImage } from '../components/ui/OptimizedImage.tsx';
import { FoodPlate3D, PLATES_3D_CATALOG, Plate3DMeta } from '../components/3d/FoodPlate3D.tsx';
import { Food3DModal } from '../components/3d/Food3DModal.tsx';
import {
  LayoutGrid,
  PlusCircle,
  X,
  Clock,
  CheckCircle2,
  UtensilsCrossed,
  Sparkles,
  ArrowDown,
  ShoppingBag,
  Plus,
  Minus,
  MousePointerClick,
} from 'lucide-react';

export const TablesFloorView: React.FC = () => {
  const {
    tables,
    orders,
    products,
    getTableStatus,
    updateOrderStatus,
    setActiveView,
    setSelectedTableForOrder,
    currentUser,
    draftCart,
    addToDraftCart,
    updateDraftQuantity,
  } = useRestaurant();

  const [statusFilter, setStatusFilter] = useState<'all' | 'Disponible' | 'Ocupada'>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [inspectedOrderId, setInspectedOrderId] = useState<number | null>(null);
  const [selectedPlateIdx, setSelectedPlateIdx] = useState<number>(0);
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);

  const salonSectionRef = useRef<HTMLDivElement>(null);
  const plateProductsSectionRef = useRef<HTMLDivElement>(null);

  const inspectedOrder = useMemo(
    () => orders.find((o) => o.id === inspectedOrderId),
    [orders, inspectedOrderId]
  );

  const filteredTables = useMemo(
    () =>
      tables.filter((t) => {
        const status = getTableStatus(t.id);
        if (statusFilter !== 'all' && status !== statusFilter) return false;
        if (areaFilter !== 'all' && t.area !== areaFilter) return false;
        return true;
      }),
    [tables, getTableStatus, statusFilter, areaFilter]
  );

  const areas = useMemo(
    () => ['all', ...Array.from(new Set(tables.map((t) => t.area || 'Salón Principal')))],
    [tables]
  );

  const handleOpenOrder = useCallback(
    (table: Table) => {
      setSelectedTableForOrder(table);
      setActiveView('nuevo-pedido');
    },
    [setSelectedTableForOrder, setActiveView]
  );

  const handleViewOrder = useCallback((orderId: number) => {
    setInspectedOrderId(orderId);
  }, []);

  const handlePlate3DClick = useCallback((idx: number, _plate: Plate3DMeta) => {
    setSelectedPlateIdx(idx);
    setIs3DModalOpen(true);
  }, []);

  const occupiedCount = useMemo(
    () => tables.filter((t) => getTableStatus(t.id) === 'Ocupada').length,
    [tables, getTableStatus]
  );
  const availableCount = tables.length - occupiedCount;
  const readyOrdersCount = useMemo(
    () => orders.filter((o) => o.status === 'Listo').length,
    [orders]
  );
  const draftItemsCount = useMemo(
    () => draftCart.reduce((acc, item) => acc + item.quantity, 0),
    [draftCart]
  );

  const activePlate = PLATES_3D_CATALOG[selectedPlateIdx] || PLATES_3D_CATALOG[0];
  const activePlateProducts = useMemo(
    () => products.filter((p) => p.category === activePlate.category),
    [products, activePlate.category]
  );

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16 space-y-16">
      {/* =====================================================================
          1. PORTADA EDITORIAL JETON CON 5 PLATOS DE COMIDA 3D GIRATORIOS
         ===================================================================== */}
      <section
        style={{
          background:
            'linear-gradient(132deg, #f36878 0%, #f66a55 34%, #f87d56 68%, #f8a27d 100%)',
          boxShadow:
            'rgba(247, 59, 32, 0.12) 0px 16px 40px 0px, rgba(54, 8, 2, 0.05) 0px 2px 10px 0px',
        }}
        className="relative w-full min-h-[580px] lg:min-h-[650px] rounded-[28px] overflow-hidden flex flex-col justify-between p-7 sm:p-10 lg:p-12 select-none"
      >
        {/* Background Full-Bleed 3D Cascading Food Plates Canvas */}
        <div className="absolute inset-0 z-10">
          <FoodPlate3D
            variant="hero"
            activeDishIndex={selectedPlateIdx}
            onDishChange={(idx) => setSelectedPlateIdx(idx)}
            onPlateClick={handlePlate3DClick}
            showControlsPill={false}
            className="w-full h-full"
          />
        </div>

        {/* Top Row inside Hero: Clean Interactive Guide & Single Action Pill */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 pt-1 pointer-events-none">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium tracking-[0.02em]">
            <MousePointerClick className="w-3.5 h-3.5" />
            <span>Haz clic en cualquier plato 3D para ver sus productos</span>
          </span>

          <div className="flex items-center gap-2.5 pointer-events-auto">
            <button
              onClick={() => setIs3DModalOpen(true)}
              className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/35 text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{activePlate.shortName}</span>
            </button>
          </div>
        </div>

        {/* Middle Bottom Editorial Typography & Right Action Block */}
        <div className="relative z-20 mt-auto pt-40 sm:pt-48 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pointer-events-none">
          <div className="lg:col-span-7">
            <h1
              style={{
                fontSize: 'clamp(3rem, 6.4vw, 6.1rem)',
                lineHeight: 0.93,
                letterSpacing: '-0.02em',
              }}
              className="font-medium text-white drop-shadow-[0_4px_24px_rgba(54,8,2,0.1)]"
            >
              One app
              <br />
              for all orders
            </h1>
          </div>

          <div className="lg:col-span-5 lg:pl-8 space-y-5 pointer-events-auto">
            <p className="text-white/95 text-base sm:text-lg font-normal leading-[1.35] max-w-sm">
              Un solo sistema para tus pedidos, mesas y alta cocina en 3D.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIs3DModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-white text-[#f73b20] hover:bg-[#fdedea] text-xs font-medium flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Ver Productos del Plato 3D</span>
              </button>

              <button
                onClick={() => {
                  const firstAvailable = tables.find((t) => getTableStatus(t.id) === 'Disponible');
                  if (firstAvailable) handleOpenOrder(firstAvailable);
                  else setActiveView('nuevo-pedido');
                }}
                className="px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/40 text-white text-xs font-medium flex items-center gap-2 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Tomar Pedido</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar inside Hero: Scroll (Left) | Jeton #f73b20 Dock (Center) | Pedido Counter (Right) */}
        <div className="relative z-20 mt-8 pt-2 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() =>
              plateProductsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
            }
            className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Explorar</span>
          </button>

          <div className="flex items-center gap-1 p-1.5 rounded-full bg-[#f73b20] text-white shadow-[0_8px_24px_rgba(247,59,32,0.35)] border border-white/20 max-w-full overflow-x-auto">
            {PLATES_3D_CATALOG.map((plate, idx) => (
              <button
                key={plate.id}
                onClick={() => {
                  setSelectedPlateIdx(idx);
                  setIs3DModalOpen(true);
                }}
                className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  selectedPlateIdx === idx
                    ? 'bg-white text-[#f73b20]'
                    : 'text-white/95 hover:bg-white/15'
                }`}
              >
                {plate.shortName}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIs3DModalOpen(true)}
            className="px-4 py-2 rounded-full bg-[#360802]/40 hover:bg-[#360802]/60 backdrop-blur-md border border-white/20 text-white text-xs font-medium flex items-center gap-2 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Pedido ({draftItemsCount})</span>
          </button>
        </div>
      </section>

      {/* =====================================================================
          2. PRODUCTOS DEL PLATO 3D SELECCIONADO
         ===================================================================== */}
      <section ref={plateProductsSectionRef} className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#e7dcdb] pb-6">
          <div>
            <span className="inline-block text-xs uppercase tracking-[0.05em] text-[#f73b20] font-medium mb-2">
              Productos en Escena 3D
            </span>
            <h2 className="text-3xl sm:text-4xl font-medium text-[#360802] tracking-tight leading-tight">
              {activePlate.name}
            </h2>
            <p className="text-sm text-[#74514b] mt-2 max-w-2xl leading-relaxed">
              {activePlate.description}
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {PLATES_3D_CATALOG.map((plate, idx) => (
              <button
                key={plate.id}
                onClick={() => setSelectedPlateIdx(idx)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  selectedPlateIdx === idx
                    ? 'bg-[#f73b20] text-white'
                    : 'bg-[#fdedea]/70 text-[#360802] hover:bg-[#fdedea]'
                }`}
              >
                {plate.shortName}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activePlateProducts.map((product) => {
            const inCart = draftCart.find((i) => i.product.id === product.id);
            const qty = inCart ? inCart.quantity : 0;

            return (
              <div
                key={product.id}
                className={`jeton-card p-6 flex flex-col justify-between ${
                  qty > 0
                    ? 'border-[#f73b20] ring-1 ring-[#f73b20]/20'
                    : 'border-[#e7dcdb] hover:border-[#f84d35]'
                }`}
              >
                <div>
                  <div className="relative h-48 rounded-xl overflow-hidden mb-5 bg-[#fdedea]/50">
                    <OptimizedImage
                      src={product.image}
                      alt={product.name}
                      width={600}
                      height={380}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-medium text-[#360802] leading-snug">
                      {product.name}
                    </h3>
                    <span className="text-lg font-medium text-[#f73b20] shrink-0 tabular-nums">
                      ${product.price.toLocaleString('es-CO')}
                    </span>
                  </div>

                  <p className="text-xs text-[#74514b] mt-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#e7dcdb]/80 flex items-center justify-between">
                  <button
                    onClick={() => setIs3DModalOpen(true)}
                    className="text-xs font-medium text-[#74514b] hover:text-[#f73b20] transition-colors cursor-pointer"
                  >
                    Ver en 3D
                  </button>

                  {qty === 0 ? (
                    <button
                      onClick={() => addToDraftCart(product, 1)}
                      className="px-4 py-2 rounded-xl bg-[#f73b20] hover:bg-[#f84d35] text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Incluir en pedido</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-[#fdedea] border border-[#f73b20]/30 rounded-xl px-2 py-1">
                      <button
                        onClick={() => updateDraftQuantity(product.id, -1)}
                        className="w-7 h-7 rounded-lg bg-[#ffffff] text-[#f73b20] flex items-center justify-center hover:bg-[#f73b20] hover:text-white transition-colors cursor-pointer"
                        aria-label="Restar 1"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="min-w-[20px] text-center text-xs font-medium text-[#360802]">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateDraftQuantity(product.id, 1)}
                        className="w-7 h-7 rounded-lg bg-[#f73b20] text-white flex items-center justify-center hover:bg-[#f84d35] transition-colors cursor-pointer"
                        aria-label="Sumar 1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          3. PLANO DEL SALÓN & GESTIÓN DE MESAS
         ===================================================================== */}
      <section ref={salonSectionRef} className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e7dcdb] pb-6">
          <div>
            <span className="inline-block text-xs uppercase tracking-[0.05em] text-[#f73b20] font-medium mb-2">
              Operación en Tiempo Real
            </span>
            <h2 className="text-3xl sm:text-4xl font-medium text-[#360802] tracking-tight leading-tight">
              Salón & Mesas
            </h2>
          </div>

          {(currentUser?.role === 'mesero' || currentUser?.role === 'administrador') && (
            <button
              onClick={() => {
                const firstAvailable = tables.find((t) => getTableStatus(t.id) === 'Disponible');
                if (firstAvailable) handleOpenOrder(firstAvailable);
                else setActiveView('nuevo-pedido');
              }}
              className="py-2.5 px-5 rounded-xl text-white bg-[#f73b20] hover:bg-[#f84d35] font-medium text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nuevo Pedido {draftItemsCount > 0 ? `(${draftItemsCount})` : ''}</span>
            </button>
          )}
        </div>

        {/* Clean Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="jeton-card p-6">
            <span className="text-xs font-medium text-[#74514b]">Mesas Libres</span>
            <div className="mt-2 text-3xl sm:text-4xl font-medium text-[#360802] tabular-nums">
              {availableCount}
            </div>
          </div>

          <div className="jeton-card p-6">
            <span className="text-xs font-medium text-[#74514b]">Mesas Ocupadas</span>
            <div className="mt-2 text-3xl sm:text-4xl font-medium text-[#f73b20] tabular-nums">
              {occupiedCount}
            </div>
          </div>

          <div className="jeton-card p-6">
            <span className="text-xs font-medium text-[#74514b]">Pedidos Listos</span>
            <div className="mt-2 text-3xl sm:text-4xl font-medium text-[#360802] tabular-nums">
              {readyOrdersCount}
            </div>
          </div>

          <div className="jeton-card p-6">
            <span className="text-xs font-medium text-[#74514b]">Ocupación</span>
            <div className="mt-2 text-3xl sm:text-4xl font-medium text-[#360802] tabular-nums">
              {tables.length > 0 ? Math.round((occupiedCount / tables.length) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#f73b20] text-white'
                  : 'bg-[#fdedea]/60 text-[#360802] hover:bg-[#fdedea]'
              }`}
            >
              Todas ({tables.length})
            </button>
            <button
              onClick={() => setStatusFilter('Disponible')}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                statusFilter === 'Disponible'
                  ? 'bg-[#f73b20] text-white'
                  : 'bg-[#fdedea]/60 text-[#360802] hover:bg-[#fdedea]'
              }`}
            >
              Libres ({availableCount})
            </button>
            <button
              onClick={() => setStatusFilter('Ocupada')}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                statusFilter === 'Ocupada'
                  ? 'bg-[#f73b20] text-white'
                  : 'bg-[#fdedea]/60 text-[#360802] hover:bg-[#fdedea]'
              }`}
            >
              Ocupadas ({occupiedCount})
            </button>
          </div>

          {areas.length > 2 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#74514b]">Área:</span>
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="text-xs bg-[#ffffff] border border-[#e7dcdb] rounded-xl px-3.5 py-2 font-medium text-[#360802] focus:outline-none focus:border-[#f73b20]"
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

        {/* Tables Grid */}
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
                className="text-xs font-medium text-[#f73b20] hover:underline cursor-pointer"
              >
                Restablecer filtros
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </section>

      {/* Modal de Inspección de Pedido Activo en Mesa */}
      {inspectedOrder && (
        <div className="fixed inset-0 z-50 bg-[#360802]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#ffffff] rounded-2xl max-w-lg w-full p-6 border border-[#e7dcdb]">
            <div className="flex items-start justify-between pb-4 border-b border-[#e7dcdb]">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl font-medium text-[#360802]">
                    Comanda #{inspectedOrder.id} · Mesa {inspectedOrder.tableNumber}
                  </h3>
                  <StatusBadge status={inspectedOrder.status} size="sm" />
                </div>
                <div className="text-xs text-[#74514b] mt-1 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(inspectedOrder.createdAt).toLocaleTimeString()}</span>
                  <span>·</span>
                  <span>{inspectedOrder.waiterName}</span>
                </div>
              </div>
              <button
                onClick={() => setInspectedOrderId(null)}
                className="p-1.5 rounded-full text-[#74514b] hover:text-[#360802] hover:bg-[#fdedea] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 divide-y divide-[#e7dcdb] max-h-60 overflow-y-auto pr-1">
              {inspectedOrder.items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-[#f73b20] mr-2">{item.quantity}x</span>
                    <span className="text-[#360802] font-medium">{item.productName}</span>
                  </div>
                  <span className="text-[#360802] font-medium tabular-nums">
                    ${item.subtotal.toLocaleString('es-CO')}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#e7dcdb] flex items-center justify-between">
              <span className="text-xs font-medium text-[#74514b] uppercase tracking-[0.04em]">
                Total Comanda
              </span>
              <span className="text-xl font-medium text-[#f73b20] tabular-nums">
                ${inspectedOrder.total.toLocaleString('es-CO')}
              </span>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              {inspectedOrder.status === 'Listo' &&
                (currentUser?.role === 'mesero' || currentUser?.role === 'administrador') && (
                  <button
                    onClick={() => {
                      updateOrderStatus(inspectedOrder.id, 'Entregado');
                      setInspectedOrderId(null);
                    }}
                    className="py-2.5 px-4 rounded-xl bg-[#34c771] hover:opacity-95 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Marcar Entregado (Liberar Mesa)
                  </button>
                )}
              <button
                onClick={() => setInspectedOrderId(null)}
                className="py-2.5 px-4 rounded-xl border border-[#e7dcdb] bg-[#ffffff] text-[#360802] hover:bg-[#fdedea] font-medium text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive 3D Plate Products & Direct Order Modal */}
      <Food3DModal
        isOpen={is3DModalOpen}
        onClose={() => setIs3DModalOpen(false)}
        initialDishIndex={selectedPlateIdx}
        onSelectDishCategory={() => {
          setIs3DModalOpen(false);
          setActiveView('nuevo-pedido');
        }}
      />
    </div>
  );
};
