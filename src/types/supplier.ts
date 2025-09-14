export interface Supplier {
  id: string;
  supplierName: string;
  companyName: string;
  ruc: string;
  address: string;
  createdAt: Date;
  lastUpdated: Date;
}

export interface SupplierFormData {
  supplierName: string;
  companyName: string;
  ruc: string;
  address: string;
}