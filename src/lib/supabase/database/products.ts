
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/types/database';

export const getStockLevels = async () => {
  // First get the current stock levels
  const { data: stockLevels, error: stockError } = await supabase
    .from('current_stock_levels')
    .select('*');

  if (stockError) throw stockError;

  // Then get the products with their related data
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

  // Merge the current stock data with products, ensuring we use the view's calculation
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
  // Get current stock level first
  const { data: currentLevel, error: getCurrentError } = await supabase
    .from('current_stock_levels')
    .select('current_stock')
    .eq('sku', sku)
    .single();

  if (getCurrentError) throw getCurrentError;

  // Calculate the adjustment needed
  const currentStock = currentLevel?.current_stock ?? 0;
  const adjustment = quantity - currentStock;

  // Record the adjustment
  const { error: adjustmentError } = await supabase
    .from('stock_adjustments')
    .insert({
      sku,
      quantity: adjustment,
      notes: 'Manual stock update'
    });

  if (adjustmentError) throw adjustmentError;

  return true;
};
