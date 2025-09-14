export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  price: number;
  supplier: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';