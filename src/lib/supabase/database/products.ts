
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/types/database';

export const getStockLevels = async () => {
  console.log('Fetching stock levels...');
  
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

  if (productsError) {
    console.error('Error fetching products:', productsError);
    throw productsError;
  }

  console.log('Products fetched:', products);

  // Get the latest stock check quantities
  const { data: latestStockChecks, error: stockCheckError } = await supabase
    .from('latest_stock_check_quantities')
    .select('*');

  if (stockCheckError) {
    console.error('Error fetching stock checks:', stockCheckError);
    throw stockCheckError;
  }

  console.log('Latest stock checks:', latestStockChecks);

  // Get total sold from total_sales_quantities view
  const { data: totalSales, error: totalSalesError } = await supabase
    .from('total_sales_quantities')
    .select('*');

  if (totalSalesError) {
    console.error('Error fetching total sales:', totalSalesError);
    throw totalSalesError;
  }

  console.log('Total sales:', totalSales);

  // Get stock adjustments
  const { data: stockAdjustments, error: stockAdjustmentsError } = await supabase
    .from('stock_adjustments')
    .select('sku, adjustment_sum:sum(quantity)')
    .order('sku');

  if (stockAdjustmentsError) {
    console.error('Error fetching stock adjustments:', stockAdjustmentsError);
    throw stockAdjustmentsError;
  }

  console.log('Stock adjustments:', stockAdjustments);

  // Convert to lookup maps for efficient access
  const stockCheckMap = new Map(
    latestStockChecks?.map(check => [check.sku, check.last_check_quantity]) || []
  );
  const salesMap = new Map(
    totalSales?.map(sale => [sale.sku, Number(sale.total_sold) || 0]) || []
  );
  const adjustmentsMap = new Map(
    stockAdjustments?.map(adj => [adj.sku, Number(adj.adjustment_sum) || 0]) || []
  );

  // Merge all data with products
  const mergedProducts = products.map(product => {
    // Start with the last physical stock check quantity
    const lastCheckQuantity = Number(stockCheckMap.get(product.sku) || 0);
    
    // Calculate sales since last check
    const totalSold = Number(salesMap.get(product.sku) || 0);
    
    // Calculate adjustments since last check
    const totalAdjusted = Number(adjustmentsMap.get(product.sku) || 0);

    const currentStock = lastCheckQuantity - totalSold + totalAdjusted;

    console.log('Stock calculation for SKU:', product.sku, {
      lastCheckQuantity,
      totalSold,
      totalAdjusted,
      currentStock
    });
    
    return {
      ...product,
      current_stock: currentStock
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
