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
    bg: 'bg-[#fdedea]',
    text: 'text-[#f73b20]',
    border: 'border-[#f84d35]/30',
    icon: <Clock className="w-3.5 h-3.5 text-[#f73b20]" />,
  },
  'En preparación': {
    bg: 'bg-[#eaf0ff]',
    text: 'text-[#477ee9]',
    border: 'border-[#477ee9]/30',
    icon: <ChefHat className="w-3.5 h-3.5 text-[#477ee9] animate-pulse" />,
  },
  'Listo': {
    bg: 'bg-[#e6fbf0]',
    text: 'text-[#16774d]',
    border: 'border-[#34c771]/40',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#34c771]" />,
  },
  'Entregado': {
    bg: 'bg-[#f4f4f4]',
    text: 'text-[#360802]/80',
    border: 'border-[#e7dcdb]',
    icon: <CheckCheck className="w-3.5 h-3.5 text-[#ababab]" />,
  },
  'Disponible': {
    bg: 'bg-[#e6fbf0]',
    text: 'text-[#16774d]',
    border: 'border-[#34c771]/40',
    icon: <CircleDot className="w-3 h-3 text-[#34c771] fill-[#34c771]" />,
  },
  'Ocupada': {
    bg: 'bg-[#fdedea]',
    text: 'text-[#f73b20]',
    border: 'border-[#f84d35]/30',
    icon: <CircleDot className="w-3 h-3 text-[#f73b20] fill-[#f73b20] animate-pulse" />,
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
