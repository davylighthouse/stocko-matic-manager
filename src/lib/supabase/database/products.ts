
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/types/database';

export const getStockLevels = async () => {
  // Get products with their related data first
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

  // Get initial stock
  const { data: initialStock, error: initialStockError } = await supabase
    .from('initial_stock')
    .select('sku, quantity');

  if (initialStockError) throw initialStockError;

  // Get total sold directly from the total_sales_quantities view
  const { data: totalSales, error: totalSalesError } = await supabase
    .from('total_sales_quantities')
    .select('sku, total_sold');

  if (totalSalesError) throw totalSalesError;

  // Get manual stock adjustments using aggregate function
  const { data: stockAdjustments, error: stockAdjustmentsError } = await supabase
    .from('stock_adjustments')
    .select('sku, adjustment_sum:quantity')
    .select('sku, adjustment_sum:sum(quantity)')
    .order('sku');

  if (stockAdjustmentsError) throw stockAdjustmentsError;

  // Convert to lookup maps for efficient access
  const initialStockMap = new Map(initialStock.map(item => [item.sku, item.quantity]));
  const salesMap = new Map(totalSales.map(item => [item.sku, Number(item.total_sold) || 0]));
  const adjustmentsMap = new Map(
    stockAdjustments.map(item => [item.sku, Number(item.adjustment_sum) || 0])
  );

  // Merge all data with products
  const mergedProducts = products.map(product => {
    const initialQuantity = Number(initialStockMap.get(product.sku) || 0);
    const totalSold = Number(salesMap.get(product.sku) || 0);
    const totalAdjusted = Number(adjustmentsMap.get(product.sku) || 0);
    
    return {
      ...product,
      current_stock: initialQuantity - totalSold + totalAdjusted
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
  // Get current stock level first (using the same calculation as above)
  const { data: initialStock } = await supabase
    .from('initial_stock')
    .select('quantity')
    .eq('sku', sku)
    .single();

  const { data: totalSales } = await supabase
    .from('total_sales_quantities')
    .select('total_sold')
    .eq('sku', sku)
    .single();

  const { data: adjustments } = await supabase
    .from('stock_adjustments')
    .select('adjustment_sum:sum(quantity)')
    .eq('sku', sku)
    .single();

  const currentStock = Number(initialStock?.quantity || 0) - 
                      Number(totalSales?.total_sold || 0) + 
                      Number(adjustments?.adjustment_sum || 0);

  // Calculate the adjustment needed
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
