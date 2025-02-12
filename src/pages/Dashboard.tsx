
import { Card } from "@/components/ui/card";
import { Activity, DollarSign, Package, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeagueTable } from "@/components/products/LeagueTable";
import { useQuery } from "@tanstack/react-query";
import { getTopProductsBySales, getSalesTotals } from "@/lib/supabase/database";

const Dashboard = () => {
  // Use a wider date range to ensure we capture all sales
  const startDate = new Date('2020-01-01'); // From 2020
  const endDate = new Date(); // Until today

  const { data: products = [] } = useQuery({
    queryKey: ['topProducts', startDate, endDate],
    queryFn: () => getTopProductsBySales(startDate, endDate),
  });

  const { data: totals } = useQuery({
    queryKey: ['salesTotals'],
    queryFn: getSalesTotals,
  });

  const stats = [
    {
      name: "Total Sales",
      value: totals ? `£${totals.total_sales?.toFixed(2) || '0.00'}` : '£0.00',
      change: "+12%",
      icon: DollarSign,
    },
    {
      name: "Units Sold",
      value: totals?.total_quantity?.toString() || "0",
      change: "+5%",
      icon: Package,
    },
    {
      name: "Gross Profit",
      value: totals ? `£${totals.total_profit?.toFixed(2) || '0.00'}` : '£0.00',
      change: "+8%",
      icon: TrendingUp,
    },
    {
      name: "Active SKUs",
      value: totals?.unique_products?.toString() || "0",
      change: "-2%",
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Monitor your key performance indicators and stock levels
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.name}
              className="dashboard-card p-6 space-y-4 bg-white"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-600">
                  {stat.name}
                </div>
                <Icon className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </div>
                <div
                  className={cn(
                    "inline-flex items-center text-sm",
                    stat.change.startsWith("+")
                      ? "text-green-600"
                      : "text-red-600"
                  )}
                >
                  {stat.change}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <LeagueTable />
    </div>
  );
};

export default Dashboard;
