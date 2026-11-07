export type OrderStatus = 'RECEIVED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELED';
export type OrderType = 'DINE_IN' | 'DELIVERY' | 'TAKEAWAY';
export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';

export interface RegisterAccountRequest {
  name: string;
  email: string;
  password: string;
}

export interface OptionItem {
  id: number;
  optionGroupId: number;
  name: string;
  additionalPrice: number;
}

export interface OptionGroup {
  id: number;
  menuItemId: number;
  title: string;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  options: OptionItem[];
}

export interface MenuItem {
  id: number;
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  optionGroups?: OptionGroup[];
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  orderIndex: number;
  items: MenuItem[];
}

export interface OrderItemOption {
  id: number;
  name: string;
  price: number;
}

export interface OrderItem {
  id: number;
  menuItemId: number;
  menuItem: MenuItem;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
  selectedOptions?: OrderItemOption[];
}

export interface Table {
  id: number;
  number: number;
  capacity: number;
  status: TableStatus;
}

export interface Order {
  id: number;
  code: string;
  type: OrderType;
  status: OrderStatus;
  tableId?: number | null;
  table?: Table | null;
  customerName?: string | null;
  customerPhone?: string | null;
  notes?: string | null;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
}
