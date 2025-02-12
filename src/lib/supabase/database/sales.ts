
import { supabase } from '@/integrations/supabase/client';
import type { SaleWithProduct, SalesTotals } from '@/types/sales';

export const getSalesWithProducts = async () => {
  const { data, error } = await supabase
    .from('sales_with_products')
    .select('*')
    .order('sale_date', { ascending: false });

  if (error) throw error;
  return data as SaleWithProduct[];
};

export const getSalesTotals = async () => {
  const { data, error } = await supabase
    .from('sales_totals')
    .select('*')
    .single();

  if (error) throw error;
  return data as SalesTotals;
};

export const deleteSale = async (id: number) => {
  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

export const updateSale = async (id: number, data: Partial<SaleWithProduct>) => {
  // Parse numeric values to ensure they're saved correctly
  const numericData = {
    ...data,
    total_price: data.total_price ? parseFloat(data.total_price.toString().replace('£', '')) : data.total_price,
    gross_profit: data.gross_profit ? parseFloat(data.gross_profit.toString().replace('£', '')) : data.gross_profit
  };

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
