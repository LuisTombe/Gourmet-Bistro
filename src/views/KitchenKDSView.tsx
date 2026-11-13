import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext.tsx';
import { Order } from '../types/index.ts';
import {
  ChefHat,
  Clock,
  Flame,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Check,
  RotateCw,
  Bell,
  Utensils,
} from 'lucide-react';

export const KitchenKDSView: React.FC = () => {
  const { orders, updateOrderStatus } = useRestaurant();
  const [now, setNow] = useState(Date.now());

  React.useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(interval);
  }, []);

  const getElapsed = (dateStr: string) => {
    const diff = Math.floor((now - new Date(dateStr).getTime()) / (1000 * 60));
    return Math.max(1, diff);
  };

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
        style={{ boxShadow: 'rgba(0, 0, 0, 0.05) 0px -4px 16px 0px' }}
        className={`rounded-2xl bg-[#ffffff] border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
          isOverdue
            ? 'border-[#fb2d54] ring-2 ring-[#fb2d54]/20'
            : order.status === 'Listo'
            ? 'border-[#34c771]'
            : order.status === 'En preparación'
            ? 'border-[#f73b20]'
            : 'border-[#e7dcdb]'
        }`}
      >
        {/* Ticket Header */}
        <div
          className={`p-4 border-b border-[#e7dcdb] flex items-center justify-between ${
            isOverdue
              ? 'bg-[#fdedea]'
              : order.status === 'Listo'
              ? 'bg-[#bcffbb]/55'
              : order.status === 'En preparación'
              ? 'bg-[#f5ffbb]/65'
              : 'bg-[#fdedea]/50'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-medium text-[#360802] tracking-tight">
                Mesa {order.tableNumber < 10 ? `0${order.tableNumber}` : order.tableNumber}
              </span>
              <span className="text-xs font-medium text-[#74514b]">
                #{order.id}
              </span>
            </div>
            <div className="text-[11px] text-[#74514b] mt-0.5">
              Atiende: <span className="font-medium text-[#360802]">{order.waiterName}</span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div
              className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium tabular-nums ${
                isOverdue
                  ? 'bg-[#fb2d54] text-white'
                  : 'bg-[#ffffff] text-[#360802] border border-[#e7dcdb]'
              }`}
            >
              <Clock className="w-3 h-3 text-[#f73b20]" />
              {elapsed} min
            </div>
            <span className="text-[10px] text-[#74514b] mt-1">
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Ticket Items Body */}
        <div className="p-4 space-y-2.5 flex-1">
          {order.notes && (
            <div className="p-2.5 rounded-xl bg-[#f5ffbb] border border-[#e7dcdb] text-xs text-[#360802] flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-[#f73b20] shrink-0 mt-0.5" />
              <span className="font-medium">{order.notes}</span>
            </div>
          )}

          <div className="space-y-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-[#fdedea]/45 border border-[#e7dcdb] flex flex-col gap-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-medium text-[#360802] flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-[#f73b20] text-white flex items-center justify-center text-xs font-medium shrink-0">
                      {item.quantity}
                    </span>
                    <span className="leading-snug">{item.productName}</span>
                  </div>
                </div>

                {item.notes && (
                  <div className="text-[11px] font-medium text-[#360802] bg-[#f5ffbb] px-2.5 py-0.5 rounded-lg flex items-center gap-1 mt-1">
                    <FileText className="w-3 h-3 text-[#f73b20]" />
                    <span>{item.notes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="p-4 bg-[#ffffff] border-t border-[#e7dcdb]">
          {order.status === 'Pendiente' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'En preparación')}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#f73b20] hover:bg-[#f84d35] text-white font-medium text-xs tracking-[0.02em] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4" />
              Iniciar Preparación
            </button>
          )}

          {order.status === 'En preparación' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'Listo')}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#34c771] hover:opacity-95 text-white font-medium text-xs tracking-[0.02em] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Marcar como Listo al Pase
            </button>
          )}

          {order.status === 'Listo' && (
            <div className="text-center py-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#360802] bg-[#bcffbb] px-4 py-1.5 rounded-full">
                <Check className="w-3.5 h-3.5 text-[#34c771]" />
                Listo en el pase · Esperando entrega
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Editorial KDS Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 border-b border-[#e7dcdb]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#f73b20] flex items-center justify-center text-white">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <span className="inline-block text-xs uppercase tracking-[0.05em] text-[#f73b20] font-medium mb-1">
              Línea de Fuego en Vivo
            </span>
            <h1 className="text-3xl sm:text-5xl font-medium tracking-[0.01em] text-[#360802] leading-[0.98]">
              Cocina KDS
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#fdedea] px-4 py-2 rounded-full border border-[#e7dcdb] text-xs text-[#360802] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#f73b20]" />
            <span>{activeOrders.length} comandas activas</span>
          </div>

          <button
            onClick={() => setNow(Date.now())}
            className="p-2.5 bg-[#ffffff] hover:bg-[#fdedea] text-[#360802] rounded-full border border-[#e7dcdb] transition-colors cursor-pointer"
            title="Refrescar tiempos"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3 Lane Editorial Kanban Flow */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lane 1: PENDIENTES */}
        <div className="space-y-4">
          <div className="bg-[#fdedea] p-4 rounded-2xl border border-[#e7dcdb] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f73b20]" />
              <h2 className="font-medium text-sm text-[#360802] tracking-[0.03em] uppercase">
                1. Pendientes
              </h2>
            </div>
            <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-[#ffffff] text-[#f73b20] border border-[#e7dcdb]">
              {pendientes.length}
            </span>
          </div>

          <div className="space-y-4">
            {pendientes.length === 0 ? (
              <div className="text-center py-12 bg-[#ffffff] rounded-2xl border border-dashed border-[#e7dcdb] text-[#74514b] text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-[#e7dcdb]" />
                <p className="font-medium text-[#360802]">Sin comandas pendientes</p>
                <p className="text-[11px] mt-0.5">Los nuevos pedidos aparecerán aquí.</p>
              </div>
            ) : (
              pendientes.map(renderTicketCard)
            )}
          </div>
        </div>

        {/* Lane 2: EN PREPARACIÓN */}
        <div className="space-y-4">
          <div className="bg-[#f5ffbb] p-4 rounded-2xl border border-[#e7dcdb] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#360802]" />
              <h2 className="font-medium text-sm text-[#360802] tracking-[0.03em] uppercase">
                2. En Preparación
              </h2>
            </div>
            <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-[#ffffff] text-[#360802] border border-[#e7dcdb]">
              {enPreparacion.length}
            </span>
          </div>

          <div className="space-y-4">
            {enPreparacion.length === 0 ? (
              <div className="text-center py-12 bg-[#ffffff] rounded-2xl border border-dashed border-[#e7dcdb] text-[#74514b] text-xs">
                <Utensils className="w-8 h-8 mx-auto mb-2 text-[#e7dcdb]" />
                <p className="font-medium text-[#360802]">Sin platos en fuego</p>
                <p className="text-[11px] mt-0.5">Avance un pedido pendiente al iniciar cocción.</p>
              </div>
            ) : (
              enPreparacion.map(renderTicketCard)
            )}
          </div>
        </div>

        {/* Lane 3: LISTOS AL PASE */}
        <div className="space-y-4">
          <div className="bg-[#bcffbb] p-4 rounded-2xl border border-[#e7dcdb] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#34c771]" />
              <h2 className="font-medium text-sm text-[#360802] tracking-[0.03em] uppercase">
                3. Listos al Pase
              </h2>
            </div>
            <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-[#ffffff] text-[#360802] border border-[#e7dcdb]">
              {listos.length}
            </span>
          </div>

          <div className="space-y-4">
            {listos.length === 0 ? (
              <div className="text-center py-12 bg-[#ffffff] rounded-2xl border border-dashed border-[#e7dcdb] text-[#74514b] text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 text-[#e7dcdb]" />
                <p className="font-medium text-[#360802]">Pase despejado</p>
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
