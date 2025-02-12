
export interface Product {
  sku: string;
  listing_title: string;
  stock_quantity: number;
  product_cost: number;
  supplier?: string;
  warehouse_location?: string;
  latest_stock_check_quantities?: Array<{
    last_check_quantity: number;
    check_date: string;
  }>;
  total_sales_quantities?: Array<{
    total_sold: number;
  }>;
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
