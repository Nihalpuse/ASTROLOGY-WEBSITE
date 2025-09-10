// Inventory API Types
import { Decimal } from '@prisma/client/runtime/library';

export interface InventoryStock {
  id: number;
  product_id: number;
  sku: string | null;
  quantity: number;
  reserved: number;
  min_stock: number;
  max_stock: number | null;
  location: string | null;
  batch_number: string | null;
  expiry_date: Date | null;
  cost_price: Decimal | null;
  created_at: Date | null;
  updated_at: Date | null;
  products?: {
    id: number;
    name: string;
    slug: string;
    sku: string | null;
    is_active: boolean;
    category?: {
      id: number;
      name: string;
      slug: string;
    };
  };
}

export interface InventoryUpdateRequest {
  productId: number;
  sku?: string;
  quantity?: number;
  reserved?: number;
  minStock?: number;
  maxStock?: number;
  location?: string;
  batchNumber?: string;
  expiryDate?: string; // ISO date string
  costPrice?: number;
}

export interface InventoryResponse {
  success: boolean;
  data?: InventoryStock | InventoryStock[];
  count?: number;
  message?: string;
  error?: string;
  details?: string;
}

export interface InventoryQueryParams {
  productId?: string;
  sku?: string;
  includeProduct?: boolean;
}

// Stock level indicators
export interface StockLevel {
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked';
  message: string;
  availableQuantity: number;
  reservedQuantity: number;
  minStock: number;
  maxStock: number | null;
}

export interface InventoryWithStockLevel extends InventoryStock {
  stockLevel: StockLevel;
}
