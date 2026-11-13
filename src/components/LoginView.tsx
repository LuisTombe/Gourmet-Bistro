import React, { useState, useRef } from 'react';
import { useRestaurant } from '../context/RestaurantContext.tsx';
import { FoodPlate3D, PLATES_3D_CATALOG, Plate3DMeta } from './3d/FoodPlate3D.tsx';
import { Food3DModal } from './3d/Food3DModal.tsx';
import {
  Shield,
  UserCheck,
  ChefHat,
  LogIn,
  Lock,
  User,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowDown,
  UtensilsCrossed,
  ShoppingBag,
  Plus,
  Minus,
  MousePointerClick,
  Globe,
  X,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, products, draftCart, addToDraftCart, updateDraftQuantity } = useRestaurant();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('AdminPass2026!');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlateIdx, setSelectedPlateIdx] = useState(0);
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const editorialSpreadRef = useRef<HTMLDivElement>(null);
  const loginSectionRef = useRef<HTMLDivElement>(null);

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

  const handleQuickLogin = async (u: string, p: string) => {
    setError(null);
    setUsername(u);
    setPassword(p);
    setIsSubmitting(true);
    try {
      const res = await login(u, p);
      if (!res.success) {
        setError(res.message || 'No se pudo iniciar sesión.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlate3DClick = (idx: number, _plate: Plate3DMeta) => {
    setSelectedPlateIdx(idx);
    setIs3DModalOpen(true);
  };

  const draftItemsCount = draftCart.reduce((acc, i) => acc + i.quantity, 0);
  const activePlate = PLATES_3D_CATALOG[selectedPlateIdx] || PLATES_3D_CATALOG[0];
  const activePlateProducts = products.filter((p) => p.category === activePlate.category);

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#360802] flex flex-col justify-between selection:bg-[#f73b20] selection:text-white">
      {/* =====================================================================
          1. PORTADA HERO JETON CON 5 MODELOS 3D GIRATORIOS DE PLATOS DE COMIDA
         ===================================================================== */}
      <div className="p-2.5 sm:p-4 lg:p-5">
        <section
          style={{
            background:
              'linear-gradient(132deg, #f36878 0%, #f66a55 34%, #f87d56 68%, #f8a27d 100%)',
          }}
          className="relative w-full min-h-[92vh] rounded-[28px] overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12 select-none"
        >
          {/* Full-Bleed 3D Cascading Food Plates Scene (Replaces the 5 Jeton Discs) */}
          <div className="absolute inset-0 z-10">
            <FoodPlate3D
              variant="hero"
              activeDishIndex={selectedPlateIdx}
              onDishChange={(idx) => setSelectedPlateIdx(idx)}
              onPlateClick={handlePlate3DClick}
              showControlsPill={false}
              className="w-full h-full"
            />
          </div>

          {/* Top Navigation Bar inside Hero (Exact Jeton Reference Layout) */}
          <header className="relative z-20 flex items-center justify-between gap-4 pointer-events-none">
            <div className="flex items-center gap-3 pointer-events-auto">
              <span className="text-3xl sm:text-4xl font-medium tracking-tight text-white">
                Jeton
              </span>
              <span className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium tracking-[0.03em]">
                <MousePointerClick className="w-3.5 h-3.5" />
                Haz clic en cualquier plato 3D para ver sus productos y pedir
              </span>
            </div>

            {/* Top-Right Jeton Pills: Language | Log in | Sign up / Quick POS */}
            <div className="flex items-center gap-2.5 pointer-events-auto">
              <button
                type="button"
                onClick={() =>
                  editorialSpreadRef.current?.scrollIntoView({ behavior: 'smooth' })
                }
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white text-xs font-medium tracking-[0.03em] transition-all cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>ES · COP</span>
              </button>

              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-xs font-medium tracking-[0.02em] transition-all cursor-pointer"
              >
                Log in
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'AdminPass2026!')}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#ffffff] hover:bg-[#fdedea] text-[#f73b20] text-xs font-medium tracking-[0.02em] transition-all shadow-xs cursor-pointer"
              >
                {isSubmitting ? 'Entrando...' : 'Entrar al POS'}
              </button>
            </div>
          </header>

          {/* Lower-Middle Oversized Editorial Headline + Right Subcopy & Dual Outline Pills */}
          <div className="relative z-20 mt-auto pt-44 sm:pt-56 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pointer-events-none">
            {/* Left: Massive Jeton Display Headline (100+ px scale, line-height 0.92) */}
            <div className="lg:col-span-7">
              <h1
                style={{
                  fontSize: 'clamp(3.4rem, 7.4vw, 6.75rem)',
                  lineHeight: 0.92,
                  letterSpacing: '-0.02em',
                }}
                className="font-medium text-white drop-shadow-[0_4px_24px_rgba(54,8,2,0.12)]"
              >
                One app
                <br />
                for all needs
              </h1>
            </div>

            {/* Right: Jeton Subcopy + Dual Glass Outline Action Buttons */}
            <div className="lg:col-span-5 lg:pl-10 space-y-5 pointer-events-auto">
              <p className="text-white text-lg sm:text-xl font-normal leading-[1.28] max-w-xs drop-shadow-[0_2px_12px_rgba(54,8,2,0.1)]">
                Single account for all your restaurant orders & 3D dishes.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIs3DModalOpen(true)}
                  className="px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/45 text-white text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <div className="text-left">
                    <div className="text-[9px] uppercase tracking-[0.06em] opacity-80">
                      Interactivo 3D
                    </div>
                    <div className="text-xs font-medium">Ver Platos & Pedir</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/45 text-white text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <div className="text-left">
                    <div className="text-[9px] uppercase tracking-[0.06em] opacity-80">
                      Acceso Roles
                    </div>
                    <div className="text-xs font-medium">Mesero · Cocina · Admin</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar inside Hero: ↓ Scroll (Left) | Jeton #f73b20 Orange Pill Dock (Center) | Pedido/Support Pill (Right) */}
          <div className="relative z-20 mt-8 pt-2 flex flex-wrap items-center justify-between gap-4">
            {/* Bottom-Left: ↓ Scroll Pill */}
            <button
              type="button"
              onClick={() =>
                editorialSpreadRef.current?.scrollIntoView({ behavior: 'smooth' })
              }
              className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>Scroll</span>
            </button>

            {/* Bottom-Center: Signature Jeton Signal Orange Floating Dock (#f73b20) */}
            <nav
              aria-label="Selección de platos 3D"
              className="flex items-center gap-1 p-1.5 rounded-full bg-[#f73b20] text-white shadow-[0_8px_24px_rgba(247,59,32,0.38)] border border-white/20 max-w-full overflow-x-auto"
            >
              {PLATES_3D_CATALOG.map((plate, idx) => (
                <button
                  key={plate.id}
                  type="button"
                  onClick={() => {
                    setSelectedPlateIdx(idx);
                    setIs3DModalOpen(true);
                  }}
                  className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    selectedPlateIdx === idx
                      ? 'bg-white text-[#f73b20]'
                      : 'text-white/95 hover:bg-white/15'
                  }`}
                >
                  {plate.shortName}
                </button>
              ))}
            </nav>

            {/* Bottom-Right: Active Order / Support Pill */}
            <button
              type="button"
              onClick={() => setIs3DModalOpen(true)}
              className="px-4 py-2.5 rounded-full bg-[#360802]/45 hover:bg-[#360802]/65 backdrop-blur-md border border-white/20 text-white text-xs font-medium flex items-center gap-2 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Pedido ({draftItemsCount})</span>
            </button>
          </div>
        </section>
      </div>

      {/* =====================================================================
          2. DOBLE PÁGINA EDITORIAL SOBRE LIENZO BLANCO (#ffffff)
             Muestra los productos exactos de cada plato 3D + Acceso al Sistema
         ===================================================================== */}
      <div
        ref={editorialSpreadRef}
        className="max-w-7xl w-full mx-auto px-6 py-20 sm:py-28 space-y-24"
      >
        {/* Editorial Spread Header & Interactive Plate Products */}
        <section className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end border-b border-[#e7dcdb] pb-10">
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium bg-[#fdedea] text-[#f73b20] tracking-[0.03em] mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Coherencia 3D · Del Plato Giratorio a la Comanda
              </span>
              <h2
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                  lineHeight: 0.96,
                  letterSpacing: '0.01em',
                }}
                className="font-medium text-[#360802]"
              >
                Cada plato 3D contiene los productos reales de tu pedido.
              </h2>
            </div>
            <div className="lg:col-span-4">
              <p className="text-base text-[#74514b] leading-relaxed">
                Haz clic en cualquiera de los 5 platos 3D de la portada o cámbialo aquí abajo para explorar e incluir sus productos en el flujo de pedido.
              </p>
            </div>
          </div>

          {/* 5 Plate Category Switcher Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {PLATES_3D_CATALOG.map((plate, idx) => (
              <button
                key={plate.id}
                type="button"
                onClick={() => setSelectedPlateIdx(idx)}
                className={`px-5 py-2.5 rounded-full text-xs font-medium tracking-[0.03em] transition-all cursor-pointer ${
                  selectedPlateIdx === idx
                    ? 'bg-[#f73b20] text-white'
                    : 'bg-[#fdedea] text-[#360802] hover:bg-[#f84d35] hover:text-white'
                }`}
              >
                Plato #{idx + 1} · {plate.shortName}
              </button>
            ))}
          </div>

          {/* Product Cards for the Selected 3D Plate */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activePlateProducts.map((product) => {
              const inCart = draftCart.find((i) => i.product.id === product.id);
              const qty = inCart ? inCart.quantity : 0;

              return (
                <div
                  key={product.id}
                  style={{ boxShadow: 'rgba(0, 0, 0, 0.05) 0px -4px 16px 0px' }}
                  className={`rounded-2xl bg-[#ffffff] border p-6 flex flex-col justify-between transition-all ${
                    qty > 0
                      ? 'border-[#f73b20] ring-2 ring-[#f73b20]/15'
                      : 'border-[#e7dcdb] hover:border-[#f84d35]'
                  }`}
                >
                  <div>
                    <div className="relative h-48 rounded-xl overflow-hidden mb-5 bg-[#fdedea]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-medium bg-[#ffffff]/95 text-[#360802]">
                        Esculpido en {activePlate.shortName} 3D
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xl font-medium text-[#360802] leading-snug">
                        {product.name}
                      </h3>
                      <span className="text-lg font-medium text-[#f73b20] shrink-0 tabular-nums">
                        ${product.price.toLocaleString('es-CO')}
                      </span>
                    </div>

                    <p className="text-sm text-[#74514b] mt-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#e7dcdb] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIs3DModalOpen(true)}
                      className="text-xs font-medium text-[#74514b] hover:text-[#f73b20] underline cursor-pointer"
                    >
                      Inspeccionar en 3D
                    </button>

                    {qty === 0 ? (
                      <button
                        type="button"
                        onClick={() => addToDraftCart(product, 1)}
                        className="px-4 py-2.5 rounded-xl bg-[#f73b20] hover:bg-[#f84d35] text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Agregar al pedido</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-[#fdedea] border border-[#f73b20]/40 rounded-xl px-2 py-1">
                        <button
                          type="button"
                          onClick={() => updateDraftQuantity(product.id, -1)}
                          className="w-7 h-7 rounded-lg bg-[#ffffff] text-[#f73b20] flex items-center justify-center hover:bg-[#f73b20] hover:text-white transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="min-w-[20px] text-center text-xs font-medium text-[#360802]">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateDraftQuantity(product.id, 1)}
                          className="w-7 h-7 rounded-lg bg-[#f73b20] text-white flex items-center justify-center hover:bg-[#f84d35] transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Role Access & Credentials Section */}
        <section
          ref={loginSectionRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-[#fdedea]/60 rounded-[28px] p-8 sm:p-12 border border-[#e7dcdb]"
        >
          <div className="lg:col-span-6 space-y-5">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-medium bg-[#f5ffbb] text-[#360802] tracking-[0.03em]">
              Infraestructura Operativa · 3 Microservicios + MySQL
            </span>
            <h2
              style={{
                fontSize: 'clamp(2.2rem, 4.2vw, 3.6rem)',
                lineHeight: 0.98,
              }}
              className="font-medium text-[#360802]"
            >
              Ingresa con un clic según tu rol operativo.
            </h2>
            <p className="text-base text-[#74514b] leading-relaxed">
              Los productos que hayas seleccionado desde los platos 3D se conservan automáticamente en tu comanda al iniciar sesión.
            </p>

            {/* 1-Click Role Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('carlos_m', 'MeseroPass2026!')}
                className="p-4 rounded-2xl bg-[#ffffff] hover:border-[#f73b20] border border-[#e7dcdb] text-left transition-all cursor-pointer"
              >
                <UserCheck className="w-5 h-5 text-[#f73b20] mb-2" />
                <div className="text-sm font-medium text-[#360802]">Mesero POS</div>
                <div className="text-xs text-[#74514b] mt-0.5">carlos_m</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('chef_mateo', 'CocinaPass2026!')}
                className="p-4 rounded-2xl bg-[#ffffff] hover:border-[#f73b20] border border-[#e7dcdb] text-left transition-all cursor-pointer"
              >
                <ChefHat className="w-5 h-5 text-[#f73b20] mb-2" />
                <div className="text-sm font-medium text-[#360802]">Cocina KDS</div>
                <div className="text-xs text-[#74514b] mt-0.5">chef_mateo</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'AdminPass2026!')}
                className="p-4 rounded-2xl bg-[#ffffff] hover:border-[#f73b20] border border-[#e7dcdb] text-left transition-all cursor-pointer"
              >
                <Shield className="w-5 h-5 text-[#f73b20] mb-2" />
                <div className="text-sm font-medium text-[#360802]">Administrador</div>
                <div className="text-xs text-[#74514b] mt-0.5">admin</div>
              </button>
            </div>
          </div>

          {/* Login Form Card */}
          <div className="lg:col-span-6 max-w-md w-full mx-auto">
            <div
              style={{ boxShadow: 'rgba(0, 0, 0, 0.05) 0px -4px 16px 0px' }}
              className="bg-[#ffffff] rounded-2xl p-6 sm:p-8 border border-[#e7dcdb]"
            >
              <h3 className="text-2xl font-medium text-[#360802] mb-1">
                Acceso con Credenciales
              </h3>
              <p className="text-xs text-[#74514b] mb-6">
                Autenticación JWT HttpOnly contra ms-usuarios (:4001)
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3.5 rounded-2xl bg-[#fdedea] border border-[#fb2d54]/40 text-[#360802] text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-[#fb2d54] shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[#360802] mb-1.5">
                    Usuario
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#74514b]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin, carlos_m, chef_mateo"
                      className="w-full pl-10 pr-4 py-3 bg-[#fdedea]/50 border border-[#e7dcdb] rounded-2xl text-[#360802] text-sm focus:outline-none focus:border-[#f73b20] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#360802] mb-1.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#74514b]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-[#fdedea]/50 border border-[#e7dcdb] rounded-2xl text-[#360802] text-sm focus:outline-none focus:border-[#f73b20] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[48px] py-3.5 px-5 rounded-xl text-white bg-[#f73b20] hover:bg-[#f84d35] font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Iniciar Sesión en Jeton POS
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>

      {/* Modal Rápido de Login si se pulsa "Log in" arriba */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#360802]/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#ffffff] rounded-2xl max-w-md w-full p-6 sm:p-8 border border-[#e7dcdb] relative">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#fdedea] text-[#360802] flex items-center justify-center hover:bg-[#f73b20] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-2xl font-medium text-[#360802] mb-1">Iniciar Sesión</h3>
            <p className="text-xs text-[#74514b] mb-5">
              Selecciona un perfil rápido o ingresa tus credenciales:
            </p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              <button
                type="button"
                onClick={() => handleQuickLogin('carlos_m', 'MeseroPass2026!')}
                className="p-2.5 rounded-xl bg-[#fdedea] hover:bg-[#f73b20] hover:text-white text-[#360802] text-xs font-medium text-center transition-colors cursor-pointer"
              >
                Mesero
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('chef_mateo', 'CocinaPass2026!')}
                className="p-2.5 rounded-xl bg-[#fdedea] hover:bg-[#f73b20] hover:text-white text-[#360802] text-xs font-medium text-center transition-colors cursor-pointer"
              >
                Cocina
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'AdminPass2026!')}
                className="p-2.5 rounded-xl bg-[#fdedea] hover:bg-[#f73b20] hover:text-white text-[#360802] text-xs font-medium text-center transition-colors cursor-pointer"
              >
                Admin
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuario"
                className="w-full px-4 py-3 bg-[#fdedea]/50 border border-[#e7dcdb] rounded-2xl text-[#360802] text-sm focus:outline-none focus:border-[#f73b20]"
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full px-4 py-3 bg-[#fdedea]/50 border border-[#e7dcdb] rounded-2xl text-[#360802] text-sm focus:outline-none focus:border-[#f73b20]"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#f73b20] hover:bg-[#f84d35] text-white text-sm font-medium cursor-pointer"
              >
                {isSubmitting ? 'Verificando...' : 'Entrar al Sistema'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Interactive 3D Plate Products Modal */}
      <Food3DModal
        isOpen={is3DModalOpen}
        onClose={() => setIs3DModalOpen(false)}
        initialDishIndex={selectedPlateIdx}
      />
    </div>
  );
};
