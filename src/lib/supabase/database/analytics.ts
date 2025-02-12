
import { supabase } from '@/integrations/supabase/client';

export const getTopProductsBySales = async (startDate: Date, endDate: Date) => {
  console.log('Fetching sales for date range:', {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  });

  const { data, error } = await supabase
    .rpc('get_top_products_by_sales', {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    });

  if (error) throw error;
  
  console.log('Received product sales data:', data);
  return data;
};
