export type UserRole = 'administrador' | 'mesero' | 'cocinero';

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  active: boolean;
  avatar?: string;
}

export type ProductCategory =
  | 'Entradas'
  | 'Carnes & Grill'
  | 'Pastas & Risottos'
  | 'Postres'
  | 'Bebidas & Bar';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  available: boolean;
  image: string;
  station: 'Cocina' | 'Parrilla' | 'Pastelería' | 'Bar';
}

export type TableStatus = 'Disponible' | 'Ocupada';

export interface Table {
  id: number;
  tableNumber: number;
  capacity: number;
  area: 'Salón Principal' | 'Terraza Gourmet' | 'Zona VIP';
}

export type OrderStatus = 'Pendiente' | 'En preparación' | 'Listo' | 'Entregado';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

export interface Order {
  id: number;
  tableId: number;
  tableNumber: number;
  userId: number;
  waiterName: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  notes?: string;
}

export type SnapshotType = 'git_release' | 'audit_snapshot' | 'recovery_point';

export interface SystemVersionSnapshot {
  id: string;
  versionTag: string;
  branch: string;
  commitHash: string;
  author: string;
  authorRole: string;
  timestamp: string;
  description: string;
  type: SnapshotType;
  stateBackup?: {
    users: User[];
    products: Product[];
    tables: Table[];
    orders: Order[];
  };
}
