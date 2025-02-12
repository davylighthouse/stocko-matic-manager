
export interface Product {
  sku: string;
  listing_title: string;
  stock_quantity: number;
  product_cost: number;
}

export interface Sale {
  id: number;
  sale_date: string;
  platform: string;
  sku: string;
  promoted: boolean;
  quantity: number;
  total_price: number;
  gross_profit: number;
}
