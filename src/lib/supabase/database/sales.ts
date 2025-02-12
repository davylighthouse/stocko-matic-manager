
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
