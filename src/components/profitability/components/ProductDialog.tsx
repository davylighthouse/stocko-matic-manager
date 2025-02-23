
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

    const updates = {} as Record<keyof Product, any>;
    const updatedFieldNames: string[] = [];

    if ('currentTarget' in eventOrField) {
      // Handle form submission
      eventOrField.preventDefault();
      const formData = new FormData(eventOrField.currentTarget);
      formData.forEach((value, key) => {
        if (value !== '' && value !== null) {
          if (key === 'advertising_cost') {
            // For advertising_cost, we need to update the product_cost_history
            const parsedValue = parseFloat(value as string);
            updates.promoted_listing_percentage = parsedValue;
            updatedFieldNames.push('promoted_listing_percentage');
          } else {
            updates[key as keyof Product] = value;
            updatedFieldNames.push(key);
          }
        }
      });
    } else {
      // Handle individual field update
      const { field, value } = eventOrField;
      if (field === 'advertising_cost') {
        // Convert advertising_cost to promoted_listing_percentage for historical tracking
        updates.promoted_listing_percentage = value;
        updatedFieldNames.push('promoted_listing_percentage');
      } else {
        updates[field as keyof Product] = value;
        updatedFieldNames.push(field);
      }
    }

    try {
      // The handle_product_cost_updates trigger will automatically create a new history record
      // when promoted_listing_percentage is updated
      await updateProductDetails(currentProduct.sku, updates);
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      
      if ('currentTarget' in eventOrField) {
        onOpenChange(false);
        toast({
          title: "Success",
          description: "Product details updated successfully",
        });
      }
      
      setUpdatedFields([]);
    } catch (error) {
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
      product={currentProduct ?? null}
      open={isOpen}
      onOpenChange={onOpenChange}
      onSubmit={handleProductUpdate}
      onStockUpdate={handleStockUpdate}
      updatedFields={updatedFields}
    />
  );
};
