export type Rol = 'administrador' | 'mesero' | 'cocinero';
export type Estado = 'Pendiente' | 'En preparación' | 'Listo' | 'Entregado';
export type Usuario = { id_usuario: number; nombre_usuario: string; rol: Rol; activo: boolean };
export type Producto = {
  id_producto: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  disponible: boolean;
};
export type Mesa = { id_mesa: number; numero_mesa: number; estado: 'Disponible' | 'Ocupada' };
export type DetallePedido = {
  id_detalle: number;
  id_producto: number;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
};
export type Pedido = {
  id_pedido: number;
  id_mesa: number;
  id_usuario: number;
  fecha_pedido: string;
  estado: Estado;
  total: number;
  detalles: DetallePedido[];
};
export type PaginationMeta = {
  limit: number;
  offset: number;
  nextCursor?: number | null;
  hasMore: boolean;
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Deduplicación de peticiones GET en vuelo y caché en cliente con TTL
const inFlightRequests = new Map<string, Promise<unknown>>();
const clientResponseCache = new Map<string, { data: unknown; expiresAt: number }>();

export function invalidateApiCache(prefix = '/api/') {
  for (const key of clientResponseCache.keys()) {
    if (key.startsWith(prefix)) {
      clientResponseCache.delete(key);
    }
  }
}

interface RequestConfig extends RequestInit {
  timeoutMs?: number;
  cacheTtlMs?: number;
  bypassCache?: boolean;
}

export async function request<T>(path: string, options: RequestConfig = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const timeoutMs = options.timeoutMs ?? 6000;
  const cacheTtlMs = options.cacheTtlMs ?? 0;

  // 1. Si es una mutación, invalidar caché de cliente relacionada
  if (method !== 'GET') {
    const baseResource = path.split('/').slice(0, 3).join('/');
    invalidateApiCache(baseResource);
    if (path.startsWith('/api/pedidos')) {
      invalidateApiCache('/api/mesas');
    }
  }

  // 2. Retornar desde caché en cliente si está vigente
  if (method === 'GET' && cacheTtlMs > 0 && !options.bypassCache) {
    const cached = clientResponseCache.get(path);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data as T;
    }
  }

  // 3. Deduplicar peticiones GET idénticas que ya están en vuelo
  if (method === 'GET' && inFlightRequests.has(path)) {
    return inFlightRequests.get(path) as Promise<T>;
  }

  const headers: HeadersInit = {
    ...(options.body ? { 'content-type': 'application/json' } : {}),
    ...(options.headers || {}),
  };

  const fetchPromise = (async () => {
    let response: Response;
    try {
      response = await fetch(path, {
        ...options,
        method,
        headers,
        credentials: 'same-origin',
        signal: options.signal || AbortSignal.timeout(timeoutMs),
      });
    } catch (err: unknown) {
      const isTimeout =
        err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
      throw new ApiError(
        isTimeout ? 408 : 503,
        isTimeout
          ? `La petición a ${path} excedió el tiempo límite (${timeoutMs}ms).`
          : 'Sin conexión con el servidor. Verifica el estado de la operación antes de reintentar.'
      );
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new ApiError(response.status, data.error || 'No se pudo completar la operación');
    }

    if (method === 'GET' && cacheTtlMs > 0) {
      clientResponseCache.set(path, { data, expiresAt: Date.now() + cacheTtlMs });
    }
    return data as T;
  })();

  if (method === 'GET') {
    inFlightRequests.set(path, fetchPromise);
    fetchPromise.finally(() => {
      inFlightRequests.delete(path);
    });
  }

  return fetchPromise;
}

const json = (value: unknown) => JSON.stringify(value);

