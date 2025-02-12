
import { supabase } from '@/integrations/supabase/client';

export const processInitialStockCSV = async (file: File): Promise<{ success: boolean; message: string }> => {
  try {
    const text = await file.text();
    const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim()));
    const headers = rows[0].map(header => header.toLowerCase().trim());

    const skuIndex = headers.indexOf('sku');
    const quantityIndex = headers.indexOf('quantity');
    const effectiveDateIndex = headers.indexOf('effective date');

    if (skuIndex === -1 || quantityIndex === -1 || effectiveDateIndex === -1) {
      return {
        success: false,
        message: 'CSV must contain SKU, Quantity, and Effective Date columns'
      };
    }

    for (const row of rows.slice(1)) {
      if (row.length < headers.length) continue;

      const sku = row[skuIndex];
      const quantity = parseInt(row[quantityIndex]);
      const effectiveDate = row[effectiveDateIndex];

      if (!sku || isNaN(quantity)) {
        console.log('Skipping invalid row:', row);
        continue;
      }

      const { error } = await supabase
        .from('initial_stock')
        .upsert({
          sku,
          quantity,
          effective_date: effectiveDate,
        }, {
          onConflict: 'sku'
        });

      if (error) {
        console.error('Error upserting initial stock:', error);
        throw error;
      }
    }

    return { success: true, message: 'Initial stock data processed successfully' };
  } catch (error) {
    console.error('Error processing initial stock CSV:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to process initial stock CSV' 
    };
  }
};

export const generateStockCheckTemplate = async () => {
  const { data: products, error } = await supabase
    .from('products')
    .select('sku');

  if (error) throw error;

  const csvContent = [
    ['SKU', 'Quantity', 'Effective Date'],
    ...products.map(product => [
      product.sku,
      '', // Empty quantity field for user to fill
      new Date().toISOString().split('T')[0] // Today's date as default
    ])
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `initial_stock_template_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
