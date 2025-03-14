import { supabase } from '@/integrations/supabase/client';
import type { SaleWithProduct, SalesTotals } from '@/types/sales';
import type { ProfitabilityData } from '@/components/profitability/types';
import { format } from 'date-fns';
import { Product } from "@/types/database";

export const processCSV = async (file: File): Promise<{ success: boolean; message: string }> => {
  try {
    const text = await file.text();
    const rows = text.split('\n').map(row => row.split(','));
    const headers = rows[0];
    const data = rows.slice(1);

    // Get default IDs
    const [{ data: defaultPickingFee }, { data: defaultShippingService }] = await Promise.all([
      supabase.from('current_picking_fees').select('id').limit(1).single(),
      supabase.from('shipping_services').select('id').limit(1).single()
    ]);

    if (!defaultPickingFee || !defaultShippingService) {
      throw new Error('Default picking fee or shipping service not found');
    }

    // Create maps to aggregate data by SKU
    const salesBySku = new Map<string, {
      quantity: number;
      total_price: number;
      gross_profit: number;
      sales: Array<{
        sale_date: string;
        platform: string;
        promoted: boolean;
        quantity: number;
        total_price: number;
        gross_profit: number;
      }>;
    }>();

    const productsBySku = new Map<string, {
      sku: string;
      listing_title: string;
      product_cost: number;
      default_picking_fee_id: number;
      default_shipping_service_id: number;
      stock_quantity: number;
    }>();

    // Helper function to parse price values
    const parsePrice = (value: string | undefined): number => {
      if (!value || value.trim() === '') return 0;
      const cleanValue = value.trim().replace('£', '');
      const number = parseFloat(cleanValue);
      return isNaN(number) ? 0 : number;
    };

    // First pass: aggregate data by SKU
    for (const row of data) {
      if (row.length !== headers.length) continue;

      const sku = row[headers.indexOf('SKU')];
      const quantity = parseInt(row[headers.indexOf('Quantity')] || '0');
      const total_price = parsePrice(row[headers.indexOf('Total Price')]);
      const gross_profit = parsePrice(row[headers.indexOf('Gross Profit')]);
      const product_cost = parsePrice(row[headers.indexOf('Product Cost')]);

      if (!sku) continue;

      // Aggregate sales data
      if (!salesBySku.has(sku)) {
        salesBySku.set(sku, {
          quantity: 0,
          total_price: 0,
          gross_profit: 0,
          sales: [],
        });
      }
      const skuData = salesBySku.get(sku)!;
      skuData.quantity += quantity;
      skuData.total_price += total_price;
      skuData.gross_profit += gross_profit;
      skuData.sales.push({
        sale_date: row[headers.indexOf('Sale Date')],
        platform: row[headers.indexOf('Platform')],
        promoted: row[headers.indexOf('Promoted Listing')]?.toLowerCase() === 'yes',
        quantity,
        total_price,
        gross_profit,
      });

      // Store product data (only for first occurrence of SKU)
      if (!productsBySku.has(sku)) {
        productsBySku.set(sku, {
          sku,
          listing_title: row[headers.indexOf('Listing Title')] || sku,
          product_cost,
          default_picking_fee_id: defaultPickingFee.id,
          default_shipping_service_id: defaultShippingService.id,
          stock_quantity: 0
        });
      }
    }

    // Second pass: save aggregated data
    for (const [sku, productData] of productsBySku) {
      // First, ensure the product exists by upserting it
      const { error: productError } = await supabase
        .from('products')
        .upsert([productData], { onConflict: 'sku' });

      if (productError) throw productError;

      // Then insert individual sales
      const salesData = salesBySku.get(sku)!;
      for (const sale of salesData.sales) {
        const { error: saleError } = await supabase
          .from('sales')
          .insert([{ ...sale, sku }]);

        if (saleError) throw saleError;
      }

      // Get current stock quantity
      const { data: currentProduct } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('sku', sku)
        .single();

      // Calculate new stock quantity
      const currentQuantity = currentProduct?.stock_quantity ?? 0;
      const newQuantity = currentQuantity - salesData.quantity;

      // Update the stock quantity
      const { error: stockError } = await supabase
        .from('products')
        .update({ stock_quantity: newQuantity })
        .eq('sku', sku);

      if (stockError) throw stockError;
    }

    return { success: true, message: 'CSV processed successfully' };
  } catch (error) {
    console.error('Error processing CSV:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to process CSV' 
    };
  }
};

