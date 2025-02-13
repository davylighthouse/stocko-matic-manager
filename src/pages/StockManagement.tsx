
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
    mutationFn: ({ sku, data }: { sku: string; data: Partial<Product> }) => {
      // Create a new object with only the valid properties from Product type
      const updatedData: Partial<Product> = {
        ...data,
        amazon_fba_tier_id: data.amazon_fba_tier_id ? 
          parseInt(data.amazon_fba_tier_id.toString()) : null,
        promoted_listing_percentage: data.promoted_listing_percentage ? 
          parseFloat(data.promoted_listing_percentage.toString()) : null
      };
      return updateProductDetails(sku, updatedData);
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
    const updatedFieldNames: string[] = [];

    // Helper function to process form fields
    const processField = <T extends keyof Product>(
      fieldName: T, 
      transform?: (value: string) => Product[T]
    ) => {
      const value = formData.get(fieldName);
      if (value !== null && value !== '') {
        updates[fieldName] = transform ? transform(value as string) : value as Product[T];
        updatedFieldNames.push(fieldName);
      }
    };

    // Process each field with appropriate type conversion
    processField('listing_title');
    processField('product_cost', value => parseFloat(value));
    processField('warehouse_location');
    processField('supplier');
    processField('stock_quantity', value => parseInt(value));
    processField('low_stock_threshold', value => parseInt(value));
    processField('product_status');
    processField('default_shipping_service');
    processField('vat_status');
    processField('dimensions_height', value => parseFloat(value));
    processField('dimensions_width', value => parseFloat(value));
    processField('dimensions_length', value => parseFloat(value));
    processField('weight', value => parseFloat(value));
    processField('packaging_cost', value => parseFloat(value));
    processField('making_up_cost', value => parseFloat(value));
    processField('additional_costs', value => parseFloat(value));

    // Special handling for shipping service and picking fee IDs
    const shippingServiceId = formData.get('default_shipping_service_id');
    if (shippingServiceId) {
      updates.default_shipping_service_id = parseInt(shippingServiceId as string);
      updatedFieldNames.push('default_shipping_service_id');
    }

    const pickingFeeId = formData.get('default_picking_fee_id');
    if (pickingFeeId) {
      updates.default_picking_fee_id = parseInt(pickingFeeId as string);
      updatedFieldNames.push('default_picking_fee_id');
    }

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
