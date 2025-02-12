
import { Button } from "@/components/ui/button";
import { Product } from "@/types/database";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ProductEditDialog } from "./ProductEditDialog";

interface ProductsTableProps {
  products: Product[];
  selectedProduct: Product | null;
  onProductSelect: (product: Product) => void;
  onStockUpdate: (sku: string, quantity: number) => void;
  onProductUpdate: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const ProductsTable = ({
  products,
  selectedProduct,
  onProductSelect,
  onStockUpdate,
  onProductUpdate,
}: ProductsTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Check</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sold</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product: Product) => (
            <tr
              key={product.sku}
              onClick={() => onProductSelect(product)}
              className="cursor-pointer hover:bg-gray-50"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {product.sku}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    (product.stock_quantity ?? 0) > 50
                      ? "bg-green-100 text-green-800"
                      : (product.stock_quantity ?? 0) > 20
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  )}
                >
                  {product.stock_quantity ?? 0}
                </span>
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
                    const newQuantity = prompt("Enter new stock quantity:", String(product.stock_quantity ?? 0));
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
          ))}
        </tbody>
      </table>
      <ProductEditDialog
        product={selectedProduct}
        open={selectedProduct !== null}
        onOpenChange={(open) => !open && onProductSelect(null)}
        onStockUpdate={onStockUpdate}
        onSubmit={onProductUpdate}
      />
    </div>
  );
};
