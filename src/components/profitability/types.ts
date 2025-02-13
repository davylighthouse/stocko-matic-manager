
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
  total_costs: number;
  profit: number;
  profit_margin: number;
  ad_costs: number;
  promoted: boolean;
  product_cost: number;
  platform_fee_percentage: number;
  default_shipping_service_id: number;
  default_picking_fee_id: number;
  picking_fee: number;
  packaging_cost: number;
  making_up_cost: number;
  promoted_listing_percentage: number;
  vat_status: string;
}

export interface ProfitabilityTableProps {
  sales: ProfitabilityData[];
}

export interface ColumnWidth {
  [key: string]: number;
}

export interface EditableCellProps {
  value: string | number;
  field: keyof ProfitabilityData;
  type?: string;
  onChange: (field: keyof ProfitabilityData, value: string | number) => void;
}
