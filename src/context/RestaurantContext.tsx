import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, OrderItem, OrderStatus, Product, Table, TableStatus, User, UserRole } from '../types/index.ts';
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_TABLES,
  INITIAL_ORDERS,
} from '../data/mockData.ts';
import {
  calculateOrderTotal,
  calculateSubtotal,
  canDeleteProduct,
  canDeleteTable,
  canTransitionOrderStatus,
  computeTableStatus,
} from '../domain/rules.ts';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface RestaurantContextType {
  currentUser: User | null;
  users: User[];
  products: Product[];
  tables: Table[];
  orders: Order[];
  activeView: string;
  selectedTableForOrder: Table | null;
  toasts: ToastNotification[];
  setActiveView: (view: string) => void;
  setSelectedTableForOrder: (table: Table | null) => void;
  login: (username: string) => { success: boolean; message?: string };
  logout: () => void;
  switchUser: (userId: number) => void;
  createOrder: (
    tableId: number,
    items: { productId: number; quantity: number; notes?: string }[],
    notes?: string
  ) => { success: boolean; orderId?: number; error?: string };
  updateOrderStatus: (
    orderId: number,
    nextStatus: OrderStatus
  ) => { success: boolean; error?: string };
  addProduct: (product: Omit<Product, 'id'>) => { success: boolean; error?: string };
  updateProduct: (id: number, product: Partial<Product>) => { success: boolean; error?: string };
  toggleProductAvailability: (id: number) => void;
  deleteProduct: (id: number) => { success: boolean; error?: string };
  addTable: (table: Omit<Table, 'id'>) => { success: boolean; error?: string };
  updateTable: (id: number, table: Partial<Table>) => { success: boolean; error?: string };
  deleteTable: (id: number) => { success: boolean; error?: string };
  addUser: (user: Omit<User, 'id'>) => { success: boolean; error?: string };
  updateUser: (id: number, user: Partial<User>) => { success: boolean; error?: string };
  toggleUserActive: (id: number) => void;
  getTableStatus: (tableId: number) => TableStatus;
  getActiveOrder: (tableId: number) => Order | undefined;
  dismissToast: (id: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  resetToDefaults: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | null>(null);

const STORAGE_KEYS = {
  USERS: 'bistro_pos_users',
  PRODUCTS: 'bistro_pos_products',
  TABLES: 'bistro_pos_tables',
  ORDERS: 'bistro_pos_orders',
  CURRENT_USER_ID: 'bistro_pos_current_user_id',
};

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [tables, setTables] = useState<Table[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TABLES);
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (savedId) {
      const found = INITIAL_USERS.find((u) => u.id === Number(savedId));
      if (found && found.active) return found;
    }
    // Default to mesero so user can test POS immediately, or null if on login
    return INITIAL_USERS[1]; // Carlos Mendoza (mesero)
  });

  const [activeView, setActiveView] = useState<string>('mesas');
  const [selectedTableForOrder, setSelectedTableForOrder] = useState<Table | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, String(currentUser.id));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  }, [currentUser]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const login = (username: string) => {
    const user = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!user) {
      return { success: false, message: 'Usuario no encontrado. Ingrese admin, mesero o cocina.' };
    }
    if (!user.active) {
      return { success: false, message: 'Esta cuenta ha sido desactivada por el administrador.' };
    }
    setCurrentUser(user);
    if (user.role === 'cocinero') {
      setActiveView('cocina');
    } else if (user.role === 'administrador') {
      setActiveView('mesas');
    } else {
      setActiveView('mesas');
    }
    showToast(`Bienvenido al sistema, ${user.name}`, 'success');
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveView('login');
    showToast('Sesión cerrada correctamente.', 'info');
  };

  const switchUser = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (user && user.active) {
      setCurrentUser(user);
      if (user.role === 'cocinero') {
        setActiveView('cocina');
      } else {
        if (activeView === 'cocina') setActiveView('mesas');
      }
      showToast(`Cambiado a rol: ${user.name} (${user.role})`, 'info');
    }
  };

  const getTableStatus = (tableId: number): TableStatus => {
    return computeTableStatus(tableId, orders);
  };

  const getActiveOrder = (tableId: number): Order | undefined => {
    return orders.find(
      (o) => o.tableId === tableId && (o.status === 'Pendiente' || o.status === 'En preparación' || o.status === 'Listo')
    );
  };

  const createOrder = (
    tableId: number,
    items: { productId: number; quantity: number; notes?: string }[],
    notes?: string
  ): { success: boolean; orderId?: number; error?: string } => {
    if (!currentUser) {
      return { success: false, error: 'Debe iniciar sesión para registrar pedidos.' };
    }

    // Check table exists
    const targetTable = tables.find((t) => t.id === tableId);
    if (!targetTable) {
      return { success: false, error: 'La mesa seleccionada no existe.' };
    }

    // Check RN-04: At most 1 active order per table
    const existingActive = getActiveOrder(tableId);
    if (existingActive) {
      return {
        success: false,
        error: `La Mesa ${targetTable.tableNumber} ya tiene un pedido activo (#${existingActive.id} - ${existingActive.status}).`,
      };
    }

    // Validate items > 0
    if (!items || items.length === 0) {
      return { success: false, error: 'El pedido debe incluir al menos un producto del menú.' };
    }

    // Validate products exist and are available, capture current price
    const orderItems: OrderItem[] = [];
    for (const item of items) {
      if (item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        return { success: false, error: 'Las cantidades deben ser números enteros mayores a cero.' };
      }
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) {
        return { success: false, error: `El producto ID ${item.productId} no existe en el catálogo.` };
      }
      if (!prod.available) {
        return { success: false, error: `El producto '${prod.name}' no se encuentra disponible actualmente.` };
      }

      const subtotal = calculateSubtotal(item.quantity, prod.price);
      orderItems.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        productId: prod.id,
        productName: prod.name,
        quantity: item.quantity,
        unitPrice: prod.price,
        subtotal,
        notes: item.notes,
      });
    }

    const total = calculateOrderTotal(orderItems);
    const newOrderId = (orders.length > 0 ? Math.max(...orders.map((o) => o.id)) : 100) + 1;

    const newOrder: Order = {
      id: newOrderId,
      tableId: targetTable.id,
      tableNumber: targetTable.tableNumber,
      userId: currentUser.id,
      waiterName: currentUser.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Pendiente',
      items: orderItems,
      total,
      notes,
    };

    setOrders((prev) => [newOrder, ...prev]);
    showToast(`Pedido #${newOrderId} enviado a cocina para Mesa ${targetTable.tableNumber}`, 'success');
    return { success: true, orderId: newOrderId };
  };

  const updateOrderStatus = (
    orderId: number,
    nextStatus: OrderStatus
  ): { success: boolean; error?: string } => {
    if (!currentUser) {
      return { success: false, error: 'Debe iniciar sesión para realizar esta acción.' };
    }

    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, error: 'Pedido no encontrado.' };
    }

    const validation = canTransitionOrderStatus(order.status, nextStatus, currentUser.role);
    if (!validation.allowed) {
      showToast(validation.reason || 'Transición no permitida', 'error');
      return { success: false, error: validation.reason };
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );

    if (nextStatus === 'Entregado') {
      showToast(`Pedido #${orderId} entregado. Mesa ${order.tableNumber} liberada.`, 'success');
    } else if (nextStatus === 'Listo') {
      showToast(`Pedido #${orderId} listo en el pase para Mesa ${order.tableNumber}`, 'success');
    } else {
      showToast(`Pedido #${orderId} en preparación para Mesa ${order.tableNumber}`, 'info');
    }

    return { success: true };
  };

  const addProduct = (productData: Omit<Product, 'id'>): { success: boolean; error?: string } => {
    if (!currentUser || currentUser.role !== 'administrador') {
      return { success: false, error: 'Solo el administrador puede agregar productos.' };
    }
    if (!productData.name.trim()) {
      return { success: false, error: 'El nombre del producto es obligatorio.' };
    }
    if (productData.price <= 0) {
      return { success: false, error: 'El precio debe ser mayor a cero.' };
    }

    const newId = (products.length > 0 ? Math.max(...products.map((p) => p.id)) : 0) + 1;
    const newProduct: Product = { ...productData, id: newId };
    setProducts((prev) => [...prev, newProduct]);
    showToast(`Producto '${newProduct.name}' creado exitosamente.`, 'success');
    return { success: true };
  };

  const updateProduct = (
    id: number,
    productData: Partial<Product>
  ): { success: boolean; error?: string } => {
    if (!currentUser || currentUser.role !== 'administrador') {
      return { success: false, error: 'Solo el administrador puede modificar productos.' };
    }
    if (productData.name !== undefined && !productData.name.trim()) {
      return { success: false, error: 'El nombre del producto no puede estar vacío.' };
    }
    if (productData.price !== undefined && productData.price <= 0) {
      return { success: false, error: 'El precio debe ser mayor a cero.' };
    }

    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...productData } : p)));
    showToast('Producto actualizado correctamente.', 'success');
    return { success: true };
  };

  const toggleProductAvailability = (id: number) => {
    if (!currentUser || currentUser.role !== 'administrador') {
      showToast('Acción no permitida.', 'error');
      return;
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, available: !p.available } : p))
    );
    const prod = products.find((p) => p.id === id);
    if (prod) {
      showToast(
        `Producto '${prod.name}' ahora está ${!prod.available ? 'Disponible' : 'No disponible'}.`,
        'info'
      );
    }
  };

  const deleteProduct = (id: number): { success: boolean; error?: string } => {
    if (!currentUser || currentUser.role !== 'administrador') {
      return { success: false, error: 'Solo el administrador puede eliminar productos.' };
    }
    const check = canDeleteProduct(id, orders);
    if (!check.allowed) {
      showToast(check.reason || 'No se puede eliminar.', 'error');
      return { success: false, error: check.reason };
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Producto eliminado del menú.', 'success');
    return { success: true };
  };

  const addTable = (tableData: Omit<Table, 'id'>): { success: boolean; error?: string } => {
    if (!currentUser || currentUser.role !== 'administrador') {
      return { success: false, error: 'Solo el administrador puede registrar mesas.' };
    }
    if (tableData.tableNumber <= 0 || !Number.isInteger(tableData.tableNumber)) {
      return { success: false, error: 'El número de mesa debe ser un entero positivo.' };
    }
    if (tables.some((t) => t.tableNumber === tableData.tableNumber)) {
      return { success: false, error: `Ya existe una mesa con el número ${tableData.tableNumber}.` };
    }

    const newId = (tables.length > 0 ? Math.max(...tables.map((t) => t.id)) : 0) + 1;
    const newTable: Table = { ...tableData, id: newId };
    setTables((prev) => [...prev, newTable]);
    showToast(`Mesa ${newTable.tableNumber} creada exitosamente.`, 'success');
    return { success: true };
  };

  const updateTable = (id: number, tableData: Partial<Table>): { success: boolean; error?: string } => {
    if (!currentUser || currentUser.role !== 'administrador') {
      return { success: false, error: 'Solo el administrador puede modificar mesas.' };
    }
    if (tableData.tableNumber !== undefined) {
      if (tableData.tableNumber <= 0 || !Number.isInteger(tableData.tableNumber)) {
        return { success: false, error: 'El número de mesa debe ser un entero positivo.' };
      }
      if (tables.some((t) => t.id !== id && t.tableNumber === tableData.tableNumber)) {
        return { success: false, error: `Ya existe otra mesa con el número ${tableData.tableNumber}.` };
      }
    }

    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, ...tableData } : t)));
    showToast('Mesa actualizada correctamente.', 'success');
    return { success: true };
  };

  const deleteTable = (id: number): { success: boolean; error?: string } => {
    if (!currentUser || currentUser.role !== 'administrador') {
      return { success: false, error: 'Solo el administrador puede eliminar mesas.' };
    }
    const check = canDeleteTable(id, orders);
    if (!check.allowed) {
      showToast(check.reason || 'No se puede eliminar.', 'error');
      return { success: false, error: check.reason };
    }
    setTables((prev) => prev.filter((t) => t.id !== id));
    showToast('Mesa eliminada correctamente.', 'success');
    return { success: true };
  };

  const addUser = (userData: Omit<User, 'id'>): { success: boolean; error?: string } => {
    if (!currentUser || currentUser.role !== 'administrador') {
      return { success: false, error: 'Solo el administrador puede registrar usuarios.' };
    }
    if (!userData.username.trim()) {
      return { success: false, error: 'El nombre de usuario es obligatorio.' };
    }
    if (users.some((u) => u.username.toLowerCase() === userData.username.trim().toLowerCase())) {
      return { success: false, error: `El usuario '${userData.username}' ya existe.` };
    }

    const newId = (users.length > 0 ? Math.max(...users.map((u) => u.id)) : 0) + 1;
    const newUser: User = {
      ...userData,
      id: newId,
      username: userData.username.trim().toLowerCase(),
    };
    setUsers((prev) => [...prev, newUser]);
    showToast(`Usuario '${newUser.username}' registrado.`, 'success');
    return { success: true };
  };

  const updateUser = (id: number, userData: Partial<User>): { success: boolean; error?: string } => {
    if (!currentUser || currentUser.role !== 'administrador') {
      return { success: false, error: 'Solo el administrador puede editar usuarios.' };
    }
    if (userData.username !== undefined) {
      if (!userData.username.trim()) {
        return { success: false, error: 'El nombre de usuario no puede estar vacío.' };
      }
      if (
        users.some((u) => u.id !== id && u.username.toLowerCase() === userData.username!.trim().toLowerCase())
      ) {
        return { success: false, error: `El usuario '${userData.username}' ya existe.` };
      }
    }

    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...userData } : u)));
    showToast('Usuario actualizado.', 'success');
    return { success: true };
  };

  const toggleUserActive = (id: number) => {
    if (!currentUser || currentUser.role !== 'administrador') {
      showToast('Acción no permitida.', 'error');
      return;
    }
    if (id === currentUser.id) {
      showToast('No puede desactivar su propia cuenta activa.', 'error');
      return;
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
    );
    const u = users.find((user) => user.id === id);
    if (u) {
      showToast(`Usuario '${u.username}' ${!u.active ? 'activado' : 'desactivado'}.`, 'info');
    }
  };

  const resetToDefaults = () => {
    setUsers(INITIAL_USERS);
    setProducts(INITIAL_PRODUCTS);
    setTables(INITIAL_TABLES);
    setOrders(INITIAL_ORDERS);
    setCurrentUser(INITIAL_USERS[1]);
    setActiveView('mesas');
    showToast('Datos restaurados al estado inicial.', 'info');
  };

  return (
    <RestaurantContext.Provider
      value={{
        currentUser,
        users,
        products,
        tables,
        orders,
        activeView,
        selectedTableForOrder,
        toasts,
        setActiveView,
        setSelectedTableForOrder,
        login,
        logout,
        switchUser,
        createOrder,
        updateOrderStatus,
        addProduct,
        updateProduct,
        toggleProductAvailability,
        deleteProduct,
        addTable,
        updateTable,
        deleteTable,
        addUser,
        updateUser,
        toggleUserActive,
        getTableStatus,
        getActiveOrder,
        dismissToast,
        showToast,
        resetToDefaults,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
