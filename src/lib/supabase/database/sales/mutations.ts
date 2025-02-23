
import { supabase } from '@/integrations/supabase/client';
import { parsePrice } from './types';

// Define base sale types that exactly match our database schema
interface BaseSaleFields {
  sale_date: string;
  platform: string;
  sku: string | null;
  quantity: number;
  total_price: number | null;
  promoted: boolean | null;
}

// Simple update interface for basic sale updates
interface SaleUpdate extends Partial<BaseSaleFields> {
  gross_profit?: number | null;
}

// Simple interface for profitability updates
interface ProfitabilityUpdate extends Partial<BaseSaleFields> {
  verified?: boolean;
}

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

export const updateSale = async (id: number, data: SaleUpdate): Promise<boolean> => {
  console.log('Received data for update:', data);
  
  const numericData = {
    ...data,
    total_price: data.total_price !== undefined ? parsePrice(data.total_price) : undefined,
    gross_profit: data.gross_profit !== undefined ? parsePrice(data.gross_profit) : undefined
  };

  console.log('Processed data for update:', numericData);

  const { error } = await supabase
    .from('sales')
    .update(numericData)
    .eq('id', id);

  if (error) throw error;
  return true;
};

export const updateSaleProfitability = async (id: number, data: ProfitabilityUpdate): Promise<boolean> => {
  console.log('Updating sale profitability:', { id, data });
  
  const { error } = await supabase
    .from('sales')
    .update(data)
    .eq('id', id);

  if (error) {
    console.error('Error updating sale:', error);
    throw error;
  }

  return true;
};
