import React from 'react';
import { Package, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { getStockStatus, formatCurrency } from '../utils/stockUtils';

interface StatsCardsProps {
  items: InventoryItem[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ items }) => {
  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const lowStockItems = items.filter(item => getStockStatus(item) === 'low-stock').length;
  const outOfStockItems = items.filter(item => getStockStatus(item) === 'out-of-stock').length;

  const stats = [
    {
      title: 'Total Items',
      value: totalItems.toString(),
      icon: Package,
      color: 'text-blue-600 bg-blue-50',
      change: '+12 this month',
      changeColor: 'text-green-600',
    },
    {
      title: 'Total Value',
      value: formatCurrency(totalValue),
      icon: DollarSign,
      color: 'text-green-600 bg-green-50',
      change: '+8.2%',
      changeColor: 'text-green-600',
    },
    {
      title: 'Low Stock',
      value: lowStockItems.toString(),
      icon: TrendingDown,
      color: 'text-orange-600 bg-orange-50',
      change: 'Needs attention',
      changeColor: 'text-orange-600',
    },
    {
      title: 'Out of Stock',
      value: outOfStockItems.toString(),
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50',
      change: 'Urgent',
      changeColor: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm mt-2 ${stat.changeColor}`}>{stat.change}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};