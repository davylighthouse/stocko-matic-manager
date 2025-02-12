
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

export interface InitialStock {
  sku: string;
  quantity: number;
  effective_date: string;
}

export interface StockAdjustment {
  sku: string;
  quantity: number;
  notes?: string;
}

export interface CurrentStockLevel {
  sku: string;
  listing_title: string;
  initial_stock: number;
  stock_count_date: string | null;
  quantity_sold: number;
  adjustments: number;
  current_stock: number;
}
