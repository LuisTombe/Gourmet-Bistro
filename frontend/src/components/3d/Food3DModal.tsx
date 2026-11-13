import React, { useState } from 'react';
import { FoodPlate3D, DISHES } from './FoodPlate3D.tsx';
import { X, Sparkles, ChefHat, Info, Check } from 'lucide-react';

interface Food3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDishIndex?: number;
}

export const Food3DModal: React.FC<Food3DModalProps> = ({
  isOpen,
  onClose,
  initialDishIndex = 0,
}) => {
  const [selectedDishIdx, setSelectedDishIdx] = useState(initialDishIndex);

  if (!isOpen) return null;

  const currentDish = DISHES[selectedDishIdx] || DISHES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#e7dcdb] flex flex-col md:flex-row max-h-[90vh]">
        {/* Left Side: 3D Canvas on Jeton Warm Coral Gradient */}
        <div className="relative md:w-3/5 h-80 md:h-auto min-h-[380px] bg-gradient-to-br from-[#f73b20] via-[#f84d35] to-[#ffbfae] flex items-center justify-center overflow-hidden">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute inset-0 bg-radial from-white/20 to-transparent pointer-events-none" />

          {/* 3D Scene */}
          <FoodPlate3D
            variant="interactive"
            activeDishIndex={selectedDishIdx}
            onDishChange={(idx) => setSelectedDishIdx(idx)}
            className="w-full h-full"
          />

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 z-30 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Right Side: Editorial Dish Card & Details */}
        <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between bg-white text-[#360802]">
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fdedea] text-[#f73b20] border border-[#f73b20]/20">
                <ChefHat className="w-3.5 h-3.5" />
                Alta Gastronomía 3D
              </span>

              <button
                onClick={onClose}
                className="hidden md:flex p-1.5 rounded-full text-[#ababab] hover:text-[#360802] hover:bg-[#fdedea] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#360802] leading-tight">
              {currentDish.name}
            </h3>

            <div className="mt-2 text-2xl font-black text-[#f73b20] tabular-nums">
              {currentDish.price}
            </div>

            <p className="mt-3 text-sm text-[#360802]/80 leading-relaxed">
              {currentDish.description}
            </p>

            <div className="mt-6 space-y-2.5 pt-4 border-t border-[#e7dcdb]">
              <div className="flex items-center gap-2 text-xs text-[#360802]/70">
                <Check className="w-4 h-4 text-[#34c771] shrink-0" />
                <span>Presentación en porcelana de hueso con borde dorado</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#360802]/70">
                <Check className="w-4 h-4 text-[#34c771] shrink-0" />
                <span>Cocción al punto validada por estándar KDS de cocina</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#360802]/70">
                <Check className="w-4 h-4 text-[#34c771] shrink-0" />
                <span>Ingredientes de estación y reducción artesanal</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#e7dcdb] flex items-center justify-between gap-3">
            <span className="text-xs text-[#ababab]">Interactúa moviendo el cursor</span>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#f73b20] hover:bg-[#e02f17] text-white text-xs font-bold transition-all shadow-md shadow-[#f73b20]/20 cursor-pointer min-h-[44px]"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
