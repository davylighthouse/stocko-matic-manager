
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Pencil, Calculator } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  };

  const CalculationDialog = ({ title, value, tooltipContent, className = "" }: { title: string, value: React.ReactNode, tooltipContent: string, className?: string }) => (
    <Dialog>
      <DialogTrigger asChild>
        <div className={`group inline-flex items-center gap-1 cursor-pointer ${className}`}>
          {value}
          <Calculator className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 text-slate-50">
        <DialogHeader>
          <DialogTitle className="text-slate-200">{title}</DialogTitle>
          <DialogDescription>
            <pre className="text-sm whitespace-pre-wrap font-mono bg-slate-800 p-4 rounded mt-4 text-slate-100">
              {tooltipContent}
            </pre>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );

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
          title="Advertising Cost"
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
