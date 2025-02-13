
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
    .from('products')
    .select(`
      sku,
      listing_title,
      current_stock_levels!current_stock_levels_sku_fkey (
        initial_stock,
        current_stock,
        quantity_sold,
        adjustments
      )
    `);

  if (error) {
    console.error('Error fetching stock levels:', error);
    throw error;
  }

  const transformedData = data.map(item => {
    const stockLevel = Array.isArray(item.current_stock_levels) 
      ? item.current_stock_levels[0] 
      : item.current_stock_levels;
    
    return {
      sku: item.sku || '',
      listing_title: item.listing_title || '',
      initial_stock: stockLevel?.initial_stock || 0,
      current_stock: stockLevel?.current_stock || 0,
      quantity_sold: stockLevel?.quantity_sold || 0,
      adjustments: stockLevel?.adjustments || 0,
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
  const { error } = await supabase
    .from('stock_adjustments')
    .insert({
      sku: adjustment.sku,
      quantity: adjustment.quantity,
      notes: adjustment.notes,
    });

  if (error) throw error;
  return true;
};
