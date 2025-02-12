
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { getStockLevels, updateStockLevel, updateProductDetails } from "@/lib/supabase/database";
import { Product } from "@/types/database";
import { useToast } from "@/components/ui/use-toast";
import { ProductsTable } from "@/components/stock/ProductsTable";

const StockManagement = () => {
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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

        <ProductsTable
          products={filteredProducts}
          selectedProduct={selectedProduct}
          onProductSelect={setSelectedProduct}
          onStockUpdate={handleStockUpdate}
          onProductUpdate={handleProductUpdate}
        />
      </Card>
    </div>
  );
};

export default StockManagement;
