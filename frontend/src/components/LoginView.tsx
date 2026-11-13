import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext.tsx';
import { Flame, Shield, UserCheck, ChefHat, LogIn, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { AmbientTwinkle } from './AmbientTwinkle.tsx';

export const LoginView: React.FC = () => {
  const { login } = useRestaurant();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('AdminPass2026!');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim()) {
      setError('Por favor ingrese su nombre de usuario.');
      return;
    }
    if (!password) {
      setError('Por favor ingrese su contraseña.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(username, password);
      if (!res.success) {
        setError(res.message || 'Credenciales inválidas o cuenta desactivada.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillCredentials = (u: string, p: string) => {
    setError(null);
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Luces y estrellas tenues de fondo (AmbientTwinkle del kit) */}
      <AmbientTwinkle />

      {/* Degradado cálido difuminado */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-[#EA580C]/20 to-[#D97706]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Emblem & Title */}
        <div className="text-center">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EA580C] to-[#D97706] items-center justify-center text-white shadow-xl shadow-orange-950/40 mb-3 border border-orange-400/30">
            <Flame className="w-8 h-8 text-amber-100" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            GOURMET BISTRO
          </h2>
          <p className="mt-1 text-sm text-slate-400 font-medium">
            Sistema de Pedidos, Salón POS & Cocina KDS
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-[#1E293B] py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-700/80">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Nombre de Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin, carlos_m, chef_mateo"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[48px] py-3 px-4 rounded-xl text-white bg-[#EA580C] hover:bg-[#CC4900] active:scale-[0.99] font-bold text-sm tracking-wide shadow-md shadow-orange-950/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Autenticando en Servidor...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Ingresar al Sistema
                </>
              )}
            </button>
          </form>

          {/* Cuentas de Acceso Verificables en MySQL */}
          <div className="mt-8 pt-6 border-t border-slate-700/80">
            <p className="text-xs text-center font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Cuentas Registradas en Base de Datos
            </p>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleFillCredentials('carlos_m', 'MeseroPass2026!')}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left flex items-center gap-3 transition-colors text-xs text-slate-200"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white">Carlos Mendoza (Mesero)</div>
                  <div className="text-[11px] text-slate-400">carlos_m • MeseroPass2026!</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleFillCredentials('chef_mateo', 'CocinaPass2026!')}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left flex items-center gap-3 transition-colors text-xs text-slate-200"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <ChefHat className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white">Mateo Silvestri (Chef Cocina)</div>
                  <div className="text-[11px] text-slate-400">chef_mateo • CocinaPass2026!</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleFillCredentials('admin', 'AdminPass2026!')}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left flex items-center gap-3 transition-colors text-xs text-slate-200"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white">Administrador General</div>
                  <div className="text-[11px] text-slate-400">admin • AdminPass2026!</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Microservicios Activos: Usuarios (:4001) • Catálogo (:4002) • Pedidos (:4003)
        </p>
      </div>
    </div>
  );
};
