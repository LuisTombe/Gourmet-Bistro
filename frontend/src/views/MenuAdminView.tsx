import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext.tsx';
import { Product, ProductCategory } from '../types/index.ts';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Power,
  Search,
  CheckCircle2,
  X,
  AlertCircle,
  Eye,
  UtensilsCrossed,
} from 'lucide-react';

export const MenuAdminView: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    toggleProductAvailability,
    deleteProduct,
    orders,
  } = useRestaurant();

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [category, setCategory] = useState<ProductCategory>('Carnes & Grill');
  const [station, setStation] = useState<'Cocina' | 'Parrilla' | 'Pastelería' | 'Bar'>('Cocina');
  const [image, setImage] = useState('');
  const [available, setAvailable] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const categories: (ProductCategory | 'Todos')[] = [
    'Todos',
    'Entradas',
    'Carnes & Grill',
    'Pastas & Risottos',
    'Postres',
    'Bebidas & Bar',
  ];

  const filtered = products.filter((p) => {
    if (selectedCategory !== 'Todos' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Carnes & Grill');
    setStation('Cocina');
    setImage('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&h=400&q=80');
    setAvailable(true);
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price);
    setCategory(p.category);
    setStation(p.station);
    setImage(p.image);
    setAvailable(p.available);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('El nombre del producto es obligatorio.');
      return;
    }
    if (price === '' || price <= 0) {
      setFormError('El precio debe ser un número mayor a cero.');
      return;
    }

    if (editingProduct) {
      const res = updateProduct(editingProduct.id, {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        category,
        station,
        image: image.trim() || editingProduct.image,
        available,
      });
      if (res.success) setModalOpen(false);
      else setFormError(res.error || 'Error al actualizar.');
    } else {
      const res = addProduct({
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        category,
        station,
        image:
          image.trim() ||
          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&h=400&q=80',
        available,
      });
      if (res.success) setModalOpen(false);
      else setFormError(res.error || 'Error al registrar.');
    }
  };

  const handleDelete = (id: number) => {
    deleteProduct(id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Administración de Menú & Catálogo
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {products.length} platos
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure precios, disponibilidad por estación y platos gastronómicos vigentes.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="min-h-[44px] px-4 py-2.5 bg-[#EA580C] hover:bg-[#CC4900] active:scale-95 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </button>
      </div>

      {/* Filter and Search */}
      <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por plato o ingrediente..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Plato / Descripción</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Estación</th>
                <th className="py-3.5 px-4">Precio Actual</th>
                <th className="py-3.5 px-4">Disponibilidad</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                      />
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm">{prod.name}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 max-w-sm mt-0.5">
                          {prod.description}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {prod.category}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {prod.station}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-extrabold text-[#A33900] text-sm tabular-nums">
                    ${prod.price.toLocaleString('es-CO')}
                  </td>

                  {/* Availability toggle */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => toggleProductAvailability(prod.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                        prod.available
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      }`}
                      title="Alternar disponibilidad para nuevos pedidos"
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          prod.available ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      {prod.available ? 'Disponible' : 'Agotado'}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="Modificar producto"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(prod.id)}
                        className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                        title="Eliminar producto (restringido si tiene historial)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#1E293B] text-white p-5 flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {editingProduct ? 'Modificar Producto' : 'Registrar Nuevo Producto'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre del Plato / Producto *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Bife de Chorizo Madurado"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#EA580C]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Descripción Gastronómica
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ingredientes, términos o detalles para comensales..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#EA580C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Precio ($ COP) *
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="45000"
                    min="100"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#EA580C]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#EA580C]"
                  >
                    <option value="Entradas">Entradas</option>
                    <option value="Carnes & Grill">Carnes & Grill</option>
                    <option value="Pastas & Risottos">Pastas & Risottos</option>
                    <option value="Postres">Postres</option>
                    <option value="Bebidas & Bar">Bebidas & Bar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Estación de Cocina
                  </label>
                  <select
                    value={station}
                    onChange={(e) => setStation(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#EA580C]"
                  >
                    <option value="Cocina">Cocina General</option>
                    <option value="Parrilla">Parrilla / Grill</option>
                    <option value="Pastelería">Pastelería</option>
                    <option value="Bar">Bar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Disponibilidad Inicial
                  </label>
                  <select
                    value={available ? 'yes' : 'no'}
                    onChange={(e) => setAvailable(e.target.value === 'yes')}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#EA580C]"
                  >
                    <option value="yes">Disponible para pedidos</option>
                    <option value="no">Agotado / No disponible</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  URL de Imagen de Presentación
                </label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#EA580C]"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#EA580C] hover:bg-[#CC4900] text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  {editingProduct ? 'Actualizar Producto' : 'Guardar en Menú'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
