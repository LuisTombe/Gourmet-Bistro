import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext.tsx';
import { Order, OrderStatus } from '../types/index.ts';
import { StatusBadge } from '../components/ui/StatusBadge.tsx';
import {
  ChefHat,
  Clock,
  Flame,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Filter,
  Check,
  RotateCw,
  Bell,
  Utensils,
} from 'lucide-react';

export const KitchenKDSView: React.FC = () => {
  const { orders, updateOrderStatus, currentUser } = useRestaurant();
  const [stationFilter, setStationFilter] = useState<string>('all');
  const [now, setNow] = useState(Date.now());

  // Periodically refresh now to update elapsed timers
  React.useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(interval);
  }, []);

  const getElapsed = (dateStr: string) => {
    const diff = Math.floor((now - new Date(dateStr).getTime()) / (1000 * 60));
    return Math.max(1, diff);
  };

  // Only active kitchen orders
  const activeOrders = orders.filter(
    (o) => o.status === 'Pendiente' || o.status === 'En preparación' || o.status === 'Listo'
  );

  const pendientes = activeOrders.filter((o) => o.status === 'Pendiente');
  const enPreparacion = activeOrders.filter((o) => o.status === 'En preparación');
  const listos = activeOrders.filter((o) => o.status === 'Listo');

  const renderTicketCard = (order: Order) => {
    const elapsed = getElapsed(order.createdAt);
    const isOverdue = elapsed >= 20;

    return (
      <div
        key={order.id}
        className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-lg flex flex-col justify-between ${
          isOverdue
            ? 'bg-[#1E293B] border-rose-500 ring-2 ring-rose-500/30'
            : order.status === 'Listo'
            ? 'bg-[#1E293B] border-emerald-500/60'
            : order.status === 'En preparación'
            ? 'bg-[#1E293B] border-blue-500/50'
            : 'bg-[#1E293B] border-amber-500/40'
        }`}
      >
        {/* Ticket Top Header */}
        <div
          className={`p-3.5 border-b flex items-center justify-between ${
            isOverdue
              ? 'bg-rose-950/60 border-rose-900/60 text-rose-200'
              : 'bg-slate-900/80 border-slate-800 text-slate-200'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-white tracking-tight">
                Mesa {order.tableNumber < 10 ? `0${order.tableNumber}` : order.tableNumber}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                #{order.id}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Mesero: <strong className="text-slate-300">{order.waiterName.split(' ')[0]}</strong>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div
              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-extrabold tabular-nums ${
                isOverdue
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              <Clock className="w-3 h-3" />
              {elapsed}m
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5">
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Ticket Items Body */}
        <div className="p-3.5 space-y-2.5 flex-1">
          {order.notes && (
            <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-200 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span className="font-medium">{order.notes}</span>
            </div>
          )}

          <div className="space-y-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#EA580C] text-white flex items-center justify-center text-xs font-black shrink-0">
                      {item.quantity}
                    </span>
                    <span className="leading-snug">{item.productName}</span>
                  </div>
                </div>

                {item.notes && (
                  <div className="text-[11px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-900/60 px-2 py-0.5 rounded flex items-center gap-1 mt-0.5">
                    <FileText className="w-3 h-3 text-amber-500" />
                    <span>{item.notes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="p-3 bg-slate-900/90 border-t border-slate-800">
          {order.status === 'Pendiente' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'En preparación')}
              className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-extrabold text-xs tracking-wide flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              Iniciar Preparación
            </button>
          )}

          {order.status === 'En preparación' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'Listo')}
              className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold text-xs tracking-wide flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Marcar como Listo al Pase
            </button>
          )}

          {order.status === 'Listo' && (
            <div className="text-center py-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-3 py-1.5 rounded-full">
                <Check className="w-3.5 h-3.5" />
                Listo en el pase • Esperando entrega
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0F172A] text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* KDS Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#EA580C] to-[#D97706] flex items-center justify-center text-white shadow-lg shadow-orange-950/40">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                KDS • Pantalla de Cocina
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Línea en Vivo
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Gestión visual de tickets por estación. Actualización de estados para meseros.
            </p>
          </div>
        </div>

        {/* Live Metrics */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1E293B] px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-slate-300">
              {activeOrders.length} tickets activos
            </span>
          </div>

          <button
            onClick={() => setNow(Date.now())}
            className="p-2 bg-[#1E293B] hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
            title="Refrescar vista"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3 Lane Kanban Flow (Pendiente, En Preparación, Listo) */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lane 1: PENDIENTES */}
        <div className="space-y-4">
          <div className="bg-[#1E293B] p-3.5 rounded-2xl border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <h2 className="font-black text-sm text-amber-400 tracking-wide uppercase">
                1. Pendientes
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {pendientes.length}
            </span>
          </div>

          <div className="space-y-4">
            {pendientes.length === 0 ? (
              <div className="text-center py-12 bg-[#1E293B]/40 rounded-2xl border border-dashed border-slate-800 text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="font-semibold text-slate-400">Sin comandas pendientes</p>
                <p className="text-[11px] mt-0.5">Los nuevos pedidos aparecerán aquí.</p>
              </div>
            ) : (
              pendientes.map(renderTicketCard)
            )}
          </div>
        </div>

        {/* Lane 2: EN PREPARACIÓN */}
        <div className="space-y-4">
          <div className="bg-[#1E293B] p-3.5 rounded-2xl border border-blue-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#3B82F6] animate-pulse" />
              <h2 className="font-black text-sm text-blue-400 tracking-wide uppercase">
                2. En Preparación
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {enPreparacion.length}
            </span>
          </div>

          <div className="space-y-4">
            {enPreparacion.length === 0 ? (
              <div className="text-center py-12 bg-[#1E293B]/40 rounded-2xl border border-dashed border-slate-800 text-slate-500 text-xs">
                <Utensils className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="font-semibold text-slate-400">Sin platos en línea de fuego</p>
                <p className="text-[11px] mt-0.5">Avance un pedido pendiente al iniciar la cocción.</p>
              </div>
            ) : (
              enPreparacion.map(renderTicketCard)
            )}
          </div>
        </div>

        {/* Lane 3: LISTOS AL PASE */}
        <div className="space-y-4">
          <div className="bg-[#1E293B] p-3.5 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#10B981]" />
              <h2 className="font-black text-sm text-emerald-400 tracking-wide uppercase">
                3. Listos al Pase
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {listos.length}
            </span>
          </div>

          <div className="space-y-4">
            {listos.length === 0 ? (
              <div className="text-center py-12 bg-[#1E293B]/40 rounded-2xl border border-dashed border-slate-800 text-slate-500 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="font-semibold text-slate-400">Pase despejado</p>
                <p className="text-[11px] mt-0.5">Los platos listos para servir se mostrarán aquí.</p>
              </div>
            ) : (
              listos.map(renderTicketCard)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
