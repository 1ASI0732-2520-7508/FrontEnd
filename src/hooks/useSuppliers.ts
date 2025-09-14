import { useState } from 'react';
import { Supplier, SupplierFormData } from '../types/supplier';
import { suppliersData as initialSuppliers } from '../data/suppliersData';

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);

  const addSupplier = (supplierData: SupplierFormData) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: Date.now().toString(),
      createdAt: new Date(),
      lastUpdated: new Date(),
    };
    setSuppliers(prev => [...prev, newSupplier]);
  };

  const updateSupplier = (updatedSupplier: Supplier) => {
    setSuppliers(prev =>
      prev.map(supplier =>
        supplier.id === updatedSupplier.id
          ? { ...updatedSupplier, lastUpdated: new Date() }
          : supplier
      )
    );
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
  };

  const editSupplier = (supplierData: SupplierFormData, supplierId: string) => {
    const updatedSupplier: Supplier = {
      ...supplierData,
      id: supplierId,
      createdAt: suppliers.find(s => s.id === supplierId)?.createdAt || new Date(),
      lastUpdated: new Date(),
    };
    updateSupplier(updatedSupplier);
  };

  return {
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    editSupplier,
  };
};