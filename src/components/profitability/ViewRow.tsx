import { TableCell } from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { ProfitabilityData } from "./types";
import { formatCurrency, formatPercentage, getCalculationTooltip, getMarginColor, getProfitColor } from "./utils";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStockLevels } from "@/lib/supabase/database";
import { CalculationDialog } from "./components/CalculationDialog";
import { ProductDialog } from "./components/ProductDialog";
import { getPlatformColor } from "./utils/styles";

interface ViewRowProps {
  sale: ProfitabilityData;
  columnWidths: { [key: string]: number };
  onEdit: () => void;
}

export const ViewRow = ({ sale, columnWidths, onEdit }: ViewRowProps) => {
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getStockLevels
  });

  const currentProduct = products.find(p => p.sku === sale.sku);

  const historicalIndicator = "text-xs text-muted-foreground ml-1 italic";

  console.log('Current product:', currentProduct);

  return (
    <>
      <TableCell className="p-4 whitespace-nowrap" style={{ width: columnWidths.date }}>
        {format(new Date(sale.sale_date), 'dd MMM yyyy')}
      </TableCell>
      <TableCell 
        className={`p-4 whitespace-nowrap ${getPlatformColor(sale.platform, sale.promoted)}`}
        style={{ width: columnWidths.platform }}
      >
        {sale.platform}
      </TableCell>
      <TableCell 
        className="p-4 whitespace-nowrap cursor-pointer hover:text-blue-600"
        style={{ width: columnWidths.sku }}
        onClick={() => setIsProductDialogOpen(true)}
      >
        {sale.sku}
      </TableCell>
      <TableCell className="p-4" style={{ width: columnWidths.title }}>
        {sale.listing_title}
      </TableCell>
      <TableCell className="p-4 text-right whitespace-nowrap" style={{ width: columnWidths.quantity }}>
        {sale.quantity}
      </TableCell>
      <TableCell className="p-4 text-right whitespace-nowrap" style={{ width: columnWidths.salePrice }}>
        <CalculationDialog 
          title="Sale Price"
          value={formatCurrency(sale.total_price)}
          tooltipContent={`Sale Price: ${formatCurrency(sale.total_price)}`}
        />
      </TableCell>
      <TableCell className="p-4 text-right whitespace-nowrap" style={{ width: columnWidths.productCost }}>
        <div className="flex items-center justify-end">
          <CalculationDialog 
            title="Product Cost"
            value={formatCurrency(sale.total_product_cost)}
            tooltipContent={getCalculationTooltip(sale, 'product_cost', formatCurrency, formatPercentage)}
          />
          <span className={historicalIndicator}>(hist)</span>
        </div>
      </TableCell>
      <TableCell className="p-4 text-right whitespace-nowrap" style={{ width: columnWidths.platformFees }}>
        <div className="flex items-center justify-end">
          <CalculationDialog 
            title="Platform Fees"
            value={formatCurrency(sale.platform_fees)}
            tooltipContent={getCalculationTooltip(sale, 'platform_fees', formatCurrency, formatPercentage)}
          />
          <span className={historicalIndicator}>(hist)</span>
        </div>
      </TableCell>
      <TableCell className="p-4 text-right whitespace-nowrap" style={{ width: columnWidths.shipping }}>
        <div className="flex items-center justify-end">
          <CalculationDialog 
            title="Shipping Costs"
            value={formatCurrency(sale.shipping_cost)}
            tooltipContent={getCalculationTooltip(sale, 'shipping', formatCurrency, formatPercentage)}
          />
          <span className={historicalIndicator}>(hist)</span>
        </div>
      </TableCell>
      <TableCell className="p-4 text-right whitespace-nowrap" style={{ width: columnWidths.vat }}>
        <CalculationDialog 
          title="VAT"
          value={formatCurrency(sale.vat_cost)}
          tooltipContent={getCalculationTooltip(sale, 'vat', formatCurrency, formatPercentage)}
        />
      </TableCell>
      <TableCell className="p-4 text-right whitespace-nowrap" style={{ width: columnWidths.advertising }}>
        <CalculationDialog 
          title="Advertising"
          value={formatCurrency(sale.advertising_cost)}
          tooltipContent={getCalculationTooltip(sale, 'advertising', formatCurrency, formatPercentage)}
        />
      </TableCell>
      <TableCell className="p-4 text-right whitespace-nowrap" style={{ width: columnWidths.totalCosts }}>
        <CalculationDialog 
          title="Total Costs"
          value={formatCurrency(sale.total_costs)}
          tooltipContent={getCalculationTooltip(sale, 'total_costs', formatCurrency, formatPercentage)}
        />
      </TableCell>
      <TableCell className="p-4 text-right whitespace-nowrap" style={{ width: columnWidths.profit }}>
        <CalculationDialog 
          title="Profit"
          value={formatCurrency(sale.profit)}
          tooltipContent={getCalculationTooltip(sale, 'profit', formatCurrency, formatPercentage)}
          className={getProfitColor(sale.profit)}
        />
      </TableCell>
      <TableCell className="p-4 text-right whitespace-nowrap" style={{ width: columnWidths.margin }}>
        <CalculationDialog 
          title="Profit Margin"
          value={formatPercentage(sale.profit_margin)}
          tooltipContent={getCalculationTooltip(sale, 'profit_margin', formatCurrency, formatPercentage)}
          className={getMarginColor(sale.profit_margin)}
        />
      </TableCell>
      <TableCell className="p-4 whitespace-nowrap" style={{ width: 100 }}>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </TableCell>

      <ProductDialog
        isOpen={isProductDialogOpen}
        onOpenChange={setIsProductDialogOpen}
        currentProduct={currentProduct}
      />
    </>
  );
};
