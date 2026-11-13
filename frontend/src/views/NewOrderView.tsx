import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext.tsx';
import { Product, ProductCategory, Table } from '../types/index.ts';
import { calculateSubtotal, calculateOrderTotal } from '../domain/rules.ts';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  UtensilsCrossed,
  Send,
  AlertCircle,
  FileText,
  CheckCircle,
  ArrowLeft,
  Flame,
} from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export const NewOrderView: React.FC = () => {
  const {
    products,
    tables,
    getTableStatus,
    selectedTableForOrder,
    setSelectedTableForOrder,
    createOrder,
    setActiveView,
    currentUser,
  } = useRestaurant();

  const [selectedTableId, setSelectedTableId] = useState<number | null>(() => {
    if (selectedTableForOrder && getTableStatus(selectedTableForOrder.id) === 'Disponible') {
      return selectedTableForOrder.id;
    }
    // Find first available table
    const firstAvailable = tables.find((t) => getTableStatus(t.id) === 'Disponible');
    return firstAvailable ? firstAvailable.id : null;
  });

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [activeItemNoteModal, setActiveItemNoteModal] = useState<number | null>(null);
  const [tempItemNote, setTempItemNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync selectedTableForOrder if set from salon
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

  // Filter available products
  const filteredProducts = products.filter((prod) => {
    if (selectedCategory !== 'Todos' && prod.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        prod.name.toLowerCase().includes(q) ||
        prod.description.toLowerCase().includes(q) ||
        prod.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Available tables for dropdown
  const availableTables = tables.filter((t) => getTableStatus(t.id) === 'Disponible');
  const currentTable = tables.find((t) => t.id === selectedTableId);
  const isSelectedTableOccupied = selectedTableId ? getTableStatus(selectedTableId) === 'Ocupada' : false;

  // Cart operations
  const addToCart = (product: Product) => {
    if (!product.available) return;
    setErrorMsg(null);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const openNoteModal = (productId: number) => {
    const item = cart.find((i) => i.product.id === productId);
    if (item) {
      setTempItemNote(item.notes || '');
      setActiveItemNoteModal(productId);
    }
  };

  const saveItemNote = () => {
    if (activeItemNoteModal !== null) {
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === activeItemNoteModal ? { ...item, notes: tempItemNote.trim() } : item
        )
      );
      setActiveItemNoteModal(null);
    }
  };

  // Calculations
  const cartCalculationItems = cart.map((item) => ({
    quantity: item.quantity,
    unitPrice: item.product.price,
  }));
  const total = calculateOrderTotal(cartCalculationItems);

  // Submit order to kitchen
  const handleSendToKitchen = () => {
    setErrorMsg(null);
    if (!selectedTableId) {
      setErrorMsg('Debe seleccionar una mesa válida para el pedido.');
      return;
    }
    if (isSelectedTableOccupied) {
      setErrorMsg(`La Mesa ${currentTable?.tableNumber} ya tiene un pedido activo.`);
      return;
    }
    if (cart.length === 0) {
      setErrorMsg('Debe agregar al menos un plato o bebida al pedido.');
      return;
    }

    setIsSubmitting(true);
    const orderItemsPayload = cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      notes: item.notes,
    }));

    const result = createOrder(selectedTableId, orderItemsPayload, generalNotes.trim() || undefined);
    setIsSubmitting(false);

    if (result.success) {
      // Clear cart and redirect to tables or kitchen
      setCart([]);
      setGeneralNotes('');
      setSelectedTableForOrder(null);
      setActiveView('mesas');
    } else {
      setErrorMsg(result.error || 'No se pudo registrar el pedido.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('mesas')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Volver al plano de salón"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
              Punto de Venta (POS) • Nuevo Pedido
            </h1>
            <p className="text-xs text-slate-500">
              Atendido por: <strong className="text-slate-700">{currentUser?.name}</strong>
            </p>
          </div>
        </div>

        {/* Available tables count indicator */}
        <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 hidden sm:block">
          {availableTables.length} mesas libres
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-800 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: 5 cols Catalog, 3 cols Live Ticket */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Product Catalog (7 or 8 columns on large desktop) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Search Bar & Category Pills */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            {/* Search input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, ingrediente o corte (ej. Bife, Risotto, Malbec)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[36px] px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#2554F4] text-white shadow-xs'
                      : 'bg-white border border-[#E3E7EF] text-[#626B7A] hover:bg-[#F2F4F8] hover:text-[#141722]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProducts.map((prod) => {
              const inCart = cart.find((i) => i.product.id === prod.id);

              return (
                <div
                  key={prod.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-xs ${
                    !prod.available
                      ? 'opacity-60 border-[#E3E7EF] bg-slate-50'
                      : inCart
                      ? 'border-[#2554F4] ring-2 ring-[#2554F4]/20 shadow-md'
                      : 'border-[#E3E7EF] hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  {/* Image & Badges */}
                  <div className="relative h-36 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-sm">
                        {prod.station}
                      </span>
                    </div>

                    {!prod.available && (
                      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          Agotado / No Disponible
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[#0F172A] leading-tight line-clamp-1">
                        {prod.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-base font-extrabold text-[#141722] tabular-nums">
                        ${prod.price.toLocaleString('es-CO')}
                      </span>

                      {/* Interactive Add or Stepper */}
                      {prod.available && (
                        <div>
                          {inCart ? (
                            <div className="flex items-center gap-1.5 bg-[#EAF0FF] border border-[#2554F4]/30 rounded-xl p-0.5">
                              <button
                                onClick={() => updateQuantity(prod.id, -1)}
                                className="w-7 h-7 rounded-lg bg-white text-[#2554F4] font-bold flex items-center justify-center hover:bg-blue-100 active:scale-95 transition-all cursor-pointer"
                                aria-label="Restar 1"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-6 text-center font-extrabold text-xs text-[#2554F4] tabular-nums">
                                {inCart.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(prod.id, 1)}
                                className="w-7 h-7 rounded-lg bg-[#2554F4] text-white font-bold flex items-center justify-center hover:bg-[#1741CF] active:scale-95 transition-all shadow-xs cursor-pointer"
                                aria-label="Sumar 1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(prod)}
                              className="px-3.5 py-1.5 bg-[#2554F4] hover:bg-[#1741CF] active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs transition-all cursor-pointer"
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
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <UtensilsCrossed className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No se encontraron platos</p>
              <p className="text-xs text-slate-400 mt-0.5">Intente con otro término o categoría.</p>
            </div>
          )}
        </div>

        {/* Right: Pinned Live Ticket (5 or 4 columns) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden sticky top-20">
          {/* Ticket Header */}
          <div className="bg-[#1E293B] text-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#EA580C]" />
                <h2 className="font-extrabold text-base tracking-tight">Comanda / Ticket de Mesa</h2>
              </div>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono">
                {cart.length} ítems
              </span>
            </div>

            {/* Table Selection Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Asignar a Mesa
              </label>
              <select
                value={selectedTableId || ''}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSelectedTableId(val || null);
                  setErrorMsg(null);
                }}
                className={`w-full py-2 px-3 rounded-xl text-sm font-bold border transition-colors ${
                  isSelectedTableOccupied
                    ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                    : 'bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-[#EA580C]'
                }`}
              >
                <option value="">-- Seleccione una mesa --</option>
                {tables.map((t) => {
                  const status = getTableStatus(t.id);
                  const isAvail = status === 'Disponible';
                  return (
                    <option key={t.id} value={t.id}>
                      Mesa {t.tableNumber < 10 ? `0${t.tableNumber}` : t.tableNumber} ({t.area} - {t.capacity}p) — {status}
                    </option>
                  );
                })}
              </select>

              {isSelectedTableOccupied && (
                <p className="text-[11px] text-rose-400 font-semibold mt-1">
                  ⚠️ Esta mesa ya tiene un pedido activo en curso. Seleccione otra mesa disponible.
                </p>
              )}
            </div>
          </div>

          {/* Ticket Line Items */}
          <div className="p-4 max-h-[42vh] overflow-y-auto divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-600">Ticket vacío</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Seleccione productos del catálogo para armar la comanda.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="text-[#EA580C] font-black">{item.quantity}x</span>
                        <span className="truncate">{item.product.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 tabular-nums">
                        ${item.product.price.toLocaleString('es-CO')} c/u
                      </div>

                      {/* Modifier notes badge */}
                      {item.notes ? (
                        <button
                          onClick={() => openNoteModal(item.product.id)}
                          className="mt-1 text-[11px] font-semibold text-[#904D00] bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3 text-amber-600" />
                          <span>{item.notes}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openNoteModal(item.product.id)}
                          className="mt-1 text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1 font-medium"
                        >
                          + Agregar nota de cocina
                        </button>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-extrabold text-slate-900 tabular-nums">
                        ${(item.quantity * item.product.price).toLocaleString('es-CO')}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1 mt-1.5 justify-end">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
                          aria-label="Disminuir"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold px-1 tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
                          aria-label="Aumentar"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="w-5 h-5 rounded text-rose-500 hover:bg-rose-50 flex items-center justify-center ml-1"
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
          <div className="p-3 bg-slate-50 border-t border-slate-100">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Observaciones generales para cocina
            </label>
            <input
              type="text"
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Ej. Servir platos al tiempo, comensal alérgico al maní..."
              className="w-full px-3 py-2 text-xs bg-white border border-[#E3E7EF] rounded-xl text-[#141722] focus:outline-none focus:ring-2 focus:ring-[#2554F4]"
            />
          </div>

          {/* Totals & Submit Footer */}
          <div className="p-4 bg-[#F8F9FC] border-t border-[#E3E7EF] space-y-3">
            <div className="flex items-center justify-between text-xs text-[#626B7A]">
              <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} ítems):</span>
              <span className="font-bold text-[#141722] tabular-nums">
                ${total.toLocaleString('es-CO')}
              </span>
            </div>

            <div className="flex items-center justify-between text-base pt-2 border-t border-slate-200">
              <span className="font-extrabold text-[#141722]">Total de la Comanda:</span>
              <span className="font-black text-[#2554F4] text-xl tabular-nums">
                ${total.toLocaleString('es-CO')}
              </span>
            </div>

            <button
              onClick={handleSendToKitchen}
              disabled={isSubmitting || cart.length === 0 || !selectedTableId || isSelectedTableOccupied}
              className={`w-full min-h-[48px] py-3 px-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                cart.length === 0 || !selectedTableId || isSelectedTableOccupied
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#2554F4] hover:bg-[#1741CF] active:scale-[0.98] text-white shadow-[#2554F4]/20'
              }`}
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Enviando comanda a cocina...' : 'Confirmar & Enviar a Cocina'}
            </button>
          </div>
        </div>
      </div>

      {/* Item Modification / Kitchen Note Modal */}
      {activeItemNoteModal !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-5 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-sm text-slate-900 mb-1">
              Nota especial de preparación
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Indique términos de cocción, exclusión de ingredientes o especificaciones para el chef.
            </p>

            <input
              type="text"
              value={tempItemNote}
              onChange={(e) => setTempItemNote(e.target.value)}
              placeholder="Ej. Término medio, sin cebolla, salsa aparte..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
              autoFocus
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveItemNoteModal(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={saveItemNote}
                className="px-4 py-1.5 rounded-lg bg-[#EA580C] hover:bg-[#CC4900] text-xs font-bold text-white shadow-sm"
              >
                Guardar Nota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
