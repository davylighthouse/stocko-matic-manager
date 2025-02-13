
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
  const [updatedFields, setUpdatedFields] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getStockLevels
  });

  // Filter products based on search
  const filteredProducts = products.filter((product) =>
    product.sku.toLowerCase().includes(search.toLowerCase()) ||
    product.listing_title.toLowerCase().includes(search.toLowerCase())
  );

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

  const handleStockUpdate = (sku: string, quantity: number) => {
    updateStockMutation.mutate({ sku, quantity });
  };

  const updateProductMutation = useMutation({
    mutationFn: ({ sku, data }: { sku: string; data: Partial<Product> }) => {
      console.log('Form data before processing:', data);
      
      // Process form data
      const processedData: Partial<Product> = {};
      
      // Process text fields
      if (data.listing_title) processedData.listing_title = data.listing_title;
      if (data.supplier) processedData.supplier = data.supplier;
      if (data.warehouse_location) processedData.warehouse_location = data.warehouse_location;
      if (data.product_status) processedData.product_status = data.product_status;
      if (data.vat_status) processedData.vat_status = data.vat_status;

      // Process numeric fields
      if (data.product_cost) processedData.product_cost = parseFloat(data.product_cost.toString());
      if (data.dimensions_height) processedData.dimensions_height = parseFloat(data.dimensions_height.toString());
      if (data.dimensions_width) processedData.dimensions_width = parseFloat(data.dimensions_width.toString());
      if (data.dimensions_length) processedData.dimensions_length = parseFloat(data.dimensions_length.toString());
      if (data.weight) processedData.weight = parseFloat(data.weight.toString());
      if (data.packaging_cost) processedData.packaging_cost = parseFloat(data.packaging_cost.toString());
      if (data.making_up_cost) processedData.making_up_cost = parseFloat(data.making_up_cost.toString());
      if (data.additional_costs) processedData.additional_costs = parseFloat(data.additional_costs.toString());
      if (data.low_stock_threshold) processedData.low_stock_threshold = parseInt(data.low_stock_threshold.toString());
      
      // Special handling for FBA tier and promoted listing
      const fbaValue = data.amazon_fba_tier_id;
      if (fbaValue !== undefined) {
        processedData.amazon_fba_tier_id = fbaValue === null || String(fbaValue) === 'none' ? 
          null : 
          parseInt(String(fbaValue));
      }
      
      if (data.promoted_listing_percentage !== undefined) {
        processedData.promoted_listing_percentage = parseFloat(data.promoted_listing_percentage.toString());
      }

      // Service IDs
      if (data.default_shipping_service_id) {
        processedData.default_shipping_service_id = parseInt(data.default_shipping_service_id.toString());
      }
      if (data.default_picking_fee_id) {
        processedData.default_picking_fee_id = parseInt(data.default_picking_fee_id.toString());
      }

      console.log('Processed data before sending to API:', processedData);
      return updateProductDetails(sku, processedData);
    },
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
      setUpdatedFields([]); // Clear updated fields on error
    },
  });

  const handleProductUpdate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProduct) return;

    const formData = new FormData(event.currentTarget);
    const updates: Partial<Product> = {};
    const updatedFieldNames: string[] = [];

    // Collect all form fields
    formData.forEach((value, key) => {
      if (value !== '' && value !== null) {
        (updates as any)[key] = value;
        updatedFieldNames.push(key);
      }
    });

    console.log('Form updates:', updates);

    if (Object.keys(updates).length > 0) {
      setUpdatedFields(updatedFieldNames);
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
          updatedFields={updatedFields}
        />
      </Card>
    </div>
  );
};

export default StockManagement;
