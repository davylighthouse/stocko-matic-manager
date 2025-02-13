
import { supabase } from '@/integrations/supabase/client';
import Papa from 'papaparse';

interface ProductRow {
  sku: string;
  [key: string]: string | number | undefined;
}

export const parsePrice = (value: string | undefined): number => {
  if (!value || value.trim() === '') return 0;
  const cleanValue = value.trim().replace('£', '');
  const number = parseFloat(cleanValue);
  return isNaN(number) ? 0 : number;
};

export const downloadProductTemplate = async () => {
  console.log('Downloading product template...');
  
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      sku,
      listing_title,
      stock_quantity,
      product_cost,
      supplier,
      warehouse_location,
      product_status,
      vat_status,
      dimensions_height,
      dimensions_width,
      dimensions_length,
      weight,
      packaging_cost,
      making_up_cost,
      additional_costs,
      low_stock_threshold
    `);

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  // Convert to CSV
  const csv = Papa.unparse(products);

  // Create and download file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'product_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const processCSV = async (file: File): Promise<{ success: boolean; message?: string }> => {
  return new Promise((resolve, reject) => {
    Papa.parse<ProductRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          console.log('Parsing CSV file:', results.data);
          
          for (const row of results.data) {
            if (!row.sku) {
              console.error('Row missing SKU:', row);
              continue;
            }

            // Filter out empty values and create updates object
            const updates = Object.entries(row).reduce((acc: Record<string, any>, [key, value]) => {
              if (value !== undefined && value !== '' && key !== 'sku') {
                // Convert numeric strings to numbers
                if (!isNaN(value as any)) {
                  acc[key] = Number(value);
                } else {
                  acc[key] = value;
                }
              }
              return acc;
            }, {});

            if (Object.keys(updates).length > 0) {
              const { error } = await supabase.rpc('process_product_updates', {
                p_sku: row.sku,
                p_updates: updates
              });

              if (error) {
                console.error('Error updating product:', error);
                throw error;
              }
            }
          }

          resolve({ success: true });
        } catch (error) {
          console.error('Error processing CSV:', error);
          resolve({ 
            success: false, 
            message: error instanceof Error ? error.message : 'Failed to process CSV file' 
          });
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        resolve({ 
          success: false, 
          message: 'Failed to parse CSV file' 
        });
      }
    });
  });
};
