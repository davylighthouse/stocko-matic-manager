
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ProfitabilityData } from "./types";
import { formatCurrency, formatPercentage, getCalculationTooltip, getMarginColor, getProfitColor } from "./utils";
import { useState } from "react";
import { ProductEditDialog } from "@/components/stock/ProductEditDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getStockLevels, updateProductDetails } from "@/lib/supabase/database";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types/database";

interface ViewRowProps {
  sale: ProfitabilityData;
  columnWidths: { [key: string]: number };
  onEdit: (sale: ProfitabilityData) => void;
}

export const ViewRow = ({ sale, columnWidths, onEdit }: ViewRowProps) => {
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [updatedFields, setUpdatedFields] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getPlatformColor = (platform: string, promoted: boolean) => {
    if (platform.toLowerCase() !== 'ebay') return '';
    return promoted ? 'text-red-600 font-medium' : 'text-green-600 font-medium';
  };

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getStockLevels
  });

  const currentProduct = products.find(p => p.sku === sale.sku);

  const handleProductUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentProduct) return;

    const formData = new FormData(event.currentTarget);
    const updates: Partial<Product> = {};
    const updatedFieldNames: string[] = [];

    formData.forEach((value, key) => {
      if (value !== '' && value !== null) {
        (updates as any)[key] = value;
        updatedFieldNames.push(key);
      }
    });

    try {
      await updateProductDetails(currentProduct.sku, updates);
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsProductDialogOpen(false);
      toast({
        title: "Success",
        description: "Product details updated successfully",
      });
      setUpdatedFields([]);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update product details",
        variant: "destructive",
      });
      setUpdatedFields([]);
    }
  };

  const handleStockUpdate = async (sku: string, quantity: number) => {
    // This function is required by the ProductEditDialog but won't be used in this context
    // since we're not allowing stock updates from the profitability view
  };

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

      <ProductEditDialog
        product={currentProduct}
        open={isProductDialogOpen}
        onOpenChange={setIsProductDialogOpen}
        onSubmit={handleProductUpdate}
        onStockUpdate={handleStockUpdate}
        updatedFields={updatedFields}
      />
    </>
  );
};
