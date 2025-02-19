
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
      
      // First update any existing Amazon FBM rate to use the correct date
      const { data: existingRate } = await supabase
        .from('platform_fee_history')
        .select('*')
        .eq('platform_name', 'Amazon FBM')
        .single();

      if (existingRate && existingRate.effective_from !== '2024-01-01') {
        const { error: updateError } = await supabase
          .from('platform_fee_history')
          .update({ effective_from: '2024-01-01' })
          .eq('id', existingRate.id);

        if (updateError) {
          console.error('Error updating Amazon FBM rate date:', updateError);
        }
      }

      // Get historical rates for comparison
      const { data: historicalRates, error: ratesError } = await supabase
        .from('platform_fee_history')
        .select('*')
        .order('effective_from', { ascending: false });

      if (ratesError) {
        console.error('Error fetching historical rates:', ratesError);
        throw ratesError;
      }

      console.log('Current historical rates:', historicalRates);
      
      const { data, error } = await supabase
        .from('sales_profitability')
        .select(`
          *,
          products (
            product_cost,
            packaging_cost,
            making_up_cost,
            additional_costs
          )
        `)
        .order('sale_date', { ascending: false });

      if (error) {
        console.error('Error fetching profitability data:', error);
        throw error;
      }

      // Process data and calculate derived fields
      const processedData = data?.map(sale => {
        // Calculate VAT if applicable
        let vatCost = 0;
        if (sale.vat_status === 'standard') {
          vatCost = sale.total_price / 6; // 20% VAT calculation
        }

        // Platform fees are now correctly calculated in the view
        const platformFees = sale.platform_fees || 0;
        const shippingCost = sale.shipping_cost || 0;
        const totalProductCost = sale.total_product_cost || 0;
        const advertisingCost = sale.advertising_cost || 0;

        // Calculate total costs including VAT
        const totalCosts = platformFees + 
                         shippingCost + 
                         totalProductCost +
                         advertisingCost +
                         vatCost;

        // Calculate profit and margin
        const profit = (sale.total_price || 0) - totalCosts;
        const profitMargin = sale.total_price ? (profit / sale.total_price) * 100 : 0;

        return {
          ...sale,
          id: sale.sale_id,
          vat_cost: vatCost,
          total_costs: totalCosts,
          profit: profit,
          profit_margin: profitMargin,
          base_product_cost: sale.products?.product_cost || 0,
          packaging_cost: sale.products?.packaging_cost || 0,
          making_up_cost: sale.products?.making_up_cost || 0,
          additional_costs: sale.products?.additional_costs || 0,
          product_cost: sale.total_product_cost || 0,
          shipping_cost: shippingCost,
          advertising_cost: advertisingCost
        } as ProfitabilityData;
      });

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
