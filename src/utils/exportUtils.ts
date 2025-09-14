import * as XLSX from 'xlsx';
import { InventoryItem } from '../types/inventory';
import { formatCurrency, formatDate, getStockStatus } from './stockUtils';

export const exportToExcel = (items: InventoryItem[], supplierFilter?: string) => {
  // Prepare data for export
  const exportData = items.map(item => ({
    'Item Name': item.name,
    'Category': item.category,
    'Quantity': item.quantity,
    'Min Stock': item.minStock,
    'Unit Price': item.price,
    'Total Value': item.quantity * item.price,
    'Stock Status': getStockStatus(item).replace('-', ' ').toUpperCase(),
    'Supplier': item.supplier,
    'Description': item.description,
    'Last Updated': formatDate(item.lastUpdated),
  }));

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  const colWidths = [
    { wch: 25 }, // Item Name
    { wch: 15 }, // Category
    { wch: 10 }, // Quantity
    { wch: 10 }, // Min Stock
    { wch: 12 }, // Unit Price
    { wch: 12 }, // Total Value
    { wch: 12 }, // Stock Status
    { wch: 20 }, // Supplier
    { wch: 30 }, // Description
    { wch: 15 }, // Last Updated
  ];
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  const sheetName = supplierFilter ? `${supplierFilter} Inventory` : 'Inventory Report';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate filename
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = supplierFilter 
    ? `${supplierFilter}_inventory_${timestamp}.xlsx`
    : `inventory_report_${timestamp}.xlsx`;

  // Save file
  XLSX.writeFile(wb, filename);
};