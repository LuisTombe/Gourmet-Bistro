import React, { useState, useEffect, useMemo } from 'react';
import { useRestaurant } from '../context/RestaurantContext.tsx';
import { ProductCategory } from '../types/index.ts';
import { calculateOrderTotal } from '../domain/rules.ts';
import { Food3DModal } from '../components/3d/Food3DModal.tsx';
import { PLATES_3D_CATALOG } from '../components/3d/FoodPlate3D.tsx';
import { useDebounce } from '../hooks/useDebounce.ts';
import { OptimizedImage } from '../components/ui/OptimizedImage.tsx';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  UtensilsCrossed,
  Send,
  AlertCircle,
  FileText,
  ArrowLeft,
  Flame,
  Sparkles,
} from 'lucide-react';

export const NewOrderView: React.FC = () => {
  const {
    products,
    tables,
    getTableStatus,
    selectedTableForOrder,
    setSelectedTableForOrder,
    draftCart,
    addToDraftCart,
    updateDraftQuantity,
    removeFromDraftCart,
    updateDraftItemNote,
    clearDraftCart,
    createOrder,
    setActiveView,
    currentUser,
  } = useRestaurant();

  const [selectedTableId, setSelectedTableId] = useState<number | null>(() => {
    if (selectedTableForOrder && getTableStatus(selectedTableForOrder.id) === 'Disponible') {
      return selectedTableForOrder.id;
    }
    const firstAvailable = tables.find((t) => getTableStatus(t.id) === 'Disponible');
    return firstAvailable ? firstAvailable.id : null;
  });

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [activeItemNoteModal, setActiveItemNoteModal] = useState<number | null>(null);
  const [tempItemNote, setTempItemNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);
  const [active3DDishIdx, setActive3DDishIdx] = useState(0);

  useEffect(() => {
    if (selectedTableForOrder) {
      setSelectedTableId(selectedTableForOrder.id);
    }
  }, [selectedTableForOrder]);

  const categories: (ProductCategory | 'Todos')[] = [
    'Todos',
    'Entradas',
    'Carnes & Grill',
    'Pastas & Risottos',
    'Postres',
    'Bebidas & Bar',
  ];

  const debouncedSearch = useDebounce(searchQuery, 250);

  const filteredProducts = useMemo(
    () =>
      products.filter((prod) => {
        if (selectedCategory !== 'Todos' && prod.category !== selectedCategory) return false;
        if (debouncedSearch.trim()) {
          const q = debouncedSearch.toLowerCase();
          return (
            prod.name.toLowerCase().includes(q) ||
            prod.description.toLowerCase().includes(q) ||
            prod.category.toLowerCase().includes(q)
          );
        }
        return true;
      }),
    [products, selectedCategory, debouncedSearch]
  );

  const availableTables = tables.filter((t) => getTableStatus(t.id) === 'Disponible');
  const currentTable = tables.find((t) => t.id === selectedTableId);
  const isSelectedTableOccupied = selectedTableId ? getTableStatus(selectedTableId) === 'Ocupada' : false;

  const openNoteModal = (productId: number) => {
    const item = draftCart.find((i) => i.product.id === productId);
    if (item) {
      setTempItemNote(item.notes || '');
      setActiveItemNoteModal(productId);
    }
  };

  const saveItemNote = () => {
    if (activeItemNoteModal !== null) {
      updateDraftItemNote(activeItemNoteModal, tempItemNote);
      setActiveItemNoteModal(null);
    }
  };

  const cartCalculationItems = draftCart.map((item) => ({
    quantity: item.quantity,
    unitPrice: item.product.price,
  }));
  const total = calculateOrderTotal(cartCalculationItems);

  const handleSendToKitchen = async () => {
    setErrorMsg(null);
    if (!selectedTableId) {
      setErrorMsg('Debe seleccionar una mesa válida para el pedido.');
      return;
    }
    if (isSelectedTableOccupied) {
      setErrorMsg(`La Mesa ${currentTable?.tableNumber} ya tiene un pedido activo.`);
      return;
    }
    if (draftCart.length === 0) {
      setErrorMsg('Debe agregar al menos un plato o bebida al pedido.');
      return;
    }

    setIsSubmitting(true);
    const orderItemsPayload = draftCart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      notes: item.notes,
    }));

    const result = await createOrder(selectedTableId, orderItemsPayload, generalNotes.trim() || undefined);
    setIsSubmitting(false);

    if (result.success) {
      clearDraftCart();
      setGeneralNotes('');
      setSelectedTableForOrder(null);
      setActiveView('mesas');
    } else {
      setErrorMsg(result.error || 'No se pudo registrar el pedido.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Editorial Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-[#e7dcdb]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveView('mesas')}
            className="w-11 h-11 rounded-full bg-[#fdedea] text-[#360802] hover:bg-[#f73b20] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Volver a la portada y salón"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="inline-block text-xs uppercase tracking-[0.05em] text-[#f73b20] font-medium mb-1">
              Comanda Interactiva · Sincronizada con Platos 3D
            </span>
            <h1 className="text-3xl sm:text-5xl font-medium text-[#360802] tracking-[0.01em] leading-[0.98]">
              Nuevo Pedido
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium px-4 py-2 rounded-full bg-[#bcffbb] text-[#360802] tracking-[0.03em]">
            {availableTables.length} mesas disponibles
          </span>
          <button
            onClick={() => {
              setActive3DDishIdx(0);
              setIs3DModalOpen(true);
            }}
            className="px-4 py-2 rounded-full text-xs font-medium bg-[#f73b20] text-white hover:bg-[#f84d35] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explorar Platos 3D</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-5 p-4 rounded-2xl bg-[#fdedea] border border-[#fb2d54]/40 text-[#360802] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#fb2d54] shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-[#360802] hover:text-[#f73b20] font-medium">
            ✕
          </button>
        </div>
      )}

      {/* Main Editorial Grid: 8 cols Catalog, 4 cols Live Ticket */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Product Catalog */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Search Bar & Category Pills */}
          <div
            style={{ boxShadow: 'rgba(0, 0, 0, 0.05) 0px -4px 16px 0px' }}
            className="bg-[#ffffff] p-5 rounded-2xl border border-[#e7dcdb] space-y-4"
          >
            <div className="relative">
              <Search className="w-4 h-4 text-[#74514b] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar plato, corte o bebida (ej. Ojo de Bife, Risotto, Burrata, Old Fashioned)..."
                className="w-full pl-11 pr-4 py-3 bg-[#fdedea]/60 border border-[#e7dcdb] rounded-2xl text-sm text-[#360802] placeholder-[#74514b]/70 focus:outline-none focus:border-[#f73b20] focus:bg-[#ffffff] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#74514b] hover:text-[#360802]"
                >
                  Limpiar
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[38px] px-4 py-1.5 rounded-full text-xs font-medium tracking-[0.03em] transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#f73b20] text-white'
                      : 'bg-[#ffffff] border border-[#e7dcdb] text-[#74514b] hover:bg-[#fdedea] hover:text-[#360802]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredProducts.map((prod) => {
              const inCart = draftCart.find((i) => i.product.id === prod.id);
              const matchingPlateIdx = PLATES_3D_CATALOG.findIndex((pl) => pl.category === prod.category);

              return (
                <div
                  key={prod.id}
                  style={{ boxShadow: 'rgba(0, 0, 0, 0.05) 0px -4px 16px 0px' }}
                  className={`bg-[#ffffff] rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                    !prod.available
                      ? 'opacity-55 border-[#e7dcdb]'
                      : inCart
                      ? 'border-[#f73b20] ring-2 ring-[#f73b20]/15'
                      : 'border-[#e7dcdb] hover:border-[#f84d35]'
                  }`}
                >
                  {/* Image & Station / 3D Badges */}
                  <div className="relative h-40 w-full bg-[#fdedea] overflow-hidden">
                    <OptimizedImage
                      src={prod.image}
                      alt={prod.name}
                      width={480}
                      height={160}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-[0.04em] bg-[#ffffff]/90 text-[#360802] backdrop-blur-md">
                        {prod.station}
                      </span>
                    </div>

                    {matchingPlateIdx >= 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setActive3DDishIdx(matchingPlateIdx);
                          setIs3DModalOpen(true);
                        }}
                        className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#f73b20] text-white flex items-center gap-1 hover:bg-[#f84d35] transition-colors cursor-pointer"
                        title="Ver este producto en su modelo de plato 3D"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Plato 3D</span>
                      </button>
                    )}

                    {!prod.available && (
                      <div className="absolute inset-0 bg-[#360802]/60 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-[#fb2d54] text-white text-xs font-medium px-3.5 py-1 rounded-full">
                          No Disponible
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] text-[#74514b] font-medium">{prod.category}</span>
                      <h3 className="font-medium text-base text-[#360802] leading-snug mt-0.5">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-[#74514b] line-clamp-2 mt-1 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#e7dcdb] flex items-center justify-between">
                      <span className="text-lg font-medium text-[#f73b20] tabular-nums">
                        ${prod.price.toLocaleString('es-CO')}
                      </span>

                      {prod.available && (
                        <div>
                          {inCart ? (
                            <div className="flex items-center gap-1.5 bg-[#fdedea] border border-[#f73b20]/40 rounded-xl p-1">
                              <button
                                onClick={() => updateDraftQuantity(prod.id, -1)}
                                className="w-7 h-7 rounded-lg bg-[#ffffff] text-[#f73b20] flex items-center justify-center hover:bg-[#f73b20] hover:text-white transition-all cursor-pointer"
                                aria-label="Restar 1"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-6 text-center font-medium text-xs text-[#360802] tabular-nums">
                                {inCart.quantity}
                              </span>
                              <button
                                onClick={() => updateDraftQuantity(prod.id, 1)}
                                className="w-7 h-7 rounded-lg bg-[#f73b20] text-white flex items-center justify-center hover:bg-[#f84d35] transition-all cursor-pointer"
                                aria-label="Sumar 1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setErrorMsg(null);
                                addToDraftCart(prod, 1);
                              }}
                              className="px-4 py-2 bg-[#f73b20] hover:bg-[#f84d35] text-white font-medium text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Agregar
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-14 bg-[#ffffff] rounded-2xl border border-[#e7dcdb]">
              <UtensilsCrossed className="w-8 h-8 text-[#74514b] mx-auto mb-2" />
              <p className="text-base font-medium text-[#360802]">No se encontraron productos</p>
              <p className="text-xs text-[#74514b] mt-1">Intente con otro término o categoría.</p>
            </div>
          )}
        </div>

        {/* Right: Pinned Live Ticket (Pure Jeton Editorial Light Card) */}
        <div
          style={{
            boxShadow:
              'rgba(247, 59, 32, 0.1) 0px 8px 24px 0px, rgba(247, 59, 32, 0.05) 0px 2px 8px 0px',
          }}
          className="lg:col-span-5 xl:col-span-4 bg-[#ffffff] rounded-2xl border border-[#e7dcdb] overflow-hidden sticky top-24"
        >
          {/* Editorial Ticket Header */}
          <div className="bg-[#fdedea] text-[#360802] p-5 border-b border-[#e7dcdb]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#f73b20] text-white flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-medium text-lg text-[#360802] leading-tight">
                    Comanda de Mesa
                  </h2>
                  <p className="text-[11px] text-[#74514b]">
                    Atiende: {currentUser?.name || 'Mesero'}
                  </p>
                </div>
              </div>
              <span className="text-xs bg-[#ffffff] text-[#f73b20] border border-[#e7dcdb] px-3 py-1 rounded-full font-medium">
                {draftCart.reduce((acc, i) => acc + i.quantity, 0)} ítems
              </span>
            </div>

            {/* Table Selection Dropdown */}
            <div>
              <label className="block text-[11px] font-medium text-[#74514b] uppercase tracking-[0.04em] mb-1.5">
                Asignar a Mesa
              </label>
              <select
                value={selectedTableId || ''}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSelectedTableId(val || null);
                  const found = tables.find((t) => t.id === val) || null;
                  setSelectedTableForOrder(found);
                  setErrorMsg(null);
                }}
                className={`w-full py-2.5 px-3.5 rounded-2xl text-sm font-medium border transition-colors ${
                  isSelectedTableOccupied
                    ? 'bg-[#fdedea] border-[#fb2d54] text-[#fb2d54]'
                    : 'bg-[#ffffff] border-[#e7dcdb] text-[#360802] focus:outline-none focus:border-[#f73b20]'
                }`}
              >
                <option value="">-- Seleccione una mesa --</option>
                {tables.map((t) => {
                  const status = getTableStatus(t.id);
                  return (
                    <option key={t.id} value={t.id}>
                      Mesa {t.tableNumber < 10 ? `0${t.tableNumber}` : t.tableNumber} ({t.area} - {t.capacity}p) — {status}
                    </option>
                  );
                })}
              </select>

              {isSelectedTableOccupied && (
                <p className="text-[11px] text-[#fb2d54] font-medium mt-1.5">
                  Esta mesa ya tiene un pedido activo en curso. Seleccione una mesa disponible.
                </p>
              )}
            </div>
          </div>

          {/* Ticket Line Items */}
          <div className="p-5 max-h-[40vh] overflow-y-auto divide-y divide-[#e7dcdb]">
            {draftCart.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-11 h-11 rounded-full bg-[#fdedea] text-[#f73b20] flex items-center justify-center mx-auto mb-2.5">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-[#360802]">Comanda vacía</p>
                <p className="text-xs text-[#74514b] mt-1">
                  Selecciona productos del listado o pulsa un plato 3D para agregarlos.
                </p>
              </div>
            ) : (
              draftCart.map((item) => (
                <div key={item.product.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[#360802] flex items-center gap-1.5">
                        <span className="text-[#f73b20]">{item.quantity}x</span>
                        <span className="truncate">{item.product.name}</span>
                      </div>
                      <div className="text-[11px] text-[#74514b] tabular-nums">
                        ${item.product.price.toLocaleString('es-CO')} c/u
                      </div>

                      {item.notes ? (
                        <button
                          onClick={() => openNoteModal(item.product.id)}
                          className="mt-1.5 text-[11px] font-medium text-[#360802] bg-[#f5ffbb] px-2.5 py-0.5 rounded-full flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3 text-[#f73b20]" />
                          <span>{item.notes}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openNoteModal(item.product.id)}
                          className="mt-1 text-[11px] text-[#74514b] hover:text-[#f73b20] flex items-center gap-1 font-medium cursor-pointer"
                        >
                          + Nota de cocina
                        </button>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-medium text-[#360802] tabular-nums">
                        ${(item.quantity * item.product.price).toLocaleString('es-CO')}
                      </div>

                      <div className="flex items-center gap-1 mt-1.5 justify-end">
                        <button
                          onClick={() => updateDraftQuantity(item.product.id, -1)}
                          className="w-6 h-6 rounded-lg bg-[#fdedea] hover:bg-[#f73b20] hover:text-white text-[#360802] flex items-center justify-center text-xs transition-colors cursor-pointer"
                          aria-label="Disminuir"
                        >
                          -
                        </button>
                        <span className="text-xs font-medium px-1 text-[#360802] tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateDraftQuantity(item.product.id, 1)}
                          className="w-6 h-6 rounded-lg bg-[#fdedea] hover:bg-[#f73b20] hover:text-white text-[#360802] flex items-center justify-center text-xs transition-colors cursor-pointer"
                          aria-label="Aumentar"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromDraftCart(item.product.id)}
                          className="w-6 h-6 rounded-lg text-[#fb2d54] hover:bg-[#fdedea] flex items-center justify-center ml-1 cursor-pointer"
                          aria-label="Eliminar item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* General Notes for Kitchen */}
          <div className="p-4 bg-[#fdedea]/35 border-t border-[#e7dcdb]">
            <label className="block text-[11px] font-medium text-[#74514b] uppercase tracking-[0.04em] mb-1.5">
              Observaciones para cocina
            </label>
            <input
              type="text"
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Ej. Término medio, servir entradas juntas..."
              className="w-full px-3.5 py-2.5 text-xs bg-[#ffffff] border border-[#e7dcdb] rounded-2xl text-[#360802] focus:outline-none focus:border-[#f73b20]"
            />
          </div>

          {/* Totals & Submit Footer */}
          <div className="p-5 bg-[#ffffff] border-t border-[#e7dcdb] space-y-3.5">
            <div className="flex items-center justify-between text-xs text-[#74514b]">
              <span>Subtotal ({draftCart.reduce((s, i) => s + i.quantity, 0)} productos):</span>
              <span className="font-medium text-[#360802] tabular-nums">
                ${total.toLocaleString('es-CO')}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#e7dcdb]">
              <span className="text-base font-medium text-[#360802]">Total Comanda</span>
              <span className="font-medium text-[#f73b20] text-2xl tabular-nums">
                ${total.toLocaleString('es-CO')}
              </span>
            </div>

            <button
              onClick={handleSendToKitchen}
              disabled={isSubmitting || draftCart.length === 0 || !selectedTableId || isSelectedTableOccupied}
              className={`w-full min-h-[48px] py-3.5 px-5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                draftCart.length === 0 || !selectedTableId || isSelectedTableOccupied
                  ? 'bg-[#e7dcdb] text-[#74514b] cursor-not-allowed'
                  : 'bg-[#f73b20] hover:bg-[#f84d35] text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Enviando comanda a cocina...' : 'Confirmar y Enviar a Cocina'}
            </button>
          </div>
        </div>
      </div>

      {/* Item Modification / Kitchen Note Modal */}
      {activeItemNoteModal !== null && (
        <div className="fixed inset-0 z-50 bg-[#360802]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#ffffff] w-full max-w-md rounded-2xl p-6 border border-[#e7dcdb]">
            <h3 className="font-medium text-base text-[#360802] mb-1">
              Nota de preparación
            </h3>
            <p className="text-xs text-[#74514b] mb-3">
              Indique términos de cocción o especificaciones para cocina.
            </p>

            <input
              type="text"
              value={tempItemNote}
              onChange={(e) => setTempItemNote(e.target.value)}
              placeholder="Ej. Término medio, sin cebolla, salsa aparte..."
              className="w-full px-3.5 py-2.5 text-sm border border-[#e7dcdb] rounded-2xl text-[#360802] focus:outline-none focus:border-[#f73b20]"
              autoFocus
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveItemNoteModal(null)}
                className="px-4 py-2 rounded-xl border border-[#e7dcdb] text-xs font-medium text-[#74514b] hover:bg-[#fdedea]"
              >
                Cancelar
              </button>
              <button
                onClick={saveItemNote}
                className="px-4 py-2 rounded-xl bg-[#f73b20] hover:bg-[#f84d35] text-xs font-medium text-white cursor-pointer"
              >
                Guardar Nota
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D Dishes Modal */}
      <Food3DModal
        isOpen={is3DModalOpen}
        initialDishIndex={active3DDishIdx}
        onClose={() => setIs3DModalOpen(false)}
        onSelectDishCategory={(cat) => setSelectedCategory(cat as ProductCategory)}
      />
    </div>
  );
};
