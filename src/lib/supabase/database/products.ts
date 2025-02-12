
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/types/database';

export const getStockLevels = async () => {
  const { data: products, error: productsError } = await supabase
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

  if (productsError) throw productsError;

  // Fetch current stock levels
  const { data: stockLevels, error: stockError } = await supabase
    .from('current_stock_levels')
    .select('*');

  if (stockError) throw stockError;

  // Merge the current stock data with products
  const mergedProducts = products.map(product => {
    const stockLevel = stockLevels.find(sl => sl.sku === product.sku);
    return {
      ...product,
      current_stock: stockLevel?.current_stock ?? 0
    };
  });

  return mergedProducts;
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
  // First, record this as a stock adjustment
  const { error: adjustmentError } = await supabase
    .from('stock_adjustments')
    .insert({
      sku,
      quantity,
      notes: 'Manual stock update'
    });

  if (adjustmentError) throw adjustmentError;

  return true;
};
