
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ProfitabilityData } from "./types";
import { formatCurrency, formatPercentage, getCalculationTooltip, getMarginColor, getProfitColor } from "./utils";

interface ViewRowProps {
  sale: ProfitabilityData;
  columnWidths: { [key: string]: number };
  onEdit: (sale: ProfitabilityData) => void;
}

export const ViewRow = ({ sale, columnWidths, onEdit }: ViewRowProps) => {
  return (
    <>
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
      <TableCell className="text-right cursor-pointer" style={{ width: columnWidths.productCost }}>
        <Tooltip>
          <TooltipTrigger>
            {formatCurrency(sale.total_product_cost)}
          </TooltipTrigger>
          <TooltipContent>
            <pre>Product Cost per Unit × Quantity = {formatCurrency(sale.total_product_cost)}</pre>
          </TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell className="text-right cursor-pointer" style={{ width: columnWidths.platformFees }}>
        <Tooltip>
          <TooltipTrigger>
            {formatCurrency(sale.platform_fees)}
          </TooltipTrigger>
          <TooltipContent>
            <pre>Platform Fee: {formatCurrency(sale.platform_fees)}</pre>
          </TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell className="text-right" style={{ width: columnWidths.shipping }}>
        {formatCurrency(sale.shipping_cost)}
      </TableCell>
      <TableCell className="text-right cursor-pointer" style={{ width: columnWidths.vat }}>
        <Tooltip>
          <TooltipTrigger>
            {formatCurrency(sale.vat_cost)}
          </TooltipTrigger>
          <TooltipContent>
            <pre>VAT (20%): {formatCurrency(sale.vat_cost)}</pre>
          </TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell className="text-right cursor-pointer" style={{ width: columnWidths.totalCosts }}>
        <Tooltip>
          <TooltipTrigger>
            {formatCurrency(sale.total_costs)}
          </TooltipTrigger>
          <TooltipContent>
            <pre className="whitespace-pre-line">
              {getCalculationTooltip(sale, 'total_costs', formatCurrency, formatPercentage)}
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
              {getCalculationTooltip(sale, 'profit', formatCurrency, formatPercentage)}
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
              {getCalculationTooltip(sale, 'profit_margin', formatCurrency, formatPercentage)}
            </pre>
          </TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell style={{ width: 100 }}>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onEdit(sale)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </TableCell>
    </>
  );
};
