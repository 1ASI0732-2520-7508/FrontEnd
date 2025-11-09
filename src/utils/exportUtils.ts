import * as XLSX from 'xlsx';
import { InventoryItem } from '../types/inventory';
import { formatDate, getStockStatus } from './stockUtils';
import {jsPDF} from "jspdf";
import {applyPlugin, autoTable} from "jspdf-autotable";


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

export const exportToPDF = (items: InventoryItem[], supplierFilter?: string) => {

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
  }));

  const doc = new jsPDF({orientation: "landscape"});

  const title = supplierFilter ? `${supplierFilter} Inventory` : `Invnetory Report`;
  doc.setFontSize(18);
  doc.text(title, 20, 20);

  const headers = ['Item Name', 'Category', 'Quantity', 'Min Stock', 'Unit Price', 'Total Value', 'Stock Status', 'Supplier', 'Description'];


  doc.setFontSize(12);

  let yPosition = 30;

  autoTable(doc, {
   head: [headers],
    body: exportData.map(item => [
        item['Item Name'],
        item['Category'],
        item['Quantity'],
        item['Min Stock'],
        item['Unit Price'],
        item['Total Value'],
        item['Stock Status'],
        item['Supplier'],
        item['Description']
    ]),
    startY: yPosition,
    theme: 'striped',
    margin: {top: 10},
    columnStyles: {
     0: {cellWidth: 40},
      1: {cellWidth: 30},
      2: {cellWidth: 20},
      3: {cellWidth: 20},
      4: {cellWidth: 20},
      5: {cellWidth: 20},
      6: {cellWidth: 20},
      7: {cellWidth: 20},
      8: {cellWidth: 20}
    },
  });

  //Generate Fillename

  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = supplierFilter
  ? `${supplierFilter}_inventory_${timestamp}.pdf`
      : `inventory_report_${timestamp}.pdf`;


  doc.save(fileName)
}