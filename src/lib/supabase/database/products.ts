
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/types/database';

export const getStockLevels = async () => {
  console.log('Fetching stock levels...');
  
  // Get products with their related data first
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select(`
      *,
      latest_stock_check_quantities (
        last_check_quantity,
        check_date,
        stock_check_id
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

  console.log('Products and their latest checks:', products);

  // Get sales after the last stock check for each product
  const latestChecks = products.map(p => ({
    sku: p.sku,
    checkDate: p.latest_stock_check_quantities?.[0]?.check_date,
    lastQuantity: p.latest_stock_check_quantities?.[0]?.last_check_quantity || 0
  })).filter(check => check.checkDate);

  console.log('Latest check dates:', latestChecks);

  // Get sales since last check for each product
  const salesPromises = latestChecks.map(async (check) => {
    const { data, error } = await supabase
      .from('sales')
      .select('sku, quantity')
      .eq('sku', check.sku)
      .gte('sale_date', check.checkDate);

    if (error) {
      console.error('Error fetching sales for SKU:', check.sku, error);
      return { sku: check.sku, totalSold: 0 };
    }

    const totalSold = data?.reduce((sum, sale) => sum + (sale.quantity || 0), 0) || 0;
    return { sku: check.sku, totalSold };
  });

  // Get adjustments since last check for each product
  const adjustmentsPromises = latestChecks.map(async (check) => {
    const { data, error } = await supabase
      .from('stock_adjustments')
      .select('sku, quantity')
      .eq('sku', check.sku)
      .gte('adjustment_date', check.checkDate);

    if (error) {
      console.error('Error fetching adjustments for SKU:', check.sku, error);
      return { sku: check.sku, totalAdjusted: 0 };
    }

    const totalAdjusted = data?.reduce((sum, adj) => sum + (adj.quantity || 0), 0) || 0;
    return { sku: check.sku, totalAdjusted };
  });

  // Wait for all promises to resolve
  const [salesResults, adjustmentResults] = await Promise.all([
    Promise.all(salesPromises),
    Promise.all(adjustmentsPromises)
  ]);

  console.log('Sales since last check:', salesResults);
  console.log('Adjustments since last check:', adjustmentResults);

  // Create maps for efficient lookup
  const salesMap = new Map(salesResults.map(r => [r.sku, r.totalSold]));
  const adjustmentsMap = new Map(adjustmentResults.map(r => [r.sku, r.totalAdjusted]));
  const lastCheckMap = new Map(latestChecks.map(c => [c.sku, c.lastQuantity]));

  // Calculate current stock levels
  const mergedProducts = products.map(product => {
    const lastCheckQuantity = Number(lastCheckMap.get(product.sku) || 0);
    const salesSinceCheck = Number(salesMap.get(product.sku) || 0);
    const adjustmentsSinceCheck = Number(adjustmentsMap.get(product.sku) || 0);

    const currentStock = lastCheckQuantity - salesSinceCheck + adjustmentsSinceCheck;

    console.log('Stock calculation for SKU:', product.sku, {
      lastCheckQuantity,
      salesSinceCheck,
      adjustmentsSinceCheck,
      currentStock,
      checkDate: product.latest_stock_check_quantities?.[0]?.check_date
    });

    return {
      ...product,
      current_stock: currentStock
    };
  });

  return mergedProducts;
};

export const updateProductDetails = async (sku: string, data: {
  listing_title?: string;
  product_cost?: number;
  warehouse_location?: string;
  supplier?: string;
}) => {
  const { error } = await supabase
    .from('products')
    .update(data)
    .eq('sku', sku);

  if (error) throw error;
  return true;
};

export const createProduct = async (product: {
  sku: string;
  listing_title?: string;
  stock_quantity?: number;
}) => {
  const { error } = await supabase
    .from('products')
    .insert({
      sku: product.sku,
      listing_title: product.listing_title || product.sku, // Use SKU as default listing title
      stock_quantity: product.stock_quantity || 0
    });

  if (error) throw error;
  return true;
};

export const updateStockLevel = async (sku: string, quantity: number) => {
  // First check if the product exists
  const { data: existingProduct, error: checkError } = await supabase
    .from('products')
    .select('listing_title')
    .eq('sku', sku)
    .single();

  if (checkError) {
    if (checkError.code === 'PGRST116') {
      // Product doesn't exist - create it automatically
      await createProduct({ 
        sku,
        listing_title: sku // Use SKU as initial listing title
      });
    } else {
      throw checkError;
    }
  }

  // Get current stock level using our existing function
  const stockLevels = await getStockLevels();
  const currentProduct = stockLevels.find(p => p.sku === sku);
  
  if (!currentProduct) {
    throw new Error(`Product with SKU ${sku} not found`);
  }

  // Calculate the adjustment needed
  const adjustment = quantity - (currentProduct.current_stock || 0);

  // Record the adjustment
  const { error: adjustmentError } = await supabase
    .from('stock_adjustments')
    .insert({
      sku,
      quantity: adjustment,
      notes: 'Manual stock update'
    });

  if (adjustmentError) throw adjustmentError;

  return true;
};
