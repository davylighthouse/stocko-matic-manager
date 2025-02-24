
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

    const updates: Partial<Product> = {};
    const updatedFieldNames: string[] = [];

    if ('currentTarget' in eventOrField) {
      eventOrField.preventDefault();
      const formData = new FormData(eventOrField.currentTarget);
      
      formData.forEach((value, key) => {
        if (value !== '' && value !== null) {
          const fieldKey = key as keyof Product;
          
          // Handle promoted_listing_percentage separately
          if (fieldKey === 'promoted_listing_percentage') {
            const parsedValue = parseFloat(value.toString());
            if (!isNaN(parsedValue)) {
              updates.promoted_listing_percentage = parsedValue;
              updatedFieldNames.push(fieldKey);
            }
          } else if (
            fieldKey === 'stock_quantity' || 
            fieldKey === 'product_cost' || 
            fieldKey === 'packaging_cost' || 
            fieldKey === 'making_up_cost' || 
            fieldKey === 'additional_costs' || 
            fieldKey === 'low_stock_threshold'
          ) {
            const parsedValue = parseFloat(value.toString());
            if (!isNaN(parsedValue)) {
              updates[fieldKey] = parsedValue as any;
              updatedFieldNames.push(fieldKey);
            }
          } else {
            updates[fieldKey] = value.toString() as any;
            updatedFieldNames.push(fieldKey);
          }
        }
      });
    } else {
      // Handle direct field updates
      const { field, value } = eventOrField;
      if (field === 'promoted_listing_percentage') {
        const parsedValue = typeof value === 'string' ? parseFloat(value) : value;
        updates.promoted_listing_percentage = parsedValue as number;
      } else {
        updates[field as keyof Product] = value as any;
      }
      updatedFieldNames.push(field);
    }

    try {
      console.log('Updating product with:', updates);
      await updateProductDetails(currentProduct.sku, updates);
      
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
