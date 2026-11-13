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
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
  },
  'En preparación': {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: <ChefHat className="w-3.5 h-3.5 text-blue-600 animate-pulse" />,
  },
  'Listo': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
  },
  'Entregado': {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    icon: <CheckCheck className="w-3.5 h-3.5 text-slate-500" />,
  },
  'Disponible': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: <CircleDot className="w-3 h-3 text-emerald-500 fill-emerald-500" />,
  },
  'Ocupada': {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: <CircleDot className="w-3 h-3 text-amber-500 fill-amber-500 animate-pulse" />,
  },
};

export const StatusBadge: React.FC<{ status: BadgeStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  const current = statusStyles[status] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    icon: null,
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
    >
      {current.icon}
      <span>{status}</span>
    </span>
  );
};
