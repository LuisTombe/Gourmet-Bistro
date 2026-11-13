import { Order, OrderStatus, Product, Table, User, SystemVersionSnapshot } from '../types/index.ts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  // --- Health Check ---
  async checkHealth(): Promise<{ status: string; database: string }> {
    const res = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(res);
  },

  // --- Usuarios (Auth / Personal) ---
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE_URL}/users`);
    return handleResponse<User[]>(res);
  },

  async login(username: string): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    return handleResponse(res);
  },

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    return handleResponse<User>(res);
  },

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    return handleResponse<User>(res);
  },

  async toggleUserActive(id: number): Promise<{ id: number; active: boolean }> {
    const res = await fetch(`${API_BASE_URL}/users/${id}/toggle-active`, {
      method: 'PATCH',
    });
    return handleResponse(res);
  },

  // --- Mesas ---
  async getTables(): Promise<Table[]> {
    const res = await fetch(`${API_BASE_URL}/tables`);
    return handleResponse<Table[]>(res);
  },

  async createTable(table: Omit<Table, 'id'>): Promise<Table> {
    const res = await fetch(`${API_BASE_URL}/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(table),
    });
    return handleResponse<Table>(res);
  },

  async updateTable(id: number, table: Partial<Table>): Promise<Table> {
    const res = await fetch(`${API_BASE_URL}/tables/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(table),
    });
    return handleResponse<Table>(res);
  },

  async deleteTable(id: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/tables/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // --- Productos (Menú) ---
  async getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_BASE_URL}/products`);
    return handleResponse<Product[]>(res);
  },

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return handleResponse<Product>(res);
  },

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return handleResponse<Product>(res);
  },

  async toggleProductAvailability(id: number): Promise<{ id: number; available: boolean }> {
    const res = await fetch(`${API_BASE_URL}/products/${id}/toggle-availability`, {
      method: 'PATCH',
    });
    return handleResponse(res);
  },

  async deleteProduct(id: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // --- Pedidos (Orders & KDS) ---
  async getOrders(): Promise<Order[]> {
    const res = await fetch(`${API_BASE_URL}/orders`);
    return handleResponse<Order[]>(res);
  },

  async createOrder(
    tableId: number,
    userId: number,
    items: { productId: number; quantity: number; notes?: string }[],
    notes?: string
  ): Promise<{ success: boolean; order: Order }> {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId, userId, items, notes }),
    });
    return handleResponse(res);
  },

  async updateOrderStatus(
    orderId: number,
    status: OrderStatus
  ): Promise<{ success: boolean; orderId: number; status: OrderStatus }> {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  // --- Snapshots & Rollback (Fase 1 / Admin) ---
  async getSnapshots(): Promise<SystemVersionSnapshot[]> {
    const res = await fetch(`${API_BASE_URL}/snapshots`);
    return handleResponse<SystemVersionSnapshot[]>(res);
  },

  async createSnapshot(
    description: string,
    versionTag?: string,
    author?: string,
    authorRole?: string
  ): Promise<{ success: boolean; snapshot: SystemVersionSnapshot }> {
    const res = await fetch(`${API_BASE_URL}/snapshots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, versionTag, author, authorRole }),
    });
    return handleResponse(res);
  },

  async rollbackSnapshot(
    snapshotId: string
  ): Promise<{ success: boolean; message: string; versionTag: string }> {
    const res = await fetch(`${API_BASE_URL}/snapshots/${snapshotId}/rollback`, {
      method: 'POST',
    });
    return handleResponse(res);
  },
};
