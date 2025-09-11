// Orders API Types

export interface AdminOrder {
  id: number;
  orderId: string;
  date: string;
  customer: {
    name: string;
    location: string;
  };
  items: number;
  total: number;
  status: string;
  paymentStatus: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  orderItems?: OrderItem[];
  shippingAddress?: unknown;
  billingAddress?: unknown;
  notes?: string;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  type: string;
  product?: {
    id: number;
    name: string;
    sku: string;
    image_url?: string;
    description?: string;
    price: number;
  };
  service?: {
    id: number;
    title: string;
    slug: string;
    description?: string;
    price: number;
  };
}

export interface OrderDetails {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  placedOn: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress?: {
    name: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  billingAddress?: unknown;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  statusHistory: Array<{
    status: string;
    date: string;
    description: string;
  }>;
}

export interface OrdersResponse {
  success: boolean;
  orders?: AdminOrder[];
  order?: OrderDetails;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
  message?: string;
}

export interface OrderUpdateRequest {
  orderId: number;
  status?: string;
  paymentStatus?: string;
  notes?: string;
  admin?: boolean;
}

export interface OrderQueryParams {
  admin?: boolean;
  status?: string;
  paymentStatus?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Order status types
export type OrderStatus = 
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

// Statistics interface
export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}
