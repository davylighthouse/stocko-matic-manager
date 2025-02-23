
import type { SaleWithProduct } from '@/types/sales';

interface RawSaleData {
  sale_id: number;
  sale_date: string;
  platform: string;
  sku: string;
  listing_title: string;
  promoted: boolean;
  quantity: number;
  total_price: number;
  total_product_cost: number;
  platform_fees: number;
  shipping_cost: number;
  advertising_cost: number;
  vat_status: string;
  platform_fee_percentage: number;
}

export const calculateSaleMetrics = (sale: RawSaleData): SaleWithProduct => {
  // Calculate VAT correctly
  let vatCost = 0;
  if (sale.vat_status === "standard") {
    vatCost = (sale.total_price || 0) / 6;
  }

  // Check Amazon FBA shipping rule
  let shippingCost = sale.shipping_cost;
  if (sale.platform === "Amazon FBA") {
    shippingCost = 0;
  }

  // Calculate advertising cost based on platform and promotion status
  let advertisingCost = 0;
  if (sale.promoted) {
    // Use the platform_fee_percentage for the advertising cost calculation
    advertisingCost = (sale.total_price || 0) * (sale.platform_fee_percentage || 0) / 100;
    console.log('Calculating advertising cost:', {
      total_price: sale.total_price,
      platform_fee_percentage: sale.platform_fee_percentage,
      result: advertisingCost
    });
  }

  // Calculate total costs correctly
  const totalCosts =
    (sale.total_product_cost || 0) +
    (sale.platform_fees || 0) +
    shippingCost +
    advertisingCost +
    vatCost;

  // Calculate final profit and margin
  const profit = (sale.total_price || 0) - totalCosts;
  const profitMargin = sale.total_price ? (profit / sale.total_price) * 100 : 0;

  // Debug logging
  console.log("\n-----------");
  console.log(`📊 SALE ANALYSIS: #${sale.sale_id}`);
  console.log("-----------");
  console.log("BASIC INFO:");
  console.log(`📅 Sale Date: ${sale.sale_date}`);
  console.log(`🏷️ SKU: ${sale.sku}`);
  console.log(`💰 Total Price: £${sale.total_price}`);
  console.log(`🎯 Promoted: ${sale.promoted}`);
  console.log(`📢 Platform Fee %: ${sale.platform_fee_percentage}%`);
  console.log("\nCOST ANALYSIS:");
  console.log(`📦 Product Cost: £${sale.total_product_cost}`);
  console.log(`🏪 Platform Fees: £${sale.platform_fees}`);
  console.log(`🚚 Shipping Cost: £${shippingCost}`);
  console.log(`📢 Advertising: £${advertisingCost}`);
  console.log(`💱 VAT: £${vatCost} (${sale.vat_status})`);
  console.log("\nPROFITABILITY:");
  console.log(`💶 Total Costs: £${totalCosts}`);
  console.log(`📈 Profit: £${profit}`);
  console.log(`📊 Margin: ${profitMargin.toFixed(2)}%`);
  console.log("-----------");

  return {
    id: sale.sale_id,
    sale_date: sale.sale_date,
    platform: sale.platform,
    sku: sale.sku,
    listing_title: sale.listing_title,
    promoted: sale.promoted || false,
    quantity: sale.quantity || 0,
    total_price: sale.total_price || 0,
    total_product_cost: sale.total_product_cost || 0,
    platform_fees: sale.platform_fees || 0,
    shipping_cost: shippingCost,
    advertising_cost: advertisingCost,
    gross_profit: profit,
    vat_status: sale.vat_status,
    vat_cost: vatCost,
    profit_margin: profitMargin,
    total_costs: totalCosts
  };
};
