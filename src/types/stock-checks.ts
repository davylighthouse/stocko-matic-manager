
export interface StockCheckItem {
  sku: string;
  quantity?: number;
  product_cost?: number;
  warehouse_location?: string;
}

export interface StockCheck {
  id: number;
  check_date: string;
  notes?: string;
  completed: boolean;
}
