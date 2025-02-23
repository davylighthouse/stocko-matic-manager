
import { supabase } from '@/integrations/supabase/client';
import type { SaleWithProduct } from '@/types/sales';
import type { ProfitabilityData } from '@/components/profitability/types';
import { parsePrice } from './types';

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

// Define a more specific type for the update data
interface SaleUpdateData {
  sale_date?: string;
  platform?: string;
  sku?: string;
  quantity?: number;
  total_price?: number | string;
  gross_profit?: number | string;
  promoted?: boolean;
}

export const updateSale = async (id: number, data: SaleUpdateData): Promise<boolean> => {
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

// Define specific fields for profitability update
interface ProfitabilityUpdateData {
  sale_date?: string;
  platform?: string;
  sku?: string;
  quantity?: number;
  total_price?: number;
  promoted?: boolean;
  verified?: boolean;
}

export const updateSaleProfitability = async (id: number, data: ProfitabilityUpdateData): Promise<boolean> => {
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
