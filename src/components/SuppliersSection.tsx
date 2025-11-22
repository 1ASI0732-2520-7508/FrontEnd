import React, { useState } from "react";
import { Plus, Edit2, Trash2, Building2, FileText } from "lucide-react";
import { Supplier } from "../types/supplier";
import {useTranslation} from "react-i18next";

interface SuppliersSectionProps {
  suppliers: Supplier[];
  onAddSupplier: () => void;
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (id: string) => void;
}

export const SuppliersSection: React.FC<SuppliersSectionProps> = ({
                                                                    suppliers,
                                                                    onAddSupplier,
                                                                    onEditSupplier,
                                                                    onDeleteSupplier,
                                                                  }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const {t} = useTranslation();

  const filteredSuppliers = suppliers.filter(
      (supplier) =>
          supplier.supplierName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
          supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.ruc.includes(searchTerm)
  );

    return (
        <div className="space-y-6 transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {t("suppliers.title")}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {t("suppliers.subtitle")}
                    </p>
                </div>
                <button
                    onClick={onAddSupplier}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                    <Plus className="w-5 h-5" />
                    <span>{t("suppliers.addButton")}</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <input
                    type="text"
                    placeholder={t("suppliers.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
            </div>

            {/* Suppliers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSuppliers.map((supplier) => (
                    <div
                        key={supplier.id}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/30 rounded-lg flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {supplier.supplierName}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {supplier.companyName}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => onEditSupplier(supplier)}
                                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-all duration-200"
                                    title={t("suppliers.editTooltip")}
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm(t("suppliers.deleteConfirm"))) {
                                            onDeleteSupplier(supplier.id);
                                        }
                                    }}
                                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all duration-200"
                                    title={t("suppliers.deleteTooltip")}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <FileText className="w-4 h-4" />
                                <span>
                  {t("suppliers.ruc")}: {supplier.ruc}
                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredSuppliers.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center transition-all duration-300">
                    <Building2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        {searchTerm
                            ? t("suppliers.noResultsTitle")
                            : t("suppliers.noSuppliersTitle")}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        {searchTerm
                            ? t("suppliers.noResultsSubtitle")
                            : t("suppliers.noSuppliersSubtitle")}
                    </p>
                </div>
            )}
        </div>
    );
};
