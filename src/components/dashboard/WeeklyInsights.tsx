
import { Card } from "@/components/ui/card";
import { format, subDays } from 'date-fns';
import { useQuery } from "@tanstack/react-query";
import { getSalesWithProducts } from "@/lib/supabase/database";
import { TrendingUp, TrendingDown, Package } from "lucide-react";

export const WeeklyInsights = () => {
  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: getSalesWithProducts,
  });

  // Get date 7 days ago
  const sevenDaysAgo = subDays(new Date(), 7);

  // Filter sales for last 7 days
  const recentSales = sales.filter(
    sale => new Date(sale.sale_date) >= sevenDaysAgo
  );

  // Calculate insights
  const topSelling = recentSales.reduce((acc, sale) => {
    const key = `${sale.sku}-${sale.listing_title}`;
    if (!acc[key]) {
      acc[key] = { 
        sku: sale.sku,
        title: sale.listing_title,
        quantity: 0,
        revenue: 0,
        profit: 0
      };
    }
    acc[key].quantity += sale.quantity;
    acc[key].revenue += sale.total_price || 0;
    acc[key].profit += sale.gross_profit || 0;
    return acc;
  }, {} as Record<string, any>);

  const insights = Object.values(topSelling);
  const topByQuantity = [...insights].sort((a, b) => b.quantity - a.quantity)[0];
  const topByProfit = [...insights].sort((a, b) => b.profit - a.profit)[0];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Last 7 Days Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topByQuantity && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Package className="h-4 w-4" />
              Top Selling Product
            </div>
            <div className="font-medium">{topByQuantity.title}</div>
            <div className="text-sm text-gray-600">
              Quantity sold: {topByQuantity.quantity}
            </div>
            <div className="text-sm text-gray-600">
              Revenue: £{topByQuantity.revenue.toFixed(2)}
            </div>
          </div>
        )}
        
        {topByProfit && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <TrendingUp className="h-4 w-4" />
              Most Profitable Product
            </div>
            <div className="font-medium">{topByProfit.title}</div>
            <div className="text-sm text-gray-600">
              Profit: £{topByProfit.profit.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">
              Margin: {((topByProfit.profit / topByProfit.revenue) * 100).toFixed(1)}%
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
