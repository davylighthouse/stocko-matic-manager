
// Base interface for sale data with required fields
export interface BaseSaleData {
  sale_date?: string;
  platform?: string;
  sku?: string;
  quantity?: number;
  promoted?: boolean;
}

export interface SalesCSVRow {
  'Sale Date': string;
  Platform: string;
  'Listing Title': string;
  SKU: string;
  'Promoted Listing': string;
  Quantity: string;
  'Total Price': string;
}

// Extend base interface for specific update types
export interface SaleProfitabilityUpdate extends BaseSaleData {
  total_price?: number;
  verified?: boolean;
}

export interface UpdateSaleData extends BaseSaleData {
  total_price?: string | number;
  gross_profit?: string | number;
}

export interface NewSaleData {
  sale_date: string;
  platform: string;
  sku: string;
  quantity: number;
  total_price: number;
  promoted: boolean;
}
