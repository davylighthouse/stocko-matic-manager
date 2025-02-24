
import { SaleWithProduct } from '@/types/sales';
import type { SaleProfitabilityData } from '@/types/sales';

export const calculateSaleMetrics = (sale: SaleProfitabilityData): SaleWithProduct => {
  // Calculate VAT if applicable
  const vatCost = sale.vat_status === 'standard' ? (sale.total_price || 0) / 6 : 0;

  // Calculate total costs including VAT
  const totalCosts = (sale.total_product_cost || 0) +
                    (sale.platform_fees || 0) +
                    (sale.shipping_cost || 0) +
                    (sale.advertising_cost || 0) +
                    vatCost;

  // Calculate profit
  const profit = (sale.total_price || 0) - totalCosts;

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
    shipping_cost: sale.shipping_cost || 0,
    advertising_cost: sale.advertising_cost || 0,
    gross_profit: profit,
    vat_status: sale.vat_status,
    vat_cost: vatCost,
    profit_margin: sale.total_price ? (profit / sale.total_price) * 100 : 0,
    total_costs: totalCosts
  };
};
