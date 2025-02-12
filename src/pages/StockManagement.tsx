
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStockLevels, updateStockLevel, updateProductDetails } from "@/lib/supabase/database";
import { Product } from "@/types/database";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

const StockManagement = () => {
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getStockLevels
  });

  console.log('Products data:', products);

  const updateStockMutation = useMutation({
    mutationFn: ({ sku, quantity }: { sku: string; quantity: number }) =>
      updateStockLevel(sku, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Success",
        description: "Stock level updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update stock level",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ sku, data }: { sku: string; data: any }) =>
      updateProductDetails(sku, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSelectedProduct(null);
      toast({
        title: "Success",
        description: "Product details updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update product details",
        variant: "destructive",
      });
    },
  });

  const filteredProducts = products.filter(
    (product: Product) =>
      product.sku.toLowerCase().includes(search.toLowerCase()) ||
      product.listing_title.toLowerCase().includes(search.toLowerCase())
  );

  const handleStockUpdate = async (sku: string, quantity: number) => {
    updateStockMutation.mutate({ sku, quantity });
  };

  const handleProductUpdate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProduct) return;

    const formData = new FormData(event.currentTarget);
    const data = {
      listing_title: formData.get('listing_title') as string,
      product_cost: formData.get('product_cost') ? parseFloat(formData.get('product_cost') as string) : null,
      warehouse_location: formData.get('warehouse_location') as string || null,
      supplier: formData.get('supplier') as string || null,
    };

    updateProductMutation.mutate({ sku: selectedProduct.sku, data });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Stock Management
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your inventory and product details
          </p>
        </div>
        <Button className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card className="bg-white overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by SKU or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Check</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product: Product) => (
                <tr 
                  key={product.sku}
                  onClick={() => setSelectedProduct(product)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.listing_title}
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
                    <Dialog 
                      open={selectedProduct?.sku === product.sku} 
                      onOpenChange={(open) => {
                        if (!open) setSelectedProduct(null);
                      }}
                    >
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Product Details</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleProductUpdate} className="space-y-4">
                          <div>
                            <Label htmlFor="listing_title">Title</Label>
                            <Input
                              id="listing_title"
                              name="listing_title"
                              defaultValue={selectedProduct?.listing_title}
                            />
                          </div>
                          <div>
                            <Label htmlFor="stock_quantity">Current Stock</Label>
                            <Input
                              id="stock_quantity"
                              name="stock_quantity"
                              type="number"
                              defaultValue={selectedProduct?.stock_quantity}
                              onChange={(e) => {
                                const quantity = parseInt(e.target.value);
                                if (!isNaN(quantity)) {
                                  handleStockUpdate(product.sku, quantity);
                                }
                              }}
                            />
                          </div>
                          <div>
                            <Label htmlFor="product_cost">Product Cost</Label>
                            <Input
                              id="product_cost"
                              name="product_cost"
                              type="number"
                              step="0.01"
                              defaultValue={selectedProduct?.product_cost}
                            />
                          </div>
                          <div>
                            <Label htmlFor="warehouse_location">Warehouse Location</Label>
                            <Input
                              id="warehouse_location"
                              name="warehouse_location"
                              defaultValue={selectedProduct?.warehouse_location}
                            />
                          </div>
                          <div>
                            <Label htmlFor="supplier">Supplier</Label>
                            <Input
                              id="supplier"
                              name="supplier"
                              defaultValue={selectedProduct?.supplier}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setSelectedProduct(null)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit">
                              Save Changes
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click when clicking the button
                        const newQuantity = prompt("Enter new stock quantity:", String(product.stock_quantity ?? 0));
                        if (newQuantity !== null) {
                          const quantity = parseInt(newQuantity);
                          if (!isNaN(quantity)) {
                            handleStockUpdate(product.sku, quantity);
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
        </div>
      </Card>
    </div>
  );
};

export default StockManagement;
