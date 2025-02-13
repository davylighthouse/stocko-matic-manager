import { Button } from "@/components/ui/button";
import { Product } from "@/types/database";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ProductEditDialog } from "./ProductEditDialog";
import { Circle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ProductsTableProps {
  products: Product[];
  selectedProduct: Product | null;
  onProductSelect: (product: Product) => void;
  onStockUpdate: (sku: string, quantity: number) => void;
  onProductUpdate: (event: React.FormEvent<HTMLFormElement>) => void;
  updatedFields?: string[];
}

const calculateCompleteness = (product: Product): { percentage: number; missingFields: string[] } => {
  const requiredFields = [
    { name: 'listing_title', label: 'Title', defaultValue: product.sku },
    { name: 'product_cost', label: 'Product Cost', defaultValue: null },
    { name: 'supplier', label: 'Supplier', defaultValue: null },
    { name: 'warehouse_location', label: 'Warehouse Location', defaultValue: null },
    { name: 'product_status', label: 'Product Status', defaultValue: null },
    { name: 'default_shipping_service', label: 'Shipping Service', defaultValue: null },
    { name: 'vat_status', label: 'VAT Status', defaultValue: null },
    { name: 'dimensions_height', label: 'Height', defaultValue: null },
    { name: 'dimensions_width', label: 'Width', defaultValue: null },
    { name: 'dimensions_length', label: 'Length', defaultValue: null },
    { name: 'weight', label: 'Weight', defaultValue: null },
    { name: 'packaging_cost', label: 'Packaging Cost', defaultValue: null },
    { name: 'making_up_cost', label: 'Making Up Cost', defaultValue: null }
  ];

  const missingFields = requiredFields.filter(field => {
    const value = product[field.name as keyof Product];
    return value !== field.defaultValue && (value === null || value === undefined || value === '');
  });

  const percentage = ((requiredFields.length - missingFields.length) / requiredFields.length) * 100;

  return {
    percentage,
    missingFields: missingFields.map(f => f.label)
  };
};

export const ProductsTable = ({
  products,
  selectedProduct,
  onProductSelect,
  onStockUpdate,
  onProductUpdate,
  updatedFields = [],
}: ProductsTableProps) => {
  const [showStatus, setShowStatus] = useState(true);

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="status-toggle"
              checked={showStatus}
              onCheckedChange={setShowStatus}
              className="data-[state=checked]:bg-[#9b87f5] data-[state=unchecked]:bg-gray-200"
            />
            <Label htmlFor="status-toggle" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Show Status
            </Label>
          </div>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            {showStatus && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Level</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Check</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sold</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product: Product) => {
            const completeness = calculateCompleteness(product);
            const completenessColor = 
              completeness.percentage === 100 ? "text-green-500" :
              completeness.percentage >= 70 ? "text-yellow-500" :
              "text-red-500";

            const stockLevel = product.stock_quantity;
            const threshold = product.low_stock_threshold ?? 20;
            
            return (
              <tr
                key={product.sku}
                onClick={() => onProductSelect(product)}
                className="cursor-pointer hover:bg-gray-50"
              >
                {showStatus && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center">
                            <Circle className={cn("h-4 w-4 fill-current", completenessColor)} />
                            <span className="ml-2 text-sm text-gray-500">
                              {completeness.percentage.toFixed(0)}%
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {completeness.missingFields.length > 0
                            ? `Missing information: ${completeness.missingFields.join(', ')}`
                            : 'All information complete'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {product.sku}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div 
                    className={cn(
                      "px-3 py-1 rounded-full inline-flex items-center",
                      stockLevel <= threshold 
                        ? "bg-red-100 text-red-800" 
                        : "bg-green-100 text-green-800"
                    )}
                  >
                    <span className="text-sm font-medium">{stockLevel}</span>
                    {stockLevel <= threshold && (
                      <span className="ml-1 text-xs">Low Stock</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.listing_title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.latest_stock_check_quantities?.[0]?.last_check_quantity ?? 'No check'}
                  {product.latest_stock_check_quantities?.[0]?.check_date && (
                    <span className="text-xs text-gray-400 block">
                      {format(new Date(product.latest_stock_check_quantities[0].check_date), 'dd/MM/yyyy')}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.total_sales_quantities?.[0]?.total_sold ?? 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.product_cost !== null 
                    ? `£${product.product_cost.toFixed(2)}`
                    : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.warehouse_location || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newQuantity = prompt("Enter new stock quantity:", String(stockLevel));
                      if (newQuantity !== null) {
                        const quantity = parseInt(newQuantity);
                        if (!isNaN(quantity)) {
                          onStockUpdate(product.sku, quantity);
                        }
                      }
                    }}
                  >
                    Update Stock
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <ProductEditDialog
        product={selectedProduct}
        open={selectedProduct !== null}
        onOpenChange={(open) => !open && onProductSelect(null)}
        onStockUpdate={onStockUpdate}
        onSubmit={onProductUpdate}
        updatedFields={updatedFields}
      />
    </div>
  );
};
