
export interface SaleWithProduct {
  id: number;
  sale_date: string;
  platform: string;
  sku: string;
  listing_title: string;
  quantity: number;
  total_price: number;
  gross_profit: number;
  promoted: boolean;
}

export interface SalesTotals {
  total_sales: number;
  total_quantity: number;
  unique_products: number;
  earliest_sale: string;
  latest_sale: string;
  total_profit: number;
}
