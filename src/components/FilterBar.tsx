import React from 'react';
import { Filter, SortAsc } from 'lucide-react';
import { categories } from '../data/mockData';
import { useTranslation } from 'react-i18next';

interface FilterBarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  stockFilter: string;
  onStockFilterChange: (filter: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  stockFilter,
  onStockFilterChange,
}) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6 transition-colors duration-300">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('filter.filters')}</span>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">{t('filter.category')}</label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="">{t('filter.allCategories')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">{t('filter.stockStatus')}</label>
          <select
            value={stockFilter}
            onChange={(e) => onStockFilterChange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="">{t('filter.allItems')}</option>
            <option value="in-stock">{t('filter.inStock')}</option>
            <option value="low-stock">{t('filter.lowStock')}</option>
            <option value="out-of-stock">{t('filter.outOfStock')}</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <SortAsc className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <label className="text-sm text-gray-600 dark:text-gray-400">{t('filter.sortBy')}</label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="name">{t('filter.name')}</option>
            <option value="quantity">{t('filter.quantity')}</option>
            <option value="price">{t('filter.price')}</option>
            <option value="lastUpdated">{t('filter.lastUpdated')}</option>
          </select>
        </div>
      </div>
    </div>
  );
};