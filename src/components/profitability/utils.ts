
export const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '£0.00';
  return `£${value.toFixed(2)}`;
};

export const formatPercentage = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '0.0%';
  return `${value.toFixed(1)}%`;
};

export const getProfitColor = (profit: number | null | undefined) => {
  if (profit === null || profit === undefined) return "bg-red-100 text-red-900";
  if (profit >= 3) return "bg-green-100 text-green-900";
  if (profit >= 2) return "bg-yellow-100 text-yellow-900";
  return "bg-red-100 text-red-900";
};

export const getMarginColor = (margin: number | null | undefined) => {
  if (margin === null || margin === undefined) return "bg-red-100 text-red-900";
  if (margin >= 20) return "bg-green-100 text-green-900";
  if (margin >= 15) return "bg-yellow-100 text-yellow-900";
  return "bg-red-100 text-red-900";
};

export const getCalculationTooltip = (sale: any, type: string, formatCurrency: (n: number | null | undefined) => string, formatPercentage: (n: number | null | undefined) => string) => {
  switch (type) {
    case 'total_costs':
      return `Total Product Cost: ${formatCurrency(sale.total_product_cost)}
Platform Fees: ${formatCurrency(sale.platform_fees)}
Shipping Cost: ${formatCurrency(sale.shipping_cost)}
VAT: ${formatCurrency(sale.vat_cost)}
Advertising Cost: ${formatCurrency(sale.advertising_cost)}
----------------------------------
Total = ${formatCurrency(sale.total_costs)}`;

    case 'profit':
      return `Sale Price: ${formatCurrency(sale.total_price)}
- Total Costs: ${formatCurrency(sale.total_costs)}
----------------------------------
Profit = ${formatCurrency(sale.profit)}`;

    case 'profit_margin':
      return `(Profit ${formatCurrency(sale.profit)} ÷ Sale Price ${formatCurrency(sale.total_price)}) × 100
----------------------------------
Margin = ${formatPercentage(sale.profit_margin)}`;

    case 'shipping':
      const shippingBreakdown = [
        `Base Shipping Cost: ${formatCurrency(sale.shipping_service_price || 0)}`,
        sale.picking_fee ? `Picking Fee: ${formatCurrency(sale.picking_fee)}` : null,
        sale.packaging_cost ? `Packaging Cost: ${formatCurrency(sale.packaging_cost)}` : null,
        sale.making_up_cost ? `Making Up Cost: ${formatCurrency(sale.making_up_cost)}` : null,
      ].filter(Boolean).join('\n');

      return `${shippingBreakdown}
----------------------------------
Total Shipping = ${formatCurrency(sale.shipping_cost)}`;

    case 'vat':
      const vatRate = sale.vat_status === 'standard' ? '20%' : sale.vat_status;
      return `Sale Price: ${formatCurrency(sale.total_price)}
VAT Rate: ${vatRate}
VAT Status: ${sale.vat_status}
----------------------------------
VAT Amount = ${formatCurrency(sale.vat_cost)}`;

    case 'platform_fees':
      const feeBreakdown = [
        sale.platform_fee_percentage ? `Percentage Fee (${sale.platform_fee_percentage}%): ${formatCurrency((sale.total_price * sale.platform_fee_percentage) / 100)}` : null,
        sale.platform_flat_fee ? `Flat Fee: ${formatCurrency(sale.platform_flat_fee)}` : null,
        sale.fba_fee_amount ? `FBA Fee: ${formatCurrency(sale.fba_fee_amount)}` : null,
      ].filter(Boolean).join('\n');

      return `${feeBreakdown}
----------------------------------
Total Platform Fees = ${formatCurrency(sale.platform_fees)}`;

    case 'advertising':
      if (!sale.promoted || sale.platform !== 'eBay') {
        return 'No advertising costs for this sale';
      }
      return `Sale Price: ${formatCurrency(sale.total_price)}
Promoted Listing Rate: ${sale.promoted_listing_percentage}%
----------------------------------
Advertising Cost = ${formatCurrency(sale.advertising_cost)}`;

    default:
      return '';
  }
};
