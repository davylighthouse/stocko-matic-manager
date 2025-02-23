
import { useState } from "react";
import { ProductEditDialog } from "@/components/stock/ProductEditDialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { updateProductDetails } from "@/lib/supabase/database";
import { Product } from "@/types/database";

interface ProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentProduct: Product | undefined;
}

export const ProductDialog = ({ isOpen, onOpenChange, currentProduct }: ProductDialogProps) => {
  const [updatedFields, setUpdatedFields] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleProductUpdate = async (event: React.FormEvent<HTMLFormElement> | { field: string, value: any }) => {
    if (!currentProduct) return;

    let updates: Partial<Product> = {};
    let updatedFieldNames: string[] = [];

    // Handle both form submissions and individual field updates
    if ('currentTarget' in event) {
      // This is a form submission
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      formData.forEach((value, key) => {
        if (value !== '' && value !== null) {
          (updates as any)[key] = value;
          updatedFieldNames.push(key);
        }
      });
    } else {
      // This is an individual field update
      updates[event.field] = event.value;
      updatedFieldNames.push(event.field);
    }

    try {
      await updateProductDetails(currentProduct.sku, updates);
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      
      if (!('currentTarget' in event)) {
        // Only show toast and close dialog for form submissions
        toast({
          title: "Success",
          description: "Product details updated successfully",
        });
        onOpenChange(false);
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
      product={currentProduct}
      open={isOpen}
      onOpenChange={onOpenChange}
      onSubmit={handleProductUpdate}
      onStockUpdate={handleStockUpdate}
      updatedFields={updatedFields}
    />
  );
};
