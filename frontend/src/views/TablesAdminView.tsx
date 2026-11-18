import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext.tsx';
import { Table } from '../types/index.ts';
import { StatusBadge } from '../components/ui/StatusBadge.tsx';
import { PageHeader } from '../components/ui/PageHeader.tsx';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  Users,
  CheckCircle2,
  X,
  AlertCircle,
  Clock,
} from 'lucide-react';

export const TablesAdminView: React.FC = () => {
  const {
    tables,
    addTable,
    updateTable,
    deleteTable,
    getTableStatus,
    getActiveOrder,
  } = useRestaurant();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  const [tableNumber, setTableNumber] = useState<number | ''>('');
  const [capacity, setCapacity] = useState<number | ''>(4);
  const [area, setArea] = useState<'Salón Principal' | 'Terraza Gourmet' | 'Zona VIP'>('Salón Principal');
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingTable(null);
    // Suggest next table number
    const maxNumber = tables.length > 0 ? Math.max(...tables.map((t) => t.tableNumber)) : 0;
    setTableNumber(maxNumber + 1);
    setCapacity(4);
    setArea('Salón Principal');
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (t: Table) => {
    setEditingTable(t);
    setTableNumber(t.tableNumber);
    setCapacity(t.capacity);
    setArea(t.area);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (tableNumber === '' || tableNumber <= 0 || !Number.isInteger(Number(tableNumber))) {
      setFormError('El número de mesa debe ser un entero positivo.');
      return;
    }
    if (capacity === '' || capacity <= 0) {
      setFormError('La capacidad debe ser de al menos 1 comensal.');
      return;
    }

    if (editingTable) {
      const res = await updateTable(editingTable.id, {
        tableNumber: Number(tableNumber),
        capacity: Number(capacity),
        area,
      });
      if (res.success) setModalOpen(false);
      else setFormError(res.error || 'Error al actualizar.');
    } else {
      const res = await addTable({
        tableNumber: Number(tableNumber),
        capacity: Number(capacity),
        area,
      });
      if (res.success) setModalOpen(false);
      else setFormError(res.error || 'Error al registrar.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Configuración de Mesas & Capacidad"
        subtitle="Defina la distribución física del restaurante por sectores y controle disponibilidad."
        badge={`${tables.length} mesas`}
        action={
          <button
            onClick={handleOpenAdd}
            className="min-h-[44px] px-4 py-2.5 bg-[#f73b20] hover:bg-[#e02f17] active:scale-95 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Registrar Mesa
          </button>
        }
      />

      {/* Tables Table */}
      <div
        style={{ boxShadow: 'rgba(0, 0, 0, 0.05) 0px -4px 16px 0px' }}
        className="bg-white rounded-2xl border border-[#e7dcdb] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Número de Mesa</th>
                <th className="py-3.5 px-4">Capacidad</th>
                <th className="py-3.5 px-4">Sector / Área</th>
                <th className="py-3.5 px-4">Estado en Tiempo Real</th>
                <th className="py-3.5 px-4">Comanda Activa</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {tables.map((t) => {
                const status = getTableStatus(t.id);
                const activeOrder = getActiveOrder(t.id);

                return (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-black text-slate-900 text-base">
                      Mesa {t.tableNumber < 10 ? `0${t.tableNumber}` : t.tableNumber}
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 font-semibold text-slate-700">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        {t.capacity} personas
                      </span>
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-700">
                      {t.area}
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={status} size="sm" />
                    </td>

                    <td className="py-4 px-4">
                      {activeOrder ? (
                        <div className="text-slate-700">
                          <span className="font-bold text-slate-900">Ticket #{activeOrder.id}</span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {activeOrder.items.length} platos • ${activeOrder.total.toLocaleString('es-CO')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium">— Ninguna —</span>
                      )}
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Modificar mesa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => deleteTable(t.id)}
                          className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                          title="Eliminar mesa (restringido si tiene historial de pedidos)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#1E293B] text-white p-5 flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {editingTable ? 'Modificar Mesa' : 'Registrar Nueva Mesa'}
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
                  Número Identificador de Mesa *
                </label>
                <input
                  type="number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Ej. 1, 2, 3..."
                  min="1"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#f73b20]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Capacidad de Sillas / Comensales *
                </label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Ej. 4"
                  min="1"
                  max="24"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#f73b20]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Sector del Restaurante
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#f73b20]"
                >
                  <option value="Salón Principal">Salón Principal</option>
                  <option value="Terraza Gourmet">Terraza Gourmet</option>
                  <option value="Zona VIP">Zona VIP</option>
                </select>
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
                  className="px-5 py-2.5 min-h-[44px] bg-[#f73b20] hover:bg-[#e02f17] text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  {editingTable ? 'Actualizar Mesa' : 'Guardar Mesa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
