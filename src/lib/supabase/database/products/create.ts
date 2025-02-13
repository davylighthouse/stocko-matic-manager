
import { supabase } from '@/integrations/supabase/client';

export const createProduct = async (product: {
  sku: string;
  listing_title?: string;
  stock_quantity?: number;
}) => {
  console.log('Creating product with data:', product);
  
  // Get default IDs for new products
  const [{ data: defaultPickingFee }, { data: defaultShippingService }] = await Promise.all([
    supabase.from('picking_fees').select('id').limit(1).single(),
    supabase.from('shipping_services').select('id').limit(1).single()
  ]);

  if (!defaultPickingFee || !defaultShippingService) {
    throw new Error('Default picking fee or shipping service not found');
  }
  
  // Always ensure listing_title is set, using SKU as fallback
  const productData = {
    sku: product.sku,
    listing_title: product.listing_title || product.sku,
    stock_quantity: product.stock_quantity ?? 0,
    default_picking_fee_id: defaultPickingFee.id,
    default_shipping_service_id: defaultShippingService.id
  };

  // Additional verification
  if (!productData.listing_title) {
    console.error("listing_title is null after initial setup, using SKU");
    productData.listing_title = product.sku;
  }

  console.log('Final product data:', productData);

  const { data: existingProduct } = await supabase
    .from('products')
    .select('*')
    .eq('sku', product.sku)
    .maybeSingle();

  if (existingProduct) {
    console.log('Product already exists:', existingProduct);
    if (!existingProduct.listing_title) {
      await updateProductDetails(product.sku, { listing_title: product.sku });
    }
    return existingProduct;
  }

  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  console.log('Product created successfully:', data);
  return data;
};
