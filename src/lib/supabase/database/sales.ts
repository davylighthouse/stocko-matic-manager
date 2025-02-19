import { supabase } from '@/integrations/supabase/client';
import type { SaleWithProduct, SalesTotals } from '@/types/sales';
import type { ProfitabilityData } from '@/components/profitability/types';
import { format, parse } from 'date-fns';
import Papa from 'papaparse';

const parsePrice = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined || value === '') return 0;
  const stringValue = value.toString().trim().replace(/[£$,\s]/g, '');
  const number = parseFloat(stringValue);
  return isNaN(number) ? 0 : number;
};

export const getSalesWithProducts = async () => {
  const { data, error } = await supabase
    .from('sales_with_products')
    .select('*')
    .order('sale_date', { ascending: false });

  if (error) throw error;
  
  console.log('Raw data from database:', data);
  
  // Ensure numeric values are properly handled
  const formattedData = data?.map(sale => {
    const formatted = {
      ...sale,
      total_price: parsePrice(sale.total_price),
      gross_profit: parsePrice(sale.gross_profit)
    };
    console.log('Formatting sale:', {
      original: {
        total_price: sale.total_price,
        gross_profit: sale.gross_profit
      },
      formatted: {
        total_price: formatted.total_price,
        gross_profit: formatted.gross_profit
      }
    });
    return formatted;
  });

  console.log('Formatted data:', formattedData);

  return formattedData as SaleWithProduct[];
};

export const getSalesTotals = async () => {
  // Get aggregated data from sales_profitability view
  const { data, error } = await supabase
    .from('sales_profitability')
    .select('total_price, quantity, profit, sku, sale_date')
    .throwOnError();

  if (error) {
    console.error('Error fetching sales totals:', error);
    throw error;
  }

  // Calculate totals
  const totals = (data || []).reduce((acc, sale) => ({
    total_sales: acc.total_sales + (sale.total_price || 0),
    total_quantity: acc.total_quantity + (sale.quantity || 0),
    total_profit: acc.total_profit + (sale.profit || 0),
  }), {
    total_sales: 0,
    total_quantity: 0,
    total_profit: 0,
  });

  // Get unique SKUs count
  const uniqueSkus = new Set(data?.map(sale => sale.sku)).size;

  // Sort data by sale_date to get earliest and latest
  const sortedData = [...(data || [])].sort((a, b) => 
    new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime()
  );

  return {
    ...totals,
    unique_products: uniqueSkus,
    earliest_sale: sortedData[0]?.sale_date,
    latest_sale: sortedData[sortedData.length - 1]?.sale_date,
  } as SalesTotals;
};

export const deleteSale = async (id: number) => {
  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

export const deleteMultipleSales = async (ids: number[]) => {
  const { error } = await supabase
    .from('sales')
    .delete()
    .in('id', ids);

  if (error) throw error;
  return true;
};

export const updateSale = async (id: number, data: Partial<SaleWithProduct>) => {
  console.log('Received data for update:', data);
  
  const numericData = {
    ...data,
    total_price: parsePrice(data.total_price),
    gross_profit: parsePrice(data.gross_profit)
  };

  console.log('Processed data for update:', numericData);

  const { data: updatedData, error } = await supabase
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
    .eq('id', id)
    .select();

  if (error) throw error;
  return true;
};

export const updateSaleProfitability = async (id: number, data: Partial<ProfitabilityData>) => {
  console.log('Updating sale profitability:', { id, data });
  
  const { error } = await supabase
    .from('sales')  // Changed from 'sales_profitability' to 'sales' since it's a view
    .update({
      sale_date: data.sale_date,
      platform: data.platform,
      sku: data.sku,
      quantity: data.quantity,
      total_price: parsePrice(data.total_price),
      gross_profit: data.profit  // We'll calculate this from the profitability data
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating sale:', error);
    throw error;
  }

  return true;
};

export const processCSV = async (file: File): Promise<{ success: boolean; message?: string }> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
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

            // Parse date from DD-MM-YYYY to YYYY-MM-DD
            const saleDate = parse(row['Sale Date'], 'dd-MM-yyyy', new Date());
            const formattedDate = format(saleDate, 'yyyy-MM-dd');

            // Create sale record
            const saleData = {
              sale_date: formattedDate,
              platform: row.Platform,
              sku: row.SKU,
              quantity: parseInt(row.Quantity) || 0,
              total_price: parsePrice(row['Total Price']),
              promoted: row['Promoted Listing']?.toLowerCase() === 'yes',
            };

            const { error } = await supabase
              .from('sales')
              .insert([saleData]);

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
  // Create CSV content with the new format
  const csvContent = [
    ['Sale Date', 'Platform', 'Listing Title', 'SKU', 'Promoted Listing', 'Quantity', 'Total Price'].join(','),
    ['01-01-2024', 'Amazon', 'Example Product', 'ABC123', 'Yes', '1', '19.99'].join(','), // Example row
  ].join('\n');

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `sales_template_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
