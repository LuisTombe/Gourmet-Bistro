import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext.tsx';
import { FoodPlate3D } from './3d/FoodPlate3D.tsx';
import {
  Flame,
  Shield,
  UserCheck,
  ChefHat,
  LogIn,
  Lock,
  User,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-[#f73b20] via-[#f84d35] to-[#ffbfae] flex flex-col justify-between relative overflow-hidden select-none">
      {/* Top Editorial Navigation Bar (Jeton Style) */}
      <header className="relative z-20 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white text-[#f73b20] flex items-center justify-center shadow-md font-black text-xl">
            GB
          </div>
          <span className="text-2xl font-medium tracking-tight text-white">
            Gourmet Bistro
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-medium backdrop-blur-md border border-white/20">
            <span className="w-2 h-2 rounded-full bg-[#bcffbb]" />
            Sistema POS Activo
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-md border border-white/30 transition-colors">
            XAMPP MySQL :3306
          </span>
        </div>
      </header>

      {/* Main Split Grid: 3D Food Plates Hero on Left, High-End Card on Right */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-6 py-4 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Big Editorial Headline & 3D Food Plates Canvas */}
        <div className="lg:col-span-7 flex flex-col justify-center text-white space-y-6">
          <div className="space-y-2">
            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-medium tracking-tight text-white leading-[0.95]">
              One POS <br />
              <span className="text-white/95">for all bistro needs.</span>
            </h1>
            <p className="text-base sm:text-lg text-white/90 max-w-lg font-normal leading-relaxed pt-2">
              Plano de salón, comanda táctil y pantalla de cocina KDS con sincronización en tiempo real.
            </p>
          </div>

          {/* 3D Food Plates Interactive Showcase */}
          <div className="relative w-full h-[360px] sm:h-[420px] rounded-3xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl">
            <div className="absolute top-4 left-5 z-20 flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-white/80 font-bold bg-black/30 px-2.5 py-1 rounded-full backdrop-blur-md">
                ★ Modelos 3D de Platos Gourmet
              </span>
            </div>

            <FoodPlate3D variant="hero" className="w-full h-full" />
          </div>
        </div>

        {/* Right Column: Editorial Login Card (Jeton Paper White & Ink Roast) */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/60 relative">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#f73b20] bg-[#fdedea] px-3 py-1 rounded-full">
                Autenticación Segura
              </span>
              <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#360802] mt-3">
                Acceso al Sistema
              </h2>
              <p className="text-xs text-[#74514b] mt-1">
                Ingrese con sus credenciales de usuario o elija una cuenta de prueba.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-2xl bg-[#ffebee] border border-[#fb2d54]/30 text-[#fb2d54] text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#360802] uppercase tracking-wider mb-1.5">
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#ababab]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin, carlos_m, chef_mateo"
                    className="w-full pl-10 pr-4 py-3 bg-[#fdedea]/40 border border-[#e7dcdb] rounded-2xl text-[#360802] placeholder-[#ababab] text-sm focus:outline-none focus:border-[#f73b20] focus:ring-2 focus:ring-[#f73b20]/20 transition-all font-medium"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#360802] uppercase tracking-wider mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#ababab]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-[#fdedea]/40 border border-[#e7dcdb] rounded-2xl text-[#360802] placeholder-[#ababab] text-sm focus:outline-none focus:border-[#f73b20] focus:ring-2 focus:ring-[#f73b20]/20 transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[48px] py-3.5 px-4 rounded-xl text-white bg-[#f73b20] hover:bg-[#e02f17] active:scale-[0.99] font-medium text-sm tracking-wide shadow-lg shadow-[#f73b20]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verificando credenciales...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Ingresar al POS
                  </>
                )}
              </button>
            </form>

            {/* Quick-Access DB Accounts */}
            <div className="mt-6 pt-5 border-t border-[#e7dcdb]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#74514b] mb-2.5 text-center">
                Cuentas de Acceso Rápido
              </p>

              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleFillCredentials('carlos_m', 'MeseroPass2026!')}
                  className="w-full px-3 py-2 rounded-xl bg-[#fdedea]/50 hover:bg-[#fdedea] border border-[#e7dcdb] text-left flex items-center justify-between text-xs text-[#360802] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#f73b20]" />
                    <span className="font-semibold">Carlos Mendoza</span>
                    <span className="text-[10px] text-[#ababab]">(Mesero)</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#f73b20]">carlos_m</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillCredentials('chef_mateo', 'CocinaPass2026!')}
                  className="w-full px-3 py-2 rounded-xl bg-[#fdedea]/50 hover:bg-[#fdedea] border border-[#e7dcdb] text-left flex items-center justify-between text-xs text-[#360802] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-[#477ee9]" />
                    <span className="font-semibold">Mateo Silvestri</span>
                    <span className="text-[10px] text-[#ababab]">(Cocina KDS)</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#477ee9]">chef_mateo</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillCredentials('admin', 'AdminPass2026!')}
                  className="w-full px-3 py-2 rounded-xl bg-[#fdedea]/50 hover:bg-[#fdedea] border border-[#e7dcdb] text-left flex items-center justify-between text-xs text-[#360802] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#34c771]" />
                    <span className="font-semibold">Administrador</span>
                    <span className="text-[10px] text-[#ababab]">(General)</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#34c771]">admin</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer Info */}
      <footer className="relative z-20 max-w-7xl w-full mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-white/80 border-t border-white/20">
        <span>Gourmet Bistro POS © 2026 — Arquitectura de 3 Microservicios</span>
        <div className="flex items-center gap-4 mt-2 sm:mt-0 text-white/90">
          <span>Usuarios :4001</span>
          <span>•</span>
          <span>Catálogo :4002</span>
          <span>•</span>
          <span>Pedidos :4003</span>
        </div>
      </footer>
    </div>
  );
};