export const getStockLevels = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      latest_stock_check_quantities (
        last_check_quantity,
        check_date
      ),
      total_sales_quantities (
        total_sold
      )
    `)
    .order('order_index');

  if (error) throw error;
  return data;
};

export const updateProductDetails = async (sku: string, data: Partial<Product>) => {
  console.log('Updating product details:', { sku, data }); // Debug log

  const updates = {
    ...data,
    // Ensure promoted_listing_percentage is explicitly set if present
    ...(data.promoted_listing_percentage !== undefined && {
      promoted_listing_percentage: Number(data.promoted_listing_percentage)
    })
  };

  const { error } = await supabase
    .from('products')
    .update(updates)
    .eq('sku', sku)
    .select();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }
  
  return true;
};

export const updateStockLevel = async (sku: string, quantity: number) => {
  const { error } = await supabase
    .from('products')
    .update({ stock_quantity: quantity })
    .eq('sku', sku);

  if (error) throw error;
  return true;
};

export const updateProductOrder = async (updates: { sku: string; order_index: number }[]) => {
  for (const update of updates) {
    const { error } = await supabase
      .from('products')
      .update({ order_index: update.order_index })
      .eq('sku', update.sku);

    if (error) throw error;
  }
  return true;
};

export interface StockCheck {
  id: number;
  check_date: string;
  notes: string | null;
  completed: boolean;
}

export interface StockCheckItem {
  id: number;
  stock_check_id: number;
  sku: string;
  quantity: number;
  product_cost: number | null;
  warehouse_location: string | null;
  created_at: string;
}

export const createStockCheck = async (notes?: string) => {
  const { data, error } = await supabase
    .from('stock_checks')
    .insert([{ notes }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getStockChecks = async () => {
  const { data, error } = await supabase
    .from('stock_checks')
    .select('*')
    .order('check_date', { ascending: false });

  if (error) throw error;
  return data;
};

export const getStockCheckItems = async (stockCheckId: number) => {
  const { data, error } = await supabase
    .from('stock_check_items')
    .select(`
      sku,
      quantity,
      product_cost,
      warehouse_location
    `)
    .eq('stock_check_id', stockCheckId);

  if (error) throw error;
  return data;
};

export const updateStockCheckItem = async (
  stockCheckId: number,
  sku: string,
  data: {
    quantity: number;
    product_cost?: number;
    warehouse_location?: string;
  }
) => {
  const { error } = await supabase
    .from('stock_check_items')
    .upsert({
      stock_check_id: stockCheckId,
      sku,
      ...data,
    }, {
      onConflict: 'stock_check_id,sku'
    });

  if (error) throw error;
  return true;
};

export const completeStockCheck = async (stockCheckId: number) => {
  const { error } = await supabase
    .from('stock_checks')
    .update({ completed: true })
    .eq('id', stockCheckId);

  if (error) throw error;
  return true;
};

export const generateStockCheckTemplate = async () => {
  const { data: products, error } = await supabase
    .from('products')
    .select('sku, listing_title, stock_quantity, product_cost, warehouse_location');

  if (error) throw error;

  // Create CSV content
  const csvContent = [
    ['SKU', 'Product Title', 'Stock Check Quantity', 'Cost Per Unit', 'Warehouse Location'],
    ...products.map(product => [
      product.sku,
      product.listing_title,
      product.stock_quantity ?? '',
      product.product_cost ?? '',
      product.warehouse_location ?? ''
    ])
  ].map(row => row.join(',')).join('\n');

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `stock_check_template_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const processStockCheckCSV = async (file: File, stockCheckId: number): Promise<{ 
  success: boolean; 
  message: string;
  discrepancies?: Array<{
    sku: string;
    product_title: string;
    current_stock: number;
    check_quantity: number;
    difference: number;
  }>;
}> => {
  try {
    const text = await file.text();
    const rows = text.split('\n').map(row => row.split(','));
    const headers = rows[0];
    const data = rows.slice(1);

    const discrepancies = [];

    for (const row of data) {
      if (row.length !== headers.length) continue;

      const sku = row[headers.indexOf('SKU')];
      const checkQuantity = parseInt(row[headers.indexOf('Stock Check Quantity')]);
      const productCost = parseFloat(row[headers.indexOf('Cost Per Unit')]);
      const warehouseLocation = row[headers.indexOf('Warehouse Location')];

      if (!sku || isNaN(checkQuantity)) continue;

      // Get current stock level
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity, listing_title')
        .eq('sku', sku)
        .single();

      if (product) {
        // Record stock check item
        await supabase
          .from('stock_check_items')
          .insert({
            stock_check_id: stockCheckId,
            sku,
            quantity: checkQuantity,
            product_cost: !isNaN(productCost) ? productCost : null,
            warehouse_location: warehouseLocation || null
          });

        // Check for discrepancy
        const currentStock = product.stock_quantity ?? 0;
        if (currentStock !== checkQuantity) {
          discrepancies.push({
            sku,
            product_title: product.listing_title,
            current_stock: currentStock,
            check_quantity: checkQuantity,
            difference: checkQuantity - currentStock
          });
        }
      }
    }

    return { 
      success: true, 
      message: 'Stock check processed successfully',
      discrepancies: discrepancies
    };
  } catch (error) {
    console.error('Error processing CSV:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to process CSV' 
    };
  }
};

