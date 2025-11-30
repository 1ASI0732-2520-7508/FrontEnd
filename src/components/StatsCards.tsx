import React from 'react';
import { Package, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { InventoryItem } from '../types/inventory';
import { getStockStatus, formatCurrency } from '../utils/stockUtils';

interface StatsCardsProps {
  items: InventoryItem[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ items }) => {
  const { t } = useTranslation();

  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const lowStockItems = items.filter(item => getStockStatus(item) === 'low-stock').length;
  const outOfStockItems = items.filter(item => getStockStatus(item) === 'out-of-stock').length;

  const stats = [
    {
      title: t('stats.totalItems'),
      value: totalItems.toString(),
      icon: Package,
      color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30',
      change: t('stats.totalItemsChange'),
      changeColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: t('stats.totalValue'),
      value: formatCurrency(totalValue),
      icon: DollarSign,
      color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/30',
      change: t('stats.totalValueChange'),
      changeColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: t('stats.lowStock'),
      value: lowStockItems.toString(),
      icon: TrendingDown,
      color: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/30',
      change: t('stats.lowStockChange'),
      changeColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      title: t('stats.outOfStock'),
      value: outOfStockItems.toString(),
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30',
      change: t('stats.outOfStockChange'),
      changeColor: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
              <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
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
