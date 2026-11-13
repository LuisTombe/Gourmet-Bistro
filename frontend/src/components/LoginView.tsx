import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext.tsx';
import { Flame, Shield, UserCheck, ChefHat, LogIn, Lock, User, AlertCircle } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, users } = useRestaurant();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim()) {
      setError('Por favor ingrese su nombre de usuario.');
      return;
    }

    const res = login(username);
    if (!res.success) {
      setError(res.message || 'Error al iniciar sesión.');
    }
  };

  const handleQuickLogin = (uname: string) => {
    setError(null);
    setUsername(uname);
    setPassword('••••••••');
    const res = login(uname);
    if (!res.success) {
      setError(res.message || 'Error al iniciar sesión.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Warm ambient background lights evoking amber reduction and fire */}
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
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin, mesero o cocina"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] py-3 px-4 rounded-xl text-white bg-[#EA580C] hover:bg-[#CC4900] active:scale-[0.99] font-bold text-sm tracking-wide shadow-md shadow-orange-950/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Ingresar al Sistema
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-700/80">
            <p className="text-xs text-center font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Acceso Rápido de Demostración
            </p>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('mesero')}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left flex items-center gap-3 transition-colors text-xs text-slate-200"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white">Carlos Mendoza (Mesero)</div>
                  <div className="text-[11px] text-slate-400">Gestión de mesas, toma de pedidos y entrega</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('cocina')}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left flex items-center gap-3 transition-colors text-xs text-slate-200"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <ChefHat className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white">Elena Rossi (Chef / Cocina)</div>
                  <div className="text-[11px] text-slate-400">KDS pantalla de cocina y avance de estados</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left flex items-center gap-3 transition-colors text-xs text-slate-200"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white">Mateo Valenzuela (Administrador)</div>
                  <div className="text-[11px] text-slate-400">Control total de menú, mesas, usuarios y reportes</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          MVP Académico • 18 Requisitos Funcionales (RF-01 a RF-18)
        </p>
      </div>
    </div>
  );
};
