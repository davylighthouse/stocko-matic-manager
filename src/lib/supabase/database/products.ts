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

  // Remove any undefined values to prevent database errors
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  );

  console.log("Clean data for update:", cleanData);

  const { error } = await supabase
    .from('products')
    .update(cleanData)
    .eq('sku', sku);

  if (error) {
    console.error("Error updating product:", error);
    throw error;
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
  
  const productData = {
    sku: product.sku,
    listing_title: product.listing_title || product.sku,
    stock_quantity: product.stock_quantity || 0
  };

  console.log('Final product data:', productData);

  const { data: existingProduct } = await supabase
    .from('products')
    .select('sku')
    .eq('sku', product.sku)
    .maybeSingle();

  if (existingProduct) {
    console.log('Product already exists:', existingProduct);
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
      .select('stock_quantity')
      .eq('sku', sku)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking product existence:', checkError);
      throw checkError;
    }

    if (!existingProduct) {
      console.log('Product not found, creating new product');
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

    const { error: updateError } = await supabase
      .from('products')
      .update({ stock_quantity: quantity })
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
