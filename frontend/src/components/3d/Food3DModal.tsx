import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FoodPlate3D, PLATES_3D_CATALOG } from './FoodPlate3D.tsx';
import { useRestaurant } from '../../context/RestaurantContext.tsx';
import { calculateOrderTotal } from '../../domain/rules.ts';
import { OptimizedImage } from '../ui/OptimizedImage.tsx';
import {
  X,
  Sparkles,
  UtensilsCrossed,
  Plus,
  Minus,
  ShoppingBag,
  Send,
  ArrowRight,
  CheckCircle2,
  Layers,
} from 'lucide-react';

interface Food3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDishIndex?: number;
  onSelectDishCategory?: (category: string) => void;
}

export const Food3DModal: React.FC<Food3DModalProps> = ({
  isOpen,
  onClose,
  initialDishIndex = 0,
  onSelectDishCategory,
}) => {
  const {
    products,
    tables,
    getTableStatus,
    selectedTableForOrder,
    setSelectedTableForOrder,
    draftCart,
    addToDraftCart,
    updateDraftQuantity,
    clearDraftCart,
    createOrder,
    currentUser,
    login,
    setActiveView,
  } = useRestaurant();

  const [selectedIdx, setSelectedIdx] = useState(initialDishIndex);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setSelectedIdx(initialDishIndex);
  }, [initialDishIndex, isOpen]);

  if (!isOpen) return null;

  const currentPlate = PLATES_3D_CATALOG[selectedIdx] || PLATES_3D_CATALOG[0];

  // Exact products depicted on this 3D plate
  const plateProducts = products.filter((p) => p.category === currentPlate.category);

  // Available tables for direct order dispatch
  const availableTables = tables.filter((t) => getTableStatus(t.id) === 'Disponible');
  const activeTable =
    selectedTableForOrder && getTableStatus(selectedTableForOrder.id) === 'Disponible'
      ? selectedTableForOrder
      : availableTables[0] || null;

  const totalDraftItems = draftCart.reduce((acc, item) => acc + item.quantity, 0);
  const totalDraftAmount = calculateOrderTotal(
    draftCart.map((i) => ({ quantity: i.quantity, unitPrice: i.product.price }))
  );

  const handleDirectOrderSubmit = async () => {
    if (draftCart.length === 0) return;

    // If not logged in yet, auto-authenticate as waiter carlos_m so the flow is seamless
    if (!currentUser) {
      setIsSubmitting(true);
      await login('carlos_m', 'MeseroPass2026!');
      setIsSubmitting(false);
      onClose();
      setActiveView('nuevo-pedido');
      return;
    }

    if (!activeTable) {
      onClose();
      setActiveView('nuevo-pedido');
      return;
    }

    setIsSubmitting(true);
    const res = await createOrder(
      activeTable.id,
      draftCart.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
        notes: i.notes,
      }))
    );
    setIsSubmitting(false);

    if (res.success) {
      clearDraftCart();
      onClose();
    }
  };

  const handleGoToFullPOS = async () => {
    if (!currentUser) {
      await login('carlos_m', 'MeseroPass2026!');
    }
    if (onSelectDishCategory) {
      onSelectDishCategory(currentPlate.category);
    }
    onClose();
    setActiveView('nuevo-pedido');
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-[#360802]/60 backdrop-blur-md overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-3d-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          boxShadow:
            'rgba(247, 59, 32, 0.14) 0px 16px 48px 0px, rgba(54, 8, 2, 0.12) 0px 4px 16px 0px',
        }}
        className="relative w-full max-w-6xl my-auto bg-[#ffffff] rounded-[28px] border border-[#e7dcdb] overflow-hidden grid grid-cols-1 lg:grid-cols-12 max-h-[92vh] lg:max-h-[88vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-[#ffffff]/90 hover:bg-[#fdedea] text-[#360802] border border-[#e7dcdb] flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Cerrar inspección de plato 3D"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column (5 cols): Interactive 3D Plate Viewport */}
        <div
          style={{
            background:
              'linear-gradient(135deg, #f36c7b 0%, #f73b20 48%, #f88a63 82%, #f9b489 100%)',
          }}
          className="lg:col-span-5 relative min-h-[260px] sm:min-h-[340px] lg:min-h-[580px] flex flex-col justify-between overflow-hidden"
        >
          {/* Top Editorial Badge */}
          <div className="p-6 z-20 flex items-center justify-between pointer-events-none">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium tracking-[0.03em]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plato 3D #{currentPlate.id} de 5 · Interactivo</span>
            </div>
          </div>

          {/* 3D Scene */}
          <div className="absolute inset-0">
            <FoodPlate3D
              variant="interactive"
              activeDishIndex={selectedIdx}
              onDishChange={(idx) => setSelectedIdx(idx)}
              showControlsPill={false}
            />
          </div>

          {/* Bottom 5-Plate Switcher inside 3D Viewport */}
          <div className="relative z-20 p-5 bg-gradient-to-t from-[#360802]/65 via-[#360802]/25 to-transparent">
            <p className="text-[11px] uppercase tracking-[0.06em] text-white/80 mb-2 font-medium">
              Selecciona otro plato 3D de la cascada:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PLATES_3D_CATALOG.map((plate, idx) => (
                <button
                  key={plate.id}
                  onClick={() => setSelectedIdx(idx)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    selectedIdx === idx
                      ? 'bg-[#ffffff] text-[#f73b20] shadow-xs'
                      : 'bg-white/15 text-white hover:bg-white/30'
                  }`}
                >
                  {idx + 1}. {plate.shortName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Products on the Selected 3D Plate & Direct Order Integration */}
        <div className="lg:col-span-7 p-5 sm:p-8 flex flex-col justify-between bg-[#ffffff] overflow-y-auto max-h-[58vh] lg:max-h-[88vh]">
          <div>
            {/* Category Pill & Editorial Title */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#fdedea] text-[#f73b20] tracking-[0.03em]">
                <UtensilsCrossed className="w-3.5 h-3.5" />
                {currentPlate.category}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#f5ffbb] text-[#360802] tracking-[0.03em]">
                <Layers className="w-3.5 h-3.5" />
                {plateProducts.length} productos en este modelo 3D
              </span>
            </div>

            <h2
              id="modal-3d-title"
              className="text-2xl sm:text-4xl font-medium text-[#360802] tracking-[0.01em] leading-[1.02]"
            >
              {currentPlate.name}
            </h2>

            <p className="mt-2.5 text-sm text-[#74514b] leading-relaxed">
              {currentPlate.description}
            </p>

            {/* List of Exact Products Depicted on this 3D Plate */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs uppercase tracking-[0.05em] text-[#74514b] font-medium">
                  Productos representados en este plato 3D (Clic para agregar al pedido)
                </h3>
              </div>

              <div className="space-y-3">
                {plateProducts.map((product) => {
                  const inDraft = draftCart.find((item) => item.product.id === product.id);
                  const qty = inDraft ? inDraft.quantity : 0;

                  return (
                    <div
                      key={product.id}
                      style={{ boxShadow: 'rgba(0, 0, 0, 0.05) 0px -4px 16px 0px' }}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        qty > 0
                          ? 'bg-[#fdedea]/55 border-[#f73b20]'
                          : 'bg-[#ffffff] border-[#e7dcdb] hover:border-[#f84d35]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <OptimizedImage
                          src={product.image}
                          alt={product.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-xl object-cover border border-[#e7dcdb] shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-medium text-[#360802]">{product.name}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#bcffbb] text-[#360802]">
                              En escena 3D
                            </span>
                          </div>
                          <p className="text-xs text-[#74514b] mt-0.5 line-clamp-2">
                            {product.description}
                          </p>
                          <p className="text-sm font-medium text-[#f73b20] mt-1">
                            ${product.price.toLocaleString('es-CO')}
                          </p>
                        </div>
                      </div>

                      {/* Add / Stepper Controls */}
                      <div className="flex items-center justify-end shrink-0">
                        {qty === 0 ? (
                          <button
                            onClick={() => addToDraftCart(product, 1)}
                            disabled={!product.available}
                            className="px-4 py-2.5 rounded-xl bg-[#f73b20] hover:bg-[#f84d35] disabled: opacity-50 text-white text-xs font-medium tracking-[0.02em] flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Agregar al pedido</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 bg-[#ffffff] border border-[#f73b20] rounded-xl px-2 py-1">
                            <button
                              onClick={() => updateDraftQuantity(product.id, -1)}
                              className="w-7 h-7 rounded-lg bg-[#fdedea] text-[#f73b20] flex items-center justify-center hover:bg-[#f73b20] hover:text-white transition-colors cursor-pointer"
                              aria-label="Disminuir cantidad"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="min-w-[24px] text-center text-sm font-medium text-[#360802]">
                              {qty}
                            </span>
                            <button
                              onClick={() => updateDraftQuantity(product.id, 1)}
                              className="w-7 h-7 rounded-lg bg-[#f73b20] text-white flex items-center justify-center hover:bg-[#f84d35] transition-colors cursor-pointer"
                              aria-label="Aumentar cantidad"
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
            </div>
          </div>

          {/* Bottom Order Flow Integration Bar */}
          <div className="mt-6 pt-5 border-t border-[#e7dcdb]">
            {/* Table Selection + Cart Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 p-3.5 rounded-2xl bg-[#fdedea]/70 border border-[#e7dcdb]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#f73b20] text-white flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-[#74514b]">
                    Pedido activo ({totalDraftItems} {totalDraftItems === 1 ? 'producto' : 'productos'})
                  </p>
                  <p className="text-lg font-medium text-[#360802]">
                    Total: ${totalDraftAmount.toLocaleString('es-CO')}
                  </p>
                </div>
              </div>

              {/* Quick Table Selector */}
              <div className="flex items-center gap-2">
                <label htmlFor="modal-table-select" className="text-xs font-medium text-[#360802]">
                  Mesa destino:
                </label>
                <select
                  id="modal-table-select"
                  value={activeTable?.id || ''}
                  onChange={(e) => {
                    const tbl = tables.find((t) => t.id === Number(e.target.value)) || null;
                    setSelectedTableForOrder(tbl);
                  }}
                  className="px-3 py-2 rounded-xl bg-[#ffffff] border border-[#e7dcdb] text-xs font-medium text-[#360802] focus:outline-none focus:border-[#f73b20]"
                >
                  {availableTables.map((t) => (
                    <option key={t.id} value={t.id}>
                      Mesa #{t.tableNumber} ({t.area})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDirectOrderSubmit}
                disabled={draftCart.length === 0 || isSubmitting}
                className="flex-1 py-3.5 px-5 rounded-xl bg-[#f73b20] hover:bg-[#f84d35] disabled:opacity-45 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Procesando pedido...'
                    : activeTable
                    ? `Registrar Pedido en Mesa #${activeTable.tableNumber}`
                    : 'Continuar con el Pedido'}
                </span>
              </button>

              <button
                onClick={handleGoToFullPOS}
                className="py-3.5 px-5 rounded-xl bg-[#ffffff] hover:bg-[#fdedea] text-[#360802] border border-[#e7dcdb] font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#f73b20]" />
                <span>Abrir Comanda en POS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
