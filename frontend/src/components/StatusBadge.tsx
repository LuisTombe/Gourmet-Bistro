import React from 'react';
import { OrderStatus, TableStatus } from '../types/index.ts';

interface StatusBadgeProps {
  status: OrderStatus | TableStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  };

  const getStyle = () => {
    switch (status) {
      case 'Pendiente':
        return {
          bg: 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]',
          dot: 'bg-[#F59E0B]',
        };
      case 'En preparación':
        return {
          bg: 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]',
          dot: 'bg-[#3B82F6] animate-pulse',
        };
      case 'Listo':
        return {
          bg: 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]',
          dot: 'bg-[#10B981]',
        };
      case 'Entregado':
        return {
          bg: 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]',
          dot: 'bg-[#64748B]',
        };
      case 'Disponible':
        return {
          bg: 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]',
          dot: 'bg-[#10B981]',
        };
      case 'Ocupada':
        return {
          bg: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]',
          dot: 'bg-[#EF4444]',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700',
          dot: 'bg-slate-400',
        };
    }
  };

  const config = getStyle();

  return (
    <span
      className={`inline-flex items-center rounded-full transition-colors ${config.bg} ${sizeClasses[size]} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
      <span className="tracking-wide">{status}</span>
    </span>
  );
};
