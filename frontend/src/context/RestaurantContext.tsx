import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Order,
  OrderItem,
  OrderStatus,
  Product,
  ProductCategory,
  Table,
  TableStatus,
  User,
  UserRole,
  SystemVersionSnapshot,
} from '../types/index.ts';
import { api, ApiError } from '../services/apiClient.ts';
import {
  calculateOrderTotal,
  calculateSubtotal,
  canDeleteProduct,
  canDeleteTable,
  canTransitionOrderStatus,
  computeTableStatus,
} from '../domain/rules.ts';

export interface DraftCartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

function classifyProductMeta(name: string, description: string): {
  category: ProductCategory;
  station: Product['station'];
  image: string;
} {
  const text = `${name} ${description}`.toLowerCase();

  if (
    text.includes('bife') ||
    text.includes('cordero') ||
    text.includes('salmón') ||
    text.includes('salmon') ||
    text.includes('costilla') ||
    text.includes('corte') ||
    text.includes('parrilla') ||
    text.includes('lomo') && !text.includes('carpaccio')
  ) {
    if (text.includes('salmón') || text.includes('salmon')) {
      return {
        category: 'Carnes & Grill',
        station: 'Parrilla',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=700&q=80',
      };
    }
    if (text.includes('cordero') || text.includes('costilla')) {
      return {
        category: 'Carnes & Grill',
        station: 'Parrilla',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80',
      };
    }
    return {
      category: 'Carnes & Grill',
      station: 'Parrilla',
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=700&q=80',
    };
  }

  if (
    text.includes('risotto') ||
    text.includes('ravioli') ||
    text.includes('pappardelle') ||
    text.includes('pasta') ||
    text.includes('tagliatelle')
  ) {
    if (text.includes('risotto')) {
      return {
        category: 'Pastas & Risottos',
        station: 'Cocina',
        image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=700&q=80',
      };
    }
    return {
      category: 'Pastas & Risottos',
      station: 'Cocina',
      image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=700&q=80',
    };
  }

  if (
    text.includes('tiramis') ||
    text.includes('chocolate') ||
    text.includes('esfera') ||
    text.includes('postre') ||
    text.includes('helado') ||
    text.includes('mousse')
  ) {
    if (text.includes('tiramis')) {
      return {
        category: 'Postres',
        station: 'Pastelería',
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=700&q=80',
      };
    }
    return {
      category: 'Postres',
      station: 'Pastelería',
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80',
    };
  }

  if (
    text.includes('cóctel') ||
    text.includes('coctel') ||
    text.includes('old fashioned') ||
    text.includes('gin') ||
    text.includes('limonada') ||
    text.includes('vino') ||
    text.includes('malbec') ||
    text.includes('bourbon')
  ) {
    if (text.includes('limonada')) {
      return {
        category: 'Bebidas & Bar',
        station: 'Bar',
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=700&q=80',
      };
    }
    return {
      category: 'Bebidas & Bar',
      station: 'Bar',
      image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=700&q=80',
    };
  }

  if (text.includes('burrata')) {
    return {
      category: 'Entradas',
      station: 'Cocina',
      image: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?auto=format&fit=crop&w=700&q=80',
    };
  }
  if (text.includes('atún') || text.includes('atun') || text.includes('tartar')) {
    return {
      category: 'Entradas',
      station: 'Cocina',
      image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=700&q=80',
    };
  }

  return {
    category: 'Entradas',
    station: 'Cocina',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80',
  };
}

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface RestaurantContextType {
  currentUser: User | null;
  isAuthLoading: boolean;
  users: User[];
  products: Product[];
  tables: Table[];
  orders: Order[];
  activeView: string;
  selectedTableForOrder: Table | null;
  draftCart: DraftCartItem[];
  toasts: ToastNotification[];
  setActiveView: (view: string) => void;
  setSelectedTableForOrder: (table: Table | null) => void;
  addToDraftCart: (product: Product, quantity?: number) => void;
  updateDraftQuantity: (productId: number, delta: number) => void;
  removeFromDraftCart: (productId: number) => void;
  updateDraftItemNote: (productId: number, notes: string) => void;
  clearDraftCart: () => void;
  login: (username: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  createOrder: (
    tableId: number,
    items: { productId: number; quantity: number; notes?: string }[],
    notes?: string
  ) => Promise<{ success: boolean; orderId?: number; error?: string }>;
  updateOrderStatus: (
    orderId: number,
    nextStatus: OrderStatus
  ) => Promise<{ success: boolean; error?: string }>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateProduct: (id: number, product: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  toggleProductAvailability: (id: number) => Promise<void>;
  deleteProduct: (id: number) => Promise<{ success: boolean; error?: string }>;
  addTable: (table: Omit<Table, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateTable: (id: number, table: Partial<Table>) => Promise<{ success: boolean; error?: string }>;
  deleteTable: (id: number) => Promise<{ success: boolean; error?: string }>;
  addUser: (user: Omit<User, 'id'> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  updateUser: (id: number, user: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  toggleUserActive: (id: number) => Promise<void>;
  getTableStatus: (tableId: number) => TableStatus;
  getActiveOrder: (tableId: number) => Order | undefined;
  dismissToast: (id: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  refreshData: () => Promise<void>;
  snapshots: SystemVersionSnapshot[];
  createVersionSnapshot: (description: string, versionTag?: string) => { success: boolean; snapshot?: SystemVersionSnapshot };
  rollbackToSnapshot: (snapshotId: string) => { success: boolean; message: string };
}

const INITIAL_SEEDED_PRODUCTS: Product[] = [
  ['Carpaccio de Res Trufado', 'Láminas de lomo con aceite de trufa y parmesano reggiano.', 38000],
  ['Burrata Pugliese con Higos', 'Burrata fresca sobre rúcula silvestre e higos caramelizados.', 34000],
  ['Tartar de Atún Rojo & Palta', 'Atún fresco con aderezo ponzu y emulsión de aguacate.', 42000],
  ['Ojo de Bife Angosto (400g)', 'Corte madurado 28 días terminado a la leña.', 89000],
  ['Costillas de Cordero Patagónico', 'Costillas al romero y puré rústico.', 84000],
  ['Salmón Austral Glaseado', 'Filete de salmón salvaje con glaseado teriyaki.', 72000],
  ['Risotto ai Frutti di Mare', 'Arroz carnaroli con langostinos, calamares y mejillones.', 62000],
  ['Ravioli de Ossobuco Braseado', 'Pasta artesanal bañada en reducción al vino tinto.', 56000],
  ['Pappardelle al Ragu de Jabalí', 'Cintas caseras con ragú toscano cocinado 8 horas.', 54000],
  ['Tiramisú Tradizionale', 'Savoiardi con café espresso y crema mascarpone.', 24000],
  ['Esfera de Chocolate Valrhona', 'Mousse de avellana con baño de cacao amargo.', 28000],
  ['Cóctel Smoked Old Fashioned', 'Bourbon añejo con piel de naranja y humo de roble.', 36000],
  ['Gin Tonic Botánico', 'Ginebra artesanal con frutos rojos y enebro fresco.', 32000],
  ['Limonada de Hierbabuena & Jengibre', 'Extracto natural de limón y hierbabuena fresca.', 14000],
].map(([name, description, price], index) => {
  const meta = classifyProductMeta(String(name), String(description));
  return {
    id: index + 1,
    name: String(name),
    description: String(description),
    price: Number(price),
    category: meta.category,
    available: true,
    image: meta.image,
    station: meta.station,
  };
});

const INITIAL_SEEDED_TABLES: Table[] = Array.from({ length: 9 }, (_, idx) => {
  const areas: Table['area'][] = ['Salón Principal', 'Terraza Gourmet', 'Zona VIP'];
  return {
    id: idx + 1,
    tableNumber: idx + 1,
    capacity: idx % 3 === 0 ? 6 : idx % 2 === 0 ? 4 : 2,
    area: areas[idx % areas.length],
  };
});

const RestaurantContext = createContext<RestaurantContextType | null>(null);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>(INITIAL_SEEDED_PRODUCTS);
  const [tables, setTables] = useState<Table[]>(INITIAL_SEEDED_TABLES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeView, setActiveView] = useState<string>('mesas');
  const [selectedTableForOrder, setSelectedTableForOrder] = useState<Table | null>(null);
  const [draftCart, setDraftCart] = useState<DraftCartItem[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [snapshots, setSnapshots] = useState<SystemVersionSnapshot[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Carrito borrador compartido entre Platos 3D y Nuevo Pedido ---
  const addToDraftCart = useCallback((product: Product, quantity = 1) => {
    if (!product.available) {
      showToast(`"${product.name}" no está disponible actualmente.`, 'error');
      return;
    }
    setDraftCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`+${quantity} ${product.name} añadido al pedido en curso`, 'success');
  }, [showToast]);

  const updateDraftQuantity = useCallback((productId: number, delta: number) => {
    setDraftCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is DraftCartItem => item !== null)
    );
  }, []);

  const removeFromDraftCart = useCallback((productId: number) => {
    setDraftCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateDraftItemNote = useCallback((productId: number, notes: string) => {
    setDraftCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, notes: notes.trim() } : item
      )
    );
  }, []);

  const clearDraftCart = useCallback(() => {
    setDraftCart([]);
  }, []);

  // 1. Cargar datos del catálogo y pedidos desde los microservicios
  const refreshData = useCallback(async () => {
    try {
      const [prodRes, mesasRes, pedidosRes] = await Promise.allSettled([
        api.productos.listar(),
        api.mesas.listar(),
        api.pedidos.listar(),
      ]);

      if (prodRes.status === 'fulfilled' && prodRes.value.productos) {
        setProducts(
          prodRes.value.productos.map((p) => {
            const meta = classifyProductMeta(p.nombre, p.descripcion || '');
            return {
              id: p.id_producto,
              name: p.nombre,
              description: p.descripcion || '',
              price: Number(p.precio),
              category: meta.category,
              available: Boolean(p.disponible),
              image: meta.image,
              station: meta.station,
            };
          })
        );
      }

      if (mesasRes.status === 'fulfilled' && mesasRes.value.mesas) {
        const areas: Table['area'][] = ['Salón Principal', 'Terraza Gourmet', 'Zona VIP'];
        setTables(
          mesasRes.value.mesas.map((m, idx) => ({
            id: m.id_mesa,
            tableNumber: m.numero_mesa,
            capacity: idx % 3 === 0 ? 6 : idx % 2 === 0 ? 4 : 2,
            area: areas[idx % areas.length],
          }))
        );
      }

      if (pedidosRes.status === 'fulfilled' && pedidosRes.value.pedidos) {
        setOrders(
          pedidosRes.value.pedidos.map((o) => ({
            id: o.id_pedido,
            tableId: o.id_mesa,
            tableNumber: o.id_mesa,
            userId: o.id_usuario,
            waiterName: `Usuario #${o.id_usuario}`,
            createdAt: o.fecha_pedido,
            updatedAt: o.fecha_pedido,
            status: o.estado as OrderStatus,
            total: Number(o.total),
            items: (o.detalles || []).map((d) => ({
              id: d.id_detalle,
              productId: d.id_producto,
              productName: d.nombre_producto,
              quantity: d.cantidad,
              unitPrice: Number(d.precio_unitario),
              subtotal: Number(d.subtotal),
            })),
          }))
        );
      }

      // Si el usuario es administrador, consultar también la lista de empleados
      if (currentUser?.role === 'administrador') {
        const usersRes = await api.usuarios.listar().catch(() => null);
        if (usersRes?.usuarios) {
          setUsers(
            usersRes.usuarios.map((u) => ({
              id: u.id_usuario,
              username: u.nombre_usuario,
              name: u.nombre_usuario,
              role: u.rol,
              active: Boolean(u.activo),
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            }))
          );
        }
      }
    } catch (err) {
      console.warn('Error refrescando datos de microservicios:', err);
    }
  }, [currentUser?.role]);

  // 2. Validación de sesión inicial mediante cookie HttpOnly contra ms-usuarios
  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      try {
        const res = await api.auth.me();
        if (isMounted && res.usuario) {
          const userObj: User = {
            id: res.usuario.id_usuario,
            username: res.usuario.nombre_usuario,
            name: res.usuario.nombre_usuario,
            role: res.usuario.rol,
            active: res.usuario.activo,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          };
          setCurrentUser(userObj);
          setActiveView(userObj.role === 'cocinero' ? 'cocina' : 'mesas');
        }
      } catch {
        if (isMounted) {
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    }
    checkSession();
    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Polling suave HTTP para mantener sincronizados pedidos y mesas entre clientes
  useEffect(() => {
    if (!currentUser) return;
    refreshData();
    const interval = setInterval(() => {
      api.pedidos.listar().then((res) => {
        if (res.pedidos) {
          setOrders(
            res.pedidos.map((o) => ({
              id: o.id_pedido,
              tableId: o.id_mesa,
              tableNumber: o.id_mesa,
              userId: o.id_usuario,
              waiterName: `Usuario #${o.id_usuario}`,
              createdAt: o.fecha_pedido,
              updatedAt: o.fecha_pedido,
              status: o.estado as OrderStatus,
              total: Number(o.total),
              items: (o.detalles || []).map((d) => ({
                id: d.id_detalle,
                productId: d.id_producto,
                productName: d.nombre_producto,
                quantity: d.cantidad,
                unitPrice: Number(d.precio_unitario),
                subtotal: Number(d.subtotal),
              })),
            }))
          );
        }
      }).catch(() => {});
    }, 4000);
    return () => clearInterval(interval);
  }, [currentUser, refreshData]);

  // --- Operaciones de Autenticación Real ---
  const login = async (username: string, password = ''): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await api.auth.login(username.trim(), password);
      const user = res.usuario;
      const userObj: User = {
        id: user.id_usuario,
        username: user.nombre_usuario,
        name: user.nombre_usuario,
        role: user.rol,
        active: user.activo,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      };
      setCurrentUser(userObj);
      setActiveView(userObj.role === 'cocinero' ? 'cocina' : 'mesas');
      showToast(`Bienvenido al sistema, ${user.nombre_usuario}`, 'success');
      refreshData();
      return { success: true };
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : 'Error al conectar con el servidor de autenticación';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.warn('Logout remoto:', err);
    } finally {
      setCurrentUser(null);
      setActiveView('login');
      showToast('Sesión cerrada correctamente.', 'info');
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

  // --- Operaciones de Pedidos (ms-pedidos) ---
  const createOrder = async (
    tableId: number,
    items: { productId: number; quantity: number; notes?: string }[],
    notes?: string
  ): Promise<{ success: boolean; orderId?: number; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Debe iniciar sesión para registrar pedidos.' };

    const targetTable = tables.find((t) => t.id === tableId);
    if (!targetTable) return { success: false, error: 'Mesa no encontrada.' };

    if (items.length === 0) return { success: false, error: 'Debe agregar al menos un producto.' };

    const orderItems: OrderItem[] = [];
    for (const item of items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod || !prod.available) {
        return { success: false, error: `El producto ${prod ? prod.name : ''} no está disponible.` };
      }
      orderItems.push({
        id: Date.now() + Math.random(),
        productId: prod.id,
        productName: prod.name,
        quantity: item.quantity,
        unitPrice: prod.price,
        subtotal: calculateSubtotal(item.quantity, prod.price),
      });
    }

    const total = calculateOrderTotal(orderItems);

    try {
      const payloadItems = items.map((i) => ({ id_producto: i.productId, cantidad: i.quantity }));
      const res = await api.pedidos.crear(targetTable.id, payloadItems, total);
      showToast(`Pedido #${res.pedido.id_pedido} enviado a cocina para Mesa ${targetTable.tableNumber}`, 'success');
      await refreshData();
      return { success: true, orderId: res.pedido.id_pedido };
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : 'Error al registrar pedido';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const updateOrderStatus = async (
    orderId: number,
    nextStatus: OrderStatus
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Debe iniciar sesión.' };

    try {
      await api.pedidos.avanzar(orderId, nextStatus);
      showToast(`Pedido #${orderId} actualizado a '${nextStatus}'`, 'success');
      await refreshData();
      return { success: true };
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : 'Error al actualizar estado del pedido';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  // --- Operaciones de Menú / Catálogo (ms-catalogo) ---
  const addProduct = async (productData: Omit<Product, 'id'>): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser || currentUser.role !== 'administrador') {
      return { success: false, error: 'Solo el administrador puede agregar productos.' };
    }
    try {
      await api.productos.crear({
        nombre: productData.name.trim(),
        descripcion: productData.description || null,
        precio: productData.price,
      });
      showToast(`Producto '${productData.name}' creado exitosamente.`, 'success');
      await refreshData();
      return { success: true };
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : 'Error al registrar producto';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const updateProduct = async (id: number, productData: Partial<Product>): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser || currentUser.role !== 'administrador') {
      return { success: false, error: 'Solo el administrador puede modificar productos.' };
    }
    const current = products.find((p) => p.id === id);
    if (!current) return { success: false, error: 'Producto no encontrado' };

    try {
      await api.productos.editar(id, {
        nombre: productData.name !== undefined ? productData.name.trim() : current.name,
        descripcion: productData.description !== undefined ? productData.description : current.description,
        precio: productData.price !== undefined ? productData.price : current.price,
      });
      showToast('Producto actualizado correctamente.', 'success');
      await refreshData();
      return { success: true };
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : 'Error al actualizar producto';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const toggleProductAvailability = async (id: number) => {
    if (!currentUser || currentUser.role !== 'administrador') {
      showToast('Acción no permitida.', 'error');
      return;
    }
    const prod = products.find((p) => p.id === id);
    if (!prod) return;

    try {
      await api.productos.disponibilidad(id, !prod.available);
      showToast(`Producto '${prod.name}' ahora está ${!prod.available ? 'Disponible' : 'No disponible'}.`, 'info');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Error al cambiar disponibilidad', 'error');
    }
  };

  const deleteProduct = async (id: number): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser || currentUser.role !== 'administrador') {
      return { success: false, error: 'Solo el administrador puede eliminar productos.' };
    }
    try {
      await api.productos.eliminar(id);
      showToast('Producto eliminado del menú.', 'success');
      await refreshData();
      return { success: true };
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : 'No se pudo eliminar el producto.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  // --- Operaciones de Mesas (ms-catalogo) ---
  const addTable = async (tableData: Omit<Table, 'id'>): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser || currentUser.role !== 'administrador') {
      return { success: false, error: 'Solo el administrador puede registrar mesas.' };
    }
    try {
      await api.mesas.crear(tableData.tableNumber);
      showToast(`Mesa #${tableData.tableNumber} creada exitosamente.`, 'success');
      await refreshData();
      return { success: true };
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : 'Error al registrar mesa';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const updateTable = async (id: number, tableData: Partial<Table>): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser || currentUser.role !== 'administrador') {
      return { success: false, error: 'Solo el administrador puede modificar mesas.' };
    }
    const current = tables.find((t) => t.id === id);
    if (!current) return { success: false, error: 'Mesa no encontrada' };

    try {
      await api.mesas.editar(id, tableData.tableNumber || current.tableNumber);
      showToast('Mesa actualizada correctamente.', 'success');
      await refreshData();
      return { success: true };
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : 'Error al actualizar mesa';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const deleteTable = async (id: number): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser || currentUser.role !== 'administrador') {
      return { success: false, error: 'Solo el administrador puede eliminar mesas.' };
    }
    try {
      await api.mesas.eliminar(id);
      showToast('Mesa eliminada correctamente.', 'success');
      await refreshData();
      return { success: true };
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : 'No se pudo eliminar la mesa.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  // --- Operaciones de Usuarios (ms-usuarios) ---
  const addUser = async (userData: Omit<User, 'id'> & { password?: string }): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser || currentUser.role !== 'administrador') {
      return { success: false, error: 'Solo el administrador puede registrar usuarios.' };
    }
    try {
      await api.usuarios.crear({
        nombre_usuario: userData.username.trim(),
        contrasena: userData.password || 'Empleado2026!',
        rol: userData.role,
      });
      showToast(`Usuario '${userData.username}' registrado con éxito.`, 'success');
      await refreshData();
      return { success: true };
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : 'Error al registrar usuario';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const updateUser = async (id: number, userData: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser || currentUser.role !== 'administrador') {
      return { success: false, error: 'Solo el administrador puede editar usuarios.' };
    }
    try {
      await api.usuarios.editar(id, {
        nombre_usuario: userData.username,
        rol: userData.role,
      });
      showToast('Usuario actualizado.', 'success');
      await refreshData();
      return { success: true };
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : 'Error al actualizar usuario';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const toggleUserActive = async (id: number) => {
    if (!currentUser || currentUser.role !== 'administrador') {
      showToast('Acción no permitida.', 'error');
      return;
    }
    try {
      await api.usuarios.desactivar(id);
      showToast('Cuenta de usuario desactivada.', 'info');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Error al desactivar usuario', 'error');
    }
  };

  // --- Versionamiento & Rollback (Fase 1 / Admin) ---
  const createVersionSnapshot = (description: string, versionTag?: string) => {
    const nextTag = versionTag || `v1.${snapshots.length + 1}.0-dev`;
    const newSnapshot: SystemVersionSnapshot = {
      id: `snap-${Date.now()}`,
      versionTag: nextTag,
      branch: 'Dev',
      commitHash: Math.random().toString(16).substring(2, 9),
      author: currentUser?.name || 'Administrador',
      authorRole: currentUser?.role || 'administrador',
      timestamp: new Date().toISOString(),
      description: description || 'Punto de restauración del sistema',
      type: 'recovery_point',
      stateBackup: {
        users: JSON.parse(JSON.stringify(users)),
        products: JSON.parse(JSON.stringify(products)),
        tables: JSON.parse(JSON.stringify(tables)),
        orders: JSON.parse(JSON.stringify(orders)),
      },
    };
    setSnapshots((prev) => [newSnapshot, ...prev]);
    showToast(`Punto de versión "${newSnapshot.versionTag}" creado correctamente.`, 'success');
    return { success: true, snapshot: newSnapshot };
  };

  const rollbackToSnapshot = (snapshotId: string) => {
    const snap = snapshots.find((s) => s.id === snapshotId);
    if (!snap) {
      showToast('Punto de restauración no encontrado.', 'error');
      return { success: false, message: 'Snapshot no encontrado' };
    }
    if (snap.stateBackup) {
      setUsers(snap.stateBackup.users);
      setProducts(snap.stateBackup.products);
      setTables(snap.stateBackup.tables);
      setOrders(snap.stateBackup.orders);
    }
    showToast(`Sistema revertido con éxito a la versión ${snap.versionTag}.`, 'success');
    return { success: true, message: `Revertido a ${snap.versionTag}` };
  };

  return (
    <RestaurantContext.Provider
      value={{
        currentUser,
        isAuthLoading,
        users,
        products,
        tables,
        orders,
        activeView,
        selectedTableForOrder,
        draftCart,
        toasts,
        setActiveView,
        setSelectedTableForOrder,
        addToDraftCart,
        updateDraftQuantity,
        removeFromDraftCart,
        updateDraftItemNote,
        clearDraftCart,
        login,
        logout,
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
        refreshData,
        snapshots,
        createVersionSnapshot,
        rollbackToSnapshot,
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
