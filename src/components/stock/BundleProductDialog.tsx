
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product, BundleComponent } from "@/types/database";
import { X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface BundleProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBundleUpdate: () => void;
}

// Create a simpler type for available products
interface AvailableProduct {
  sku: string;
  listing_title: string;
  stock_quantity: number;
}

export const BundleProductDialog = ({
  product,
  open,
  onOpenChange,
  onBundleUpdate,
}: BundleProductDialogProps) => {
  const [components, setComponents] = useState<BundleComponent[]>([]);
  const [availableProducts, setAvailableProducts] = useState<AvailableProduct[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open && product) {
      fetchBundleComponents();
      fetchAvailableProducts();
    }
  }, [open, product]);

  const fetchBundleComponents = async () => {
    if (!product) return;
    
    const { data, error } = await supabase
      .from('bundle_components')
      .select(`
        component_sku,
        quantity,
        products:component_sku (
          listing_title,
          stock_quantity
        )
      `)
      .eq('bundle_sku', product.sku);

    if (error) {
      console.error('Error fetching bundle components:', error);
      return;
    }

    setComponents(data.map(item => ({
      component_sku: item.component_sku,
      quantity: item.quantity,
      listing_title: item.products?.listing_title,
      stock_quantity: item.products?.stock_quantity
    })));
  };

  const fetchAvailableProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('sku, listing_title, stock_quantity')
      .order('listing_title');

    if (error) {
      console.error('Error fetching available products:', error);
      return;
    }

    setAvailableProducts(data);
  };

  const handleAddComponent = () => {
    setComponents([...components, { component_sku: '', quantity: 1 }]);
  };

  const handleRemoveComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const handleComponentChange = (index: number, field: keyof BundleComponent, value: string | number) => {
    const newComponents = [...components];
    newComponents[index] = {
      ...newComponents[index],
      [field]: value,
    };
    setComponents(newComponents);
  };

  const handleSave = async () => {
    if (!product) return;

    try {
      // First, ensure this product is marked as a bundle
      const { error: bundleError } = await supabase
        .from('bundle_products')
        .upsert({ bundle_sku: product.sku });

      if (bundleError) throw bundleError;

      // Remove existing components
      await supabase
        .from('bundle_components')
        .delete()
        .eq('bundle_sku', product.sku);

      // Add new components
      const { error: componentsError } = await supabase
        .from('bundle_components')
        .insert(
          components
            .filter(c => c.component_sku && c.quantity > 0)
            .map(c => ({
              bundle_sku: product.sku,
              component_sku: c.component_sku,
              quantity: c.quantity
            }))
        );

      if (componentsError) throw componentsError;

      toast({
        title: "Success",
        description: "Bundle components updated successfully",
      });

      onBundleUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving bundle:', error);
      toast({
        title: "Error",
        description: "Failed to update bundle components",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Bundle Components - {product?.sku}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-4">
            {components.map((component, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-1 space-y-2">
                  <Label>Component SKU</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={component.component_sku}
                    onChange={(e) => handleComponentChange(index, 'component_sku', e.target.value)}
                  >
                    <option value="">Select a product</option>
                    {availableProducts.map((p) => (
                      <option key={p.sku} value={p.sku}>
                        {p.sku} - {p.listing_title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-32 space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={component.quantity}
                    onChange={(e) => handleComponentChange(index, 'quantity', parseInt(e.target.value))}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-8"
                  onClick={() => handleRemoveComponent(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleAddComponent}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Component
          </Button>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSave}>
              Save Bundle
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
