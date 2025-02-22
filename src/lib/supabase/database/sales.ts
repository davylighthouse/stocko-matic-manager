import { supabase } from '@/integrations/supabase/client';
import type { SaleWithProduct } from '@/types/sales';
import { format } from 'date-fns';
import Papa from 'papaparse';

const debugTypes = (data: unknown, label: string) => {
  console.log(`Type Debug [${label}]:`, {
    rawType: typeof data,
    isArray: Array.isArray(data),
    hasPromise: data instanceof Promise,
    keys: data && typeof data === 'object' ? Object.keys(data) : [],
    prototype: data && typeof data === 'object' ? Object.getPrototypeOf(data) : null
  });
};

interface SalesCSVRow {
  'Sale Date': string;
  Platform: string;
  'Listing Title': string;
  SKU: string;
  'Promoted Listing': string;
  Quantity: string;
  'Total Price': string;
}

interface BaseSaleData {
  sale_date: string;
  platform: string;
  sku: string;
  quantity: number;
  total_price: number;
  promoted: boolean;
}

type SaleProfitabilityUpdate = Partial<BaseSaleData> & {
  verified?: boolean;
};

type NewSaleData = BaseSaleData;

const parsePrice = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined || value === '') return 0;
  const stringValue = value.toString().trim().replace(/[£$,\s]/g, '');
  const number = parseFloat(stringValue);
  return isNaN(number) ? 0 : number;
};

export const getSalesWithProducts = async (): Promise<SaleWithProduct[]> => {
  const { data: salesData, error } = await supabase
    .from('sales_profitability')
    .select(`
      sale_id,
      sale_date,
      platform,
      sku,
      listing_title,
      promoted,
      quantity,
      total_price,
      total_product_cost,
      platform_fees,
      shipping_cost,
      advertising_cost
    `);

  if (error) {
    console.error('Error fetching sales with products:', error);
    throw error;
  }

  return (salesData || []).map(sale => ({
    id: sale.sale_id,
    sale_date: sale.sale_date,
    platform: sale.platform,
    sku: sale.sku,
    listing_title: sale.listing_title,
    promoted: sale.promoted || false,
    quantity: sale.quantity || 0,
    total_price: sale.total_price || 0,
    total_product_cost: sale.total_product_cost || 0,
    platform_fees: sale.platform_fees || 0,
    shipping_cost: sale.shipping_cost || 0,
    advertising_cost: sale.advertising_cost || 0,
    gross_profit: (sale.total_price || 0) - (
      (sale.total_product_cost || 0) +
      (sale.platform_fees || 0) +
      (sale.shipping_cost || 0) +
      (sale.advertising_cost || 0)
    )
  }));
};

export const deleteSale = async (id: number): Promise<boolean> => {
  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

export const deleteMultipleSales = async (ids: number[]): Promise<boolean> => {
  const { error } = await supabase
    .from('sales')
    .delete()
    .in('id', ids);

  if (error) throw error;
  return true;
};

export const updateSale = async (id: number, data: UpdateSaleData): Promise<boolean> => {
  console.log('Received data for update:', data);
  
  const numericData = {
    ...data,
    total_price: parsePrice(data.total_price),
    gross_profit: parsePrice(data.gross_profit)
  };

  console.log('Processed data for update:', numericData);

  const { error } = await supabase
    .from('sales')
    .update({
      sale_date: numericData.sale_date,
      platform: numericData.platform,
      sku: numericData.sku,
      quantity: numericData.quantity,
      total_price: numericData.total_price,
      gross_profit: numericData.gross_profit,
      promoted: numericData.promoted
    })
    .eq('id', id);

  if (error) throw error;
  return true;
};

export const updateSaleProfitability = async (id: number, data: SaleProfitabilityUpdate): Promise<boolean> => {
  debugTypes(data, 'updateSaleProfitability input');
  console.log('Updating sale profitability:', { id, data });
  
  const { error } = await supabase
    .from('sales')
    .update({
      sale_date: data.sale_date,
      platform: data.platform,
      sku: data.sku,
      quantity: data.quantity,
      total_price: data.total_price,
      promoted: data.promoted,
      verified: data.verified
    })
    .eq('sale_id', id);

  if (error) {
    console.error('Error updating sale:', error);
    throw error;
  }

  return true;
};

export const processSalesCSV = async (file: File): Promise<{ success: boolean; message?: string }> => {
  debugTypes(file, 'CSV file input');
  
  return new Promise((resolve) => {
    Papa.parse<SalesCSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          debugTypes(results.data, 'Parsed CSV data');
          console.log('Parsing sales CSV file:', results.data);
          
          for (const row of results.data) {
            debugTypes(row, 'Individual CSV row');
            
            if (!row.SKU || !row['Sale Date']) {
              console.error('Row missing required fields:', row);
              continue;
            }

            const { data: existingProduct } = await supabase
              .from('products')
              .select('sku')
              .eq('sku', row.SKU)
              .maybeSingle();

            debugTypes(existingProduct, 'Existing product data');

            if (!existingProduct) {
              console.log('Product does not exist, creating:', row.SKU);
              const [{ data: defaultPickingFee }, { data: defaultShippingService }] = await Promise.all([
                supabase.from('current_picking_fees').select('id').limit(1).single(),
                supabase.from('shipping_services').select('id').limit(1).single()
              ]);

              debugTypes(defaultPickingFee, 'Default picking fee');
              debugTypes(defaultShippingService, 'Default shipping service');

              if (!defaultPickingFee || !defaultShippingService) {
                throw new Error('Default picking fee or shipping service not found');
              }

              const newProduct = {
                sku: row.SKU,
                listing_title: row['Listing Title'] || row.SKU,
                default_picking_fee_id: defaultPickingFee.id,
                default_shipping_service_id: defaultShippingService.id,
                stock_quantity: 0
              };

              debugTypes(newProduct, 'New product data');

              const { error: productError } = await supabase
                .from('products')
                .insert(newProduct);

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

            debugTypes(saleData, 'Sale data before insert');
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
