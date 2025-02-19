
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { useQuery } from "@tanstack/react-query";
import { getSalesWithProducts } from "@/lib/supabase/database/sales";

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
      profitMargin: day.sales > 0 ? ((day.grossProfit / day.sales) * 100) : 0,
    }))
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  console.log('Chart Data:', chartData);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Daily Sales Performance</h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(new Date(date), 'dd/MM')}
              height={60}
              tick={(props) => {
                const { x, y, payload } = props;
                const date = format(new Date(payload.value), 'dd/MM');
                const dayData = chartData.find(d => d.date === payload.value);
                const margin = dayData && !isNaN(dayData.profitMargin) 
                  ? dayData.profitMargin.toFixed(1) 
                  : '0.0';
                
                console.log('Margin for date:', payload.value, margin);
                
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text x={0} y={0} dy={16} textAnchor="middle">{date}</text>
                    <text x={0} y={0} dy={35} textAnchor="middle" fill="#666">{margin}%</text>
                  </g>
                );
              }}
            />
            <YAxis yAxisId="left" />
            <Tooltip 
              formatter={(value: number) => `£${value.toFixed(2)}`}
              labelFormatter={(label) => format(new Date(label), 'dd MMM yyyy')}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="sales"
              fill="#8884d8"
              name="Total Sales"
            />
            <Bar
              yAxisId="left"
              dataKey="grossProfit"
              fill="#82ca9d"
              name="Gross Profit"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
