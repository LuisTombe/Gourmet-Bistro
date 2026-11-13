import React, { useState, useEffect, useRef } from 'react';
import { useRestaurant } from '../context/RestaurantContext.tsx';
import { Food3DModal } from './3d/Food3DModal.tsx';
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
  Sparkles,
  Flame,
  ShieldCheck,
  Check,
  Sliders,
  Settings,
  GitBranch,
  ShoppingBag,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    orders,
    tables,
    activeView,
    setActiveView,
    logout,
    getTableStatus,
    draftCart,
  } = useRestaurant();

  const [profilePanelOpen, setProfilePanelOpen] = useState(false);
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const occupiedCount = tables.filter((t) => getTableStatus(t.id) === 'Ocupada').length;
  const availableCount = tables.length - occupiedCount;
  const kitchenActiveCount = orders.filter(
    (o) => o.status === 'Pendiente' || o.status === 'En preparación'
  ).length;
  const readyCount = orders.filter((o) => o.status === 'Listo').length;
  const draftCount = draftCart.reduce((acc, i) => acc + i.quantity, 0);

  const role = currentUser.role;

  const isSettingsActive =
    activeView === 'menu' ||
    activeView === 'gestion-mesas' ||
    activeView === 'usuarios' ||
    activeView === 'versionamiento';

  return (
    <header className="bg-[#ffffff]/90 backdrop-blur-xl text-[#360802] border-b border-[#e7dcdb] sticky top-0 z-40">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Editorial Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView(role === 'cocinero' ? 'cocina' : 'mesas')}
              className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
              title="Ir a la portada principal"
            >
              <div className="w-9 h-9 rounded-full bg-[#f73b20] flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-xl tracking-tight text-[#360802]">
                  Jeton<span className="text-[#f73b20]">Bistro</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-medium uppercase tracking-[0.05em] bg-[#fdedea] text-[#f73b20] px-2 py-0.5 rounded-full">
                  POS 3D
                </span>
              </div>
            </button>

            {/* Operational Pastel Pills */}
            <div className="hidden xl:flex items-center gap-2 ml-4 pl-4 border-l border-[#e7dcdb] text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#bcffbb] text-[#360802] font-medium tracking-[0.02em]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34c771]" />
                {availableCount} Libres
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fdedea] text-[#360802] font-medium tracking-[0.02em]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f73b20]" />
                {occupiedCount} Ocupadas
              </span>
              {kitchenActiveCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5ffbb] text-[#360802] font-medium tracking-[0.02em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f73b20]" />
                  {kitchenActiveCount} en Cocina
                </span>
              )}
              {readyCount > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#f73b20] text-white font-medium tracking-[0.02em]">
                  ★ {readyCount} Listos
                </span>
              )}
            </div>
          </div>

          {/* Jeton Editorial Pill Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#fdedea]/70 p-1 rounded-full border border-[#e7dcdb]">
            {(role === 'mesero' || role === 'administrador') && (
              <>
                <button
                  onClick={() => setActiveView('mesas')}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-[0.02em] flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeView === 'mesas'
                      ? 'bg-[#f73b20] text-white'
                      : 'text-[#360802] hover:bg-[#ffffff]'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Portada & Salón
                </button>

                <button
                  onClick={() => setActiveView('nuevo-pedido')}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-[0.02em] flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeView === 'nuevo-pedido'
                      ? 'bg-[#f73b20] text-white'
                      : 'text-[#360802] hover:bg-[#ffffff]'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Nuevo Pedido
                  {draftCount > 0 && (
                    <span
                      className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-medium ${
                        activeView === 'nuevo-pedido'
                          ? 'bg-white text-[#f73b20]'
                          : 'bg-[#f73b20] text-white'
                      }`}
                    >
                      {draftCount}
                    </span>
                  )}
                </button>
              </>
            )}

            {(role === 'cocinero' || role === 'administrador') && (
              <button
                onClick={() => setActiveView('cocina')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-[0.02em] flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeView === 'cocina'
                    ? 'bg-[#f73b20] text-white'
                    : 'text-[#360802] hover:bg-[#ffffff]'
                }`}
              >
                <ChefHat className="w-3.5 h-3.5" />
                KDS Cocina
                {kitchenActiveCount > 0 && (
                  <span className="ml-0.5 bg-[#f5ffbb] text-[#360802] font-medium text-[10px] px-1.5 rounded-full">
                    {kitchenActiveCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setActiveView('pedidos')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-[0.02em] flex items-center gap-1.5 transition-all cursor-pointer ${
                activeView === 'pedidos'
                  ? 'bg-[#f73b20] text-white'
                  : 'text-[#360802] hover:bg-[#ffffff]'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Pedidos
              {readyCount > 0 && (
                <span className="ml-0.5 bg-[#bcffbb] text-[#360802] font-medium text-[10px] px-1.5 rounded-full">
                  {readyCount}
                </span>
              )}
            </button>

            {isSettingsActive && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5ffbb] text-[#360802] text-xs font-medium">
                <Sliders className="w-3.5 h-3.5 text-[#f73b20]" />
                <span>
                  {activeView === 'menu' && 'Menú'}
                  {activeView === 'gestion-mesas' && 'Mesas'}
                  {activeView === 'usuarios' && 'Personal'}
                  {activeView === 'versionamiento' && 'Git & Versiones'}
                </span>
              </div>
            )}
          </nav>

          {/* Right Actions: 3D Plates Trigger + User Profile Pill */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIs3DModalOpen(true)}
              className="px-4 py-2 rounded-full bg-[#f73b20] hover:bg-[#f84d35] text-white text-xs font-medium tracking-[0.02em] flex items-center gap-1.5 transition-all cursor-pointer"
              title="Abrir platos gourmet en 3D interactivo"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Platos 3D</span>
              {draftCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white text-[#f73b20] text-[10px]">
                  {draftCount}
                </span>
              )}
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfilePanelOpen(!profilePanelOpen)}
                className={`flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full transition-all border cursor-pointer ${
                  profilePanelOpen
                    ? 'bg-[#fdedea] border-[#f73b20]'
                    : 'bg-[#ffffff] hover:bg-[#fdedea] border-[#e7dcdb]'
                }`}
                title="Abrir perfil y administración"
                aria-expanded={profilePanelOpen}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#e7dcdb]"
                />
                <span className="hidden sm:inline text-xs font-medium text-[#360802]">
                  {currentUser.name}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#74514b] transition-transform duration-200 ${
                    profilePanelOpen ? 'rotate-180 text-[#f73b20]' : ''
                  }`}
                />
              </button>

              {/* Editorial Light Dropdown Menu */}
              {profilePanelOpen && (
                <div
                  style={{
                    boxShadow:
                      'rgba(247, 59, 32, 0.12) 0px 12px 32px 0px, rgba(54, 8, 2, 0.08) 0px 2px 8px 0px',
                  }}
                  className="absolute right-0 mt-2.5 w-80 bg-[#ffffff] border border-[#e7dcdb] rounded-2xl z-50 overflow-hidden divide-y divide-[#e7dcdb]"
                >
                  <div className="p-4 bg-[#fdedea]/60">
                    <div className="flex items-center gap-3">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-11 h-11 rounded-full object-cover border border-[#f73b20]/40"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[#360802] text-sm truncate">
                          {currentUser.name}
                        </div>
                        <div className="text-xs text-[#74514b] truncate">
                          @{currentUser.username}
                        </div>
                        <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.04em] px-2.5 py-0.5 rounded-full bg-[#ffffff] text-[#f73b20] border border-[#e7dcdb]">
                          <ShieldCheck className="w-3 h-3" />
                          {currentUser.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {role === 'administrador' && (
                    <div className="p-3">
                      <div className="px-2 py-1 text-[11px] font-medium text-[#74514b] uppercase tracking-[0.04em] flex items-center gap-1.5">
                        <Settings className="w-3.5 h-3.5 text-[#f73b20]" />
                        <span>Administración & Ajustes</span>
                      </div>

                      <div className="mt-1.5 space-y-1">
                        <button
                          onClick={() => {
                            setActiveView('menu');
                            setProfilePanelOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                            activeView === 'menu'
                              ? 'bg-[#f73b20] text-white font-medium'
                              : 'text-[#360802] hover:bg-[#fdedea]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <BookOpen
                              className={`w-4 h-4 ${
                                activeView === 'menu' ? 'text-white' : 'text-[#f73b20]'
                              }`}
                            />
                            <div>
                              <div className="font-medium">Menú del Restaurante</div>
                              <div
                                className={`text-[10px] ${
                                  activeView === 'menu' ? 'text-white/80' : 'text-[#74514b]'
                                }`}
                              >
                                Platos, precios y disponibilidad
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
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                            activeView === 'gestion-mesas'
                              ? 'bg-[#f73b20] text-white font-medium'
                              : 'text-[#360802] hover:bg-[#fdedea]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <UtensilsCrossed
                              className={`w-4 h-4 ${
                                activeView === 'gestion-mesas' ? 'text-white' : 'text-[#f73b20]'
                              }`}
                            />
                            <div>
                              <div className="font-medium">Gestión de Mesas</div>
                              <div
                                className={`text-[10px] ${
                                  activeView === 'gestion-mesas' ? 'text-white/80' : 'text-[#74514b]'
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
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                            activeView === 'usuarios'
                              ? 'bg-[#f73b20] text-white font-medium'
                              : 'text-[#360802] hover:bg-[#fdedea]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Users
                              className={`w-4 h-4 ${
                                activeView === 'usuarios' ? 'text-white' : 'text-[#f73b20]'
                              }`}
                            />
                            <div>
                              <div className="font-medium">Personal y Accesos</div>
                              <div
                                className={`text-[10px] ${
                                  activeView === 'usuarios' ? 'text-white/80' : 'text-[#74514b]'
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
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                            activeView === 'versionamiento'
                              ? 'bg-[#f73b20] text-white font-medium'
                              : 'text-[#360802] hover:bg-[#fdedea]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <GitBranch
                              className={`w-4 h-4 ${
                                activeView === 'versionamiento' ? 'text-white' : 'text-[#f73b20]'
                              }`}
                            />
                            <div>
                              <div className="font-medium">Versionamiento & Histórico</div>
                              <div
                                className={`text-[10px] ${
                                  activeView === 'versionamiento' ? 'text-white/80' : 'text-[#74514b]'
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

                  <div className="p-3 bg-[#fdedea]/30">
                    <button
                      onClick={() => {
                        logout();
                        setProfilePanelOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#fb2d54] hover:bg-[#fdedea] transition-colors font-medium cursor-pointer"
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
      </div>

      {/* Mobile Navigation Sub-bar */}
      <div className="md:hidden flex items-center justify-around bg-[#ffffff] border-t border-[#e7dcdb] px-2 py-2 text-xs overflow-x-auto">
        {(role === 'mesero' || role === 'administrador') && (
          <>
            <button
              onClick={() => setActiveView('mesas')}
              className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap ${
                activeView === 'mesas' ? 'bg-[#f73b20] text-white' : 'text-[#360802]'
              }`}
            >
              Portada & Salón
            </button>
            <button
              onClick={() => setActiveView('nuevo-pedido')}
              className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap ${
                activeView === 'nuevo-pedido' ? 'bg-[#f73b20] text-white' : 'text-[#360802]'
              }`}
            >
              + Pedido {draftCount > 0 ? `(${draftCount})` : ''}
            </button>
          </>
        )}
        {(role === 'cocinero' || role === 'administrador') && (
          <button
            onClick={() => setActiveView('cocina')}
            className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap ${
              activeView === 'cocina' ? 'bg-[#f73b20] text-white' : 'text-[#360802]'
            }`}
          >
            Cocina {kitchenActiveCount > 0 ? `(${kitchenActiveCount})` : ''}
          </button>
        )}
        <button
          onClick={() => setActiveView('pedidos')}
          className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap ${
            activeView === 'pedidos' ? 'bg-[#f73b20] text-white' : 'text-[#360802]'
          }`}
        >
          Pedidos {readyCount > 0 ? `(${readyCount})` : ''}
        </button>
      </div>

      <Food3DModal isOpen={is3DModalOpen} onClose={() => setIs3DModalOpen(false)} />
    </header>
  );
};
