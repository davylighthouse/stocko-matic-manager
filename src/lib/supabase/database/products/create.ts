
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/database";

export const createProduct = async (productData: Partial<Product>) => {
  // Get default picking fee and shipping service
  const [{ data: defaultPickingFee }, { data: defaultShippingService }] = await Promise.all([
    supabase.from('current_picking_fees').select('id').limit(1).single(),
    supabase.from('shipping_services').select('id').limit(1).single()
  ]);

  if (!defaultPickingFee?.id || !defaultShippingService?.id) {
    throw new Error('Default picking fee or shipping service not found');
  }

  // Prepare the required fields
  const product = {
    sku: productData.sku || '',
    listing_title: productData.listing_title || productData.sku || '',
    default_picking_fee_id: defaultPickingFee.id,
    default_shipping_service_id: defaultShippingService.id,
    stock_quantity: 0,
    ...productData
  };

  // Create the product
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();

  if (error) throw error;
  return data;
};
