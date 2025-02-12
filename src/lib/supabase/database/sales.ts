
import { supabase } from '@/integrations/supabase/client';
import type { SaleWithProduct, SalesTotals } from '@/types/sales';

export const getSalesWithProducts = async () => {
  const { data, error } = await supabase
    .from('sales_with_products')
    .select('*')
    .order('sale_date', { ascending: false });

  if (error) throw error;
  
  console.log('Raw data from database:', data);
  
  // Ensure numeric values are properly handled
  const formattedData = data?.map(sale => ({
    ...sale,
    total_price: parseFloat(sale.total_price?.toString() || '0'),
    gross_profit: parseFloat(sale.gross_profit?.toString() || '0')
  }));

  console.log('Formatted data:', formattedData);

  return formattedData as SaleWithProduct[];
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
  console.log('Received data for update:', data);
  
  // Parse numeric values to ensure they're saved correctly
  const numericData = {
    ...data,
    total_price: data.total_price ? parseFloat(data.total_price.toString().replace('£', '')) : null,
    gross_profit: data.gross_profit ? parseFloat(data.gross_profit.toString().replace('£', '')) : null
  };

  console.log('Processed data for update:', numericData);

  const { data: updatedData, error } = await supabase
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
    .eq('id', id)
    .select();

  if (error) throw error;

  console.log('Update response:', updatedData);

  return true;
};
