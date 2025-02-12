
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/types/database';

export const getStockLevels = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      latest_stock_check_quantities (
        last_check_quantity,
        check_date
      ),
      total_sales_quantities (
        total_sold
      )
    `)
    .order('listing_title');

  if (error) throw error;
  return data;
};

export const updateProductDetails = async (sku: string, data: {
  listing_title?: string;
  product_cost?: number;
  warehouse_location?: string;
  supplier?: string;
}) => {
  const { error } = await supabase
    .from('products')
    .update(data)
    .eq('sku', sku);

  if (error) throw error;
  return true;
};

export const updateStockLevel = async (sku: string, quantity: number) => {
  const { error } = await supabase
    .from('products')
    .update({ stock_quantity: quantity })
    .eq('sku', sku);

  if (error) throw error;
  return true;
};
