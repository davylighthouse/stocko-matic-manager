
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStockLevels, updateStockLevel } from "@/lib/supabase/database";
import { Product } from "@/types/database";
import { useToast } from "@/components/ui/use-toast";

const StockManagement = () => {
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getStockLevels
  });

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

  const filteredProducts = products.filter(
    (product: Product) =>
      product.sku.toLowerCase().includes(search.toLowerCase()) ||
      product.listing_title.toLowerCase().includes(search.toLowerCase())
  );

  const handleStockUpdate = async (sku: string, quantity: number) => {
    updateStockMutation.mutate({ sku, quantity });
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product: Product) => (
                <tr key={product.sku}>
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
                        product.stock_quantity > 50
                          ? "bg-green-100 text-green-800"
                          : product.stock_quantity > 20
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      )}
                    >
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    £{product.product_cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newQuantity = prompt("Enter new stock quantity:", String(product.stock_quantity));
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
