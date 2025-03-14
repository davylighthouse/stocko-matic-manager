
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/database";

export const getProductDetails = async (sku: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      bundle_products (bundle_sku),
      bundle_components!bundle_components_bundle_sku_fkey (
        component_sku,
        quantity,
        component:products!bundle_components_component_sku_fkey (
          listing_title,
          stock_quantity,
          product_cost
        )
      ),
      latest_stock_check_quantities (
        last_check_quantity,
        check_date
      ),
      total_sales_quantities (
        total_sold
      ),
      current_stock_levels (
        current_stock,
        initial_stock,
        quantity_sold,
        adjustments
      )
    `)
    .eq('sku', sku)
    .maybeSingle();

  if (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }

  return data as Product | null;
};

export const updateProductDetails = async (sku: string, updates: Record<string, string | number | boolean | null>) => {
  const { error } = await supabase.rpc('process_product_updates', {
    p_sku: sku,
    p_updates: updates
  });

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};
