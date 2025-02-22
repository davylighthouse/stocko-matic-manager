
import { format } from 'date-fns';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { SalesCSVRow, NewSaleData } from './types';
import { parsePrice } from './utils';

export const processSalesCSV = async (file: File): Promise<{ success: boolean; message?: string }> => {
  return new Promise((resolve) => {
    Papa.parse<SalesCSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          console.log('Parsing sales CSV file:', results.data);
          
          for (const row of results.data) {
            if (!row.SKU || !row['Sale Date']) {
              console.error('Row missing required fields:', row);
              continue;
            }

            const { data: existingProduct } = await supabase
              .from('products')
              .select('sku')
              .eq('sku', row.SKU)
              .maybeSingle();

            if (!existingProduct) {
              console.log('Product does not exist, creating:', row.SKU);
              const [{ data: defaultPickingFee }, { data: defaultShippingService }] = await Promise.all([
                supabase.from('current_picking_fees').select('id').limit(1).single(),
                supabase.from('shipping_services').select('id').limit(1).single()
              ]);

              if (!defaultPickingFee || !defaultShippingService) {
                throw new Error('Default picking fee or shipping service not found');
              }

              const { error: productError } = await supabase
                .from('products')
                .insert({
                  sku: row.SKU,
                  listing_title: row['Listing Title'] || row.SKU,
                  default_picking_fee_id: defaultPickingFee.id,
                  default_shipping_service_id: defaultShippingService.id,
                  stock_quantity: 0
                });

              if (productError) {
                console.error('Error creating product:', productError);
                throw productError;
              }
            }

            const [day, month, year] = row['Sale Date'].split(/[-/]/);
            const saleDate = new Date(Number(year), Number(month) - 1, Number(day));
            
            if (isNaN(saleDate.getTime())) {
              console.error('Invalid date format:', row['Sale Date']);
              continue;
            }

            const formattedDate = format(saleDate, 'yyyy-MM-dd');

            const saleData: NewSaleData = {
              sale_date: formattedDate,
              platform: row.Platform,
              sku: row.SKU,
              quantity: parseInt(row.Quantity) || 0,
              total_price: parsePrice(row['Total Price']),
              promoted: row['Promoted Listing']?.toLowerCase() === 'yes',
            };

            console.log('Inserting sale:', saleData);

            const { error } = await supabase
              .from('sales')
              .insert(saleData);

            if (error) {
              console.error('Error creating sale:', error);
              throw error;
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

export const downloadSalesTemplate = async () => {
  const csvContent = [
    ['Sale Date', 'Platform', 'Listing Title', 'SKU', 'Promoted Listing', 'Quantity', 'Total Price'].join(','),
    ['04/01/2024', 'Amazon', 'Example Product', 'ABC123', 'Yes', '1', '19.99'].join(',')
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `sales_template_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
