import { useState, useMemo } from 'react';
import { InventoryItem } from '../types/inventory';
import { getStockStatus } from '../utils/stockUtils';

export const useFilters = (items: InventoryItem[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [stockFilter, setStockFilter] = useState('');

  const filteredItems = useMemo(() => {
    let filtered = items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      const matchesStock = !stockFilter || getStockStatus(item) === stockFilter;
      
      return matchesSearch && matchesCategory && matchesStock;
    });

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'quantity':
          return b.quantity - a.quantity;
        case 'price':
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return filtered;
  }, [items, searchTerm, selectedCategory, sortBy, stockFilter]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    stockFilter,
    setStockFilter,
    filteredItems,
  };
};