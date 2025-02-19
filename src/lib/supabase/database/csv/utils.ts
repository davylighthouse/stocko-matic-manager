
import { supabase } from '@/integrations/supabase/client';
import Papa from 'papaparse';

interface ProductRow {
  sku: string;
  [key: string]: string | number | undefined;
}

export const parsePrice = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined || value === '') return 0;
  const stringValue = value.toString().trim().replace(/[£$,\s]/g, '');
  const number = parseFloat(stringValue);
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

            // If stock quantity is being updated, we need to create a stock adjustment
            const stockQuantity = row.stock_quantity !== undefined ? 
              parseFloat(row.stock_quantity.toString()) : undefined;

            if (stockQuantity !== undefined) {
              // Get current stock level
              const { data: currentStock } = await supabase
                .from('current_stock_levels')
                .select('current_stock')
                .eq('sku', row.sku)
                .single();

              const currentStockLevel = currentStock?.current_stock || 0;
              
              // Calculate adjustment needed
              const adjustment = stockQuantity - currentStockLevel;

              if (adjustment !== 0) {
                // Create stock adjustment
                const { error: adjustmentError } = await supabase
                  .from('stock_adjustments')
                  .insert({
                    sku: row.sku,
                    quantity: adjustment,
                    notes: 'Adjustment from CSV import'
                  });

                if (adjustmentError) {
                  console.error('Error creating stock adjustment:', adjustmentError);
                  throw adjustmentError;
                }
              }

              // Remove stock_quantity from updates as it's handled by the adjustment
              delete row.stock_quantity;
            }

            // Filter out empty values and create updates object for other fields
            const updates = Object.entries(row).reduce((acc: Record<string, any>, [key, value]) => {
              if (value !== undefined && value !== '' && key !== 'sku') {
                // List of numeric fields
                const numericFields = [
                  'product_cost',
                  'dimensions_height',
                  'dimensions_width',
                  'dimensions_length',
                  'weight',
                  'packaging_cost',
                  'making_up_cost',
                  'additional_costs',
                  'low_stock_threshold'
                ];

                if (numericFields.includes(key)) {
                  // Use parsePrice for any numeric field to handle various formats
                  acc[key] = parsePrice(value);
                } else {
                  acc[key] = value;
                }
              }
              return acc;
            }, {});

            if (Object.keys(updates).length > 0) {
              console.log('Updating product with data:', { sku: row.sku, updates });
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
