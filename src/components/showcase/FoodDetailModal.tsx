import React, { useState } from 'react';
import { PLATES_CATALOG, PlateMeta } from '../../data/platesCatalog.ts';
import { FoodPlateShowcase } from './FoodPlateShowcase.tsx';
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

interface FoodDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDishIndex?: number;
  onSelectDishCategory?: (category: string) => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
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
    setActiveView,
    showToast,
  } = useRestaurant();

  const [selectedIdx, setSelectedIdx] = useState(initialDishIndex);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setSelectedIdx(initialDishIndex);
  }, [initialDishIndex, isOpen]);

  if (!isOpen) return null;

  const currentPlate: PlateMeta = PLATES_CATALOG[selectedIdx] || PLATES_CATALOG[0];

  // Productos exactos de la categoría seleccionada
  const plateProducts = products.filter((p) => p.category === currentPlate.category);

  // Mesas disponibles
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

    if (!currentUser) {
      showToast('Inicia sesión para registrar el pedido (tu selección se conserva).', 'info');
      onClose();
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

  const handleGoToFullPOS = () => {
    if (!currentUser) {
      showToast('Inicia sesión para abrir la comanda en el POS.', 'info');
      onClose();
      return;
    }
    if (onSelectDishCategory) {
      onSelectDishCategory(currentPlate.category);
    }
    onClose();
    setActiveView('nuevo-pedido');
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-[#1C1917]/70 backdrop-blur-md overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-food-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          boxShadow:
            'rgba(194, 65, 12, 0.16) 0px 16px 48px 0px, rgba(41, 37, 36, 0.12) 0px 4px 16px 0px',
        }}
        className="relative w-full max-w-6xl my-auto bg-[#ffffff] rounded-[24px] sm:rounded-[28px] border border-[#E7E5E4] overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 max-h-[94vh] lg:max-h-[88vh]"
      >
        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-[#ffffff]/90 hover:bg-[#FFF7ED] text-[#292524] border border-[#E7E5E4] flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Columna Izquierda (5 columnas): Visor de Plato 2D */}
        <div
          style={{
            background:
              'linear-gradient(132deg, #991B1B 0%, #C2410C 38%, #EA580C 72%, #F97316 100%)',
          }}
          className="lg:col-span-5 relative min-h-[260px] sm:min-h-[340px] lg:min-h-[580px] flex flex-col justify-between overflow-hidden"
        >
          {/* Badge superior */}
          <div className="p-6 z-20 flex items-center justify-between pointer-events-none">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium tracking-[0.03em]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plato #{currentPlate.id} de 5 · Menú de Autor</span>
            </div>
          </div>

          {/* Escaparate visual 2D */}
          <div className="relative z-10 flex-1 flex items-center justify-center">
            <FoodPlateShowcase
              variant="interactive"
              activeDishIndex={selectedIdx}
              onDishChange={(idx) => setSelectedIdx(idx)}
            />
          </div>

          {/* Selector de platos 1 a 5 */}
          <div className="relative z-20 p-5 bg-gradient-to-t from-[#1C1917]/85 via-[#1C1917]/40 to-transparent">
            <p className="text-[11px] uppercase tracking-[0.06em] text-white/80 mb-2 font-medium">
              Selecciona otro plato de la selección:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PLATES_CATALOG.map((plate, idx) => (
                <button
                  key={plate.id}
                  onClick={() => setSelectedIdx(idx)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    selectedIdx === idx
                      ? 'bg-[#ffffff] text-[#C2410C] shadow-xs'
                      : 'bg-white/15 text-white hover:bg-white/30'
                  }`}
                >
                  {idx + 1}. {plate.shortName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Columna Derecha (7 columnas): Productos del Plato y Comanda Directa */}
        <div className="lg:col-span-7 p-5 sm:p-8 flex flex-col justify-between bg-[#ffffff] overflow-y-auto max-h-[58vh] lg:max-h-[88vh]">
          <div>
            {/* Etiquetas y Título */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FFF7ED] text-[#C2410C] tracking-[0.03em]">
                <UtensilsCrossed className="w-3.5 h-3.5" />
                {currentPlate.category}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FEF3C7] text-[#92400E] tracking-[0.03em]">
                <Layers className="w-3.5 h-3.5" />
                {plateProducts.length} productos disponibles
              </span>
            </div>

            <h2
              id="modal-food-title"
              className="text-2xl sm:text-4xl font-medium text-[#1C1917] tracking-[0.01em] leading-[1.02]"
            >
              {currentPlate.name}
            </h2>

            <p className="mt-2.5 text-sm text-[#78716C] leading-relaxed">
              {currentPlate.description}
            </p>

            {/* Listado de Productos */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs uppercase tracking-[0.05em] text-[#78716C] font-medium">
                  Productos de la categoría (Haz clic para agregar a la comanda)
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
                          ? 'bg-[#FFF7ED]/70 border-[#EA580C]'
                          : 'bg-[#ffffff] border-[#E7E5E4] hover:border-[#F97316]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#E7E5E4]">
                          <OptimizedImage
                            src={product.image}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm sm:text-base font-medium text-[#1C1917]">
                              {product.name}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Disponible
                            </span>
                          </div>
                          <p className="text-xs text-[#78716C] line-clamp-1 mt-0.5">
                            {product.description}
                          </p>
                          <span className="text-sm font-semibold text-[#C2410C] mt-1 block">
                            ${product.price.toLocaleString('es-CO')}
                          </span>
                        </div>
                      </div>

                      {/* Control de cantidad */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {qty > 0 ? (
                          <div className="flex items-center gap-2 bg-[#ffffff] p-1 rounded-xl border border-[#E7E5E4]">
                            <button
                              onClick={() => updateDraftQuantity(product.id, -1)}
                              className="w-8 h-8 rounded-lg bg-[#FFF7ED] hover:bg-[#C2410C] hover:text-white text-[#C2410C] flex items-center justify-center transition-colors cursor-pointer"
                              aria-label="Disminuir"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-7 text-center font-bold text-sm text-[#1C1917]">
                              {qty}
                            </span>
                            <button
                              onClick={() => updateDraftQuantity(product.id, 1)}
                              className="w-8 h-8 rounded-lg bg-[#FFF7ED] hover:bg-[#C2410C] hover:text-white text-[#C2410C] flex items-center justify-center transition-colors cursor-pointer"
                              aria-label="Aumentar"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToDraftCart(product, 1)}
                            className="px-4 py-2 rounded-xl bg-[#FFF7ED] hover:bg-[#C2410C] text-[#C2410C] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Agregar al pedido</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Barra inferior: Comanda y Envío a Mesa */}
          <div className="mt-6 pt-5 border-t border-[#E7E5E4] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#FFF7ED]/60 rounded-2xl border border-[#EA580C]/20">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#C2410C] text-white">
                  <ShoppingBag className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs text-[#78716C]">
                    Pedido activo ({totalDraftItems} productos)
                  </div>
                  <div className="text-base font-bold text-[#1C1917]">
                    Total: ${totalDraftAmount.toLocaleString('es-CO')}
                  </div>
                </div>
              </div>

              {/* Selector de Mesa */}
              <div className="flex items-center gap-2">
                <label htmlFor="mesa-select-modal" className="text-xs text-[#78716C] font-medium whitespace-nowrap">
                  Mesa destino:
                </label>
                <select
                  id="mesa-select-modal"
                  value={activeTable?.id || ''}
                  onChange={(e) => {
                    const found = tables.find((t) => t.id === Number(e.target.value));
                    if (found) setSelectedTableForOrder(found);
                  }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#E7E5E4] bg-white text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#C2410C]"
                >
                  {availableTables.length > 0 ? (
                    availableTables.map((t) => (
                      <option key={t.id} value={t.id}>
                        Mesa #{t.tableNumber} ({t.area})
                      </option>
                    ))
                  ) : (
                    <option value="">Sin mesas disponibles</option>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleDirectOrderSubmit}
                disabled={draftCart.length === 0 || isSubmitting}
                className="py-3 px-4 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Registrando...'
                    : activeTable
                    ? `Registrar Pedido en Mesa #${activeTable.tableNumber}`
                    : 'Registrar Pedido'}
                </span>
              </button>

              <button
                onClick={handleGoToFullPOS}
                className="py-3 px-4 rounded-xl bg-white hover:bg-[#FFF7ED] text-[#292524] border border-[#E7E5E4] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Abrir Comanda en POS</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Aliases para retrocompatibilidad total
export const Food3DModal = FoodDetailModal;