export const api = {
  auth: {
    login: (nombre_usuario: string, contrasena: string) =>
      request<{ usuario: Usuario }>('/api/auth/login', {
        method: 'POST',
        body: json({ nombre_usuario, contrasena }),
      }),
    me: () => request<{ usuario: Usuario }>('/api/auth/me', { cacheTtlMs: 5000 }),
    logout: () => request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
  },
  usuarios: {
    listar: (params?: { limit?: number; offset?: number; cursor?: number }) => {
      const qs = new URLSearchParams();
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.offset) qs.set('offset', String(params.offset));
      if (params?.cursor) qs.set('cursor', String(params.cursor));
      const query = qs.toString();
      return request<{ usuarios: Usuario[]; pagination?: PaginationMeta }>(
        `/api/usuarios${query ? `?${query}` : ''}`,
        { cacheTtlMs: 8000 }
      );
    },
    crear: (input: { nombre_usuario: string; contrasena: string; rol: Rol }) =>
      request('/api/usuarios', { method: 'POST', body: json(input) }),
    editar: (id: number, input: { nombre_usuario?: string; rol?: Rol }) =>
      request(`/api/usuarios/${id}`, { method: 'PATCH', body: json(input) }),
    desactivar: (id: number) => request(`/api/usuarios/${id}/desactivar`, { method: 'PATCH' }),
  },
  productos: {
    listar: (params?: { limit?: number; offset?: number; cursor?: number }) => {
      const qs = new URLSearchParams();
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.offset) qs.set('offset', String(params.offset));
      if (params?.cursor) qs.set('cursor', String(params.cursor));
      const query = qs.toString();
      return request<{ productos: Producto[]; pagination?: PaginationMeta }>(
        `/api/productos${query ? `?${query}` : ''}`,
        { cacheTtlMs: 12000 }
      );
    },
    crear: (input: { nombre: string; descripcion?: string | null; precio: number }) =>
      request('/api/productos', { method: 'POST', body: json(input) }),
    editar: (id: number, input: { nombre: string; descripcion?: string | null; precio: number }) =>
      request(`/api/productos/${id}`, { method: 'PUT', body: json(input) }),
    disponibilidad: (id: number, disponible: boolean) =>
      request(`/api/productos/${id}/disponibilidad`, {
        method: 'PATCH',
        body: json({ disponible }),
      }),
    eliminar: (id: number) => request(`/api/productos/${id}`, { method: 'DELETE' }),
  },
  mesas: {
    listar: (params?: { limit?: number; offset?: number }) => {
      const qs = new URLSearchParams();
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.offset) qs.set('offset', String(params.offset));
      const query = qs.toString();
      return request<{ mesas: Mesa[]; pagination?: PaginationMeta }>(
        `/api/mesas${query ? `?${query}` : ''}`,
        { cacheTtlMs: 4000 }
      );
    },
    crear: (numero_mesa: number) =>
      request('/api/mesas', { method: 'POST', body: json({ numero_mesa }) }),
    editar: (id: number, numero_mesa: number) =>
      request(`/api/mesas/${id}`, { method: 'PUT', body: json({ numero_mesa }) }),
    eliminar: (id: number) => request(`/api/mesas/${id}`, { method: 'DELETE' }),
  },
  pedidos: {
    listar: (estado?: Estado, params?: { limit?: number; offset?: number; cursor?: number }) => {
      const qs = new URLSearchParams();
      if (estado) qs.set('estado', estado);
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.offset) qs.set('offset', String(params.offset));
      if (params?.cursor) qs.set('cursor', String(params.cursor));
      const query = qs.toString();
      return request<{ pedidos: Pedido[]; pagination?: PaginationMeta }>(
        `/api/pedidos${query ? `?${query}` : ''}`,
        { cacheTtlMs: 2000 }
      );
    },
    detalle: (id: number) =>
      request<{ pedido: Pedido }>(`/api/pedidos/${id}`, { cacheTtlMs: 2000 }),
    crear: (
      id_mesa: number,
      items: { id_producto: number; cantidad: number }[],
      total_confirmado: number
    ) =>
      request<{ pedido: { id_pedido: number; id_mesa: number; estado: Estado; total: number } }>(
        '/api/pedidos',
        { method: 'POST', body: json({ id_mesa, items, total_confirmado }) }
      ),
    avanzar: (id: number, estado: Estado) =>
      request(`/api/pedidos/${id}/estado`, { method: 'PATCH', body: json({ estado }) }),
  },
};
