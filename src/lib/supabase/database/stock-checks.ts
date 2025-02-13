import { supabase } from '@/integrations/supabase/client';
import type { StockCheck, StockCheckItem, InitialStock, StockAdjustment, CurrentStockLevel } from '@/types/stock-checks';

export const createStockCheck = async (notes?: string) => {
  const { data, error } = await supabase
    .from('stock_checks')
    .insert([{ notes }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getStockChecks = async () => {
  const { data, error } = await supabase
    .from('stock_checks')
    .select('*')
    .order('check_date', { ascending: false });

  if (error) throw error;
  return data;
};

export const getStockCheckItems = async (stockCheckId: number) => {
  const { data, error } = await supabase
    .from('stock_check_items')
    .select(`
      sku,
      quantity,
      product_cost,
      warehouse_location
    `)
    .eq('stock_check_id', stockCheckId);

  if (error) throw error;
  return data;
};

export const updateStockCheckItem = async (
  stockCheckId: number,
  sku: string,
  data: {
    quantity: number;
    product_cost?: number;
    warehouse_location?: string;
  }
) => {
  const { error } = await supabase
    .from('stock_check_items')
    .upsert({
      stock_check_id: stockCheckId,
      sku,
      ...data,
    }, {
      onConflict: 'stock_check_id,sku'
    });

  if (error) throw error;
  return true;
};

export const completeStockCheck = async (stockCheckId: number) => {
  const { error } = await supabase
    .from('stock_checks')
    .update({ completed: true })
    .eq('id', stockCheckId);

  if (error) throw error;
  return true;
};

export const getCurrentStockLevels = async () => {
  console.log('Fetching current stock levels...');
  
  const { data, error } = await supabase
    .from('current_stock_levels')
    .select(`
      sku,
      initial_stock,
      current_stock,
      quantity_sold,
      adjustments
    `);

  if (error) {
    console.error('Error fetching stock levels:', error);
    throw error;
  }

  // Get all products in a separate query
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('sku, listing_title');

  if (productsError) {
    console.error('Error fetching products:', productsError);
    throw productsError;
  }

  // Create a map of products by SKU for quick lookup
  const productMap = new Map(products.map(p => [p.sku, p]));

  const transformedData = data.map(item => {
    const product = productMap.get(item.sku || '');
    
    return {
      sku: item.sku || '',
      listing_title: product?.listing_title || '',
      initial_stock: item.initial_stock || 0,
      current_stock: item.current_stock || 0,
      quantity_sold: item.quantity_sold || 0,
      adjustments: item.adjustments || 0,
      stock_count_date: null
    };
  });

  console.log('Fetched stock levels:', transformedData);
  return transformedData as CurrentStockLevel[];
};

export const setInitialStock = async (stockData: InitialStock) => {
  const { error } = await supabase
    .from('initial_stock')
    .upsert({
      sku: stockData.sku,
      quantity: stockData.quantity,
      effective_date: stockData.effective_date,
    }, {
      onConflict: 'sku'
    });

  if (error) throw error;
  return true;
};

export const addStockAdjustment = async (adjustment: StockAdjustment) => {
  // First verify the SKU exists in products
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('sku')
    .eq('sku', adjustment.sku)
    .maybeSingle();

  if (productError) throw productError;
  if (!product) throw new Error(`Product with SKU ${adjustment.sku} not found`);

  // Then insert the adjustment
  const { error } = await supabase
    .from('stock_adjustments')
    .insert([{
      sku: adjustment.sku,
      quantity: adjustment.quantity,
      notes: adjustment.notes || null,
      adjustment_date: new Date().toISOString()
    }]);

  if (error) throw error;
  return true;
};
