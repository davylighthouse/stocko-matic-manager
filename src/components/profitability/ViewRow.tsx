
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

  return (
    <>
      <TableCell style={{ width: columnWidths.date }}>
        {format(new Date(sale.sale_date), 'dd MMM yyyy')}
      </TableCell>
      <TableCell 
        style={{ width: columnWidths.platform }}
        className={getPlatformColor(sale.platform, sale.promoted)}
      >
        {sale.platform}
      </TableCell>
      <TableCell 
        style={{ width: columnWidths.sku }}
        className="cursor-pointer hover:text-blue-600"
        onClick={() => setIsProductDialogOpen(true)}
      >
        {sale.sku}
      </TableCell>
      <TableCell style={{ width: columnWidths.title }}>{sale.listing_title}</TableCell>
      <TableCell className="text-right" style={{ width: columnWidths.quantity }}>
        {sale.quantity}
      </TableCell>
      <TableCell className="text-right" style={{ width: columnWidths.salePrice }}>
        <CalculationDialog 
          title="Sale Price"
          value={formatCurrency(sale.total_price)}
          tooltipContent={`Sale Price: ${formatCurrency(sale.total_price)}`}
        />
      </TableCell>
      <TableCell className="text-right" style={{ width: columnWidths.productCost }}>
        <CalculationDialog 
          title="Product Cost"
          value={formatCurrency(sale.total_product_cost)}
          tooltipContent={`Product Cost per Unit (${formatCurrency(sale.product_cost)}) × Quantity (${sale.quantity}) = ${formatCurrency(sale.total_product_cost)}`}
        />
      </TableCell>
      <TableCell className="text-right" style={{ width: columnWidths.platformFees }}>
        <CalculationDialog 
          title="Platform Fees"
          value={formatCurrency(sale.platform_fees)}
          tooltipContent={getCalculationTooltip(sale, 'platform_fees', formatCurrency, formatPercentage)}
        />
      </TableCell>
      <TableCell className="text-right" style={{ width: columnWidths.shipping }}>
        <CalculationDialog 
          title="Shipping Costs"
          value={formatCurrency(sale.shipping_cost)}
          tooltipContent={getCalculationTooltip(sale, 'shipping', formatCurrency, formatPercentage)}
        />
      </TableCell>
      <TableCell className="text-right" style={{ width: columnWidths.vat }}>
        <CalculationDialog 
          title="VAT"
          value={formatCurrency(sale.vat_cost)}
          tooltipContent={getCalculationTooltip(sale, 'vat', formatCurrency, formatPercentage)}
        />
      </TableCell>
      <TableCell className="text-right" style={{ width: columnWidths.advertising }}>
        <CalculationDialog 
          title="Advertising"
          value={formatCurrency(sale.advertising_cost)}
          tooltipContent={getCalculationTooltip(sale, 'advertising', formatCurrency, formatPercentage)}
        />
      </TableCell>
      <TableCell className="text-right" style={{ width: columnWidths.totalCosts }}>
        <CalculationDialog 
          title="Total Costs"
          value={formatCurrency(sale.total_costs)}
          tooltipContent={getCalculationTooltip(sale, 'total_costs', formatCurrency, formatPercentage)}
        />
      </TableCell>
      <TableCell className="text-right" style={{ width: columnWidths.profit }}>
        <CalculationDialog 
          title="Profit"
          value={formatCurrency(sale.profit)}
          tooltipContent={getCalculationTooltip(sale, 'profit', formatCurrency, formatPercentage)}
          className={getProfitColor(sale.profit)}
        />
      </TableCell>
      <TableCell className="text-right" style={{ width: columnWidths.margin }}>
        <CalculationDialog 
          title="Profit Margin"
          value={formatPercentage(sale.profit_margin)}
          tooltipContent={getCalculationTooltip(sale, 'profit_margin', formatCurrency, formatPercentage)}
          className={getMarginColor(sale.profit_margin)}
        />
      </TableCell>
      <TableCell style={{ width: 100 }}>
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
