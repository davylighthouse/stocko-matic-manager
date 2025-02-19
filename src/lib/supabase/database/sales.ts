
import { supabase } from '@/integrations/supabase/client';
import type { SaleWithProduct, SalesTotals } from '@/types/sales';
import type { ProfitabilityData } from '@/components/profitability/types';

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
    .select('total_price, quantity, profit, sku')
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

  return {
    ...totals,
    unique_products: uniqueSkus,
    earliest_sale: data?.[data.length - 1]?.sale_date,
    latest_sale: data?.[0]?.sale_date,
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
