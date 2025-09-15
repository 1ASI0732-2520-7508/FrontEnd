import { useState, useEffect } from "react";
import { InventoryItem } from "../types/inventory";
import axios from "axios";

interface ApiItem {
  id: number;
  item_name: string;
  description: string;
  current_quantity: number;
  minimum_stock_level: number;
  unit_price: string;
  supplier: number;
  category: number;
}

interface Supplier {
  id: number;
  supplier_name: string;
}

interface Category {
  id: number;
  category_name: string;
}

// Custom hook for inventory management
export const useInventory = () => {
  const token = localStorage.getItem("access_token");

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const API_URL = import.meta.env.VITE_API_URL;

  // Axios instance with auth header
  const api = axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      const res = await api.get("/api/suppliers/");
      setSuppliers(res.data);
    } catch (err) {
      console.error("Error fetching suppliers", err);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/categories/");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  // Fetch items and map to frontend format
  const fetchItems = async () => {
    try {
      const res = await api.get("/api/items/");
      const mappedItems: InventoryItem[] = res.data.map((i: ApiItem) => ({
        id: i.id.toString(),
        name: i.item_name,
        description: i.description,
        quantity: i.current_quantity,
        minStock: i.minimum_stock_level,
        price: parseFloat(i.unit_price),
        supplier:
          suppliers.find((s) => s.id === i.supplier)?.supplier_name || "",
        category:
          categories.find((c) => c.id === i.category)?.category_name || "",
        lastUpdated: new Date(), // or get it from API if available
      }));

      console.log(mappedItems);
      setItems(mappedItems);
    } catch (err) {
      console.error("Error fetching items", err);
    }
  };

  useEffect(() => {
    if (!token) return;
    // fetch suppliers and categories first, then items
    Promise.all([fetchSuppliers(), fetchCategories()]).then(() => fetchItems());
  }, [token]);

  // CRUD operations
  const addItem = async (
    newItem: Omit<InventoryItem, "id" | "lastUpdated">,
  ) => {
    try {
      const categoryObj = categories.find(
        (c) => c.category_name === newItem.category,
      );
      const supplierObj = suppliers.find(
        (s) => s.supplier_name === newItem.supplier,
      );

      const res = await api.post("/api/items/", {
        item_name: newItem.name,
        description: newItem.description,
        current_quantity: newItem.quantity,
        minimum_stock_level: newItem.minStock,
        unit_price: newItem.price.toString(),
        supplier: supplierObj?.id,
        category: categoryObj?.id,
      });

      console.log(res);

      fetchItems();
    } catch (err) {
      console.error("Error adding item", err);
    }
  };

  const editItem = async (
    updatedData: Omit<InventoryItem, "id" | "lastUpdated">,
    id: string,
  ) => {
    try {
      const categoryObj = categories.find(
        (c) => c.category_name === updatedData.category,
      );
      const supplierObj = suppliers.find(
        (s) => s.supplier_name === updatedData.supplier,
      );

      await api.put(`/api/items/${id}/`, {
        item_name: updatedData.name,
        description: updatedData.description,
        current_quantity: updatedData.quantity,
        minimum_stock_level: updatedData.minStock,
        unit_price: updatedData.price.toString(),
        supplier: supplierObj?.id,
        category: categoryObj?.id,
      });

      fetchItems();
    } catch (err) {
      console.error("Error updating item", err);
    }
  };

  // Delete item
  const deleteItem = async (id: string) => {
    try {
      await api.delete(`/api/items/${id}/`);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting item", err);
    }
  };

  return { items, addItem, editItem, deleteItem, suppliers, categories };
};

/*import { useState, useEffect } from 'react';
import { InventoryItem } from '../types/inventory';
import { useAuth } from './useAuth';

const API_URL = 'http://localhost:8000/api/items/'; // Change to your API endpoint

export const useInventory = () => {
  const { user } = useAuth(); // assuming useAuth provides the access token
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('access_token')}`, // make sure useAuth returns accessToken
  });

  // Map API response to frontend InventoryItem type
  const mapApiItemToInventoryItem = (apiItem: any): InventoryItem => ({
    id: apiItem.id.toString(),
    name: apiItem.item_name,
    category: apiItem.category_name,
    quantity: apiItem.current_quantity,
    minStock: apiItem.minimum_stock_level,
    price: parseFloat(apiItem.unit_price),
    supplier: apiItem.supplier_name,
    description: apiItem.description || '',
  });

  const fetchItems = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: getAuthHeaders() });
      const data = await res.json();
      const mappedItems = data.map(mapApiItemToInventoryItem);
      setItems(mappedItems);
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user]);

  const addItem = async (newItem: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    if (!user) return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          item_name: newItem.name,
          category: newItem.category,
          current_quantity: newItem.quantity,
          minimum_stock_level: newItem.minStock,
          unit_price: newItem.price.toString(),
          supplier: newItem.supplier,
          description: newItem.description,
        }),
      });
      const savedItem = await res.json();
      setItems(prev => [...prev, mapApiItemToInventoryItem(savedItem)]);
    } catch (err) {
      console.error('Error adding item:', err);
    }
  };

  const editItem = async (itemData: Omit<InventoryItem, 'id' | 'lastUpdated'>, itemId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}${itemId}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          item_name: itemData.name,
          category: itemData.category,
          current_quantity: itemData.quantity,
          minimum_stock_level: itemData.minStock,
          unit_price: itemData.price.toString(),
          supplier: itemData.supplier,
          description: itemData.description,
        }),
      });
      const updatedItem = await res.json();
      setItems(prev => prev.map(item => item.id === itemId ? mapApiItemToInventoryItem(updatedItem) : item));
    } catch (err) {
      console.error('Error editing item:', err);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!user) return;
    try {
      await fetch(`${API_URL}${itemId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  return { items, loading, fetchItems, addItem, editItem, deleteItem };
};
*/
