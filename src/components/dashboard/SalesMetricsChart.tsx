
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { useQuery } from "@tanstack/react-query";
import { getSalesWithProducts } from "@/lib/supabase/database";

export const SalesMetricsChart = () => {
  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: getSalesWithProducts,
  });

  // Group sales by date and calculate metrics
  const dailyMetrics = sales.reduce((acc: any, sale) => {
    const date = sale.sale_date;
    if (!acc[date]) {
      acc[date] = {
        date,
        sales: 0,
        grossProfit: 0,
        transactions: 0,
      };
    }
    acc[date].sales += sale.total_price || 0;
    acc[date].grossProfit += sale.gross_profit || 0;
    acc[date].transactions += 1;
    return acc;
  }, {});

  // Convert to array and calculate margin
  const chartData = Object.values(dailyMetrics)
    .map((day: any) => ({
      ...day,
      profitMargin: (day.grossProfit / day.sales) * 100,
    }))
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Daily Sales Performance</h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(new Date(date), 'dd/MM')}
            />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value: number) => `£${value.toFixed(2)}`}
              labelFormatter={(label) => format(new Date(label), 'dd MMM yyyy')}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sales"
              stroke="#8884d8"
              name="Total Sales"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="grossProfit"
              stroke="#82ca9d"
              name="Gross Profit"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="profitMargin"
              stroke="#ffc658"
              name="Profit Margin %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
