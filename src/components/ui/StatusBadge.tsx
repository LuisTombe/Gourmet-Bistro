import React from 'react';
import { Clock, ChefHat, CheckCircle2, CheckCheck, CircleDot } from 'lucide-react';

export type BadgeStatus =
  | 'Pendiente'
  | 'En preparación'
  | 'Listo'
  | 'Entregado'
  | 'Disponible'
  | 'Ocupada'
  | string;

const statusStyles: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  'Pendiente': {
    bg: 'bg-[#FFF7ED]',
    text: 'text-[#C2410C]',
    border: 'border-[#FDBA74]',
    icon: <Clock className="w-3.5 h-3.5 text-[#C2410C]" />,
  },
  'En preparación': {
    bg: 'bg-[#DBEAFE]',
    text: 'text-[#1D4ED8]',
    border: 'border-[#93C5FD]',
    icon: <ChefHat className="w-3.5 h-3.5 text-[#1D4ED8] animate-pulse" />,
  },
  'Listo': {
    bg: 'bg-[#DCFCE7]',
    text: 'text-[#15803D]',
    border: 'border-[#86EFAC]',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />,
  },
  'Entregado': {
    bg: 'bg-[#F5F5F4]',
    text: 'text-[#57534E]',
    border: 'border-[#E7E5E4]',
    icon: <CheckCheck className="w-3.5 h-3.5 text-[#78716C]" />,
  },
  'Disponible': {
    bg: 'bg-[#DCFCE7]',
    text: 'text-[#15803D]',
    border: 'border-[#86EFAC]',
    icon: <CircleDot className="w-3 h-3 text-[#15803D] fill-[#15803D]" />,
  },
  'Ocupada': {
    bg: 'bg-[#FFF7ED]',
    text: 'text-[#C2410C]',
    border: 'border-[#FED7AA]',
    icon: <CircleDot className="w-3 h-3 text-[#C2410C] fill-[#C2410C] animate-pulse" />,
  },
};

interface StatusBadgeProps {
  status: BadgeStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const config = statusStyles[status] || {
    bg: 'bg-[#fdedea]',
    text: 'text-[#360802]',
    border: 'border-[#e7dcdb]',
    icon: null,
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border tracking-wide transition-colors ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      {showIcon && config.icon}
      <span>{status}</span>
    </span>
  );
};
