
import { supabase } from '@/integrations/supabase/client';
import type { SaleWithProduct } from '@/types/sales';
import { SaleProfitabilityUpdate, UpdateSaleData } from './types';
import { parsePrice } from './utils';

export const getSalesWithProducts = async (): Promise<SaleWithProduct[]> => {
  const { data: salesData, error } = await supabase
    .from('sales_profitability')
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
      advertising_cost
    `);

  if (error) {
    console.error('Error fetching sales with products:', error);
    throw error;
  }

  return (salesData || []).map(sale => ({
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
    gross_profit: (sale.total_price || 0) - (
      (sale.total_product_cost || 0) +
      (sale.platform_fees || 0) +
      (sale.shipping_cost || 0) +
      (sale.advertising_cost || 0)
    )
  }));
};

export const deleteSale = async (id: number): Promise<boolean> => {
  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

export const deleteMultipleSales = async (ids: number[]): Promise<boolean> => {
  const { error } = await supabase
    .from('sales')
    .delete()
    .in('id', ids);

  if (error) throw error;
  return true;
};

export const updateSale = async (id: number, data: UpdateSaleData): Promise<boolean> => {
  console.log('Received data for update:', data);
  
  const numericData = {
    ...data,
    total_price: parsePrice(data.total_price),
    gross_profit: parsePrice(data.gross_profit)
  };

  console.log('Processed data for update:', numericData);

  const { error } = await supabase
    .from('sales')
    .update({
      sale_date: numericData.sale_date,
      platform: numericData.platform,
      sku: numericData.sku,
      quantity: numericData.quantity,
      total_price: numericData.total_price,
      gross_profit: numericData.gross_profit,
      promoted: numericData.promoted
    })
    .eq('id', id);

  if (error) throw error;
  return true;
};

export const updateSaleProfitability = async (id: number, data: SaleProfitabilityUpdate): Promise<boolean> => {
  console.log('Updating sale profitability:', { id, data });
  
  const { error } = await supabase
    .from('sales')
    .update({
      sale_date: data.sale_date,
      platform: data.platform,
      sku: data.sku,
      quantity: data.quantity,
      total_price: data.total_price,
      promoted: data.promoted,
      verified: data.verified
    })
    .eq('sale_id', id);

  if (error) {
    console.error('Error updating sale:', error);
    throw error;
  }

  return true;
};
