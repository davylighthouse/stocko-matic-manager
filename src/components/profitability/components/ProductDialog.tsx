
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

    const updates: Record<string, string | number | null> = {};
    const updatedFieldNames: string[] = [];

    if ('currentTarget' in eventOrField) {
      eventOrField.preventDefault();
      const formData = new FormData(eventOrField.currentTarget);
      formData.forEach((value, key) => {
        if (value !== '' && value !== null) {
          if (key === 'advertising_cost') {
            const parsedValue = parseFloat(value.toString());
            if (!isNaN(parsedValue)) {
              updates.promoted_listing_percentage = parsedValue;
              updatedFieldNames.push('promoted_listing_percentage');
            }
          } else {
            updates[key] = value.toString();
            updatedFieldNames.push(key);
          }
        }
      });
    } else {
      const { field, value } = eventOrField;
      if (field === 'advertising_cost' && typeof value === 'number') {
        updates.promoted_listing_percentage = value;
        updatedFieldNames.push('promoted_listing_percentage');
      } else {
        updates[field] = value;
        updatedFieldNames.push(field);
      }
    }

    try {
      console.log('Updating product with:', updates);
      await updateProductDetails(currentProduct.sku, updates as Partial<Product>);
      
      // Invalidate all relevant queries
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

  // Map the promoted_listing_percentage to advertising_cost for the dialog
  const productWithAdvertisingCost = currentProduct ? {
    ...currentProduct,
    advertising_cost: currentProduct.promoted_listing_percentage || 0
  } : null;

  console.log('Product with advertising cost:', productWithAdvertisingCost); // Debug log

  return (
    <ProductEditDialog
      product={productWithAdvertisingCost}
      open={isOpen}
      onOpenChange={onOpenChange}
      onSubmit={handleProductUpdate}
      onStockUpdate={handleStockUpdate}
      updatedFields={updatedFields}
    />
  );
};
