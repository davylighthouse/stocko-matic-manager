
import { supabase } from '@/integrations/supabase/client';

export const processCSV = async (file: File): Promise<{ success: boolean; message: string }> => {
  try {
    const text = await file.text();
    const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim()));
    const headers = rows[0].map(header => header.trim());

    // Log all headers for debugging
    console.log('CSV Headers:', headers);

    // Helper function to parse price values
    const parsePrice = (value: string | undefined): number => {
      // Handle undefined or empty values
      if (!value || value.trim() === '') return 0;
      
      // Remove £ symbol and any whitespace, then convert to float
      const cleanValue = value.trim().replace('£', '');
      const number = parseFloat(cleanValue);
      console.log('parsePrice:', { input: value, cleaned: cleanValue, result: number });
      return isNaN(number) ? 0 : number;
    };

    // Find the correct column indices
    const findColumnIndex = (possibleNames: string[]): number => {
      const index = headers.findIndex(header => 
        possibleNames.some(name => header.toLowerCase().trim() === name.toLowerCase().trim())
      );
      console.log(`Finding column index for "${possibleNames.join(', ')}"`, { 
        found: index, 
        header: index !== -1 ? headers[index] : 'not found' 
      });
      return index;
    };

    const totalPriceIndex = findColumnIndex(['Total Price']);
    const grossProfitIndex = findColumnIndex(['Gross Profit']);
    const quantityIndex = findColumnIndex(['Quantity']);
    const skuIndex = findColumnIndex(['SKU']);
    const saleDateIndex = findColumnIndex(['Sale Date']);
    const platformIndex = findColumnIndex(['Platform']);
    const promotedIndex = findColumnIndex(['Promoted']);
    const productCostIndex = findColumnIndex(['Product Cost']);
    const listingTitleIndex = findColumnIndex(['Listing Title']);

    // Log found indices for debugging
    console.log('All column indices:', {
      totalPrice: totalPriceIndex,
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
    if (totalPriceIndex === -1 || skuIndex === -1 || quantityIndex === -1) {
      console.error('Missing required columns:', {
        totalPrice: totalPriceIndex === -1,
        sku: skuIndex === -1,
        quantity: quantityIndex === -1
      });
      return {
        success: false,
        message: 'CSV file is missing required columns (Total Price, SKU, or Quantity)'
      };
    }

    const data = rows.slice(1);

    // Process each row
    for (const row of data) {
      if (row.length !== headers.length) {
        console.log('Skipping row - incorrect length:', row);
        continue;
      }

      const sku = row[skuIndex];
      if (!sku) {
        console.log('Skipping row - no SKU:', row);
        continue;
      }

      // Process price values using parsePrice()
      const rawTotalPrice = row[totalPriceIndex];
      const rawGrossProfit = row[grossProfitIndex];
      
      console.log('Processing row prices:', {
        sku,
        totalPrice: {
          raw: rawTotalPrice,
          parsed: parsePrice(rawTotalPrice)
        },
        grossProfit: {
          raw: rawGrossProfit,
          parsed: parsePrice(rawGrossProfit)
        }
      });

      const saleData = {
        sale_date: row[saleDateIndex],
        platform: row[platformIndex],
        sku,
        quantity: parseInt(row[quantityIndex] || '0'),
        total_price: parsePrice(rawTotalPrice),
        gross_profit: parsePrice(rawGrossProfit),
        promoted: row[promotedIndex]?.toLowerCase() === 'yes'
      };

      console.log('Final sale data before insertion:', saleData);

      // Insert the sale record
      const { error: saleError } = await supabase
        .from('sales')
        .insert([saleData]);

      if (saleError) {
        console.error('Error inserting sale:', saleError);
        throw saleError;
      }

      // Update product if it exists
      const product = {
        sku,
        listing_title: row[listingTitleIndex] || sku,
        product_cost: productCostIndex !== -1 ? parsePrice(row[productCostIndex]) : null
      };

      console.log('Upserting product:', product);

      const { error: productError } = await supabase
        .from('products')
        .upsert([product], { onConflict: 'sku' });

      if (productError) {
        console.error('Error upserting product:', productError);
        throw productError;
      }
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
