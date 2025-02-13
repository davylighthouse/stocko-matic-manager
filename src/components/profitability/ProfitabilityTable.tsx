
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface ProfitabilityTableProps {
  sales: ProfitabilityData[];
}

export const ProfitabilityTable = ({ sales }: ProfitabilityTableProps) => {
  const formatCurrency = (value: number) => {
    return `£${value.toFixed(2)}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Sale Price</TableHead>
            <TableHead className="text-right">Product Cost</TableHead>
            <TableHead className="text-right">Platform Fees</TableHead>
            <TableHead className="text-right">Shipping</TableHead>
            <TableHead className="text-right">VAT</TableHead>
            <TableHead className="text-right">Total Costs</TableHead>
            <TableHead className="text-right">Profit</TableHead>
            <TableHead className="text-right">Margin</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>{format(new Date(sale.sale_date), 'dd MMM yyyy')}</TableCell>
              <TableCell>{sale.platform}</TableCell>
              <TableCell>{sale.sku}</TableCell>
              <TableCell>{sale.listing_title}</TableCell>
              <TableCell className="text-right">{sale.quantity}</TableCell>
              <TableCell className="text-right">{formatCurrency(sale.total_price)}</TableCell>
              <TableCell className="text-right">{formatCurrency(sale.total_product_cost)}</TableCell>
              <TableCell className="text-right">{formatCurrency(sale.platform_fees)}</TableCell>
              <TableCell className="text-right">{formatCurrency(sale.shipping_cost)}</TableCell>
              <TableCell className="text-right">{formatCurrency(sale.vat_cost)}</TableCell>
              <TableCell className="text-right">{formatCurrency(sale.total_costs)}</TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(sale.profit)}</TableCell>
              <TableCell className="text-right">{formatPercentage(sale.profit_margin)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
