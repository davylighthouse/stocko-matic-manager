
export interface SalesCSVRow {
  'Sale Date': string;
  Platform: string;
  'Listing Title': string;
  SKU: string;
  'Promoted Listing': string;
  Quantity: string;
  'Total Price': string;
}

export interface SaleProfitabilityUpdate {
  sale_date?: string;
  platform?: string;
  sku?: string;
  quantity?: number;
  total_price?: number;
  promoted?: boolean;
  verified?: boolean;
}

export interface UpdateSaleData {
  sale_date?: string;
  platform?: string;
  sku?: string;
  quantity?: number;
  total_price?: string | number;
  gross_profit?: string | number;
  promoted?: boolean;
}

export interface NewSaleData {
  sale_date: string;
  platform: string;
  sku: string;
  quantity: number;
  total_price: number;
  promoted: boolean;
}
