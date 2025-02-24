
export interface SaleWithProduct {
  id: number;
  sale_date: string;
  platform: string;
  sku: string;
  listing_title: string;
  promoted: boolean;
  quantity: number;
  total_price: number;
  total_product_cost: number;
  platform_fees: number;
  shipping_cost: number;
  advertising_cost: number;
  gross_profit: number;
  vat_status?: string;
  vat_cost?: number;
  profit_margin?: number;
  total_costs?: number;
}

export interface SalesTotals {
  total_sales: number;
  total_quantity: number;
  unique_products: number;
  earliest_sale: string;
  latest_sale: string;
  total_profit: number;
}

export interface SaleProfitabilityData {
  sale_id: number;
  sale_date: string;
  platform: string;
  sku: string;
  listing_title: string;
  promoted: boolean;
  quantity: number;
  total_price: number;
  total_product_cost: number;
  platform_fees: number;
  platform_fee_percentage: number;
  shipping_cost: number;
  vat_status: string;
  fba_fee_amount: number | null;
  platform_flat_fee: number | null;
  promoted_listing_percentage: number;
  advertising_cost: number;
}
