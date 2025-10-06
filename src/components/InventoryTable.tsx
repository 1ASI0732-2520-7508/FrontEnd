import React, { useEffect, useRef, useState } from 'react';
import { Edit2, Trash2, Package, AlertTriangle } from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { getStockStatus, getStockStatusColor, formatCurrency } from '../utils/stockUtils';

interface InventoryTableProps {
  items: InventoryItem[];
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
                                                                items,
                                                                onEditItem,
                                                                onDeleteItem,
                                                              }) => {
  const [pendingDelete, setPendingDelete] = useState<InventoryItem | null>(null);
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);

  // Focus the "Cancel" button when the modal opens and allow ESC to close
  useEffect(() => {
    if (pendingDelete) {
      cancelBtnRef.current?.focus();
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setPendingDelete(null);
      };
      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
    }
  }, [pendingDelete]);

  if (items.length === 0) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-500">Start by adding your first inventory item</p>
        </div>
    );
  }

  return (
      <>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
              {items.map((item) => {
                const stockStatus = getStockStatus(item);
                const statusColor = getStockStatusColor(stockStatus);

                return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {item.category}
                      </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{item.quantity} units</span>
                          <span className={`text-xs px-2 py-1 rounded-full border ${statusColor} capitalize`}>
                          {stockStatus.replace('-', ' ')}
                        </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.supplier}
                      </td>
                      {/* NOTE: If you have a 'lastUpdated' field, render it here; otherwise leave blank or remove the header */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {/* {formatDate(item.lastUpdated)} */}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                              onClick={() => onEditItem(item)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              aria-label={`Edit ${item.name}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                              onClick={() => setPendingDelete(item)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                              aria-label={`Delete ${item.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confirm Delete Modal */}
        {pendingDelete && (
            <div
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
                aria-labelledby="confirm-delete-title"
                role="dialog"
                aria-modal="true"
            >
              {/* Backdrop */}
              <div
                  className="fixed inset-0 bg-gray-900/40 transition-opacity"
                  onClick={() => setPendingDelete(null)}
              />
              {/* Panel */}
              <div className="relative w-full sm:w-[480px] mx-4 sm:mx-0 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 p-6 animate-in fade-in zoom-in duration-150">
                <div className="flex items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                    <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="ml-4 text-left">
                    <h3 id="confirm-delete-title" className="text-lg font-semibold text-gray-900">
                      Delete “{pendingDelete.name}”?
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      This action cannot be undone. The item will be permanently removed from your inventory.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                      ref={cancelBtnRef}
                      type="button"
                      className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                      onClick={() => setPendingDelete(null)}
                  >
                    Cancel
                  </button>
                  <button
                      type="button"
                      className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
                      onClick={() => {
                        onDeleteItem(pendingDelete.id);
                        setPendingDelete(null);
                      }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
        )}
      </>
  );
};
