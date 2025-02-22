
export interface ProfitabilityData {
  id: number;
  sale_date: string;
  platform: string;
  sku: string;
  listing_title: string;
  promoted: boolean;
  quantity: number;
  total_price: number;
  product_cost: number;
  packaging_cost: number;
  making_up_cost: number;
  additional_costs: number;
  total_product_cost: number;
  platform_fees: number;
  shipping_cost: number;
  advertising_cost: number;
  vat_cost: number;
  vat_status: string;
  profit: number;
  profit_margin: number;
  verified: boolean;
  total_costs: number;
  platform_fee_percentage: number;
  default_shipping_service_id: number;
  picking_fee: number;
  default_picking_fee_id: number;
  amazon_fba_tier_id: number | null;
  fba_fee_amount: number | null;
  platform_flat_fee: number | null;
  promoted_listing_percentage: number;
}

export interface ProfitabilityTableProps {
  sales: ProfitabilityData[];
}

export interface EditableCellProps {
  value: string | number;
  field: keyof ProfitabilityData;
  type?: 'text' | 'number' | 'date';
  onChange: (field: keyof ProfitabilityData, value: string | number) => void;
}

export interface ColumnWidth {
  [key: string]: number;
  date: number;
  platform: number;
  sku: number;
  title: number;
  quantity: number;
  salePrice: number;
  productCost: number;
  platformFees: number;
  shipping: number;
  vat: number;
  advertising: number;
  totalCosts: number;
  profit: number;
  margin: number;
}
