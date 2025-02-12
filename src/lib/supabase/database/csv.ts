import { supabase } from '@/integrations/supabase/client';

export const processCSV = async (file: File): Promise<{ success: boolean; message: string }> => {
  try {
    const text = await file.text();
    const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim()));
    const headers = rows[0].map(header => header.trim());

    // Log all headers for debugging
    console.log('CSV Headers:', headers);
    console.log('Raw headers (with potential whitespace):', rows[0]);
    console.log('Headers after trimming:', headers.map((h, i) => `${i}: "${h}"`));

    // Find the correct column indices
    const findColumnIndex = (possibleNames: string[]): number => {
      const index = headers.findIndex(header => {
        const headerLower = header.toLowerCase().trim();
        const found = possibleNames.some(name => name.toLowerCase().trim() === headerLower);
        console.log(`Checking header "${header}" (${headerLower}) against possible names:`, possibleNames, 'Found:', found);
        return found;
      });
      return index;
    };

    // Specifically look for Total price with exact match
    const totalPriceIndex = headers.findIndex(header => header === 'Total price');
    console.log('Looking for exact match "Total price", found at index:', totalPriceIndex);

    // If exact match fails, try case-insensitive
    const totalPriceIndexCaseInsensitive = totalPriceIndex === -1 ? 
      headers.findIndex(header => header.toLowerCase() === 'total price') : totalPriceIndex;
    console.log('Case-insensitive match for "Total price", found at index:', totalPriceIndexCaseInsensitive);

    // Initialize column indices
    const grossProfitIndex = findColumnIndex(['Gross Profit']);
    const quantityIndex = findColumnIndex(['Quantity']);
    const skuIndex = findColumnIndex(['SKU']);
    const saleDateIndex = findColumnIndex(['Sale Date']);
    const platformIndex = findColumnIndex(['Platform']);
    const promotedIndex = findColumnIndex(['Promoted']);
    const productCostIndex = findColumnIndex(['Product Cost']);
    const listingTitleIndex = findColumnIndex(['Listing Title']);

    // Use the case-insensitive match for total price
    const finalTotalPriceIndex = totalPriceIndexCaseInsensitive;

    // Log all found indices
    console.log('Column indices found:', {
      totalPrice: {
        exactMatch: totalPriceIndex,
        caseInsensitive: totalPriceIndexCaseInsensitive,
        final: finalTotalPriceIndex
      },
      grossProfit: grossProfitIndex,
      quantity: quantityIndex,
      sku: skuIndex,
      saleDate: saleDateIndex,
      platform: platformIndex,
      promoted: promotedIndex,
      productCost: productCostIndex,
      listingTitle: listingTitleIndex
    });

    // Validate required columns
    if (finalTotalPriceIndex === -1 || skuIndex === -1 || quantityIndex === -1) {
      console.error('Missing required columns:', {
        totalPrice: finalTotalPriceIndex === -1,
        sku: skuIndex === -1,
        quantity: quantityIndex === -1
      });
      return {
        success: false,
        message: 'CSV file is missing required columns (Total price, SKU, or Quantity)'
      };
    }

    const data = rows.slice(1);

    // Helper function to parse price values
    const parsePrice = (value: string | undefined): number => {
      if (!value || value.trim() === '') return 0;
      const cleanValue = value.trim().replace(/[£$,\s]/g, '');
      const number = parseFloat(cleanValue);
      console.log('Parsing price value:', { original: value, cleaned: cleanValue, result: number });
      return isNaN(number) ? 0 : number;
    };

    // Process each row
    for (const row of data) {
      if (row.length !== headers.length) continue;

      const sku = row[skuIndex];
      if (!sku) continue;

      const rawTotalPrice = row[finalTotalPriceIndex];
      console.log('Processing row total price:', {
        rowIndex: data.indexOf(row),
        columnIndex: finalTotalPriceIndex,
        rawValue: rawTotalPrice,
        parsedValue: parsePrice(rawTotalPrice)
      });

      const saleData = {
        sale_date: row[saleDateIndex],
        platform: row[platformIndex],
        sku,
        quantity: parseInt(row[quantityIndex] || '0'),
        total_price: parsePrice(rawTotalPrice),
        gross_profit: parsePrice(row[grossProfitIndex]),
        promoted: row[promotedIndex]?.toLowerCase() === 'yes'
      };

      // Insert the sale record
      const { error: saleError } = await supabase
        .from('sales')
        .insert([saleData]);

      if (saleError) throw saleError;

      // Update product if it exists
      const { error: productError } = await supabase
        .from('products')
        .upsert([{
          sku,
          listing_title: row[listingTitleIndex] || sku,
          product_cost: productCostIndex !== -1 ? parsePrice(row[productCostIndex]) : null
        }], { onConflict: 'sku' });

      if (productError) throw productError;
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
