
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProfitabilityTable } from "@/components/profitability/ProfitabilityTable";
import type { ProfitabilityData } from "@/components/profitability/types";

const Profitability = () => {
  const [search, setSearch] = useState("");

  const { data: salesData = [], isLoading } = useQuery({
    queryKey: ['profitability'],
    queryFn: async () => {
      console.log('Fetching profitability data...');
      
      const { data, error } = await supabase
        .from('sales_profitability')
        .select('*')
        .order('sale_date', { ascending: false });

      if (error) {
        console.error('Error fetching profitability data:', error);
        throw error;
      }

      // Log specific PRED6 data
      const pred6Sales = data?.filter(sale => sale.sku === 'PRED6');
      if (pred6Sales && pred6Sales.length > 0) {
        console.log('PRED6 Sales Data:', pred6Sales);
        
        // Log each PRED6 sale with JSON.stringify to ensure all data is visible
        pred6Sales.forEach((sale, index) => {
          console.log(`PRED6 Sale #${index + 1} of ${pred6Sales.length}:`, JSON.stringify({
            id: sale.id,
            date: sale.sale_date,
            platform: sale.platform,
            quantity: sale.quantity,
            total_price: sale.total_price,
            product_cost: sale.product_cost,
            total_product_cost: sale.total_product_cost,
            platform_fees: sale.platform_fees,
            shipping_cost: sale.shipping_cost,
            vat_cost: sale.vat_cost,
            total_costs: sale.total_costs,
            profit: sale.profit,
            profit_margin: sale.profit_margin,
            platform_fee_percentage: sale.platform_fee_percentage,
            platform_flat_fee: sale.platform_flat_fee,
            promoted: sale.promoted,
            promoted_listing_percentage: sale.promoted_listing_percentage,
            making_up_cost: sale.making_up_cost,
            packaging_cost: sale.packaging_cost,
            picking_fee: sale.picking_fee,
            fba_fee_amount: sale.fba_fee_amount
          }, null, 2));

          // Calculate expected platform fees for verification
          const expectedPlatformFees = sale.promoted 
            ? (sale.total_price * (sale.platform_fee_percentage || 0) / 100) + 
              (sale.platform_flat_fee || 0) +
              (sale.total_price * (sale.promoted_listing_percentage || 0) / 100)
            : (sale.total_price * (sale.platform_fee_percentage || 0) / 100) + 
              (sale.platform_flat_fee || 0);

          console.log(`PRED6 Sale #${index + 1} Fee Calculation:`, {
            total_price: sale.total_price,
            platform_fee_percentage: sale.platform_fee_percentage,
            platform_flat_fee: sale.platform_flat_fee,
            promoted: sale.promoted,
            promoted_percentage: sale.promoted_listing_percentage,
            expected_platform_fees: expectedPlatformFees,
            actual_platform_fees: sale.platform_fees,
            fba_fee_amount: sale.fba_fee_amount
          });
        });
      } else {
        console.log('No PRED6 sales found in the data');
      }
      
      return data as ProfitabilityData[];
    }
  });

  const filteredSales = salesData.filter(
    (sale) =>
      sale.sku.toLowerCase().includes(search.toLowerCase()) ||
      sale.listing_title.toLowerCase().includes(search.toLowerCase()) ||
      sale.platform.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Sales Profitability
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Analyze profitability across all sales including fees, shipping, and VAT
        </p>
      </div>

      <Card className="bg-white overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by SKU, title, or platform..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <ProfitabilityTable sales={filteredSales} />
      </Card>
    </div>
  );
};

export default Profitability;
