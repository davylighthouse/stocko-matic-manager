
// Explicitly define the base sale data structure
export interface BaseSaleData {
  sale_date?: string | null;
  platform?: string | null;
  sku?: string | null;
  quantity?: number | null;
  promoted?: boolean | null;
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

export interface SaleProfitabilityUpdate extends BaseSaleData {
  total_price?: number | null;
  verified?: boolean | null;
}

export interface UpdateSaleData extends BaseSaleData {
  total_price?: string | number | null;
  gross_profit?: string | number | null;
}

export interface NewSaleData {
  sale_date: string;
  platform: string;
  sku: string;
  quantity: number;
  total_price: number;
  promoted: boolean;
}
