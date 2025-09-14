import { useState } from 'react';
import { InventoryItem } from '../types/inventory';
import { inventoryItems as initialItems } from '../data/mockData';

export const useInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>(initialItems);

  const addItem = (newItem: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    const item: InventoryItem = {
      ...newItem,
      id: Date.now().toString(),
      lastUpdated: new Date(),
    };
    setItems(prev => [...prev, item]);
  };

  const updateItem = (updatedItem: InventoryItem) => {
    setItems(prev =>
      prev.map(item =>
        item.id === updatedItem.id
          ? { ...updatedItem, lastUpdated: new Date() }
          : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const editItem = (itemData: Omit<InventoryItem, 'id' | 'lastUpdated'>, itemId: string) => {
    const updatedItem: InventoryItem = {
      ...itemData,
      id: itemId,
      lastUpdated: new Date(),
    };
    updateItem(updatedItem);
  };

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
    editItem,
  };
};