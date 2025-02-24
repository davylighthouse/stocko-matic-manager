
import { useState } from "react";
import { ProductEditDialog } from "@/components/stock/ProductEditDialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { updateProductDetails } from "@/lib/supabase/database";
import { Product } from "@/types/database";
import { FieldUpdate } from "@/components/stock/types/product-dialog";

interface ProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentProduct: Product | undefined;
}

export const ProductDialog = ({ isOpen, onOpenChange, currentProduct }: ProductDialogProps) => {
  const [updatedFields, setUpdatedFields] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleProductUpdate = async (eventOrField: React.FormEvent<HTMLFormElement> | FieldUpdate) => {
    if (!currentProduct) return;

    const updates: Record<string, string | number | null | boolean> = {};
    const updatedFieldNames: string[] = [];

    if ('currentTarget' in eventOrField) {
      eventOrField.preventDefault();
      const formData = new FormData(eventOrField.currentTarget);
      
      formData.forEach((value, key) => {
        if (value !== '' && value !== null) {
          // Handle number fields
          if (
            key === 'promoted_listing_percentage' ||
            key === 'stock_quantity' || 
            key === 'product_cost' || 
            key === 'packaging_cost' || 
            key === 'making_up_cost' || 
            key === 'additional_costs' || 
            key === 'low_stock_threshold'
          ) {
            const parsedValue = parseFloat(value.toString());
            if (!isNaN(parsedValue)) {
              updates[key] = parsedValue;
              updatedFieldNames.push(key);
            }
          } else {
            updates[key] = value.toString();
            updatedFieldNames.push(key);
          }
        }
      });
    } else {
      // Handle direct field updates
      const { field, value } = eventOrField;
      
      if (field === 'promoted_listing_percentage') {
        updates[field] = typeof value === 'string' ? parseFloat(value) : value;
      } else {
        updates[field] = value;
      }
      updatedFieldNames.push(field);
    }

    try {
      console.log('Updating product with:', updates);
      await updateProductDetails(currentProduct.sku, updates as Partial<Product>);
      
      // Invalidate all relevant queries to refresh the data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['profitability'] }),
        queryClient.invalidateQueries({ queryKey: ['sales'] })
      ]);
      
      if ('currentTarget' in eventOrField) {
        onOpenChange(false);
        toast({
          title: "Success",
          description: "Product details updated successfully",
        });
      }
      
      setUpdatedFields([]);
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update product details",
        variant: "destructive",
      });
      setUpdatedFields([]);
    }
  };

  const handleStockUpdate = async (sku: string, quantity: number) => {
    // This function is required by the ProductEditDialog but won't be used in this context
  };

  return (
    <ProductEditDialog
      product={currentProduct}
      open={isOpen}
      onOpenChange={onOpenChange}
      onSubmit={handleProductUpdate}
      onStockUpdate={handleStockUpdate}
      updatedFields={updatedFields}
    />
  );
};
