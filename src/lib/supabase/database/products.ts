
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/types/database';

export const getStockLevels = async () => {
  console.log('Fetching stock levels...');
  
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select(`
      *,
      current_stock_levels (
        current_stock,
        initial_stock,
        quantity_sold,
        adjustments
      ),
      latest_stock_check_quantities (
        last_check_quantity,
        check_date
      ),
      total_sales_quantities (
        total_sold
      )
    `)
    .order('listing_title');

  if (productsError) {
    console.error('Error fetching products:', productsError);
    throw productsError;
  }

  console.log('Raw products data:', products);

  const transformedProducts = products.map(product => {
    console.log('Processing product:', {
      sku: product.sku,
      stockQuantity: product.stock_quantity,
      stockLevels: product.current_stock_levels
    });

    return {
      ...product,
      current_stock: product.stock_quantity ?? 0
    };
  });

  console.log('Final transformed products:', transformedProducts);
  return transformedProducts;
};

export const updateProductDetails = async (sku: string, data: Partial<Product>) => {
  console.log("Updating product:", sku, data);

  // First, get the existing product data and default IDs
  const [{ data: existingProduct, error: fetchError }, { data: defaultPickingFee }, { data: defaultShippingService }] = await Promise.all([
    supabase.from('products').select('*').eq('sku', sku).single(),
    supabase.from('picking_fees').select('id').limit(1).single(),
    supabase.from('shipping_services').select('id').limit(1).single()
  ]);

  if (fetchError) {
    console.error("Error fetching existing product:", fetchError);
    throw fetchError;
  }

  // Process the data before updating
  const processedData = {
    ...existingProduct,
    ...data,
    // Handle shipping service ID
    default_shipping_service_id: 
      data.default_shipping_service_id === null || 
      (typeof data.default_shipping_service_id === 'string' && data.default_shipping_service_id === "not_set") ? 
        defaultShippingService.id : 
        data.default_shipping_service_id ? 
          parseInt(String(data.default_shipping_service_id)) : 
          existingProduct.default_shipping_service_id,
    // Handle picking fee ID
    default_picking_fee_id: 
      data.default_picking_fee_id ? 
        parseInt(String(data.default_picking_fee_id)) : 
        existingProduct.default_picking_fee_id || defaultPickingFee.id,
    // Triple check the listing_title is set
    listing_title: data.listing_title || existingProduct?.listing_title || sku
  };

  console.log("Data to be updated:", processedData);

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

  console.log("Product updated successfully:", sku);
  return true;
};

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

export const updateStockLevel = async (sku: string, quantity: number) => {
  try {
    console.log('Updating stock level for SKU:', sku, 'to quantity:', quantity);

    const { data: existingProduct, error: checkError } = await supabase
      .from('products')
      .select('stock_quantity, listing_title')
      .eq('sku', sku)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking product existence:', checkError);
      throw checkError;
    }

    if (!existingProduct) {
      console.log('Product not found, creating new product');
      // When creating a new product, explicitly set listing_title to SKU
      const newProduct = await createProduct({
        sku,
        listing_title: sku, // Explicitly set listing_title to SKU
        stock_quantity: quantity
      });

      if (!newProduct) {
        throw new Error('Failed to create new product');
      }
      return true;
    }

    // If existing product has null listing_title, update it
    if (!existingProduct.listing_title) {
      console.log('Existing product has null listing_title, updating to SKU');
      await updateProductDetails(sku, { listing_title: sku });
    }

    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        stock_quantity: quantity,
        listing_title: existingProduct.listing_title || sku // Ensure listing_title is set
      })
      .eq('sku', sku);

    if (updateError) {
      console.error('Error updating stock quantity:', updateError);
      throw updateError;
    }

    const { error: adjustmentError } = await supabase
      .from('stock_adjustments')
      .insert({
        sku,
        quantity: quantity - (existingProduct?.stock_quantity ?? 0),
        notes: 'Manual stock update'
      });

    if (adjustmentError) {
      console.error('Error recording adjustment:', adjustmentError);
      throw adjustmentError;
    }

    console.log('Stock level updated successfully');
    return true;
  } catch (error) {
    console.error('Error in updateStockLevel:', error);
    throw error;
  }
};
