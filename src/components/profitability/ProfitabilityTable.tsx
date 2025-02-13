import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Resizable } from "re-resizable";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

interface ColumnWidth {
  [key: string]: number;
}

export const ProfitabilityTable = ({ sales }: ProfitabilityTableProps) => {
  // Initial column widths
  const [columnWidths, setColumnWidths] = useState<ColumnWidth>({
    date: 120,
    platform: 100,
    sku: 120,
    title: 200,
    quantity: 80,
    salePrice: 100,
    productCost: 100,
    platformFees: 100,
    shipping: 100,
    vat: 100,
    totalCosts: 100,
    profit: 100,
    margin: 100,
  });

  const formatCurrency = (value: number) => {
    return `£${value.toFixed(2)}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getProfitColor = (profit: number) => {
    if (profit >= 3) return "bg-green-100 text-green-900"; // Good
    if (profit >= 2) return "bg-yellow-100 text-yellow-900"; // OK
    return "bg-red-100 text-red-900"; // Bad
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 20) return "bg-green-100 text-green-900"; // Good
    if (margin >= 15) return "bg-yellow-100 text-yellow-900"; // OK
    return "bg-red-100 text-red-900"; // Bad
  };

  const getCalculationTooltip = (sale: ProfitabilityData, type: string) => {
    switch (type) {
      case 'total_costs':
        return `Product Cost: ${formatCurrency(sale.total_product_cost)}
                Platform Fees: ${formatCurrency(sale.platform_fees)}
                Shipping Cost: ${formatCurrency(sale.shipping_cost)}
                VAT: ${formatCurrency(sale.vat_cost)}
                = ${formatCurrency(sale.total_costs)}`;
      case 'profit':
        return `Sale Price: ${formatCurrency(sale.total_price)}
                - Total Costs: ${formatCurrency(sale.total_costs)}
                = ${formatCurrency(sale.profit)}`;
      case 'profit_margin':
        return `Profit: ${formatCurrency(sale.profit)}
                ÷ Sale Price: ${formatCurrency(sale.total_price)}
                × 100 = ${formatPercentage(sale.profit_margin)}`;
      default:
        return '';
    }
  };

  const handleResize = (column: string, width: number) => {
    setColumnWidths(prev => ({
      ...prev,
      [column]: width
    }));
  };

  const ResizableColumn = ({ width, onResize, children }: { width: number; onResize: (width: number) => void; children: React.ReactNode }) => (
    <Resizable
      size={{ width, height: "auto" }}
      onResizeStop={(e, direction, ref, d) => {
        onResize(width + d.width);
      }}
      enable={{ right: true }}
      minWidth={80}
      maxWidth={400}
    >
      <div className="h-full">{children}</div>
    </Resizable>
  );

  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <ResizableColumn width={columnWidths.date} onResize={(w) => handleResize('date', w)}>
                  Date
                </ResizableColumn>
              </TableHead>
              <TableHead>
                <ResizableColumn width={columnWidths.platform} onResize={(w) => handleResize('platform', w)}>
                  Platform
                </ResizableColumn>
              </TableHead>
              <TableHead>
                <ResizableColumn width={columnWidths.sku} onResize={(w) => handleResize('sku', w)}>
                  SKU
                </ResizableColumn>
              </TableHead>
              <TableHead>
                <ResizableColumn width={columnWidths.title} onResize={(w) => handleResize('title', w)}>
                  Title
                </ResizableColumn>
              </TableHead>
              <TableHead className="text-right">
                <ResizableColumn width={columnWidths.quantity} onResize={(w) => handleResize('quantity', w)}>
                  Qty
                </ResizableColumn>
              </TableHead>
              <TableHead className="text-right">
                <ResizableColumn width={columnWidths.salePrice} onResize={(w) => handleResize('salePrice', w)}>
                  Sale Price
                </ResizableColumn>
              </TableHead>
              <TableHead className="text-right">
                <ResizableColumn width={columnWidths.productCost} onResize={(w) => handleResize('productCost', w)}>
                  Product Cost
                </ResizableColumn>
              </TableHead>
              <TableHead className="text-right">
                <ResizableColumn width={columnWidths.platformFees} onResize={(w) => handleResize('platformFees', w)}>
                  Platform Fees
                </ResizableColumn>
              </TableHead>
              <TableHead className="text-right">
                <ResizableColumn width={columnWidths.shipping} onResize={(w) => handleResize('shipping', w)}>
                  Shipping
                </ResizableColumn>
              </TableHead>
              <TableHead className="text-right">
                <ResizableColumn width={columnWidths.vat} onResize={(w) => handleResize('vat', w)}>
                  VAT
                </ResizableColumn>
              </TableHead>
              <TableHead className="text-right">
                <ResizableColumn width={columnWidths.totalCosts} onResize={(w) => handleResize('totalCosts', w)}>
                  Total Costs
                </ResizableColumn>
              </TableHead>
              <TableHead className="text-right">
                <ResizableColumn width={columnWidths.profit} onResize={(w) => handleResize('profit', w)}>
                  Profit
                </ResizableColumn>
              </TableHead>
              <TableHead className="text-right">
                <ResizableColumn width={columnWidths.margin} onResize={(w) => handleResize('margin', w)}>
                  Margin
                </ResizableColumn>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell style={{ width: columnWidths.date }}>
                  {format(new Date(sale.sale_date), 'dd MMM yyyy')}
                </TableCell>
                <TableCell style={{ width: columnWidths.platform }}>{sale.platform}</TableCell>
                <TableCell style={{ width: columnWidths.sku }}>{sale.sku}</TableCell>
                <TableCell style={{ width: columnWidths.title }}>{sale.listing_title}</TableCell>
                <TableCell className="text-right" style={{ width: columnWidths.quantity }}>
                  {sale.quantity}
                </TableCell>
                <TableCell className="text-right" style={{ width: columnWidths.salePrice }}>
                  {formatCurrency(sale.total_price)}
                </TableCell>
                <TableCell className="text-right" style={{ width: columnWidths.productCost }}>
                  {formatCurrency(sale.total_product_cost)}
                </TableCell>
                <TableCell className="text-right" style={{ width: columnWidths.platformFees }}>
                  {formatCurrency(sale.platform_fees)}
                </TableCell>
                <TableCell className="text-right" style={{ width: columnWidths.shipping }}>
                  {formatCurrency(sale.shipping_cost)}
                </TableCell>
                <TableCell className="text-right" style={{ width: columnWidths.vat }}>
                  {formatCurrency(sale.vat_cost)}
                </TableCell>
                <TableCell className="text-right cursor-pointer" style={{ width: columnWidths.totalCosts }}>
                  <Tooltip>
                    <TooltipTrigger>
                      {formatCurrency(sale.total_costs)}
                    </TooltipTrigger>
                    <TooltipContent>
                      <pre className="whitespace-pre-line">
                        {getCalculationTooltip(sale, 'total_costs')}
                      </pre>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell 
                  className={`text-right font-medium rounded-sm cursor-pointer ${getProfitColor(sale.profit)}`}
                  style={{ width: columnWidths.profit }}
                >
                  <Tooltip>
                    <TooltipTrigger>
                      {formatCurrency(sale.profit)}
                    </TooltipTrigger>
                    <TooltipContent>
                      <pre className="whitespace-pre-line">
                        {getCalculationTooltip(sale, 'profit')}
                      </pre>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell 
                  className={`text-right rounded-sm cursor-pointer ${getMarginColor(sale.profit_margin)}`}
                  style={{ width: columnWidths.margin }}
                >
                  <Tooltip>
                    <TooltipTrigger>
                      {formatPercentage(sale.profit_margin)}
                    </TooltipTrigger>
                    <TooltipContent>
                      <pre className="whitespace-pre-line">
                        {getCalculationTooltip(sale, 'profit_margin')}
                      </pre>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};
