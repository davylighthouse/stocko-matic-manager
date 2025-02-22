
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
      
      const { data: salesData, error } = await supabase
        .from('sales_profitability')
        .select('*');

      if (error) {
        console.error('Error fetching profitability data:', error);
        throw error;
      }

      // Process data and calculate derived fields
      const processedData = salesData?.map(sale => {
        // Calculate VAT if applicable
        const vatCost = sale.vat_status === 'standard' ? (sale.total_price || 0) / 6 : 0;

        // Calculate total costs
        const totalCosts = (sale.total_product_cost || 0) +
                         (sale.platform_fees || 0) +
                         (sale.shipping_cost || 0) +
                         (sale.advertising_cost || 0) +
                         vatCost;

        // Calculate profit and margin
        const profit = (sale.total_price || 0) - totalCosts;
        const profitMargin = sale.total_price ? (profit / sale.total_price) * 100 : 0;

        // Return ProfitabilityData
        return {
          id: sale.sale_id,
          sale_date: sale.sale_date,
          platform: sale.platform,
          sku: sale.sku,
          listing_title: sale.listing_title,
          promoted: sale.promoted || false,
          quantity: sale.quantity || 0,
          total_price: sale.total_price || 0,
          product_cost: sale.base_product_cost || 0,
          packaging_cost: sale.packaging_cost || 0,
          making_up_cost: sale.making_up_cost || 0,
          additional_costs: sale.additional_costs || 0,
          total_product_cost: sale.total_product_cost || 0,
          platform_fees: sale.platform_fees || 0,
          shipping_cost: sale.shipping_cost || 0,
          advertising_cost: sale.advertising_cost || 0,
          vat_cost: vatCost,
          vat_status: sale.vat_status || 'exempt',
          profit,
          profit_margin: profitMargin,
          total_costs: totalCosts,
          platform_fee_percentage: sale.platform_fee_percentage || 0,
          default_shipping_service_id: 0,
          picking_fee: sale.picking_fee || 0,
          default_picking_fee_id: 0,
          amazon_fba_tier_id: null,
          fba_fee_amount: sale.fba_fee_amount || null,
          platform_flat_fee: sale.platform_flat_fee || null,
          verified: false,
          promoted_listing_percentage: 0,
        } satisfies ProfitabilityData;
      }) || [];

      return processedData;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    gcTime: 0
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
