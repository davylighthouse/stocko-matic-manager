
import { Card } from "@/components/ui/card";
import { Activity, DollarSign, Package, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeagueTable } from "@/components/products/LeagueTable";
import { useQuery } from "@tanstack/react-query";
import { getTopProductsBySales } from "@/lib/supabase/database";

const Dashboard = () => {
  // Use a wider date range to ensure we capture all sales
  const startDate = new Date('2020-01-01'); // From 2020
  const endDate = new Date(); // Until today

  const { data: products = [] } = useQuery({
    queryKey: ['topProducts', startDate, endDate],
    queryFn: () => getTopProductsBySales(startDate, endDate),
  });

  // Get the grand total and total quantity from the first row
  const grandTotal = products[0]?.grand_total || 0;
  const totalQuantity = products[0]?.total_quantity || 0;

  const stats = [
    {
      name: "Total Sales",
      value: `£${grandTotal.toFixed(2)}`,
      change: "+12%",
      icon: DollarSign,
    },
    {
      name: "Units Sold",
      value: totalQuantity.toString(),
      change: "+5%",
      icon: Package,
    },
    {
      name: "Gross Profit",
      value: "£4,567",
      change: "+8%",
      icon: TrendingUp,
    },
    {
      name: "Active SKUs",
      value: "89",
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
