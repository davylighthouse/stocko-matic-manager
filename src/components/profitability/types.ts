
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
