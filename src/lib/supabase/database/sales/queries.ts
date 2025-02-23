
import { supabase } from '@/integrations/supabase/client';
import type { SaleWithProduct, SalesTotals } from '@/types/sales';
import { calculateSaleMetrics } from './utils';

export const getSalesWithProducts = async (): Promise<SaleWithProduct[]> => {
  console.log("Fetching sales data...");

  const { data: salesData, error } = await supabase
    .from("sales_profitability")
    .select(`
      sale_id,
      sale_date,
      platform,
      sku,
      listing_title,
      promoted,
      quantity,
      total_price,
      total_product_cost,
      platform_fees,
      shipping_cost,
      vat_status,
      platform_fee_percentage,
      promoted_listing_percentage
    `);

  if (error) {
    console.error("Error fetching sales with products:", error);
    throw error;
  }

  if (!salesData) {
    return [];
  }

  return salesData.map(calculateSaleMetrics);
};

export const getSalesTotals = async (): Promise<SalesTotals> => {
  const { data, error } = await supabase
    .from('sales_profitability')
    .select(`
      total_price,
      quantity,
      platform_fees,
      sku,
      sale_date,
      total_product_cost,
      shipping_cost,
      vat_status
    `)
    .throwOnError();

  if (error) {
    console.error('Error fetching sales totals:', error);
    throw error;
  }

  const totals = (data || []).reduce((acc, sale) => {
    let vatCost = 0;
    if (sale.vat_status === 'standard') {
      vatCost = (sale.total_price || 0) / 6;
    }

    const totalCosts = (sale.platform_fees || 0) +
                      (sale.shipping_cost || 0) +
                      (sale.total_product_cost || 0) +
                      vatCost;

    const profit = (sale.total_price || 0) - totalCosts;

    return {
      total_sales: acc.total_sales + (sale.total_price || 0),
      total_quantity: acc.total_quantity + (sale.quantity || 0),
      total_profit: acc.total_profit + profit,
    };
  }, {
    total_sales: 0,
    total_quantity: 0,
    total_profit: 0,
  });

  const uniqueSkus = new Set(data?.map(sale => sale.sku)).size;

  const sortedData = [...(data || [])].sort((a, b) => 
    new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime()
  );

  return {
    ...totals,
    unique_products: uniqueSkus,
    earliest_sale: sortedData[0]?.sale_date,
    latest_sale: sortedData[sortedData.length - 1]?.sale_date,
  };
};

