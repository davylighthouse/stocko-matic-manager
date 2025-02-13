
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProfitabilityTable } from "@/components/profitability/ProfitabilityTable";

interface ProfitabilityData {
  id: number;
  sale_date: string;
  platform: string;
  sku: string;
  listing_title: string;
  quantity: number;
  total_price: number;
  total_product_cost: number;
  platform_fees: number;
  shipping_cost: number;
  vat_cost: number;
  total_costs: number;
  profit: number;
  profit_margin: number;
}

const Profitability = () => {
  const [search, setSearch] = useState("");

  const { data: salesData = [], isLoading } = useQuery({
    queryKey: ['profitability'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_profitability')
        .select('*')
        .order('sale_date', { ascending: false });

      if (error) throw error;
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
