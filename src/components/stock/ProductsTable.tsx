
import { Button } from "@/components/ui/button";
import { Product } from "@/types/database";
import { format } from "date-fns";
import { ProductEditDialog } from "./ProductEditDialog";
import { useState } from "react";
import { calculateCompleteness } from "./utils/calculateCompleteness";
import { ProductsTableHeader } from "./ProductsTableHeader";
import { ProductStatusIndicator } from "./ProductStatusIndicator";
import { StockLevelIndicator } from "./StockLevelIndicator";
import { Package } from "lucide-react";

interface ProductsTableProps {
  products: Product[];
  selectedProduct: Product | null;
  onProductSelect: (product: Product) => void;
  onStockUpdate: (sku: string, quantity: number) => void;
  onProductUpdate: (event: React.FormEvent<HTMLFormElement>) => void;
  updatedFields?: string[];
}

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
      <ProductsTableHeader 
        showStatus={showStatus}
        onShowStatusChange={setShowStatus}
      />

      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Level</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Check</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sold</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            {showStatus && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product: Product) => {
            const completeness = calculateCompleteness(product);
            const stockLevel = product.stock_quantity;
            const threshold = product.low_stock_threshold ?? 20;
            
            return (
              <tr
                key={product.sku}
                onClick={() => onProductSelect(product)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">
                  {product.sku}
                  {product.bundle_products && (
                    <Package className="h-4 w-4 text-blue-500" />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StockLevelIndicator 
                    stockLevel={stockLevel}
                    threshold={threshold}
                  />
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                {showStatus && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ProductStatusIndicator 
                      percentage={completeness.percentage}
                      missingFields={completeness.missingFields}
                    />
                  </td>
                )}
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
