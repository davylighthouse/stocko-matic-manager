
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/types/database';

export const getStockLevels = async () => {
  console.log('Fetching stock levels...');
  
  // Join products with current_stock_levels view to get accurate stock data
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select(`
      *,
      current_stock_levels!inner (
        current_stock,
        initial_stock,
        quantity_sold,
        adjustments
      )
    `)
    .order('listing_title');

  if (productsError) {
    console.error('Error fetching products:', productsError);
    throw productsError;
  }

  console.log('Raw products data:', products);

  // Transform the data to match the expected format
  const transformedProducts = products.map(product => {
    // Log individual product data for debugging
    console.log('Processing product:', {
      sku: product.sku,
      stockLevels: product.current_stock_levels
    });

    // Since we're using !inner in the join, current_stock_levels should be a single object
    const stockLevel = product.current_stock_levels;

    const currentStock = stockLevel ? stockLevel.current_stock : 0;
    
    console.log(`Calculated current stock for ${product.sku}:`, currentStock);

    return {
      ...product,
      current_stock: currentStock
    };
  });

  console.log('Final transformed products:', transformedProducts);
  return transformedProducts;
};

export const updateProductDetails = async (sku: string, data: {
  listing_title?: string;
  product_cost?: number;
  warehouse_location?: string;
  supplier?: string;
}) => {
  console.log("Updating product:", sku, data); // Debugging

  const { error } = await supabase
    .from('products')
    .update(data)
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
  
  // Create the product data object with defaults
  const productData = {
    sku: product.sku,
    listing_title: product.listing_title || product.sku, // Fallback to SKU
    stock_quantity: product.stock_quantity || 0
  };

  console.log('Final product data:', productData);

  // First, check if the product already exists
  const { data: existingProduct } = await supabase
    .from('products')
    .select('sku')
    .eq('sku', product.sku)
    .maybeSingle();

  if (existingProduct) {
    console.log('Product already exists:', existingProduct);
    return existingProduct;
  }

  // Insert the new product
  const { data, error } = await supabase
    .from('products')
    .insert([productData]) // Wrap in array to ensure correct format
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

    // First try to get the product
    const { data: existingProduct, error: checkError } = await supabase
      .from('products')
      .select('*')
      .eq('sku', sku)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking product existence:', checkError);
      throw checkError;
    }

    // If product doesn't exist, create it first
    if (!existingProduct) {
      console.log('Product not found, creating new product');
      const newProduct = await createProduct({
        sku,
        listing_title: sku,
        stock_quantity: 0
      });

      if (!newProduct) {
        throw new Error('Failed to create new product');
      }
    }

    // Get current stock level from the view
    const { data: stockLevels, error: stockError } = await supabase
      .from('current_stock_levels')
      .select('*')
      .eq('sku', sku)
      .single();

    if (stockError) {
      console.error('Error fetching current stock level:', stockError);
      throw stockError;
    }

    // Calculate the adjustment needed
    const adjustment = quantity - (stockLevels.current_stock || 0);
    console.log('Calculated adjustment:', adjustment);

    // Record the adjustment
    const { error: adjustmentError } = await supabase
      .from('stock_adjustments')
      .insert({
        sku,
        quantity: adjustment,
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
