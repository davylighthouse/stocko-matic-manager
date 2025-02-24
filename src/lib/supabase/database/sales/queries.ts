
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
      advertising_cost,
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
      vat_status,
      advertising_cost
    `);

  if (error) {
    console.error('Error fetching sales totals:', error);
    throw error;
  }

  type SaleTotalRow = {
    total_price: number | null;
    quantity: number | null;
    platform_fees: number | null;
    sku: string;
    sale_date: string;
    total_product_cost: number | null;
    shipping_cost: number | null;
    vat_status: string | null;
    advertising_cost: number | null;
  };

  const totals = (data as SaleTotalRow[] || []).reduce((acc, sale) => {
    let vatCost = 0;
    if (sale.vat_status === 'standard') {
      vatCost = (sale.total_price || 0) / 6;
    }

    const totalCosts = (sale.total_product_cost || 0) +
                      (sale.platform_fees || 0) +
                      (sale.shipping_cost || 0) +
                      (sale.advertising_cost || 0) +
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

  // Get unique SKUs count
  const uniqueSkus = new Set((data as SaleTotalRow[])?.map(sale => sale.sku)).size;

  // Sort data for date range
  const sortedData = [...((data as SaleTotalRow[]) || [])].sort((a, b) => 
    new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime()
  );

  return {
    ...totals,
    unique_products: uniqueSkus,
    earliest_sale: sortedData[0]?.sale_date || '',
    latest_sale: sortedData[sortedData.length - 1]?.sale_date || '',
  };
};
