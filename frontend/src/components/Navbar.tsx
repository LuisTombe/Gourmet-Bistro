import React, { useState, useEffect, useRef } from 'react';
import { useRestaurant } from '../context/RestaurantContext.tsx';
import { Food3DModal } from './3d/Food3DModal.tsx';
import { OptimizedImage } from './ui/OptimizedImage.tsx';
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
} from 'lucide-react';

export const Navbar: React.FC = React.memo(() => {
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
    <>
      <header className="bg-[#ffffff]/95 backdrop-blur-xl text-[#360802] border-b border-[#e7dcdb]/80 sticky top-0 z-40">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between min-h-[48px] gap-4">
          {/* Left: Clean Editorial Brand + Quiet Live Summary */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveView(role === 'cocinero' ? 'cocina' : 'mesas')}
              className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
              title="Ir a la portada principal"
            >
              <div className="w-9 h-9 rounded-full bg-[#f73b20] flex items-center justify-center text-white group-hover:scale-105 transition-transform shrink-0">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-xl tracking-tight text-[#360802]">
                Jeton<span className="text-[#f73b20]">Bistro</span>
              </span>
            </button>

            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-[#e7dcdb] text-xs text-[#74514b]">
              <span className="w-2 h-2 rounded-full bg-[#34c771]" />
              <span>{availableCount} mesas libres</span>
              {readyCount > 0 && (
                <span className="ml-2 px-2.5 py-0.5 rounded-full bg-[#fdedea] text-[#f73b20] font-medium">
                  {readyCount} {readyCount === 1 ? 'listo' : 'listos'}
                </span>
              )}
            </div>
          </div>

          {/* Center: Balanced Pill Navigation */}
          <nav
            aria-label="Navegación principal"
            className="hidden md:flex items-center gap-1 bg-[#fdedea]/55 p-1.5 rounded-full border border-[#e7dcdb]/80"
          >
            {(role === 'mesero' || role === 'administrador') && (
              <>
                <button
                  onClick={() => setActiveView('mesas')}
                  className={`px-4 py-2 rounded-full text-xs font-medium tracking-[0.01em] flex items-center gap-2 transition-all cursor-pointer ${
                    activeView === 'mesas'
                      ? 'bg-[#f73b20] text-white shadow-xs'
                      : 'text-[#360802]/80 hover:text-[#360802] hover:bg-[#ffffff]/80'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Portada & Salón</span>
                </button>

                <button
                  onClick={() => setActiveView('nuevo-pedido')}
                  className={`px-4 py-2 rounded-full text-xs font-medium tracking-[0.01em] flex items-center gap-2 transition-all cursor-pointer ${
                    activeView === 'nuevo-pedido'
                      ? 'bg-[#f73b20] text-white shadow-xs'
                      : 'text-[#360802]/80 hover:text-[#360802] hover:bg-[#ffffff]/80'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Nuevo Pedido</span>
                  {draftCount > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium leading-none ${
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
                className={`px-4 py-2 rounded-full text-xs font-medium tracking-[0.01em] flex items-center gap-2 transition-all cursor-pointer ${
                  activeView === 'cocina'
                    ? 'bg-[#f73b20] text-white shadow-xs'
                    : 'text-[#360802]/80 hover:text-[#360802] hover:bg-[#ffffff]/80'
                }`}
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span>KDS Cocina</span>
                {kitchenActiveCount > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium leading-none ${
                      activeView === 'cocina'
                        ? 'bg-white text-[#f73b20]'
                        : 'bg-[#360802]/10 text-[#360802]'
                    }`}
                  >
                    {kitchenActiveCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setActiveView('pedidos')}
              className={`px-4 py-2 rounded-full text-xs font-medium tracking-[0.01em] flex items-center gap-2 transition-all cursor-pointer ${
                activeView === 'pedidos'
                  ? 'bg-[#f73b20] text-white shadow-xs'
                  : 'text-[#360802]/80 hover:text-[#360802] hover:bg-[#ffffff]/80'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Pedidos</span>
            </button>

            {isSettingsActive && (
              <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#ffffff] text-[#360802] text-xs font-medium border border-[#e7dcdb]">
                <Sliders className="w-3.5 h-3.5 text-[#f73b20]" />
                <span>
                  {activeView === 'menu' && 'Menú'}
                  {activeView === 'gestion-mesas' && 'Mesas'}
                  {activeView === 'usuarios' && 'Personal'}
                  {activeView === 'versionamiento' && 'Versiones'}
                </span>
              </div>
            )}
          </nav>

          {/* Right: Quiet Secondary 3D Trigger + Profile Pill */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIs3DModalOpen(true)}
              className="px-4 py-2 rounded-full bg-[#fdedea] hover:bg-[#f73b20] text-[#f73b20] hover:text-white border border-[#f73b20]/20 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              title="Explorar platos gourmet en 3D interactivo"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Platos 3D</span>
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfilePanelOpen(!profilePanelOpen)}
                className={`flex items-center gap-2 py-1.5 pl-2 pr-3 rounded-full transition-all border cursor-pointer ${
                  profilePanelOpen
                    ? 'bg-[#fdedea] border-[#f73b20]'
                    : 'bg-[#ffffff] hover:bg-[#fdedea]/60 border-[#e7dcdb]'
                }`}
                title="Abrir perfil y administración"
                aria-expanded={profilePanelOpen}
              >
                <div className="w-7 h-7 rounded-full overflow-hidden border border-[#e7dcdb] shrink-0">
                  <OptimizedImage
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={currentUser.name}
                    width={28}
                    height={28}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="hidden sm:inline text-xs font-medium text-[#360802]">
                  {currentUser.name}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#74514b] transition-transform duration-200 ${
                    profilePanelOpen ? 'rotate-180 text-[#f73b20]' : ''
                  }`}
                />
              </button>

              {profilePanelOpen && (
                <div
                  style={{
                    boxShadow:
                      'rgba(247, 59, 32, 0.1) 0px 12px 32px 0px, rgba(54, 8, 2, 0.06) 0px 2px 8px 0px',
                  }}
                  className="absolute right-0 top-full mt-2.5 w-72 sm:w-80 max-h-[calc(100vh-5rem)] overflow-y-auto bg-[#ffffff] border border-[#e7dcdb] rounded-2xl z-[60] divide-y divide-[#e7dcdb]"
                >
                  <div className="p-4 bg-[#fdedea]/45">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-[#f73b20]/30 shrink-0">
                        <OptimizedImage
                          src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt={currentUser.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[#360802] text-sm truncate">
                          {currentUser.name}
                        </div>
                        <div className="text-xs text-[#74514b] truncate">
                          @{currentUser.username}
                        </div>
                        <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.04em] px-2 py-0.5 rounded-full bg-[#ffffff] text-[#f73b20] border border-[#e7dcdb]">
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
                        <span>Administración</span>
                      </div>

                      <div className="mt-1 space-y-1">
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
                            <span>Menú del Restaurante</span>
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
                            <span>Gestión de Mesas</span>
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
                            <span>Personal y Accesos</span>
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
                            <span>Versionamiento & Git</span>
                          </div>
                          {activeView === 'versionamiento' && <Check className="w-4 h-4 text-white" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="p-2.5 bg-[#fdedea]/25">
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
      <div className="md:hidden flex items-center justify-around bg-[#ffffff] border-t border-[#e7dcdb] px-3 py-2.5 text-xs overflow-x-auto gap-1">
        {(role === 'mesero' || role === 'administrador') && (
          <>
            <button
              onClick={() => setActiveView('mesas')}
              className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap ${
                activeView === 'mesas' ? 'bg-[#f73b20] text-white' : 'text-[#360802]'
              }`}
            >
              Salón
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
          Pedidos
        </button>
      </div>

      </header>

      <Food3DModal isOpen={is3DModalOpen} onClose={() => setIs3DModalOpen(false)} />
    </>
  );
});
