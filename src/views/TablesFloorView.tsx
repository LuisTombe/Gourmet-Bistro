import React, { useState, useRef } from 'react';
import { useRestaurant } from '../context/RestaurantContext.tsx';
import { Table } from '../types/index.ts';
import { TableCard } from '../components/TableCard.tsx';
import { StatusBadge } from '../components/ui/StatusBadge.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
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

  const inspectedOrder = orders.find((o) => o.id === inspectedOrderId);

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

  const handlePlate3DClick = (idx: number, _plate: Plate3DMeta) => {
    setSelectedPlateIdx(idx);
    setIs3DModalOpen(true);
  };

  const occupiedCount = tables.filter((t) => getTableStatus(t.id) === 'Ocupada').length;
  const availableCount = tables.length - occupiedCount;
  const readyOrdersCount = orders.filter((o) => o.status === 'Listo').length;
  const draftItemsCount = draftCart.reduce((acc, item) => acc + item.quantity, 0);

  const activePlate = PLATES_3D_CATALOG[selectedPlateIdx] || PLATES_3D_CATALOG[0];
  const activePlateProducts = products.filter((p) => p.category === activePlate.category);

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-14">
      {/* =====================================================================
          1. PORTADA EDITORIAL JETON CON 5 PLATOS DE COMIDA 3D GIRATORIOS
         ===================================================================== */}
      <section
        style={{
          background:
            'linear-gradient(132deg, #f36878 0%, #f66a55 34%, #f87d56 68%, #f8a27d 100%)',
          boxShadow:
            'rgba(247, 59, 32, 0.14) 0px 16px 44px 0px, rgba(54, 8, 2, 0.06) 0px 2px 10px 0px',
        }}
        className="relative w-full min-h-[600px] lg:min-h-[680px] rounded-[28px] overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12 select-none"
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

        {/* Top Row inside Hero (Editorial Brand Voice + Interactive Prompt Pill) */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 pointer-events-none">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl font-medium text-white tracking-tight">
              Jeton<span className="font-normal opacity-85">Bistro</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium tracking-[0.03em]">
              <MousePointerClick className="w-3.5 h-3.5" />
              Haz clic sobre cualquier plato 3D para ver sus productos y pedir
            </span>
          </div>

          <div className="flex items-center gap-2.5 pointer-events-auto">
            <button
              onClick={() => setIs3DModalOpen(true)}
              className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/35 text-white text-xs font-medium tracking-[0.03em] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plato Activo: {activePlate.shortName}</span>
            </button>
            {(currentUser?.role === 'mesero' || currentUser?.role === 'administrador') && (
              <button
                onClick={() => setActiveView('nuevo-pedido')}
                className="px-5 py-2 rounded-full bg-[#ffffff] text-[#360802] hover:bg-[#fdedea] text-xs font-medium tracking-[0.02em] transition-all shadow-xs cursor-pointer"
              >
                Abrir POS ({draftItemsCount})
              </button>
            )}
          </div>
        </div>

        {/* Middle Bottom Editorial Typography & Right Action Block (Exact Jeton Layout) */}
        <div className="relative z-20 mt-auto pt-44 sm:pt-52 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pointer-events-none">
          {/* Oversized Tight-Set Display Headline (Line-height 0.92, 72px–104px) */}
          <div className="lg:col-span-7">
            <h1
              style={{
                fontSize: 'clamp(3.1rem, 6.8vw, 6.4rem)',
                lineHeight: 0.92,
                letterSpacing: '-0.02em',
              }}
              className="font-medium text-white drop-shadow-[0_4px_24px_rgba(54,8,2,0.12)]"
            >
              One app
              <br />
              for all orders
            </h1>
          </div>

          {/* Right Editorial Subcopy & Dual Glass Outline Pills */}
          <div className="lg:col-span-5 lg:pl-8 space-y-5 pointer-events-auto">
            <p className="text-white text-lg sm:text-xl font-normal leading-[1.28] max-w-sm drop-shadow-[0_2px_12px_rgba(54,8,2,0.12)]">
              Un solo sistema para tus pedidos, mesas y alta cocina en 3D.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIs3DModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/45 text-white text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <div className="text-left">
                  <div className="text-[9px] uppercase tracking-[0.06em] opacity-80">
                    Inspeccionar plato
                  </div>
                  <div className="text-xs font-medium">Ver Productos 3D</div>
                </div>
              </button>

              <button
                onClick={() => {
                  const firstAvailable = tables.find((t) => getTableStatus(t.id) === 'Disponible');
                  if (firstAvailable) handleOpenOrder(firstAvailable);
                  else setActiveView('nuevo-pedido');
                }}
                className="px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/45 text-white text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <div className="text-left">
                  <div className="text-[9px] uppercase tracking-[0.06em] opacity-80">
                    Comanda rápida
                  </div>
                  <div className="text-xs font-medium">Tomar Pedido</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar inside Hero: ↓ Scroll (Left) | Jeton Signal Orange Dock (Center) | Pedido Pill (Right) */}
        <div className="relative z-20 mt-8 pt-2 flex flex-wrap items-center justify-between gap-4">
          {/* Left: ↓ Scroll Indicator Pill */}
          <button
            onClick={() =>
              plateProductsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
            }
            className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Scroll</span>
          </button>

          {/* Center: Signature Jeton Signal Orange Floating Dock (#f73b20) for the 5 3D Plates */}
          <div className="flex items-center gap-1 p-1.5 rounded-full bg-[#f73b20] text-white shadow-[0_8px_24px_rgba(247,59,32,0.38)] border border-white/20 max-w-full overflow-x-auto">
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

          {/* Right: Support / Active Order Counter Pill */}
          <button
            onClick={() => setIs3DModalOpen(true)}
            className="px-4 py-2.5 rounded-full bg-[#360802]/45 hover:bg-[#360802]/65 backdrop-blur-md border border-white/20 text-white text-xs font-medium flex items-center gap-2 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Pedido ({draftItemsCount})</span>
          </button>
        </div>
      </section>

      {/* =====================================================================
          2. COHERENCIA VISUAL: PRODUCTOS DEL PLATO 3D SELECCIONADO
         ===================================================================== */}
      <section ref={plateProductsSectionRef} className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e7dcdb] pb-5">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#fdedea] text-[#f73b20] tracking-[0.03em] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Sincronización Escena 3D ↔ Catálogo de Pedidos
            </span>
            <h2 className="text-3xl sm:text-5xl font-medium text-[#360802] tracking-[0.01em] leading-[1.02]">
              {activePlate.name}
            </h2>
            <p className="text-sm text-[#74514b] mt-1.5 max-w-2xl">
              {activePlate.description} Selecciona cualquier plato 3D para explorar e incluir sus productos directamente en el pedido.
            </p>
          </div>

          {/* 5-Plate Selector Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {PLATES_3D_CATALOG.map((plate, idx) => (
              <button
                key={plate.id}
                onClick={() => setSelectedPlateIdx(idx)}
                className={`px-4 py-2 rounded-full text-xs font-medium tracking-[0.03em] transition-all cursor-pointer ${
                  selectedPlateIdx === idx
                    ? 'bg-[#f73b20] text-white'
                    : 'bg-[#fdedea] text-[#360802] hover:bg-[#f84d35] hover:text-white'
                }`}
              >
                Plato {idx + 1}: {plate.shortName}
              </button>
            ))}
          </div>
        </div>

        {/* Cards of Exact Products Depicted on the Active 3D Plate */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activePlateProducts.map((product) => {
            const inCart = draftCart.find((i) => i.product.id === product.id);
            const qty = inCart ? inCart.quantity : 0;

            return (
              <div
                key={product.id}
                style={{ boxShadow: 'rgba(0, 0, 0, 0.05) 0px -4px 16px 0px' }}
                className={`rounded-2xl bg-[#ffffff] border p-5 flex flex-col justify-between transition-all ${
                  qty > 0
                    ? 'border-[#f73b20] ring-2 ring-[#f73b20]/15'
                    : 'border-[#e7dcdb] hover:border-[#f84d35]'
                }`}
              >
                <div>
                  <div className="relative h-44 rounded-xl overflow-hidden mb-4 bg-[#fdedea]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-medium bg-[#ffffff]/95 text-[#360802] backdrop-blur-md">
                      Presente en el Plato 3D #{activePlate.id}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-medium text-[#360802] leading-snug">
                      {product.name}
                    </h3>
                    <span className="text-lg font-medium text-[#f73b20] shrink-0 tabular-nums">
                      ${product.price.toLocaleString('es-CO')}
                    </span>
                  </div>

                  <p className="text-xs text-[#74514b] mt-1.5 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#e7dcdb] flex items-center justify-between">
                  <button
                    onClick={() => setIs3DModalOpen(true)}
                    className="text-xs font-medium text-[#74514b] hover:text-[#f73b20] underline cursor-pointer"
                  >
                    Ver en modelo 3D
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
                    <div className="flex items-center gap-2 bg-[#fdedea] border border-[#f73b20]/40 rounded-xl px-2 py-1">
                      <button
                        onClick={() => updateDraftQuantity(product.id, -1)}
                        className="w-7 h-7 rounded-lg bg-[#ffffff] text-[#f73b20] flex items-center justify-center hover:bg-[#f73b20] hover:text-white transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="min-w-[20px] text-center text-xs font-medium text-[#360802]">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateDraftQuantity(product.id, 1)}
                        className="w-7 h-7 rounded-lg bg-[#f73b20] text-white flex items-center justify-center hover:bg-[#f84d35] transition-colors cursor-pointer"
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
          3. PLANO DEL SALÓN & GESTIÓN DE MESAS (ESTILO EDITORIAL JETON)
         ===================================================================== */}
      <section ref={salonSectionRef} className="space-y-6 pt-4">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e7dcdb] pb-5">
          <div>
            <span className="inline-block text-xs uppercase tracking-[0.05em] text-[#f73b20] font-medium mb-1">
              Operación en Tiempo Real
            </span>
            <h2 className="text-3xl sm:text-5xl font-medium text-[#360802] tracking-[0.01em] leading-[1.0]">
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
              className="min-h-[44px] py-2.5 px-5 rounded-xl text-white bg-[#f73b20] hover:bg-[#f84d35] font-medium text-xs tracking-[0.02em] flex items-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nuevo Pedido ({draftItemsCount} en carrito)</span>
            </button>
          )}
        </div>

        {/* Jeton Pastel Wash Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div
            style={{ boxShadow: 'rgba(0, 0, 0, 0.05) 0px -4px 16px 0px' }}
            className="bg-[#ffffff] p-6 rounded-2xl border border-[#e7dcdb] flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-medium text-[#74514b] uppercase tracking-[0.04em]">
                Mesas Libres
              </span>
              <div className="mt-2 text-4xl font-medium text-[#360802] leading-none">
                {availableCount}
              </div>
              <div className="text-xs text-[#74514b] mt-1.5">Listas para asignar</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#bcffbb] text-[#360802] flex items-center justify-center font-medium text-lg">
              ✓
            </div>
          </div>

          <div
            style={{ boxShadow: 'rgba(0, 0, 0, 0.05) 0px -4px 16px 0px' }}
            className="bg-[#ffffff] p-6 rounded-2xl border border-[#e7dcdb] flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-medium text-[#74514b] uppercase tracking-[0.04em]">
                Mesas Ocupadas
              </span>
              <div className="mt-2 text-4xl font-medium text-[#f73b20] leading-none">
                {occupiedCount}
              </div>
              <div className="text-xs text-[#74514b] mt-1.5">Con servicio activo</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#fdedea] text-[#f73b20] flex items-center justify-center font-medium text-lg">
              ●
            </div>
          </div>

          <div
            style={{ boxShadow: 'rgba(0, 0, 0, 0.05) 0px -4px 16px 0px' }}
            className="bg-[#ffffff] p-6 rounded-2xl border border-[#e7dcdb] flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-medium text-[#74514b] uppercase tracking-[0.04em]">
                Pedidos Listos
              </span>
              <div className="mt-2 text-4xl font-medium text-[#360802] leading-none">
                {readyOrdersCount}
              </div>
              <div className="text-xs text-[#74514b] mt-1.5">Para entregar en mesa</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#f5ffbb] text-[#360802] flex items-center justify-center font-medium text-lg">
              ★
            </div>
          </div>

          <div
            style={{ boxShadow: 'rgba(0, 0, 0, 0.05) 0px -4px 16px 0px' }}
            className="bg-[#ffffff] p-6 rounded-2xl border border-[#e7dcdb] flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-medium text-[#74514b] uppercase tracking-[0.04em]">
                Ocupación Salón
              </span>
              <div className="mt-2 text-4xl font-medium text-[#360802] leading-none">
                {tables.length > 0 ? Math.round((occupiedCount / tables.length) * 100) : 0}%
              </div>
              <div className="text-xs text-[#74514b] mt-1.5">Capacidad actual</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#fdedea] text-[#360802] flex items-center justify-center font-medium text-lg">
              %
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#ffffff] p-3.5 rounded-2xl border border-[#e7dcdb]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`min-h-[38px] px-4 py-1.5 rounded-full text-xs font-medium tracking-[0.03em] transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#f73b20] text-white'
                  : 'text-[#74514b] hover:text-[#360802] hover:bg-[#fdedea]'
              }`}
            >
              Todas ({tables.length})
            </button>
            <button
              onClick={() => setStatusFilter('Disponible')}
              className={`min-h-[38px] px-4 py-1.5 rounded-full text-xs font-medium tracking-[0.03em] transition-all cursor-pointer ${
                statusFilter === 'Disponible'
                  ? 'bg-[#34c771] text-white'
                  : 'text-[#74514b] hover:text-[#360802] hover:bg-[#fdedea]'
              }`}
            >
              Libres ({availableCount})
            </button>
            <button
              onClick={() => setStatusFilter('Ocupada')}
              className={`min-h-[38px] px-4 py-1.5 rounded-full text-xs font-medium tracking-[0.03em] transition-all cursor-pointer ${
                statusFilter === 'Ocupada'
                  ? 'bg-[#f73b20] text-white'
                  : 'text-[#74514b] hover:text-[#360802] hover:bg-[#fdedea]'
              }`}
            >
              Ocupadas ({occupiedCount})
            </button>
          </div>

          {areas.length > 2 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#74514b] font-medium">Área:</span>
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="text-xs bg-[#fdedea]/60 border border-[#e7dcdb] rounded-xl px-3.5 py-2 font-medium text-[#360802] focus:outline-none focus:border-[#f73b20]"
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
