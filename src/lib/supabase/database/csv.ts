
import { supabase } from '@/integrations/supabase/client';

export const processCSV = async (file: File): Promise<{ success: boolean; message: string }> => {
  try {
    const text = await file.text();
    const rows = text.split('\n').map(row => row.split(','));
    const headers = rows[0];

    // Log all headers to verify column names
    console.log('CSV Headers:', headers);

    // Find the correct column indices, accounting for case variations
    const findColumnIndex = (possibleNames: string[]): number => {
      const index = headers.findIndex(header => 
        possibleNames.includes(header.trim())
      );
      console.log(`Looking for columns ${possibleNames.join(' or ')}, found at index:`, index);
      return index;
    };

    const totalPriceIndex = findColumnIndex(['Total Price', 'Total price', 'TotalPrice', 'TOTAL PRICE']);
    const grossProfitIndex = findColumnIndex(['Gross Profit', 'Gross profit', 'GrossProfit', 'GROSS PROFIT']);
    const quantityIndex = findColumnIndex(['Quantity', 'quantity', 'QUANTITY']);
    const skuIndex = findColumnIndex(['SKU', 'sku']);
    const saleDateIndex = findColumnIndex(['Sale Date', 'SaleDate', 'Date']);
    const platformIndex = findColumnIndex(['Platform', 'platform']);
    const promotedIndex = findColumnIndex(['Promoted Listing', 'Promoted', 'promoted']);
    const productCostIndex = findColumnIndex(['Product Cost', 'ProductCost', 'Cost']);
    const listingTitleIndex = findColumnIndex(['Listing Title', 'Title', 'Product Title']);

    // Log all found indices
    console.log('Found column indices:', {
      totalPriceIndex,
      grossProfitIndex,
      quantityIndex,
      skuIndex,
      saleDateIndex,
      platformIndex,
      promotedIndex,
      productCostIndex,
      listingTitleIndex
    });

    // Verify we found the required columns
    if (totalPriceIndex === -1) {
      throw new Error('Total Price column not found in CSV');
    }

    const data = rows.slice(1);

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
    }>();

    // Helper function to parse price values
    const parsePrice = (value: string | undefined): number => {
      if (!value || value.trim() === '') return 0;
      
      // Remove £ symbol, any whitespace, and handle thousands separators
      const cleanValue = value.trim().replace('£', '').replace(/,/g, '');
      const number = parseFloat(cleanValue);
      
      console.log('Parsing price:', {
        originalValue: value,
        cleanValue,
        parsedNumber: number
      });
      
      return isNaN(number) ? 0 : number;
    };

    // First pass: aggregate data by SKU
    for (const row of data) {
      if (row.length !== headers.length) continue;

      const rawTotalPrice = row[totalPriceIndex];
      const rawGrossProfit = row[grossProfitIndex];

      console.log('Processing row:', {
        totalPriceRaw: rawTotalPrice,
        grossProfitRaw: rawGrossProfit
      });

      const sku = row[skuIndex];
      const quantity = parseInt(row[quantityIndex] || '0');
      const total_price = parsePrice(rawTotalPrice);
      const gross_profit = parsePrice(rawGrossProfit);
      const product_cost = parsePrice(row[productCostIndex]);

      // Log parsed values
      console.log('Processed values:', {
        sku,
        quantity,
        total_price,
        gross_profit,
        product_cost
      });

      // Skip rows without a valid SKU
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
      
      const sale = {
        sale_date: row[saleDateIndex],
        platform: row[platformIndex],
        promoted: row[promotedIndex]?.toLowerCase() === 'yes',
        quantity,
        total_price,
        gross_profit,
      };
      
      console.log('Adding sale:', sale);
      skuData.sales.push(sale);

      // Store product data
      if (!productsBySku.has(sku)) {
        productsBySku.set(sku, {
          sku,
          listing_title: row[listingTitleIndex] || sku,
          product_cost,
        });
      }
    }

    // Second pass: save aggregated data
    for (const [sku, productData] of productsBySku) {
      const product = {
        ...productData,
        stock_quantity: 0,
      };

      const { error: productError } = await supabase
        .from('products')
        .upsert([product], { onConflict: 'sku' });

      if (productError) throw productError;

      const salesData = salesBySku.get(sku)!;
      console.log('Inserting sales for SKU:', sku, salesData);
      
      for (const sale of salesData.sales) {
        const { data: insertedSale, error: saleError } = await supabase
          .from('sales')
          .insert([{ ...sale, sku }])
          .select();

        if (saleError) throw saleError;
        console.log('Inserted sale:', insertedSale);
      }

      // Update stock quantity
      const { data: currentProduct } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('sku', sku)
        .single();

      const currentQuantity = currentProduct?.stock_quantity ?? 0;
      const newQuantity = currentQuantity - salesData.quantity;

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
