
import { Card } from "@/components/ui/card";
import { Activity, DollarSign, Package, TrendingUp } from "lucide-react";

const stats = [
  {
    name: "Total Sales",
    value: "$12,345",
    change: "+12%",
    icon: DollarSign,
  },
  {
    name: "Units Sold",
    value: "234",
    change: "+5%",
    icon: Package,
  },
  {
    name: "Gross Profit",
    value: "$4,567",
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

const Dashboard = () => {
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

      {/* Placeholder for charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-medium text-gray-900">Sales Overview</h3>
          <div className="h-80 flex items-center justify-center text-gray-400">
            Chart placeholder
          </div>
        </Card>
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-medium text-gray-900">Top SKUs</h3>
          <div className="h-80 flex items-center justify-center text-gray-400">
            Chart placeholder
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
