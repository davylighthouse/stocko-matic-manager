
export interface Product {
  sku: string;
  listing_title: string;
  stock_quantity: number;
  product_cost: number | null;
  warehouse_location: string | null;
  supplier: string | null;
  product_status: string | null;
  default_shipping_service: string | null;
  vat_status: string | null;
  dimensions_height: number | null;
  dimensions_width: number | null;
  dimensions_length: number | null;
  weight: number | null;
  packaging_cost: number | null;
  making_up_cost: number | null;
  additional_costs: number | null;
  low_stock_threshold: number | null;
  default_shipping_service_id: number | null;
  default_picking_fee_id: number | null;
  amazon_fba_tier_id: number | null;
  order_index: number | null;
  product_cost_notes: string | null;
  packaging_cost_notes: string | null;
  making_up_cost_notes: string | null;
  additional_costs_notes: string | null;
  promoted_listing_percentage: number | null;
  advertising_cost?: number | null;
  bundle_products?: BundleProduct | null;
  latest_stock_check_quantities?: StockCheckQuantity[];
  total_sales_quantities?: TotalSalesQuantity[];
}

export interface BundleComponent {
  component_sku: string;
  quantity: number;
  listing_title?: string;
  stock_quantity?: number;
  product_cost?: number;
}

export interface BundleProduct {
  bundle_sku: string;
  created_at?: string;
  updated_at?: string;
}

export interface StockCheckQuantity {
  check_date: string;
  last_check_quantity: number;
}

export interface TotalSalesQuantity {
  total_sold: number;
}
