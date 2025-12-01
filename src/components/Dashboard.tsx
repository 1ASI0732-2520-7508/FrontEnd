import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3, TrendingUp, Package, DollarSign, Filter, Users,
  AlertTriangle, Eye, Download
} from 'lucide-react';

import {InventoryItem} from "../types/inventory.ts";
import {Supplier} from "../types/supplier.ts";
import {Category} from "../types/inventory.ts";
import { formatCurrency, getStockStatus } from '../utils/stockUtils';
import {exportToExcel, exportToPDF} from '../utils/exportUtils';
import { useTranslation } from 'react-i18next';

interface DashboardProps {
  accessToken: string;
}

interface SupplierMetrics {
  name: string;
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  averagePrice: number;
  categories: string[];
}

const API_URL = import.meta.env.VITE_API_URL;

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const accessToken = localStorage.getItem('access_token');

  // Fetch API data
  useEffect(() => {
    const fetchData = async () => {
      const headers = { Authorization: `Bearer ${accessToken}` };

      const [itemsRes, suppliersRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/api/items/`, { headers }),
        fetch(`${API_URL}/api/suppliers/`, { headers }),
        fetch(`${API_URL}/api/categories/`, { headers }),
      ]);

      const itemsData = await itemsRes.json();
      const suppliersData = await suppliersRes.json();
      const categoriesData = await categoriesRes.json();

      const mappedItems: InventoryItem[] = itemsData.map((item: any) => ({
        id: item.id.toString(),
        name: item.item_name,
        category: item.category_name,
        quantity: item.current_quantity,
        minStock: item.minimum_stock_level,
        price: parseFloat(item.unit_price),
        supplier: item.supplier_name,
        description: item.description,
      }));

      const mappedSuppliers: Supplier[] = suppliersData.map((sup: any) => ({
        id: sup.id.toString(),
        supplierName: sup.supplier_name,
        companyName: sup.company_name,
        ruc: sup.ruc_n,
        address: sup.address,
      }));

      const mappedCategories: Category[] = categoriesData.map((cat: any) => ({
        id: cat.id.toString(),
        name: cat.category_name,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      }));

      setItems(mappedItems);
      setSuppliers(mappedSuppliers);
      setCategories(mappedCategories);
    };

    fetchData();
  }, [accessToken]);

  // Filter items by selected supplier
  const filteredItems = useMemo(() => {
    if (!selectedSupplier) return items;
    return items.filter(item => item.supplier === selectedSupplier);
  }, [items, selectedSupplier]);

  // Supplier metrics
  const supplierMetrics = useMemo(() => {
    const metrics: Record<string, SupplierMetrics> = {};
    suppliers.forEach(sup => {
      const supItems = items.filter(item => item.supplier === sup.supplierName);
      const totalValue = supItems.reduce((sum, i) => sum + i.quantity * i.price, 0);
      const lowStockItems = supItems.filter(i => getStockStatus(i) === 'low-stock').length;
      const outOfStockItems = supItems.filter(i => getStockStatus(i) === 'out-of-stock').length;
      const categories = [...new Set(supItems.map(i => i.category))];

      metrics[sup.supplierName] = {
        name: sup.supplierName,
        totalItems: supItems.length,
        totalValue,
        lowStockItems,
        outOfStockItems,
        averagePrice: supItems.length > 0 ? totalValue / supItems.reduce((sum, i) => sum + i.quantity, 0) : 0,
        categories,
      };
    });
    return metrics;
  }, [suppliers, items]);

  // Dashboard stats
  const dashboardStats = useMemo(() => {
    const totalItems = filteredItems.length;
    const totalValue = filteredItems.reduce((sum, i) => sum + i.quantity * i.price, 0);
    const totalQuantity = filteredItems.reduce((sum, i) => sum + i.quantity, 0);
    const lowStockItems = filteredItems.filter(i => getStockStatus(i) === 'low-stock').length;
    const outOfStockItems = filteredItems.filter(i => getStockStatus(i) === 'out-of-stock').length;
    const inStockItems = filteredItems.filter(i => getStockStatus(i) === 'in-stock').length;

    return {
      totalItems,
      totalValue,
      totalQuantity,
      lowStockItems,
      outOfStockItems,
      inStockItems,
      averagePrice: totalQuantity > 0 ? totalValue / totalQuantity : 0,
    };
  }, [filteredItems]);

  // Category distribution
  const categoryDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    filteredItems.forEach(item => {
      distribution[item.category] = (distribution[item.category] || 0) + item.quantity;
    });
    return Object.entries(distribution).map(([category, quantity]) => ({
      category,
      quantity,
      percentage: dashboardStats.totalQuantity > 0 ? (quantity / dashboardStats.totalQuantity) * 100 : 0,
    }));
  }, [filteredItems, dashboardStats.totalQuantity]);

  // Top items by value
  const topItemsByValue = useMemo(() => {
    return filteredItems
        .map(item => ({ ...item, totalValue: item.quantity * item.price }))
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 5);
  }, [filteredItems]);

  const statCards = [
    {
      title: t('dashboard.stats.totalItems'),
      value: dashboardStats.totalItems.toString(),
      icon: Package,
      color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50',
      change: `${dashboardStats.totalQuantity} ${t('dashboard.stats.units')}`,
      changeColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: t('dashboard.stats.totalValue'),
      value: formatCurrency(dashboardStats.totalValue),
      icon: DollarSign,
      color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/30 border-green-200 dark:border-green-800/50',
      change: `${t('dashboard.stats.avg')} ${formatCurrency(dashboardStats.averagePrice)}`,
      changeColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: t('dashboard.stats.inStock'),
      value: dashboardStats.inStockItems.toString(),
      icon: TrendingUp,
      color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/30 border-green-200 dark:border-green-800/50',
      change: t('dashboard.stats.healthyLevels'),
      changeColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: t('dashboard.stats.needsAttention'),
      value: (dashboardStats.lowStockItems + dashboardStats.outOfStockItems).toString(),
      icon: AlertTriangle,
      color: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/50',
      change: `${dashboardStats.outOfStockItems} ${t('dashboard.stats.outOfStock')}`,
      changeColor: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
      <div className="space-y-8 transition-colors duration-300">
        {/* Header with Supplier Filter */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {selectedSupplier
                  ? t('dashboard.subtitleSupplier', { supplier: selectedSupplier })
                  : t('dashboard.subtitle')}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
                onClick={() => exportToPDF(filteredItems, selectedSupplier)}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
            >
              <Download className="w-4 h-4" />
              <span>{t('dashboard.exportPDF')}</span>
            </button>

            <button
                onClick={() => exportToExcel(filteredItems, selectedSupplier)}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
            >
              <Download className="w-4 h-4" />
              <span>{t('dashboard.exportExcel')}</span>
            </button>

            <Filter className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="">{t('dashboard.allSuppliers')}</option>
              {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.supplierName}>
                    {sup.supplierName}
                  </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
                <div
                    key={idx}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {stat.value}
                      </p>
                      <p className={`text-sm mt-2 ${stat.changeColor}`}>{stat.change}</p>
                    </div>
                    <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center border ${stat.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
            );
          })}
        </div>

        {/* Category & Top Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('dashboard.categoryDistribution.title')}
              </h3>
              <BarChart3 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="space-y-4">
              {categoryDistribution.map((item, idx) => (
                  <div
                      key={item.category}
                      className="flex items-center justify-between text-gray-700 dark:text-gray-300"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: `hsl(${idx * 60}, 70%, 50%)`,
                          }}
                      />
                      <span className="text-sm font-medium">{item.category}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: `hsl(${idx * 60}, 70%, 50%)`,
                            }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                  {item.quantity}
                </span>
                    </div>
                  </div>
              ))}
            </div>
          </div>

          {/* Top Items by Value */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('dashboard.topItems.title')}
              </h3>
              <TrendingUp className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="space-y-4">
              {topItemsByValue.map((item, idx) => (
                  <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/30 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {idx + 1}
                  </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.quantity} {t('dashboard.stats.units')} × {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(item.totalValue)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.category}
                      </p>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </div>

        {/* Supplier Performance Table */}
        {!selectedSupplier && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t('dashboard.supplierPerformance.title')}
                </h3>
                <Users className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                      {t('dashboard.supplierPerformance.supplier')}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                      {t('dashboard.supplierPerformance.items')}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                      {t('dashboard.supplierPerformance.totalValue')}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                      {t('dashboard.supplierPerformance.categories')}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                      {t('dashboard.supplierPerformance.issues')}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                      {t('dashboard.supplierPerformance.action')}
                    </th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {Object.values(supplierMetrics).map((sup) => (
                      <tr
                          key={sup.name}
                          className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors duration-150"
                      >
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          {sup.name}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {sup.totalItems}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(sup.totalValue)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {sup.categories.slice(0, 2).map((cat) => (
                                <span
                                    key={cat}
                                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                                >
                          {cat}
                        </span>
                            ))}
                            {sup.categories.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                          +{sup.categories.length - 2}
                        </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            {sup.lowStockItems > 0 && (
                                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 text-xs rounded-full">
                          {sup.lowStockItems} {t('dashboard.supplierPerformance.low')}
                        </span>
                            )}
                            {sup.outOfStockItems > 0 && (
                                <span className="px-2 py-1 bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs rounded-full">
                          {sup.outOfStockItems} {t('dashboard.supplierPerformance.out')}
                        </span>
                            )}
                            {sup.lowStockItems === 0 &&
                                sup.outOfStockItems === 0 && (
                                    <span className="px-2 py-1 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                            {t('dashboard.supplierPerformance.good')}
                          </span>
                                )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <button
                              onClick={() => setSelectedSupplier(sup.name)}
                              className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-sm">{t('dashboard.view')}</span>
                          </button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
        )}
      </div>
  );

};



// import React, { useState, useMemo } from 'react';
// import { BarChart3, TrendingUp, Package, DollarSign, Filter, Users, AlertTriangle, Eye, Download } from 'lucide-react';
// import { InventoryItem } from '../types/inventory';
// import { formatCurrency, getStockStatus } from '../utils/stockUtils';
// import { exportToExcel } from '../utils/exportUtils';
//
// interface DashboardProps {
//   items: InventoryItem[];
// }
//
// interface SupplierMetrics {
//   name: string;
//   totalItems: number;
//   totalValue: number;
//   lowStockItems: number;
//   outOfStockItems: number;
//   averagePrice: number;
//   categories: string[];
// }
//
// export const Dashboard: React.FC<DashboardProps> = ({ items }) => {
//   const [selectedSupplier, setSelectedSupplier] = useState<string>('');
//
//   // Get unique suppliers
//   const suppliers = useMemo(() => {
//     const uniqueSuppliers = [...new Set(items.map(item => item.supplier))];
//     return uniqueSuppliers.sort();
//   }, [items]);
//
//   // Filter items by selected supplier
//   const filteredItems = useMemo(() => {
//     if (!selectedSupplier) return items;
//     return items.filter(item => item.supplier === selectedSupplier);
//   }, [items, selectedSupplier]);
//
//   // Calculate supplier metrics
//   const supplierMetrics = useMemo(() => {
//     const metrics: Record<string, SupplierMetrics> = {};
//
//     suppliers.forEach(supplier => {
//       const supplierItems = items.filter(item => item.supplier === supplier);
//       const totalValue = supplierItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
//       const lowStockItems = supplierItems.filter(item => getStockStatus(item) === 'low-stock').length;
//       const outOfStockItems = supplierItems.filter(item => getStockStatus(item) === 'out-of-stock').length;
//       const categories = [...new Set(supplierItems.map(item => item.category))];
//
//       metrics[supplier] = {
//         name: supplier,
//         totalItems: supplierItems.length,
//         totalValue,
//         lowStockItems,
//         outOfStockItems,
//         averagePrice: supplierItems.length > 0 ? totalValue / supplierItems.reduce((sum, item) => sum + item.quantity, 0) : 0,
//         categories,
//       };
//     });
//
//     return metrics;
//   }, [items, suppliers]);
//
//   // Calculate dashboard stats for filtered items
//   const dashboardStats = useMemo(() => {
//     const totalItems = filteredItems.length;
//     const totalValue = filteredItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
//     const totalQuantity = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
//     const lowStockItems = filteredItems.filter(item => getStockStatus(item) === 'low-stock').length;
//     const outOfStockItems = filteredItems.filter(item => getStockStatus(item) === 'out-of-stock').length;
//     const inStockItems = filteredItems.filter(item => getStockStatus(item) === 'in-stock').length;
//
//     return {
//       totalItems,
//       totalValue,
//       totalQuantity,
//       lowStockItems,
//       outOfStockItems,
//       inStockItems,
//       averagePrice: totalQuantity > 0 ? totalValue / totalQuantity : 0,
//     };
//   }, [filteredItems]);
//
//   // Get category distribution
//   const categoryDistribution = useMemo(() => {
//     const distribution: Record<string, number> = {};
//     filteredItems.forEach(item => {
//       distribution[item.category] = (distribution[item.category] || 0) + item.quantity;
//     });
//     return Object.entries(distribution).map(([category, quantity]) => ({
//       category,
//       quantity,
//       percentage: dashboardStats.totalQuantity > 0 ? (quantity / dashboardStats.totalQuantity) * 100 : 0,
//     }));
//   }, [filteredItems, dashboardStats.totalQuantity]);
//
//   // Get top items by value
//   const topItemsByValue = useMemo(() => {
//     return filteredItems
//       .map(item => ({
//         ...item,
//         totalValue: item.quantity * item.price,
//       }))
//       .sort((a, b) => b.totalValue - a.totalValue)
//       .slice(0, 5);
//   }, [filteredItems]);
//
//   const statCards = [
//     {
//       title: 'Total Items',
//       value: dashboardStats.totalItems.toString(),
//       icon: Package,
//       color: 'text-blue-600 bg-blue-50 border-blue-200',
//       change: `${dashboardStats.totalQuantity} units`,
//       changeColor: 'text-blue-600',
//     },
//     {
//       title: 'Total Value',
//       value: formatCurrency(dashboardStats.totalValue),
//       icon: DollarSign,
//       color: 'text-green-600 bg-green-50 border-green-200',
//       change: `Avg: ${formatCurrency(dashboardStats.averagePrice)}`,
//       changeColor: 'text-green-600',
//     },
//     {
//       title: 'In Stock',
//       value: dashboardStats.inStockItems.toString(),
//       icon: TrendingUp,
//       color: 'text-green-600 bg-green-50 border-green-200',
//       change: 'Healthy levels',
//       changeColor: 'text-green-600',
//     },
//     {
//       title: 'Needs Attention',
//       value: (dashboardStats.lowStockItems + dashboardStats.outOfStockItems).toString(),
//       icon: AlertTriangle,
//       color: 'text-orange-600 bg-orange-50 border-orange-200',
//       change: `${dashboardStats.outOfStockItems} out of stock`,
//       changeColor: 'text-red-600',
//     },
//   ];
//
//   return (
//     <div className="space-y-8">
//       {/* Header with Supplier Filter */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
//           <p className="text-gray-600 mt-1">
//             {selectedSupplier ? `Analytics for ${selectedSupplier}` : 'Overview of all inventory'}
//           </p>
//         </div>
//
//         <div className="flex items-center space-x-3">
//           <button
//             onClick={() => exportToExcel(filteredItems, selectedSupplier)}
//             className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
//           >
//             <Download className="w-4 h-4" />
//             <span>Export Excel</span>
//           </button>
//
//           <Filter className="w-5 h-5 text-gray-400" />
//           <select
//             value={selectedSupplier}
//             onChange={(e) => setSelectedSupplier(e.target.value)}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
//           >
//             <option value="">All Suppliers</option>
//             {suppliers.map((supplier) => (
//               <option key={supplier} value={supplier}>
//                 {supplier}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>
//
//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {statCards.map((stat, index) => {
//           const Icon = stat.icon;
//           return (
//             <div
//               key={index}
//               className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
//             >
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
//                   <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
//                   <p className={`text-sm mt-2 ${stat.changeColor}`}>{stat.change}</p>
//                 </div>
//                 <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${stat.color}`}>
//                   <Icon className="w-6 h-6" />
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* Category Distribution */}
//         <div className="bg-white rounded-xl border border-gray-200 p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-lg font-semibold text-gray-900">Category Distribution</h3>
//             <BarChart3 className="w-5 h-5 text-gray-400" />
//           </div>
//
//           <div className="space-y-4">
//             {categoryDistribution.map((item, index) => (
//               <div key={item.category} className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <div
//                     className="w-4 h-4 rounded-full"
//                     style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
//                   />
//                   <span className="text-sm font-medium text-gray-700">{item.category}</span>
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <div className="w-24 bg-gray-200 rounded-full h-2">
//                     <div
//                       className="h-2 rounded-full transition-all duration-500"
//                       style={{
//                         width: `${item.percentage}%`,
//                         backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
//                       }}
//                     />
//                   </div>
//                   <span className="text-sm text-gray-600 w-12 text-right">{item.quantity}</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//
//         {/* Top Items by Value */}
//         <div className="bg-white rounded-xl border border-gray-200 p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-lg font-semibold text-gray-900">Top Items by Value</h3>
//             <TrendingUp className="w-5 h-5 text-gray-400" />
//           </div>
//
//           <div className="space-y-4">
//             {topItemsByValue.map((item, index) => (
//               <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
//                     <span className="text-sm font-bold text-blue-600">{index + 1}</span>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-900">{item.name}</p>
//                     <p className="text-xs text-gray-500">{item.quantity} units × {formatCurrency(item.price)}</p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-sm font-bold text-gray-900">{formatCurrency(item.totalValue)}</p>
//                   <p className="text-xs text-gray-500">{item.category}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//
//       {/* Supplier Comparison Table */}
//       {!selectedSupplier && (
//         <div className="bg-white rounded-xl border border-gray-200 p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-lg font-semibold text-gray-900">Supplier Performance</h3>
//             <Users className="w-5 h-5 text-gray-400" />
//           </div>
//
//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead>
//                 <tr className="border-b border-gray-200">
//                   <th className="text-left py-3 px-4 font-medium text-gray-700">Supplier</th>
//                   <th className="text-left py-3 px-4 font-medium text-gray-700">Items</th>
//                   <th className="text-left py-3 px-4 font-medium text-gray-700">Total Value</th>
//                   <th className="text-left py-3 px-4 font-medium text-gray-700">Categories</th>
//                   <th className="text-left py-3 px-4 font-medium text-gray-700">Issues</th>
//                   <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {Object.values(supplierMetrics).map((supplier) => (
//                   <tr key={supplier.name} className="hover:bg-gray-50 transition-colors duration-150">
//                     <td className="py-3 px-4">
//                       <div className="font-medium text-gray-900">{supplier.name}</div>
//                     </td>
//                     <td className="py-3 px-4 text-gray-600">{supplier.totalItems}</td>
//                     <td className="py-3 px-4 font-medium text-gray-900">{formatCurrency(supplier.totalValue)}</td>
//                     <td className="py-3 px-4">
//                       <div className="flex flex-wrap gap-1">
//                         {supplier.categories.slice(0, 2).map((category) => (
//                           <span key={category} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
//                             {category}
//                           </span>
//                         ))}
//                         {supplier.categories.length > 2 && (
//                           <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
//                             +{supplier.categories.length - 2}
//                           </span>
//                         )}
//                       </div>
//                     </td>
//                     <td className="py-3 px-4">
//                       <div className="flex space-x-2">
//                         {supplier.lowStockItems > 0 && (
//                           <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
//                             {supplier.lowStockItems} low
//                           </span>
//                         )}
//                         {supplier.outOfStockItems > 0 && (
//                           <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
//                             {supplier.outOfStockItems} out
//                           </span>
//                         )}
//                         {supplier.lowStockItems === 0 && supplier.outOfStockItems === 0 && (
//                           <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
//                             Good
//                           </span>
//                         )}
//                       </div>
//                     </td>
//                     <td className="py-3 px-4">
//                       <button
//                         onClick={() => setSelectedSupplier(supplier.name)}
//                         className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
//                       >
//                         <Eye className="w-4 h-4" />
//                         <span className="text-sm">View</span>
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
//};