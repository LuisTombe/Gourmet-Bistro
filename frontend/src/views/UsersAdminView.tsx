import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext.tsx';
import { User, UserRole } from '../types/index.ts';
import { PageHeader } from '../components/ui/PageHeader.tsx';
import {
  Users,
  Plus,
  Edit2,
  Power,
  Shield,
  ChefHat,
  UserCheck,
  X,
  AlertCircle,
  Key,
} from 'lucide-react';

export const UsersAdminView: React.FC = () => {
  const { users, addUser, updateUser, toggleUserActive, currentUser } = useRestaurant();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('mesero');
  const [active, setActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setUsername('');
    setName('');
    setRole('mesero');
    setActive(true);
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setUsername(u.username);
    setName(u.name);
    setRole(u.role);
    setActive(u.active);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!username.trim()) {
      setFormError('El nombre de usuario es obligatorio.');
      return;
    }
    if (!name.trim()) {
      setFormError('El nombre completo es obligatorio.');
      return;
    }

    if (editingUser) {
      const res = updateUser(editingUser.id, {
        username: username.trim().toLowerCase(),
        name: name.trim(),
        role,
        active,
      });
      if (res.success) setModalOpen(false);
      else setFormError(res.error || 'Error al actualizar usuario.');
    } else {
      const res = addUser({
        username: username.trim().toLowerCase(),
        name: name.trim(),
        role,
        active,
        avatar:
          role === 'cocinero'
            ? 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&h=200&q=80'
            : role === 'administrador'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
      });
      if (res.success) setModalOpen(false);
      else setFormError(res.error || 'Error al registrar usuario.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Personal & Control de Acceso"
        subtitle="Gestione empleados, asigne roles autorizados y controle la activación de accesos."
        badge={`${users.length} cuentas`}
        action={
          <button
            onClick={handleOpenAdd}
            className="min-h-[44px] px-4 py-2.5 bg-[#f73b20] hover:bg-[#e02f17] active:scale-95 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Registrar Empleado
          </button>
        }
      />

      {/* Users Table */}
      <div
        style={{ boxShadow: 'rgba(0, 0, 0, 0.05) 0px -4px 16px 0px' }}
        className="bg-white rounded-2xl border border-[#e7dcdb] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Usuario / Nombre</th>
                <th className="py-3.5 px-4">Rol en el Sistema</th>
                <th className="py-3.5 px-4">Permisos Asignados</th>
                <th className="py-3.5 px-4">Estado de Cuenta</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {users.map((u) => {
                const isCurrent = u.id === currentUser?.id;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* User profile */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            {u.name}
                            {isCurrent && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                                Tú
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            @{u.username}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          u.role === 'administrador'
                            ? 'bg-amber-100 text-[#904D00] border border-amber-300'
                            : u.role === 'cocinero'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {u.role === 'administrador' && <Shield className="w-3.5 h-3.5" />}
                        {u.role === 'cocinero' && <ChefHat className="w-3.5 h-3.5" />}
                        {u.role === 'mesero' && <UserCheck className="w-3.5 h-3.5" />}
                        {u.role}
                      </span>
                    </td>

                    {/* Permissions summary */}
                    <td className="py-3.5 px-4 text-slate-600">
                      {u.role === 'administrador' && 'Menú, Mesas, Personal, Pedidos y Auditoría'}
                      {u.role === 'mesero' && 'Plano de mesas, registro de pedidos y entrega'}
                      {u.role === 'cocinero' && 'KDS pantalla de cocina y avance de preparación'}
                    </td>

                    {/* Active toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleUserActive(u.id)}
                        disabled={isCurrent}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                          isCurrent
                            ? 'opacity-80 cursor-not-allowed bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : u.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer'
                        }`}
                        title={isCurrent ? 'No puede desactivar su propia cuenta activa' : 'Alternar acceso'}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            u.active ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {u.active ? 'Activo' : 'Desactivado'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="Modificar usuario"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
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
                {editingUser ? 'Modificar Empleado' : 'Registrar Nuevo Empleado'}
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
                  Nombre de Usuario (Login) *
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej. mesero3, chef2"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#f73b20]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej. Andrés Gómez"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#f73b20]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Rol en el Restaurante
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#f73b20]"
                >
                  <option value="mesero">Mesero (Toma pedidos & entrega)</option>
                  <option value="cocinero">Cocinero (KDS cocina & preparación)</option>
                  <option value="administrador">Administrador (Control total)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Estado de Cuenta
                </label>
                <select
                  value={active ? 'active' : 'inactive'}
                  onChange={(e) => setActive(e.target.value === 'active')}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#f73b20]"
                >
                  <option value="active">Activo (Puede iniciar sesión)</option>
                  <option value="inactive">Desactivado (Acceso revocado)</option>
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
                  {editingUser ? 'Guardar Cambios' : 'Registrar Cuenta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