export const getTopProductsBySales = async (startDate: Date, endDate: Date) => {
  console.log('Fetching sales for date range:', {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  });

  const { data, error } = await supabase
    .rpc('get_top_products_by_sales', {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    });

  if (error) throw error;
  
  console.log('Received product sales data:', data);
  return data;
};

export const getSalesWithProducts = async () => {
  const { data: salesData, error } = await supabase
    .from('sales_profitability')
    .select(`
      sale_id,
      sale_date,
      platform,
      sku,
      listing_title,
      promoted,
      quantity,
      total_price,
      total_product_cost,
      platform_fees,
      shipping_cost,
      vat_status,
      promoted_listing_percentage
    `);

  if (error) {
    console.error('Error fetching sales with products:', error);
    throw error;
  }

  if (!salesData) return [];

  return salesData.map(sale => {
    let vatCost = 0;
    if (sale.vat_status === 'standard') {
      vatCost = (sale.total_price || 0) / 6;
    }

    // Calculate advertising cost
    let advertisingCost = 0;
    if (sale.promoted) {
      advertisingCost = (sale.total_price || 0) * (sale.promoted_listing_percentage || 0) / 100;
    }

    const totalCosts = (sale.total_product_cost || 0) +
                      (sale.platform_fees || 0) +
                      (sale.shipping_cost || 0) +
                      advertisingCost +
                      vatCost;

    const profit = (sale.total_price || 0) - totalCosts;

    return {
      id: sale.sale_id,
      sale_date: sale.sale_date,
      platform: sale.platform,
      sku: sale.sku,
      listing_title: sale.listing_title,
      promoted: sale.promoted || false,
      quantity: sale.quantity || 0,
      total_price: sale.total_price || 0,
      total_product_cost: sale.total_product_cost || 0,
      platform_fees: sale.platform_fees || 0,
      shipping_cost: sale.shipping_cost || 0,
      advertising_cost: advertisingCost,
      gross_profit: profit
    };
  });
};

export const getSalesTotals = async (): Promise<SalesTotals> => {
  const { data, error } = await supabase
    .from('sales_profitability')
    .select(`
      total_price,
      quantity,
      platform_fees,
      sku,
      sale_date,
      total_product_cost,
      shipping_cost,
      vat_status,
      promoted,
      promoted_listing_percentage
    `);

  if (error) {
    console.error('Error fetching sales totals:', error);
    throw error;
  }

  // Define the type for our query result
  type SaleTotalRow = {
    total_price: number | null;
    quantity: number | null;
    platform_fees: number | null;
    sku: string;
    sale_date: string;
    total_product_cost: number | null;
    shipping_cost: number | null;
    vat_status: string | null;
    promoted: boolean | null;
    promoted_listing_percentage: number | null;
  };

  const totals = (data as SaleTotalRow[] || []).reduce((acc, sale) => {
    let vatCost = 0;
    if (sale.vat_status === 'standard') {
      vatCost = (sale.total_price || 0) / 6;
    }

    // Calculate advertising cost based on promotion status
    let advertisingCost = 0;
    if (sale.promoted) {
      advertisingCost = (sale.total_price || 0) * (sale.promoted_listing_percentage || 0) / 100;
    }

    const totalCosts = (sale.total_product_cost || 0) +
                      (sale.platform_fees || 0) +
                      (sale.shipping_cost || 0) +
                      advertisingCost +
                      vatCost;

    // Calculate profit
    const profit = (sale.total_price || 0) - totalCosts;

    return {
      total_sales: acc.total_sales + (sale.total_price || 0),
      total_quantity: acc.total_quantity + (sale.quantity || 0),
      total_profit: acc.total_profit + profit,
    };
  }, {
    total_sales: 0,
    total_quantity: 0,
    total_profit: 0,
  });

  // Get unique SKUs count
  const uniqueSkus = new Set((data as SaleTotalRow[])?.map(sale => sale.sku)).size;

  // Sort data for date range
  const sortedData = [...((data as SaleTotalRow[]) || [])].sort((a, b) => 
    new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime()
  );

  return {
    ...totals,
    unique_products: uniqueSkus,
    earliest_sale: sortedData[0]?.sale_date || '',
    latest_sale: sortedData[sortedData.length - 1]?.sale_date || '',
  };
};

export const deleteSale = async (id: number) => {
  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

export const updateSale = async (id: number, data: Partial<SaleWithProduct>) => {
  const { error } = await supabase
    .from('sales')
    .update({
      sale_date: data.sale_date,
      platform: data.platform,
      sku: data.sku,
      quantity: data.quantity,
      total_price: data.total_price,
      gross_profit: data.gross_profit,
      promoted: data.promoted
    })
    .eq('id', id);

  if (error) throw error;
  return true;
};
