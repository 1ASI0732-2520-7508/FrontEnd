import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Supplier, SupplierFormData } from '../types/supplier';
import { useTranslation } from 'react-i18next';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplier: SupplierFormData) => void;
  supplier?: Supplier;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  supplier 
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<SupplierFormData>({
    supplierName: '',
    companyName: '',
    ruc: '',
    address: '',
  });

  const [errors, setErrors] = useState<Partial<SupplierFormData>>({});

  useEffect(() => {
    if (supplier) {
      setFormData({
        supplierName: supplier.supplierName,
        companyName: supplier.companyName,
        ruc: supplier.ruc,
        address: supplier.address,
      });
    } else {
      setFormData({
        supplierName: '',
        companyName: '',
        ruc: '',
        address: '',
      });
    }
    setErrors({});
  }, [supplier, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<SupplierFormData> = {};

    if (!formData.supplierName.trim()) {
      newErrors.supplierName = t('supplierModal.errors.supplierNameRequired');
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = t('supplierModal.errors.companyNameRequired');
    }

    if (!formData.ruc.trim()) {
      newErrors.ruc = t('supplierModal.errors.rucRequired');
    } else if (!/^\d{11}$/.test(formData.ruc)) {
      newErrors.ruc = t('supplierModal.errors.rucInvalid');
    }

    if (!formData.address.trim()) {
      newErrors.address = t('supplierModal.errors.addressRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-colors duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {supplier ? t('supplierModal.editSupplier') : t('supplierModal.addSupplier') }
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('supplierModal.supplierName')}
              </label>
              <input
                type="text"
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
                  errors.supplierName ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-700'
                }`}
                placeholder={t('supplierModal.supplierNamePlaceholder')}
              />
              {errors.supplierName && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.supplierName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('supplierModal.companyName')}
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
                  errors.companyName ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-700'
                }`}
                placeholder={t('supplierModal.companyNamePlaceholder')}
              />
              {errors.companyName && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.companyName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('supplierModal.ruc')}
              </label>
              <input
                type="text"
                value={formData.ruc}
                onChange={(e) => setFormData({ ...formData, ruc: e.target.value.replace(/\D/g, '') })}
                maxLength={11}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
                  errors.ruc ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-700'
                }`}
                placeholder={t('supplierModal.rucPlaceholder')}
              />
              {errors.ruc && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.ruc}</p>
              )}
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('supplierModal.address')}
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
                  errors.address ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-700'
                }`}
                placeholder={t('supplierModal.addressPlaceholder')}
              />
              {errors.address && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.address}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium"
            >
              {t('supplierModal.cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              {supplier ? t('supplierModal.update') : t('supplierModal.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
