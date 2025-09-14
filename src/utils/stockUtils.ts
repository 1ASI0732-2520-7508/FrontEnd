import { InventoryItem, StockStatus } from '../types/inventory';

export const getStockStatus = (item: InventoryItem): StockStatus => {
  if (item.quantity === 0) return 'out-of-stock';
  if (item.quantity <= item.minStock) return 'low-stock';
  return 'in-stock';
};

export const getStockStatusColor = (status: StockStatus): string => {
  switch (status) {
    case 'in-stock':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'low-stock':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'out-of-stock':
      return 'text-red-600 bg-red-50 border-red-200';
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};