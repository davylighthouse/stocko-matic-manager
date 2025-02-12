
import { supabase } from '@/integrations/supabase/client';
import { parsePrice } from './utils';

export const processCSV = async (file: File): Promise<{ success: boolean; message: string }> => {
  try {
    const text = await file.text();
    const rows = text.split('\n').map(row => row.split(','));
    const headers = rows[0].map(header => header.trim());

    console.log('CSV Headers:', headers);

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

      const { error: saleError } = await supabase
        .from('sales')
        .insert([saleData]);

      if (saleError) {
        console.error('Error inserting sale:', saleError);
        throw saleError;
      }

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
