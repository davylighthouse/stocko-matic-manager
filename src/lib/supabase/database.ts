
import { supabase } from '@/integrations/supabase/client';
import { Product, Sale } from '@/types/database';

export const processCSV = async (file: File): Promise<{ success: boolean; message: string }> => {
  try {
    const text = await file.text();
    const rows = text.split('\n').map(row => row.split(','));
    const headers = rows[0];
    const data = rows.slice(1);

    for (const row of data) {
      if (row.length !== headers.length) continue;

      const sale = {
        sale_date: row[headers.indexOf('Sale Date')],
        platform: row[headers.indexOf('Platform')],
        sku: row[headers.indexOf('SKU')],
        promoted: row[headers.indexOf('Promoted Listing')].toLowerCase() === 'yes',
        quantity: parseInt(row[headers.indexOf('Quantity')]),
        total_price: parseFloat(row[headers.indexOf('Total Price')]),
        gross_profit: parseFloat(row[headers.indexOf('Gross Profit')]),
      };

      const product = {
        sku: sale.sku,
        listing_title: row[headers.indexOf('Listing Title')],
        stock_quantity: 0,
        product_cost: parseFloat(row[headers.indexOf('Product Cost')]),
      };

      // First, ensure the product exists by upserting it
      const { error: productError } = await supabase
        .from('products')
        .upsert([product], { onConflict: 'sku' });

      if (productError) throw productError;

      // Then insert the sale
      const { error: saleError } = await supabase
        .from('sales')
        .insert([sale]);

      if (saleError) throw saleError;

      // Finally update the stock quantity
      const { error: stockError } = await supabase
        .from('products')
        .update({ 
          stock_quantity: supabase.sql`stock_quantity - ${sale.quantity}` 
        })
        .eq('sku', sale.sku);

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
    .select('*')
    .order('listing_title');

  if (error) throw error;
  return data;
};

export const updateStockLevel = async (sku: string, quantity: number) => {
  const { error } = await supabase
    .from('products')
    .update({ stock_quantity: quantity })
    .eq('sku', sku);

  if (error) throw error;
  return true;
};
