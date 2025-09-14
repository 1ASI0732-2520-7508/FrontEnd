import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { Supplier, SupplierFormData } from '../types/supplier';

const API_URL = 'http://localhost:8000/api/suppliers/';

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const  accessToken = localStorage.getItem('access_token');

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  // Fetch all suppliers
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, { headers });
      // Map API response to your frontend type
      const mappedSuppliers: Supplier[] = response.data.map((s: any) => ({
        id: s.id.toString(),
        supplierName: s.supplier_name,
        companyName: s.company_name,
        ruc: s.ruc_n,
        address: s.address,
      }));
      setSuppliers(mappedSuppliers);
    } catch (err) {
      console.error('Error fetching suppliers', err);
    } finally {
      setLoading(false);
    }
  };

  // Add a new supplier
  const addSupplier = async (supplierData: SupplierFormData) => {
    try {
      const payload = {
        supplier_name: supplierData.supplierName,
        company_name: supplierData.companyName,
        ruc_n: supplierData.ruc,
        address: supplierData.address,
        company: 1, // or get the actual company ID dynamically
      };
      const response = await axios.post(API_URL, payload, { headers });
      const newSupplier: Supplier = {
        id: response.data.id.toString(),
        supplierName: response.data.supplier_name,
        companyName: response.data.company_name,
        ruc: response.data.ruc_n,
        address: response.data.address,
      };
      setSuppliers(prev => [...prev, newSupplier]);
    } catch (err) {
      console.error('Error adding supplier', err as AxiosError);
    }
  };

  // Update supplier
  const editSupplier = async (id: string, supplierData: SupplierFormData) => {
    try {
      const payload = {
        supplier_name: supplierData.supplierName,
        company_name: supplierData.companyName,
        ruc_n: supplierData.ruc,
        address: supplierData.address,
        company: 1, // or dynamic
      };
      const response = await axios.put(`${API_URL}${id}/`, payload, { headers });
      const updatedSupplier: Supplier = {
        id: response.data.id.toString(),
        supplierName: response.data.supplier_name,
        companyName: response.data.company_name,
        ruc: response.data.ruc_n,
        address: response.data.address,
      };
      setSuppliers(prev =>
          prev.map(s => (s.id === id ? updatedSupplier : s))
      );
    } catch (err) {
      console.error('Error updating supplier', err as AxiosError);
    }
  };

  // Delete supplier
  const deleteSupplier = async (id: string) => {
    try {
      await axios.delete(`${API_URL}${id}/`, { headers });
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting supplier', err as AxiosError);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return {
    suppliers,
    loading,
    fetchSuppliers,
    addSupplier,
    editSupplier,
    deleteSupplier,
  };
};
