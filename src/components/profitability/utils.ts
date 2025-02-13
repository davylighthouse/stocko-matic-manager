
export const formatCurrency = (value: number) => {
  return `£${value.toFixed(2)}`;
};

export const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};

export const getProfitColor = (profit: number) => {
  if (profit >= 3) return "bg-green-100 text-green-900";
  if (profit >= 2) return "bg-yellow-100 text-yellow-900";
  return "bg-red-100 text-red-900";
};

export const getMarginColor = (margin: number) => {
  if (margin >= 20) return "bg-green-100 text-green-900";
  if (margin >= 15) return "bg-yellow-100 text-yellow-900";
  return "bg-red-100 text-red-900";
};

export const getCalculationTooltip = (sale: any, type: string, formatCurrency: (n: number) => string, formatPercentage: (n: number) => string) => {
  switch (type) {
    case 'total_costs':
      return `Product Cost: ${formatCurrency(sale.total_product_cost)}
              Platform Fees: ${formatCurrency(sale.platform_fees)}
              Shipping Cost: ${formatCurrency(sale.shipping_cost)}
              VAT: ${formatCurrency(sale.vat_cost)}
              = ${formatCurrency(sale.total_costs)}`;
    case 'profit':
      return `Sale Price: ${formatCurrency(sale.total_price)}
              - Total Costs: ${formatCurrency(sale.total_costs)}
              = ${formatCurrency(sale.profit)}`;
    case 'profit_margin':
      return `Profit: ${formatCurrency(sale.profit)}
              ÷ Sale Price: ${formatCurrency(sale.total_price)}
              × 100 = ${formatPercentage(sale.profit_margin)}`;
    default:
      return '';
  }
};
