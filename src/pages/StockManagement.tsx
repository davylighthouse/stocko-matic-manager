
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
    mutationFn: ({ sku, data }: { sku: string; data: Partial<Product> }) =>
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
    const updates: Partial<Product> = {};

    // Only include fields that have been filled in
    if (formData.get('listing_title')) updates.listing_title = formData.get('listing_title') as string;
    if (formData.get('product_cost')) updates.product_cost = parseFloat(formData.get('product_cost') as string);
    if (formData.get('warehouse_location')) updates.warehouse_location = formData.get('warehouse_location') as string;
    if (formData.get('supplier')) updates.supplier = formData.get('supplier') as string;
    if (formData.get('stock_quantity')) updates.stock_quantity = parseInt(formData.get('stock_quantity') as string);
    if (formData.get('low_stock_threshold')) updates.low_stock_threshold = parseInt(formData.get('low_stock_threshold') as string);
    if (formData.get('product_status')) updates.product_status = formData.get('product_status') as string;
    if (formData.get('default_shipping_service')) updates.default_shipping_service = formData.get('default_shipping_service') as string;
    if (formData.get('vat_status')) updates.vat_status = formData.get('vat_status') as string;
    if (formData.get('dimensions_height')) updates.dimensions_height = parseFloat(formData.get('dimensions_height') as string);
    if (formData.get('dimensions_width')) updates.dimensions_width = parseFloat(formData.get('dimensions_width') as string);
    if (formData.get('dimensions_length')) updates.dimensions_length = parseFloat(formData.get('dimensions_length') as string);
    if (formData.get('weight')) updates.weight = parseFloat(formData.get('weight') as string);
    if (formData.get('packaging_cost')) updates.packaging_cost = parseFloat(formData.get('packaging_cost') as string);
    if (formData.get('making_up_cost')) updates.making_up_cost = parseFloat(formData.get('making_up_cost') as string);
    if (formData.get('additional_costs')) updates.additional_costs = parseFloat(formData.get('additional_costs') as string);

    // Only proceed with update if there are actual changes
    if (Object.keys(updates).length > 0) {
      updateProductMutation.mutate({ sku: selectedProduct.sku, data: updates });
    } else {
      toast({
        title: "No changes",
        description: "No fields were modified",
      });
    }
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
