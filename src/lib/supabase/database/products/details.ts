
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/types/database';
import { createProduct } from './create';

export const updateProductDetails = async (sku: string, data: Partial<Product>) => {
  console.log("Updating product details - Input data:", data);

  // First, get the existing product data
  const { data: existingProduct, error: fetchError } = await supabase
    .from('products')
    .select('*')
    .eq('sku', sku)
    .single();

  if (fetchError) {
    console.error("Error fetching existing product:", fetchError);
    throw fetchError;
  }

  console.log("Existing product data:", existingProduct);

  // Process the data before updating
  const processedData = {
    ...existingProduct,
    ...data,
    // Handle shipping service ID
    default_shipping_service_id: 
      data.default_shipping_service_id !== undefined ?
      parseInt(String(data.default_shipping_service_id)) :
      existingProduct.default_shipping_service_id,
    // Handle picking fee ID
    default_picking_fee_id: 
      data.default_picking_fee_id !== undefined ?
      parseInt(String(data.default_picking_fee_id)) :
      existingProduct.default_picking_fee_id,
    // Handle Amazon FBA tier ID - fix for the "none" value
    amazon_fba_tier_id: 
      data.amazon_fba_tier_id === null || String(data.amazon_fba_tier_id).toLowerCase() === 'none' ? null :
      data.amazon_fba_tier_id !== undefined ?
      parseInt(String(data.amazon_fba_tier_id)) :
      existingProduct.amazon_fba_tier_id,
    // Handle promoted listing percentage
    promoted_listing_percentage:
      data.promoted_listing_percentage !== undefined ?
      parseFloat(String(data.promoted_listing_percentage)) :
      existingProduct.promoted_listing_percentage,
    // Ensure listing_title is set
    listing_title: data.listing_title || existingProduct?.listing_title || sku
  };

  console.log("Processed data to be updated:", processedData);

  // Verify listing_title is set before update
  if (!processedData.listing_title) {
    console.error("listing_title is still null after merge, using SKU as fallback");
    processedData.listing_title = sku;
  }

  const { error: updateError } = await supabase
    .from('products')
    .update(processedData)
    .eq('sku', sku);

  if (updateError) {
    console.error("Error updating product:", updateError);
    throw updateError;
  }

  console.log("Product updated successfully:", {
    sku,
    amazonFbaTierId: processedData.amazon_fba_tier_id,
    promotedListingPercentage: processedData.promoted_listing_percentage,
    shippingServiceId: processedData.default_shipping_service_id,
    pickingFeeId: processedData.default_picking_fee_id
  });
  
  return true;
};
