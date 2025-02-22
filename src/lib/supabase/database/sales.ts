import { supabase } from '@/integrations/supabase/client';
import type { SaleWithProduct, SalesTotals } from '@/types/sales';
import type { ProfitabilityData } from '@/components/profitability/types';
import { format } from 'date-fns';
import Papa from 'papaparse';

interface SalesCSVRow {
  'Sale Date': string;
  Platform: string;
  'Listing Title': string;
  SKU: string;
  'Promoted Listing': string;
  Quantity: string;
  'Total Price': string;
}

const parsePrice = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined || value === '') return 0;
  const stringValue = value.toString().trim().replace(/[£$,\s]/g, '');
  const number = parseFloat(stringValue);
  return isNaN(number) ? 0 : number;
};

export const getSalesWithProducts = async (): Promise<SaleWithProduct[]> => {
  console.log("Fetching sales data...");

  const { data: salesData, error } = await supabase
    .from("sales_profitability")
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
      advertising_cost,
      vat_status,
      platform_fee_percentage,
    `);

  if (error) {
    console.error("Error fetching sales with products:", error);
    throw error;
  }

  return (salesData || []).map((sale) => {
    // Calculate VAT correctly
    let vatCost = 0;
    if (sale.vat_status === "standard") {
      vatCost = (sale.total_price || 0) / 6;
    }

    // Check Amazon FBA shipping rule
    let shippingCost = sale.shipping_cost;
    if (sale.platform === "Amazon FBA") {
      shippingCost = 0;
    }

    // Calculate advertising cost based on promoted listing percentage
    const advertisingCost = sale.promoted ? 
      (sale.total_price || 0) * (sale.promoted_listing_percentage || 0) / 100 : 0;

    // Calculate total costs correctly
    const totalCosts =
      (sale.total_product_cost || 0) +
      (sale.platform_fees || 0) +
      shippingCost +
      advertisingCost +
      vatCost;

    // Calculate final profit and margin
    const profit = (sale.total_price || 0) - totalCosts;
    const profitMargin = sale.total_price ? (profit / sale.total_price) * 100 : 0;

    // ✅ DETAILED LOGGING: Historical vs Current Data Validation
    console.log("\n-----------");
    console.log(`📊 SALE ANALYSIS: #${sale.sale_id}`);
    console.log("-----------");
    console.log("BASIC INFO:");
    console.log(`📅 Sale Date: ${sale.sale_date}`);
    console.log(`🏷️ SKU: ${sale.sku}`);
    console.log(`💰 Total Price: £${sale.total_price}`);
    console.log("\nCOST ANALYSIS:");
    console.log(`📦 Product Cost: £${sale.total_product_cost}`);
    console.log(`🏪 Platform Fees: £${sale.platform_fees} (${sale.platform_fee_percentage}%)`);
    console.log(`🚚 Shipping Cost: £${shippingCost} ${sale.platform === "Amazon FBA" ? "(FBA: Set to 0)" : ""}`);
    console.log(`📢 Advertising: £${advertisingCost} (${sale.promoted_listing_percentage}%)`);
    console.log(`💱 VAT: £${vatCost} (${sale.vat_status})`);
    console.log("\nPROFITABILITY:");
    console.log(`💶 Total Costs: £${totalCosts}`);
    console.log(`📈 Profit: £${profit}`);
    console.log(`📊 Margin: ${profitMargin.toFixed(2)}%`);
    console.log("-----------");

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
      shipping_cost: shippingCost,
      advertising_cost: advertisingCost,
      gross_profit: profit,
      vat_status: sale.vat_status,
      vat_cost: vatCost,
      profit_margin: profitMargin,
      total_costs: totalCosts
    };
  });
};

