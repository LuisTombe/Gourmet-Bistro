import React from 'react';
import { PlateMeta, PLATES_CATALOG } from '../../data/platesCatalog.ts';
import { OptimizedImage } from '../ui/OptimizedImage.tsx';
import { Sparkles, Utensils, Eye } from 'lucide-react';

interface FoodPlateShowcaseProps {
  activeDishIndex?: number;
  onDishChange?: (index: number) => void;
  onPlateClick?: (index: number, plate: PlateMeta) => void;
  className?: string;
  variant?: 'hero' | 'interactive';
  showControlsPill?: boolean;
}

/**
 * Componente 2D de exhibición visual de platos de alta cocina:
 * - Sustituye el canvas WebGL Three.js con imágenes 2D de alta resolución.
 * - Disposición escalonada/cascada con sombras suaves y animaciones CSS optimizadas.
 * - Hover con ampliación suave (scale-105) sin reprocesamiento de GPU.
 * - Totalmente responsive y ligero para dispositivos de bajos recursos.
 */
export const FoodPlateShowcase: React.FC<FoodPlateShowcaseProps> = ({
  activeDishIndex = 0,
  onDishChange,
  onPlateClick,
  className = '',
  variant = 'hero',
}) => {
  const currentPlate = PLATES_CATALOG[activeDishIndex] || PLATES_CATALOG[0];

  const handleSelect = (idx: number, plate: PlateMeta) => {
    if (onDishChange) onDishChange(idx);
    if (onPlateClick) onPlateClick(idx, plate);
  };

  if (variant === 'interactive') {
    // Modo visor detallado dentro del modal
    return (
      <div className={`relative w-full h-full flex flex-col items-center justify-center p-6 ${className}`}>
        {/* Glow de fondo temático */}
        <div
          className="absolute w-72 h-72 rounded-full blur-3xl opacity-35 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: currentPlate.colorAccent }}
        />

        {/* Imagen central del plato en gran formato con agrandamiento suave al hover */}
        <div className="relative group cursor-pointer" onClick={() => handleSelect(activeDishIndex, currentPlate)}>
          <div className="w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-full p-2.5 bg-white/20 backdrop-blur-md border-2 border-white/40 shadow-2xl transition-transform duration-500 ease-out group-hover:scale-105">
            <div className="w-full h-full rounded-full overflow-hidden shadow-inner bg-slate-900/10">
              <OptimizedImage
                src={currentPlate.image}
                alt={currentPlate.name}
                width={400}
                height={400}
                priority
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
            </div>
          </div>

          {/* Badge flotante al pasar el cursor */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/95 text-[#C2410C] text-[11px] font-semibold tracking-wide shadow-md flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
            <Eye className="w-3.5 h-3.5" />
            <span>Haz clic para explorar menú</span>
          </div>
        </div>

        {/* Metadatos y esculturas culinarias */}
        <div className="relative z-10 mt-6 text-center max-w-sm">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/25 backdrop-blur-md text-white text-xs font-medium border border-white/30">
            <Sparkles className="w-3 h-3 text-amber-200" />
            {currentPlate.station} · {currentPlate.category}
          </span>
          <h3 className="mt-2 text-xl font-medium text-white tracking-tight drop-shadow-sm">
            {currentPlate.shortName}
          </h3>
          <p className="mt-1 text-xs text-white/85 line-clamp-2 leading-relaxed">
            {currentPlate.subtitle}
          </p>
        </div>
      </div>
    );
  }

  // Modo Hero principal: Despliegue horizontal centrado exactamente en el tercio medio superior libre, sin tocar el header superior ni los textos inferiores
  return (
    <div className={`relative w-full h-full overflow-hidden flex items-center justify-center ${className}`}>
      {/* Resplandor ambiental de fondo */}
      <div className="absolute inset-0 flex items-center justify-around pointer-events-none opacity-20">
        <div className="w-72 h-72 rounded-full bg-white/20 blur-3xl" />
        <div className="w-80 h-80 rounded-full bg-white/15 blur-3xl" />
      </div>

      {/* Riel horizontal que distribuye los platos en el tercio superior despejado */}
      <div className="relative w-full max-w-4xl -translate-y-20 lg:-translate-y-28 flex items-center justify-between px-4 sm:px-8">
        {PLATES_CATALOG.map((plate, idx) => {
          const isActive = idx === activeDishIndex;
          // Distribución horizontal con solapamiento armónico de anillos (-18% de solape visual)
          const zIndex = isActive ? 30 : 15 + idx;

          return (
            <div
              key={plate.id}
              onClick={() => handleSelect(idx, plate)}
              style={{ zIndex }}
              className="relative -mx-2 sm:-mx-3.5 lg:-mx-5 cursor-pointer transition-all duration-300 ease-out group"
            >
              {/* Aro/Plato exterior translúcido con efecto Jeton glassmorphism */}
              <div
                className={`relative rounded-full p-1.5 sm:p-2 lg:p-2.5 bg-white/20 backdrop-blur-md border-2 border-white/50 shadow-xl transition-all duration-300 ease-out group-hover:scale-110 group-hover:z-40 ${
                  isActive
                    ? 'ring-4 ring-white scale-108 shadow-[0_16px_36px_rgba(54,8,2,0.3)]'
                    : 'opacity-90 hover:opacity-100 hover:shadow-[0_12px_28px_rgba(54,8,2,0.2)]'
                }`}
              >
                {/* Plato cerámico con relieve sutil y tamaño equilibrado para no tocar el header ni el texto */}
                <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full p-1.5 sm:p-2 bg-gradient-to-br from-[#ffffff] via-[#faf5f4] to-[#ece1df] shadow-inner flex items-center justify-center">
                  <div className="w-full h-full rounded-full overflow-hidden border border-[#e7dcdb] shadow-sm relative bg-[#360802]/5">
                    <OptimizedImage
                      src={plate.image}
                      alt={plate.name}
                      width={180}
                      height={180}
                      priority={idx <= 2}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-115"
                    />

                    {/* Overlay interactivo al hover */}
                    <div className="absolute inset-0 bg-[#292524]/0 group-hover:bg-[#292524]/25 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded-full bg-white/95 text-[#C2410C] text-[10px] font-bold shadow-md flex items-center gap-1">
                        <Utensils className="w-2.5 h-2.5" />
                        Ver
                      </span>
                    </div>
                  </div>
                </div>

                {/* Etiqueta flotante con el nombre del plato */}
                <div
                  className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold whitespace-nowrap shadow-sm border transition-all ${
                    isActive
                      ? 'bg-[#ffffff] text-[#C2410C] border-[#C2410C]/40'
                      : 'bg-white/90 text-[#292524] border-white/70 group-hover:bg-white'
                  }`}
                >
                  {plate.shortName}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Aliases para retrocompatibilidad total sin romper imports existentes
export const FoodPlate2D = FoodPlateShowcase;
export const FoodPlate3D = FoodPlateShowcase;
