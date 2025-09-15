
import {InventoryItem} from "../types/inventory.ts";
import {Supplier} from "../types/supplier.ts";
import {Category} from "../types/inventory.ts";

import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle, Filter } from 'lucide-react';
import { formatCurrency, getStockStatus } from '../utils/stockUtils';

const API_URL = import.meta.env.VITE_API_URL;

export const Analytics: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [timeFilter, setTimeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [itemsRes, categoriesRes] = await Promise.all([
          fetch(`${API_URL}/api/items/`, { headers }),
          fetch(`${API_URL}/api/categories/`, { headers }),
        ]);

        const itemsData = await itemsRes.json();
        const categoriesData = await categoriesRes.json();

        setItems(
            itemsData.map((i: any) => ({
              id: i.id.toString(),
              name: i.item_name,
              category: i.category_name,
              quantity: i.current_quantity,
              minStock: i.minimum_stock_level,
              price: parseFloat(i.unit_price),
              supplier: i.supplier_name,
              description: i.description || '',
              lastUpdated: i.last_updated,
            }))
        );

        setCategories(
            categoriesData.map((c: any, idx: number) => ({
              id: c.id.toString(),
              name: c.category_name,
              color: `hsl(${idx * 60}, 70%, 50%)`,
            }))
        );
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };

    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    let filtered = items;

    if (categoryFilter) filtered = filtered.filter((item) => item.category === categoryFilter);

    if (timeFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      switch (timeFilter) {
        case '7d':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          filterDate.setDate(now.getDate() - 90);
          break;
      }
      filtered = filtered.filter((item) => new Date(item.lastUpdated || now) >= filterDate);
    }

    return filtered;
  }, [items, categoryFilter, timeFilter]);

  const analytics = useMemo(() => {
    const totalItems = filteredItems.length;
    const totalValue = filteredItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const totalQuantity = filteredItems.reduce((sum, item) => sum + item.quantity, 0);

    const stockAnalysis = {
      inStock: filteredItems.filter((i) => getStockStatus(i) === 'in-stock').length,
      lowStock: filteredItems.filter((i) => getStockStatus(i) === 'low-stock').length,
      outOfStock: filteredItems.filter((i) => getStockStatus(i) === 'out-of-stock').length,
    };

    const categoryAnalysis = categories.map((c) => {
      const categoryItems = filteredItems.filter((i) => i.category === c.name);
      const value = categoryItems.reduce((sum, i) => sum + i.quantity * i.price, 0);
      const quantity = categoryItems.reduce((sum, i) => sum + i.quantity, 0);
      return {
        category: c.name,
        items: categoryItems.length,
        quantity,
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
        color: c.color,
      };
    });

    const supplierAnalysis = [...new Set(filteredItems.map((i) => i.supplier))].map((supplierName, idx) => {
      const supplierItems = filteredItems.filter((i) => i.supplier === supplierName);
      const value = supplierItems.reduce((sum, i) => sum + i.quantity * i.price, 0);
      const quantity = supplierItems.reduce((sum, i) => sum + i.quantity, 0);
      return {
        supplier: supplierName,
        items: supplierItems.length,
        quantity,
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
        color: `hsl(${idx * 60}, 70%, 50%)`,
      };
    });

    const priceAnalysis = {
      highest: filteredItems.reduce((max, i) => (i.price > max.price ? i : max), filteredItems[0] || { price: 0 }),
      lowest: filteredItems.reduce((min, i) => (i.price < min.price ? i : min), filteredItems[0] || { price: 0 }),
      average: totalQuantity > 0 ? totalValue / totalQuantity : 0,
    };

    return { totalItems, totalValue, totalQuantity, stockAnalysis, categoryAnalysis, supplierAnalysis, priceAnalysis };
  }, [filteredItems, categories]);

  const statCards = [
    {
      title: 'Total Portfolio Value',
      value: formatCurrency(analytics.totalValue),
      icon: DollarSign,
      color: 'text-green-600 bg-green-50 border-green-200',
      change: `${analytics.totalItems} unique items`,
      changeColor: 'text-green-600',
    },
    {
      title: 'Total Units',
      value: analytics.totalQuantity.toLocaleString(),
      icon: Package,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      change: `Avg: ${formatCurrency(analytics.priceAnalysis.average)}`,
      changeColor: 'text-blue-600',
    },
    {
      title: 'Stock Health',
      value: `${Math.round((analytics.stockAnalysis.inStock / analytics.totalItems) * 100 || 0)}%`,
      icon: TrendingUp,
      color: 'text-green-600 bg-green-50 border-green-200',
      change: `${analytics.stockAnalysis.inStock} items healthy`,
      changeColor: 'text-green-600',
    },
    {
      title: 'Attention Needed',
      value: (analytics.stockAnalysis.lowStock + analytics.stockAnalysis.outOfStock).toString(),
      icon: AlertTriangle,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      change: `${analytics.stockAnalysis.outOfStock} critical`,
      changeColor: 'text-red-600',
    },
  ];

  return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Analytics</h2>
            <p className="text-gray-600 mt-1">Comprehensive inventory insights and trends</p>
          </div>
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 border rounded-lg">
              <option value="">All Categories</option>
              {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="px-3 py-2 border rounded-lg">
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      <p className={`text-sm mt-2 ${stat.changeColor}`}>{stat.change}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
            );
          })}
        </div>

        {/* Category Analysis */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Category Performance</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {analytics.categoryAnalysis.map((cat, i) => (
                <div key={cat.category}>
                  <div className="flex justify-between">
                    <span>{cat.category}</span>
                    <span>{formatCurrency(cat.value)} ({cat.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{cat.items} items</span>
                    <span>{cat.quantity} units</span>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* Supplier Analysis */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Supplier Distribution</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {analytics.supplierAnalysis.map((sup, i) => (
                <div key={sup.supplier} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: sup.color }} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{sup.supplier}</p>
                      <p className="text-xs text-gray-500">{sup.items} items • {sup.quantity} units</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(sup.value)}</p>
                    <p className="text-xs text-gray-500">{sup.percentage.toFixed(1)}%</p>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* Stock Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-2xl font-bold text-green-600">{analytics.stockAnalysis.inStock}</p>
            <p className="text-sm font-medium">In Stock</p>
            <p className="text-xs">{Math.round((analytics.stockAnalysis.inStock / analytics.totalItems) * 100 || 0)}% of inventory</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-2xl font-bold text-orange-600">{analytics.stockAnalysis.lowStock}</p>
            <p className="text-sm font-medium">Low Stock</p>
            <p className="text-xs">{Math.round((analytics.stockAnalysis.lowStock / analytics.totalItems) * 100 || 0)}% needs reorder</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-2xl font-bold text-red-600">{analytics.stockAnalysis.outOfStock}</p>
            <p className="text-sm font-medium">Out of Stock</p>
            <p className="text-xs">{Math.round((analytics.stockAnalysis.outOfStock / analytics.totalItems) * 100 || 0)}% critical</p>
          </div>
        </div>

        {/* Price Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-700">Highest Priced Item</p>
            <p className="text-lg font-bold text-blue-900">{analytics.priceAnalysis.highest?.name || 'N/A'}</p>
            <p className="text-sm text-blue-600">{formatCurrency(analytics.priceAnalysis.highest?.price || 0)}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-700">Average Unit Price</p>
            <p className="text-lg font-bold text-green-900">{formatCurrency(analytics.priceAnalysis.average)}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm font-medium text-purple-700">Lowest Priced Item</p>
            <p className="text-lg font-bold text-purple-900">{analytics.priceAnalysis.lowest?.name || 'N/A'}</p>
            <p className="text-sm text-purple-600">{formatCurrency(analytics.priceAnalysis.lowest?.price || 0)}</p>
          </div>
        </div>
      </div>
  );
};


// import React, { useMemo, useState } from 'react';
// import { BarChart3, TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle, Calendar, Filter } from 'lucide-react';
// import { InventoryItem } from '../types/inventory';
// import { formatCurrency, getStockStatus } from '../utils/stockUtils';
//
// interface AnalyticsProps {
//   items: InventoryItem[];
// }
//
// export const Analytics: React.FC<AnalyticsProps> = ({ items }) => {
//   const [timeFilter, setTimeFilter] = useState('all');
//   const [categoryFilter, setCategoryFilter] = useState('');
//
//   // Get unique categories
//   const categories = useMemo(() => {
//     return [...new Set(items.map(item => item.category))].sort();
//   }, [items]);
//
//   // Filter items based on time and category
//   const filteredItems = useMemo(() => {
//     let filtered = items;
//
//     // Category filter
//     if (categoryFilter) {
//       filtered = filtered.filter(item => item.category === categoryFilter);
//     }
//
//     // Time filter (based on lastUpdated)
//     if (timeFilter !== 'all') {
//       const now = new Date();
//       const filterDate = new Date();
//
//       switch (timeFilter) {
//         case '7d':
//           filterDate.setDate(now.getDate() - 7);
//           break;
//         case '30d':
//           filterDate.setDate(now.getDate() - 30);
//           break;
//         case '90d':
//           filterDate.setDate(now.getDate() - 90);
//           break;
//       }
//
//       filtered = filtered.filter(item => new Date(item.lastUpdated) >= filterDate);
//     }
//
//     return filtered;
//   }, [items, timeFilter, categoryFilter]);
//
//   // Calculate analytics metrics
//   const analytics = useMemo(() => {
//     const totalItems = filteredItems.length;
//     const totalValue = filteredItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
//     const totalQuantity = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
//
//     const stockAnalysis = {
//       inStock: filteredItems.filter(item => getStockStatus(item) === 'in-stock').length,
//       lowStock: filteredItems.filter(item => getStockStatus(item) === 'low-stock').length,
//       outOfStock: filteredItems.filter(item => getStockStatus(item) === 'out-of-stock').length,
//     };
//
//     const categoryAnalysis = categories.map(category => {
//       const categoryItems = filteredItems.filter(item => item.category === category);
//       const categoryValue = categoryItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
//       const categoryQuantity = categoryItems.reduce((sum, item) => sum + item.quantity, 0);
//
//       return {
//         category,
//         items: categoryItems.length,
//         quantity: categoryQuantity,
//         value: categoryValue,
//         percentage: totalValue > 0 ? (categoryValue / totalValue) * 100 : 0,
//       };
//     }).sort((a, b) => b.value - a.value);
//
//     const supplierAnalysis = [...new Set(filteredItems.map(item => item.supplier))].map(supplier => {
//       const supplierItems = filteredItems.filter(item => item.supplier === supplier);
//       const supplierValue = supplierItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
//       const supplierQuantity = supplierItems.reduce((sum, item) => sum + item.quantity, 0);
//
//       return {
//         supplier,
//         items: supplierItems.length,
//         quantity: supplierQuantity,
//         value: supplierValue,
//         percentage: totalValue > 0 ? (supplierValue / totalValue) * 100 : 0,
//       };
//     }).sort((a, b) => b.value - a.value);
//
//     const priceAnalysis = {
//       highest: filteredItems.reduce((max, item) => item.price > max.price ? item : max, filteredItems[0] || { price: 0 }),
//       lowest: filteredItems.reduce((min, item) => item.price < min.price ? item : min, filteredItems[0] || { price: 0 }),
//       average: totalQuantity > 0 ? totalValue / totalQuantity : 0,
//     };
//
//     return {
//       totalItems,
//       totalValue,
//       totalQuantity,
//       stockAnalysis,
//       categoryAnalysis,
//       supplierAnalysis,
//       priceAnalysis,
//     };
//   }, [filteredItems, categories]);
//
//   const statCards = [
//     {
//       title: 'Total Portfolio Value',
//       value: formatCurrency(analytics.totalValue),
//       icon: DollarSign,
//       color: 'text-green-600 bg-green-50 border-green-200',
//       change: `${analytics.totalItems} unique items`,
//       changeColor: 'text-green-600',
//     },
//     {
//       title: 'Total Units',
//       value: analytics.totalQuantity.toLocaleString(),
//       icon: Package,
//       color: 'text-blue-600 bg-blue-50 border-blue-200',
//       change: `Avg: ${formatCurrency(analytics.priceAnalysis.average)}`,
//       changeColor: 'text-blue-600',
//     },
//     {
//       title: 'Stock Health',
//       value: `${Math.round((analytics.stockAnalysis.inStock / analytics.totalItems) * 100 || 0)}%`,
//       icon: TrendingUp,
//       color: 'text-green-600 bg-green-50 border-green-200',
//       change: `${analytics.stockAnalysis.inStock} items healthy`,
//       changeColor: 'text-green-600',
//     },
//     {
//       title: 'Attention Needed',
//       value: (analytics.stockAnalysis.lowStock + analytics.stockAnalysis.outOfStock).toString(),
//       icon: AlertTriangle,
//       color: 'text-orange-600 bg-orange-50 border-orange-200',
//       change: `${analytics.stockAnalysis.outOfStock} critical`,
//       changeColor: 'text-red-600',
//     },
//   ];
//
//   return (
//     <div className="space-y-8">
//       {/* Header with Filters */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-900">Analytics</h2>
//           <p className="text-gray-600 mt-1">Comprehensive inventory insights and trends</p>
//         </div>
//
//         <div className="flex items-center space-x-3">
//           <Filter className="w-5 h-5 text-gray-400" />
//           <select
//             value={categoryFilter}
//             onChange={(e) => setCategoryFilter(e.target.value)}
//             className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
//           >
//             <option value="">All Categories</option>
//             {categories.map((category) => (
//               <option key={category} value={category}>
//                 {category}
//               </option>
//             ))}
//           </select>
//
//           <select
//             value={timeFilter}
//             onChange={(e) => setTimeFilter(e.target.value)}
//             className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
//           >
//             <option value="all">All Time</option>
//             <option value="7d">Last 7 Days</option>
//             <option value="30d">Last 30 Days</option>
//             <option value="90d">Last 90 Days</option>
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
//         {/* Category Analysis */}
//         <div className="bg-white rounded-xl border border-gray-200 p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-lg font-semibold text-gray-900">Category Performance</h3>
//             <BarChart3 className="w-5 h-5 text-gray-400" />
//           </div>
//
//           <div className="space-y-4">
//             {analytics.categoryAnalysis.map((category, index) => (
//               <div key={category.category} className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm font-medium text-gray-700">{category.category}</span>
//                   <div className="text-right">
//                     <span className="text-sm font-bold text-gray-900">{formatCurrency(category.value)}</span>
//                     <span className="text-xs text-gray-500 ml-2">({category.percentage.toFixed(1)}%)</span>
//                   </div>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div
//                     className="h-2 rounded-full transition-all duration-500"
//                     style={{
//                       width: `${category.percentage}%`,
//                       backgroundColor: `hsl(${index * 45}, 70%, 50%)`,
//                     }}
//                   />
//                 </div>
//                 <div className="flex justify-between text-xs text-gray-500">
//                   <span>{category.items} items</span>
//                   <span>{category.quantity} units</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//
//         {/* Supplier Analysis */}
//         <div className="bg-white rounded-xl border border-gray-200 p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-lg font-semibold text-gray-900">Supplier Distribution</h3>
//             <TrendingUp className="w-5 h-5 text-gray-400" />
//           </div>
//
//           <div className="space-y-4">
//             {analytics.supplierAnalysis.slice(0, 6).map((supplier, index) => (
//               <div key={supplier.supplier} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                 <div className="flex items-center space-x-3">
//                   <div
//                     className="w-4 h-4 rounded-full"
//                     style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
//                   />
//                   <div>
//                     <p className="text-sm font-medium text-gray-900">{supplier.supplier}</p>
//                     <p className="text-xs text-gray-500">{supplier.items} items • {supplier.quantity} units</p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-sm font-bold text-gray-900">{formatCurrency(supplier.value)}</p>
//                   <p className="text-xs text-gray-500">{supplier.percentage.toFixed(1)}%</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//
//       {/* Stock Status Overview */}
//       <div className="bg-white rounded-xl border border-gray-200 p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-lg font-semibold text-gray-900">Stock Status Distribution</h3>
//           <Package className="w-5 h-5 text-gray-400" />
//         </div>
//
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
//             <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
//               <TrendingUp className="w-6 h-6 text-green-600" />
//             </div>
//             <p className="text-2xl font-bold text-green-600">{analytics.stockAnalysis.inStock}</p>
//             <p className="text-sm text-green-700 font-medium">In Stock</p>
//             <p className="text-xs text-green-600 mt-1">
//               {Math.round((analytics.stockAnalysis.inStock / analytics.totalItems) * 100 || 0)}% of inventory
//             </p>
//           </div>
//
//           <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
//             <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
//               <TrendingDown className="w-6 h-6 text-orange-600" />
//             </div>
//             <p className="text-2xl font-bold text-orange-600">{analytics.stockAnalysis.lowStock}</p>
//             <p className="text-sm text-orange-700 font-medium">Low Stock</p>
//             <p className="text-xs text-orange-600 mt-1">
//               {Math.round((analytics.stockAnalysis.lowStock / analytics.totalItems) * 100 || 0)}% needs reorder
//             </p>
//           </div>
//
//           <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
//             <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
//               <AlertTriangle className="w-6 h-6 text-red-600" />
//             </div>
//             <p className="text-2xl font-bold text-red-600">{analytics.stockAnalysis.outOfStock}</p>
//             <p className="text-sm text-red-700 font-medium">Out of Stock</p>
//             <p className="text-xs text-red-600 mt-1">
//               {Math.round((analytics.stockAnalysis.outOfStock / analytics.totalItems) * 100 || 0)}% critical
//             </p>
//           </div>
//         </div>
//       </div>
//
//       {/* Price Analysis */}
//       <div className="bg-white rounded-xl border border-gray-200 p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-lg font-semibold text-gray-900">Price Analysis</h3>
//           <DollarSign className="w-5 h-5 text-gray-400" />
//         </div>
//
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
//             <h4 className="text-sm font-medium text-blue-700 mb-2">Highest Priced Item</h4>
//             <p className="text-lg font-bold text-blue-900">{analytics.priceAnalysis.highest?.name || 'N/A'}</p>
//             <p className="text-sm text-blue-600">{formatCurrency(analytics.priceAnalysis.highest?.price || 0)}</p>
//           </div>
//
//           <div className="p-4 bg-green-50 rounded-lg border border-green-200">
//             <h4 className="text-sm font-medium text-green-700 mb-2">Average Unit Price</h4>
//             <p className="text-lg font-bold text-green-900">{formatCurrency(analytics.priceAnalysis.average)}</p>
//             <p className="text-sm text-green-600">Across all items</p>
//           </div>
//
//           <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
//             <h4 className="text-sm font-medium text-purple-700 mb-2">Lowest Priced Item</h4>
//             <p className="text-lg font-bold text-purple-900">{analytics.priceAnalysis.lowest?.name || 'N/A'}</p>
//             <p className="text-sm text-purple-600">{formatCurrency(analytics.priceAnalysis.lowest?.price || 0)}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };