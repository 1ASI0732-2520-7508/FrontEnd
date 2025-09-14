export interface Supplier {
  id: string;
  supplierName: string;
  companyName: string;
  ruc: string;
  address: string;
}

export interface SupplierFormData {
  supplierName: string;
  companyName: string;
  ruc: string;
  address: string;
}