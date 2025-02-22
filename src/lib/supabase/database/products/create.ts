
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/database";

export const createProduct = async (product: Partial<Product>) => {
  // Get default picking fee and shipping service
  const [{ data: defaultPickingFee }, { data: defaultShippingService }] = await Promise.all([
    supabase.from('current_picking_fees').select('id').limit(1).single(),
    supabase.from('shipping_services').select('id').limit(1).single()
  ]);

  if (!defaultPickingFee || !defaultShippingService) {
    throw new Error('Default picking fee or shipping service not found');
  }

  // Create the product
  const { data, error } = await supabase
    .from('products')
    .insert([{
      ...product,
      default_picking_fee_id: defaultPickingFee.id,
      default_shipping_service_id: defaultShippingService.id,
      stock_quantity: 0  // Initial stock will be set separately
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};
