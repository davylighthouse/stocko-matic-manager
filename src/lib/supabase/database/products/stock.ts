
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/types/database';
import { createProduct } from './create';
import { updateProductDetails } from './details';

export const getStockLevels = async () => {
  console.log('Fetching stock levels...');
  
  // First, get all products with their basic info
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
      ),
      bundle_products (
        bundle_sku
      )
    `)
    .order('listing_title');

  if (productsError) {
    console.error('Error fetching products:', productsError);
    throw productsError;
  }

  // Then, get bundle information from the view for any products that are bundles
  const bundleSkus = products
    .filter(p => p.bundle_products !== null)
    .map(p => p.sku);

  let bundleData = [];
  if (bundleSkus.length > 0) {
    const { data: bundles, error: bundlesError } = await supabase
      .from('bundle_stock_levels')
      .select('*')
      .in('sku', bundleSkus);

    if (bundlesError) {
      console.error('Error fetching bundle data:', bundlesError);
      throw bundlesError;
    }

    bundleData = bundles || [];
  }

  console.log('Raw products data:', products);
  console.log('Bundle data:', bundleData);

  const transformedProducts = products.map(product => {
    // Find bundle data if this product is a bundle
    const bundleInfo = bundleData.find(b => b.sku === product.sku);
    
    const bundle_components = bundleInfo?.components_details?.map(component => ({
      component_sku: component.component_sku,
      quantity: component.quantity,
      listing_title: component.listing_title,
      stock_quantity: component.stock_quantity
    })) || [];

    return {
      ...product,
      current_stock: product.stock_quantity ?? 0,
      bundle_products: product.bundle_products || null,
      bundle_components,
      // If it's a bundle, use the calculated values from the view
      ...(bundleInfo && {
        stock_quantity: bundleInfo.bundle_stock,
        product_cost: bundleInfo.bundle_cost
      })
    };
  });

  console.log('Final transformed products:', transformedProducts);
  return transformedProducts;
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
        listing_title: sku,
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
        listing_title: existingProduct.listing_title || sku
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
