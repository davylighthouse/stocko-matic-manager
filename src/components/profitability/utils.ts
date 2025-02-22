
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
      const pickingFee = sale.picking_fee || 0;
      return `Base Shipping Rate: ${formatCurrency(sale.base_shipping_rate)}
Picking Fee: ${formatCurrency(pickingFee)}
----------------------------------
Total Shipping = ${formatCurrency(sale.shipping_cost)}`;

    case 'product_cost':
      const totalCost = (sale.base_product_cost || 0) +
                       (sale.packaging_cost || 0) +
                       (sale.making_up_cost || 0) +
                       (sale.additional_costs || 0);
      const perUnit = `Per Unit:
Base Product Cost: ${formatCurrency(sale.base_product_cost)}
Packaging Cost: ${formatCurrency(sale.packaging_cost)}
Making Up Cost: ${formatCurrency(sale.making_up_cost)}
Additional Costs: ${formatCurrency(sale.additional_costs)}
----------------------------------
Total Per Unit = ${formatCurrency(totalCost)}`;
      
      const withQuantity = sale.quantity > 1 ? `\n\nQuantity: ${sale.quantity}
----------------------------------
Total Product Cost = ${formatCurrency(sale.total_product_cost)}` : '';

      return perUnit + withQuantity;

    case 'vat':
      if (sale.vat_status !== 'standard') {
        return 'No VAT applicable for this product';
      }
      return `Sale Price: ${formatCurrency(sale.total_price)}
VAT Rate: 20%
VAT Amount = ${formatCurrency(sale.vat_cost)}`;

    case 'platform_fees':
      let feeBreakdown = [];
      const percentageFee = sale.platform_fee_percentage || 0;
      const calculatedPercentageFee = (sale.total_price * percentageFee) / 100;
      
      // Both FBA and FBM use percentage fees
      if (percentageFee > 0) {
        feeBreakdown.push(`Percentage Fee (${formatPercentage(percentageFee)}): ${formatCurrency(calculatedPercentageFee)}`);
      }

      // Add FBA fee if applicable
      if (sale.platform === 'Amazon FBA' && sale.fba_fee_amount) {
        feeBreakdown.push(`FBA Fee: ${formatCurrency(sale.fba_fee_amount)}`);
      }

      // Add flat fee if applicable (mainly for other platforms)
      if (sale.platform_flat_fee && sale.platform_flat_fee > 0) {
        feeBreakdown.push(`Flat Fee: ${formatCurrency(sale.platform_flat_fee)}`);
      }

      if (feeBreakdown.length === 0) {
        return 'No platform fees configured';
      }

      return `${feeBreakdown.join('\n')}
----------------------------------
Total Platform Fees = ${formatCurrency(sale.platform_fees)}`;

    case 'advertising':
      if (!sale.promoted) {
        return 'No advertising costs for this sale';
      }
      return `Sale Price: ${formatCurrency(sale.total_price)}
Promoted Listing Rate: ${formatPercentage(sale.promoted_listing_percentage)}
----------------------------------
Advertising Cost = ${formatCurrency(sale.advertising_cost)}`;

    default:
      return '';
  }
};
