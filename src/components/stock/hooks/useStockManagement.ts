
import { useState } from "react";
import { Product } from "@/types/database";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStockLevels, updateStockLevel, updateProductDetails, updateProductOrder } from "@/lib/supabase/database";
import { useToast } from "@/components/ui/use-toast";

export const useStockManagement = () => {
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [updatedFields, setUpdatedFields] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getStockLevels,
  });

  // Filter products based on search
  const filteredProducts = products
    .filter((product) =>
      product.sku.toLowerCase().includes(search.toLowerCase()) ||
      product.listing_title.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

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

  const updateOrderMutation = useMutation({
    mutationFn: (updates: { sku: string; order_index: number }[]) =>
      updateProductOrder(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Success",
        description: "Product order updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update product order",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ sku, data }: { sku: string; data: Partial<Product> }) => {
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

  return {
    search,
    setSearch,
    selectedProduct,
    setSelectedProduct,
    updatedFields,
    setUpdatedFields,
    filteredProducts,
    isLoading,
    updateStockMutation,
    updateOrderMutation,
    updateProductMutation,
  };
};
