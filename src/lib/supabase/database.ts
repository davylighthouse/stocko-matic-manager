import { supabase } from '@/integrations/supabase/client';
import { Product, Sale } from '@/types/database';

export const processCSV = async (file: File): Promise<{ success: boolean; message: string }> => {
  try {
    const text = await file.text();
    const rows = text.split('\n').map(row => row.split(','));
    const headers = rows[0];
    const data = rows.slice(1);

    // Create maps to aggregate data by SKU
    const salesBySku = new Map<string, {
      quantity: number;
      total_price: number;
      gross_profit: number;
      sales: Array<{
        sale_date: string;
        platform: string;
        promoted: boolean;
        quantity: number;
        total_price: number;
        gross_profit: number;
      }>;
    }>();

    const productsBySku = new Map<string, {
      sku: string;
      listing_title: string;
      product_cost: number;
    }>();

    // First pass: aggregate data by SKU
    for (const row of data) {
      if (row.length !== headers.length) continue;

      const sku = row[headers.indexOf('SKU')];
      const quantity = parseInt(row[headers.indexOf('Quantity')]);
      const total_price = parseFloat(row[headers.indexOf('Total Price')]);
      const gross_profit = parseFloat(row[headers.indexOf('Gross Profit')]);

      // Aggregate sales data
      if (!salesBySku.has(sku)) {
        salesBySku.set(sku, {
          quantity: 0,
          total_price: 0,
          gross_profit: 0,
          sales: [],
        });
      }
      const skuData = salesBySku.get(sku)!;
      skuData.quantity += quantity;
      skuData.total_price += total_price;
      skuData.gross_profit += gross_profit;
      skuData.sales.push({
        sale_date: row[headers.indexOf('Sale Date')],
        platform: row[headers.indexOf('Platform')],
        promoted: row[headers.indexOf('Promoted Listing')].toLowerCase() === 'yes',
        quantity,
        total_price,
        gross_profit,
      });

      // Store product data (only for first occurrence of SKU)
      if (!productsBySku.has(sku)) {
        productsBySku.set(sku, {
          sku,
          listing_title: row[headers.indexOf('Listing Title')],
          product_cost: parseFloat(row[headers.indexOf('Product Cost')]),
        });
      }
    }

    // Second pass: save aggregated data
    for (const [sku, productData] of productsBySku) {
      const product = {
        ...productData,
        stock_quantity: 0,
      };

      // First, ensure the product exists by upserting it
      const { error: productError } = await supabase
        .from('products')
        .upsert([product], { onConflict: 'sku' });

      if (productError) throw productError;

      // Then insert individual sales
      const salesData = salesBySku.get(sku)!;
      for (const sale of salesData.sales) {
        const { error: saleError } = await supabase
          .from('sales')
          .insert([{ ...sale, sku }]);

        if (saleError) throw saleError;
      }

      // Get current stock quantity
      const { data: currentProduct } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('sku', sku)
        .single();

      // Calculate new stock quantity
      const currentQuantity = currentProduct?.stock_quantity ?? 0;
      const newQuantity = currentQuantity - salesData.quantity;

      // Update the stock quantity
      const { error: stockError } = await supabase
        .from('products')
        .update({ stock_quantity: newQuantity })
        .eq('sku', sku);

      if (stockError) throw stockError;
    }

    return { success: true, message: 'CSV processed successfully' };
  } catch (error) {
    console.error('Error processing CSV:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to process CSV' 
    };
  }
};

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

export interface StockCheck {
  id: number;
  check_date: string;
  notes: string | null;
  completed: boolean;
}

export interface StockCheckItem {
  id: number;
  stock_check_id: number;
  sku: string;
  quantity: number;
  product_cost: number | null;
  warehouse_location: string | null;
  created_at: string;
}

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
      *,
      products (
        listing_title
      )
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
