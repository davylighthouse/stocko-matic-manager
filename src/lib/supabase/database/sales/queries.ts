
import { supabase } from '@/integrations/supabase/client';
import type { SaleWithProduct } from '@/types/sales';
import { SaleProfitabilityUpdate, UpdateSaleData } from './types';
import { parsePrice } from './utils';

export const getSalesWithProducts = async (): Promise<SaleWithProduct[]> => {
  console.log('Fetching sales with products...');
  
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

  return (salesData || []).map(sale => {
    const totalPrice = Number(sale.total_price) || 0;
    const totalProductCost = Number(sale.total_product_cost) || 0;
    const platformFees = Number(sale.platform_fees) || 0;
    const shippingCost = Number(sale.shipping_cost) || 0;
    const advertisingCost = Number(sale.advertising_cost) || 0;
    
    const grossProfit = totalPrice - (
      totalProductCost +
      platformFees +
      shippingCost +
      advertisingCost
    );

    return {
      id: sale.sale_id,
      sale_date: sale.sale_date,
      platform: sale.platform,
      sku: sale.sku,
      listing_title: sale.listing_title,
      promoted: Boolean(sale.promoted),
      quantity: Number(sale.quantity) || 0,
      total_price: totalPrice,
      total_product_cost: totalProductCost,
      platform_fees: platformFees,
      shipping_cost: shippingCost,
      advertising_cost: advertisingCost,
      gross_profit: grossProfit
    };
  });
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

type SaleUpdateData = {
  sale_date?: string | null;
  platform?: string | null;
  sku?: string | null;
  quantity?: number | null;
  total_price?: number | null;
  gross_profit?: number | null;
  promoted?: boolean | null;
};

export const updateSale = async (id: number, data: UpdateSaleData): Promise<boolean> => {
  const updateData: SaleUpdateData = {
    sale_date: data.sale_date || null,
    platform: data.platform || null,
    sku: data.sku || null,
    quantity: data.quantity || null,
    total_price: data.total_price ? parsePrice(data.total_price) : null,
    gross_profit: data.gross_profit ? parsePrice(data.gross_profit) : null,
    promoted: data.promoted ?? null
  };

  const { error } = await supabase
    .from('sales')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;
  return true;
};

export const updateSaleProfitability = async (id: number, data: SaleProfitabilityUpdate): Promise<boolean> => {
  const updateData: SaleUpdateData = {
    sale_date: data.sale_date || null,
    platform: data.platform || null,
    sku: data.sku || null,
    quantity: data.quantity || null,
    total_price: data.total_price || null,
    promoted: data.promoted ?? null
  };

  const { error } = await supabase
    .from('sales')
    .update(updateData)
    .eq('sale_id', id);

  if (error) throw error;
  return true;
};