export const getSalesTotals = async () => {
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
      advertising_cost,
      vat_status
    `)
    .throwOnError();

  if (error) {
    console.error('Error fetching sales totals:', error);
    throw error;
  }

  const totals = (data || []).reduce((acc, sale) => {
    let vatCost = 0;
    if (sale.vat_status === 'standard') {
      vatCost = (sale.total_price || 0) / 6;
    }

    const totalCosts = (sale.platform_fees || 0) +
                      (sale.shipping_cost || 0) +
                      (sale.total_product_cost || 0) +
                      (sale.advertising_cost || 0) +
                      vatCost;

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

  const uniqueSkus = new Set(data?.map(sale => sale.sku)).size;

  const sortedData = [...(data || [])].sort((a, b) => 
    new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime()
  );

  return {
    ...totals,
    unique_products: uniqueSkus,
    earliest_sale: sortedData[0]?.sale_date,
    latest_sale: sortedData[sortedData.length - 1]?.sale_date,
  } as SalesTotals;
};

export const deleteSale = async (id: number) => {
  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

export const deleteMultipleSales = async (ids: number[]) => {
  const { error } = await supabase
    .from('sales')
    .delete()
    .in('id', ids);

  if (error) throw error;
  return true;
};

export const updateSale = async (id: number, data: Partial<SaleWithProduct>) => {
  console.log('Received data for update:', data);
  
  const numericData = {
    ...data,
    total_price: parsePrice(data.total_price),
    gross_profit: parsePrice(data.gross_profit)
  };

  console.log('Processed data for update:', numericData);

  const { error } = await supabase
    .from('sales')
    .update({
      sale_date: numericData.sale_date,
      platform: numericData.platform,
      sku: numericData.sku,
      quantity: numericData.quantity,
      total_price: numericData.total_price,
      gross_profit: numericData.gross_profit,
      promoted: numericData.promoted
    })
    .eq('id', id);

  if (error) throw error;
  return true;
};

export const updateSaleProfitability = async (id: number, data: Partial<ProfitabilityData>) => {
  console.log('Updating sale profitability:', { id, data });
  
  const { error } = await supabase
    .from('sales')
    .update({
      sale_date: data.sale_date,
      platform: data.platform,
      sku: data.sku,
      quantity: data.quantity,
      total_price: data.total_price,
      promoted: data.promoted,
      verified: data.verified
    })
    .eq('sale_id', id);

  if (error) {
    console.error('Error updating sale:', error);
    throw error;
  }

  return true;
};

export const processSalesCSV = async (file: File): Promise<{ success: boolean; message?: string }> => {
  return new Promise((resolve) => {
    Papa.parse<SalesCSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          console.log('Parsing sales CSV file:', results.data);
          
          for (const row of results.data) {
            if (!row.SKU || !row['Sale Date']) {
              console.error('Row missing required fields:', row);
              continue;
            }

            const { data: existingProduct } = await supabase
              .from('products')
              .select('sku')
              .eq('sku', row.SKU)
              .maybeSingle();

            if (!existingProduct) {
              console.log('Product does not exist, creating:', row.SKU);
              const [{ data: defaultPickingFee }, { data: defaultShippingService }] = await Promise.all([
                supabase.from('current_picking_fees').select('id').limit(1).single(),
                supabase.from('shipping_services').select('id').limit(1).single()
              ]);

              if (!defaultPickingFee || !defaultShippingService) {
                throw new Error('Default picking fee or shipping service not found');
              }

              const { error: productError } = await supabase
                .from('products')
                .insert([{
                  sku: row.SKU,
                  listing_title: row['Listing Title'] || row.SKU,
                  default_picking_fee_id: defaultPickingFee.id,
                  default_shipping_service_id: defaultShippingService.id,
                  stock_quantity: 0
                }]);

              if (productError) {
                console.error('Error creating product:', productError);
                throw productError;
              }
            }

            const [day, month, year] = row['Sale Date'].split(/[-/]/);
            const saleDate = new Date(Number(year), Number(month) - 1, Number(day));
            
            if (isNaN(saleDate.getTime())) {
              console.error('Invalid date format:', row['Sale Date']);
              continue;
            }

            const formattedDate = format(saleDate, 'yyyy-MM-dd');
            
            const saleData = {
              sale_date: formattedDate,
              platform: row.Platform,
              sku: row.SKU,
              quantity: parseInt(row.Quantity) || 0,
              total_price: parsePrice(row['Total Price']),
              promoted: row['Promoted Listing']?.toLowerCase() === 'yes',
            };

            console.log('Inserting sale:', saleData);

            const { error } = await supabase
              .from('sales')
              .insert([saleData]);

            if (error) {
              console.error('Error creating sale:', error);
              throw error;
            }
          }

          resolve({ success: true });
        } catch (error) {
          console.error('Error processing CSV:', error);
          resolve({ 
            success: false, 
            message: error instanceof Error ? error.message : 'Failed to process CSV file' 
          });
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        resolve({ 
          success: false, 
          message: 'Failed to parse CSV file' 
        });
      }
    });
  });
};

export const downloadSalesTemplate = async () => {
  const csvContent = [
    ['Sale Date', 'Platform', 'Listing Title', 'SKU', 'Promoted Listing', 'Quantity', 'Total Price'].join(','),
    ['04/01/2024', 'Amazon', 'Example Product', 'ABC123', 'Yes', '1', '19.99'].join(',')
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `sales_template_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
