
export interface ProfitabilityData {
  id: number;
  sale_date: string;
  platform: string;
  sku: string;
  listing_title: string;
  quantity: number;
  total_price: number;
  total_product_cost: number;
  platform_fees: number;
  shipping_cost: number;
  vat_cost: number;
  advertising_cost: number;
  total_costs: number;
  profit: number;
  profit_margin: number;
  promoted: boolean;
  product_cost: number;
  platform_fee_percentage: number;
  default_shipping_service_id: number;
  picking_fee: number;
  packaging_cost: number;
  making_up_cost: number;
  promoted_listing_percentage: number;
  vat_status: string;
  fba_fee_amount: number | null;
  platform_flat_fee: number | null;
  verified?: boolean;
  default_picking_fee_id: number;
  amazon_fba_tier_id: number | null;
}

export interface ProfitabilityTableProps {
  sales: ProfitabilityData[];
}

export interface EditableCellProps {
  value: string | number;
  field: keyof ProfitabilityData;
  onChange: (field: keyof ProfitabilityData, value: any) => void;
  format?: (value: number) => string;
  type?: string;
  width?: string;
}

export type ColumnWidth = string;

export interface ColumnWidths {
  date: ColumnWidth;
  platform: ColumnWidth;
  sku: ColumnWidth;
  title: ColumnWidth;
  quantity: ColumnWidth;
  salePrice: ColumnWidth;
  productCost: ColumnWidth;
  platformFees: ColumnWidth;
  shipping: ColumnWidth;
  vat: ColumnWidth;
  advertising: ColumnWidth;
  totalCosts: ColumnWidth;
  profit: ColumnWidth;
  margin: ColumnWidth;
}
