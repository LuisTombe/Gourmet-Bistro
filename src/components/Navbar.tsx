import React, { useState, useEffect, useRef } from 'react';
import { useRestaurant } from '../context/RestaurantContext.tsx';
import {
  UtensilsCrossed,
  ChefHat,
  LayoutGrid,
  PlusCircle,
  ClipboardList,
  BookOpen,
  Users,
  LogOut,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Flame,
  ShieldCheck,
  Check,
  Sliders,
  Settings,
  GitBranch,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    users,
    orders,
    tables,
    activeView,
    setActiveView,
    logout,
    getTableStatus,
  } = useRestaurant();

  const [profilePanelOpen, setProfilePanelOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfilePanelOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfilePanelOpen(false);
      }
    };

    if (profilePanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profilePanelOpen]);

  if (!currentUser) return null;

  // Compute live indicators
  const occupiedCount = tables.filter((t) => getTableStatus(t.id) === 'Ocupada').length;
  const availableCount = tables.length - occupiedCount;
  const kitchenActiveCount = orders.filter(
    (o) => o.status === 'Pendiente' || o.status === 'En preparación'
  ).length;
  const readyCount = orders.filter((o) => o.status === 'Listo').length;

  const role = currentUser.role;

  const getRoleBadgeColor = (userRole: string) => {
    switch (userRole) {
      case 'administrador':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'cocinero':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  const getRoleDotColor = (userRole: string) => {
    switch (userRole) {
      case 'administrador':
        return 'bg-amber-400 ring-amber-900';
      case 'cocinero':
        return 'bg-blue-400 ring-blue-900';
      default:
        return 'bg-emerald-400 ring-emerald-900';
    }
  };

  const isSettingsActive =
    activeView === 'menu' ||
    activeView === 'gestion-mesas' ||
    activeView === 'usuarios' ||
    activeView === 'versionamiento';

  return (
    <header className="bg-[#1E293B] text-white border-b border-[#334155] sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView(role === 'cocinero' ? 'cocina' : 'mesas')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
              title="Volver a la vista principal"
            >
              <div className="w-10 h-10 rounded-xl bg-[#2554F4] flex items-center justify-center text-white shadow-md shadow-blue-950/30 group-hover:scale-105 transition-transform">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                  GOURMET BISTRO
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-[#2554F4]/30 text-blue-200 px-1.5 py-0.5 rounded border border-blue-400/30">
                    POS
                  </span>
                </span>
                <span className="text-xs text-slate-400 block -mt-0.5 font-medium">
                  Gastronomía & KDS
                </span>
              </div>
            </button>

            {/* Subtle Operational stats pills */}
            <div className="hidden xl:flex items-center gap-2 ml-4 pl-4 border-l border-slate-700/60 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-800/30 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {availableCount} Libres
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-950/40 text-rose-300 border border-rose-800/30 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                {occupiedCount} Ocupadas
              </span>
              {kitchenActiveCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/40 text-amber-300 border border-amber-800/30 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {kitchenActiveCount} en Cocina
                </span>
              )}
              {readyCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 font-extrabold shadow-sm animate-pulse">
                  ★ {readyCount} Listos
                </span>
              )}
            </div>
          </div>

          {/* Clean, Focused Operational Navigation (Only essential core workflows) */}
          <nav className="hidden md:flex items-center gap-1.5">
            {/* Mesero / Admin Primary Operational Views */}
            {(role === 'mesero' || role === 'administrador') && (
              <>
                <button
                  onClick={() => setActiveView('mesas')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                    activeView === 'mesas'
                      ? 'bg-[#2554F4] text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Salón / Mesas
                </button>

                <button
                  onClick={() => setActiveView('nuevo-pedido')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                    activeView === 'nuevo-pedido'
                      ? 'bg-[#2554F4] text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  Nuevo Pedido
                </button>
              </>
            )}

            {/* Cocina / KDS View (Cocinero & Admin) */}
            {(role === 'cocinero' || role === 'administrador') && (
              <button
                onClick={() => setActiveView('cocina')}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors relative ${
                  activeView === 'cocina'
                    ? 'bg-[#2554F4] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <ChefHat className="w-4 h-4" />
                KDS Cocina
                {kitchenActiveCount > 0 && (
                  <span className="ml-1 bg-amber-500 text-slate-950 font-extrabold text-[11px] px-1.5 py-0.2 rounded-full">
                    {kitchenActiveCount}
                  </span>
                )}
              </button>
            )}

            {/* Pedidos view (All roles) */}
            <button
              onClick={() => setActiveView('pedidos')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors relative ${
                activeView === 'pedidos'
                  ? 'bg-[#2554F4] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Pedidos
              {readyCount > 0 && (
                <span className="ml-1 bg-emerald-400 text-slate-950 font-black text-[11px] px-1.5 py-0.2 rounded-full">
                  {readyCount}
                </span>
              )}
            </button>

            {/* Active Settings Pill Indicator when an admin setting is open */}
            {isSettingsActive && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold ml-1">
                <Sliders className="w-3.5 h-3.5" />
                <span>
                  {activeView === 'menu' && 'Ajustes: Menú'}
                  {activeView === 'gestion-mesas' && 'Ajustes: Mesas'}
                  {activeView === 'usuarios' && 'Ajustes: Personal'}
                  {activeView === 'versionamiento' && 'Ajustes: Versiones & Git'}
                </span>
              </div>
            )}
          </nav>

          {/* Right Action: Clean Avatar Button that opens the Profile & Settings Panel */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfilePanelOpen(!profilePanelOpen)}
              className={`flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full transition-all duration-200 border ${
                profilePanelOpen
                  ? 'bg-slate-800 border-amber-500 shadow-lg ring-2 ring-amber-500/20'
                  : 'bg-slate-800/80 hover:bg-slate-850 border-slate-700/80 hover:border-slate-600'
              }`}
              title="Abrir perfil y ajustes"
              aria-expanded={profilePanelOpen}
              aria-label="Perfil de usuario y ajustes"
            >
              {/* Circular Avatar with status ring */}
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-[#1E293B]"
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-[#1E293B] ${getRoleDotColor(
                    currentUser.role
                  )}`}
                />
              </div>

              {/* Minimal chevron indicator */}
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  profilePanelOpen ? 'rotate-180 text-amber-400' : ''
                }`}
              />
            </button>

            {/* Desplegable / Panel de Perfil con Ajustes */}
            {profilePanelOpen && (
              <div className="absolute right-0 mt-2.5 w-80 bg-[#0F172A] border border-slate-700/90 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800 animate-in fade-in zoom-in-95 duration-150">
                {/* 1. Header con Información de Usuario */}
                <div className="p-4 bg-gradient-to-b from-slate-800/80 to-[#0F172A]">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500/50 shadow-md"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-[#0F172A] ${getRoleDotColor(
                          currentUser.role
                        )}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-base truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-xs text-slate-400 truncate -mt-0.5">
                        @{currentUser.username}
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRoleBadgeColor(
                            currentUser.role
                          )}`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          {currentUser.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Sección de Administración del Sistema (Solo para Administrador) */}
                {role === 'administrador' && (
                  <div className="p-3">
                    <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5 text-amber-400" />
                      <span>Administración & Ajustes</span>
                    </div>

                    <div className="mt-1.5 space-y-1">
                      <button
                        onClick={() => {
                          setActiveView('menu');
                          setProfilePanelOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                          activeView === 'menu'
                            ? 'bg-[#2554F4] text-white font-semibold shadow-sm'
                            : 'text-slate-200 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <BookOpen className="w-4 h-4 text-amber-400" />
                          <div>
                            <div className="font-medium">Menú del Restaurante</div>
                            <div
                              className={`text-[10px] ${
                                activeView === 'menu' ? 'text-orange-100' : 'text-slate-400'
                              }`}
                            >
                              Platos, precios y categorías
                            </div>
                          </div>
                        </div>
                        {activeView === 'menu' && <Check className="w-4 h-4 text-white" />}
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('gestion-mesas');
                          setProfilePanelOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                          activeView === 'gestion-mesas'
                            ? 'bg-[#2554F4] text-white font-semibold shadow-sm'
                            : 'text-slate-200 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <UtensilsCrossed className="w-4 h-4 text-blue-400" />
                          <div>
                            <div className="font-medium">Gestión de Mesas</div>
                            <div
                              className={`text-[10px] ${
                                activeView === 'gestion-mesas' ? 'text-orange-100' : 'text-slate-400'
                              }`}
                            >
                              Salón, terraza y capacidades
                            </div>
                          </div>
                        </div>
                        {activeView === 'gestion-mesas' && <Check className="w-4 h-4 text-white" />}
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('usuarios');
                          setProfilePanelOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                          activeView === 'usuarios'
                            ? 'bg-[#2554F4] text-white font-semibold shadow-sm'
                            : 'text-slate-200 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Users className="w-4 h-4 text-emerald-400" />
                          <div>
                            <div className="font-medium">Personal y Accesos</div>
                            <div
                              className={`text-[10px] ${
                                activeView === 'usuarios' ? 'text-orange-100' : 'text-slate-400'
                              }`}
                            >
                              Usuarios, roles y contraseñas
                            </div>
                          </div>
                        </div>
                        {activeView === 'usuarios' && <Check className="w-4 h-4 text-white" />}
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('versionamiento');
                          setProfilePanelOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                          activeView === 'versionamiento'
                            ? 'bg-[#2554F4] text-white font-semibold shadow-sm'
                            : 'text-slate-200 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <GitBranch className="w-4 h-4 text-amber-400" />
                          <div>
                            <div className="font-medium">Versionamiento & Histórico</div>
                            <div
                              className={`text-[10px] ${
                                activeView === 'versionamiento' ? 'text-orange-100' : 'text-slate-400'
                              }`}
                            >
                              Control de versiones y rollback
                            </div>
                          </div>
                        </div>
                        {activeView === 'versionamiento' && <Check className="w-4 h-4 text-white" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Acciones y Cierre de Sesión Seguro */}
                <div className="p-3 bg-slate-900/60 space-y-1">
                  <button
                    onClick={() => {
                      logout();
                      setProfilePanelOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav bar sub-menu (clean, core operations only) */}
      <div className="md:hidden flex items-center justify-around bg-[#0F172A] border-t border-slate-800 px-2 py-2 text-xs overflow-x-auto">
        {(role === 'mesero' || role === 'administrador') && (
          <>
            <button
              onClick={() => setActiveView('mesas')}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap ${
                activeView === 'mesas' ? 'bg-[#2554F4] text-white' : 'text-slate-400'
              }`}
            >
              Salón
            </button>
            <button
              onClick={() => setActiveView('nuevo-pedido')}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap ${
                activeView === 'nuevo-pedido' ? 'bg-[#2554F4] text-white' : 'text-slate-400'
              }`}
            >
              + Pedido
            </button>
          </>
        )}
        {(role === 'cocinero' || role === 'administrador') && (
          <button
            onClick={() => setActiveView('cocina')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap ${
              activeView === 'cocina' ? 'bg-[#2554F4] text-white' : 'text-slate-400'
            }`}
          >
            Cocina {kitchenActiveCount > 0 ? `(${kitchenActiveCount})` : ''}
          </button>
        )}
        <button
          onClick={() => setActiveView('pedidos')}
          className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap ${
            activeView === 'pedidos' ? 'bg-[#2554F4] text-white' : 'text-slate-400'
          }`}
        >
          Pedidos {readyCount > 0 ? `(${readyCount})` : ''}
        </button>
      </div>
    </header>
  );
};
