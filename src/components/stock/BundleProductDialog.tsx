
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product, BundleComponent } from "@/types/database";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { BundleComponentRow } from "./components/BundleComponentRow";
import { BundleSummary } from "./components/BundleSummary";

interface BundleProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBundleUpdate: () => void;
}

interface AvailableProduct {
  sku: string;
  listing_title: string;
  stock_quantity: number;
  product_cost: number;
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
        calculated_stock_quantity,
        calculated_cost_price,
        component:products!bundle_components_component_sku_fkey (
          listing_title,
          stock_quantity,
          product_cost
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
      listing_title: item.component?.listing_title,
      stock_quantity: item.calculated_stock_quantity,
      product_cost: item.calculated_cost_price
    })));
  };

  const fetchAvailableProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('sku, listing_title, stock_quantity, product_cost')
      .order('listing_title');

    if (error) {
      console.error('Error fetching available products:', error);
      return;
    }

    setAvailableProducts(data || []);
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

  const calculateBundleStock = (components: BundleComponent[]) => {
    if (!components.length) return 0;
    
    const stockLevels = components
      .filter(c => c.component_sku && c.quantity > 0)
      .map(c => {
        const component = availableProducts.find(p => p.sku === c.component_sku);
        return component ? Math.floor((component.stock_quantity || 0) / (c.quantity || 1)) : 0;
      });

    return stockLevels.length > 0 ? Math.min(...stockLevels) : 0;
  };

  const handleSave = async () => {
    if (!product) return;

    try {
      // First, ensure this product is marked as a bundle
      const { error: bundleError } = await supabase
        .from('bundle_products')
        .upsert({ 
          bundle_sku: product.sku,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (bundleError) throw bundleError;

      // Remove existing components
      const { error: deleteError } = await supabase
        .from('bundle_components')
        .delete()
        .eq('bundle_sku', product.sku);

      if (deleteError) throw deleteError;

      // Add new components with timestamps
      const { error: componentsError } = await supabase
        .from('bundle_components')
        .insert(
          components
            .filter(c => c.component_sku && c.quantity > 0)
            .map(c => ({
              bundle_sku: product.sku,
              component_sku: c.component_sku,
              quantity: c.quantity,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }))
        );

      if (componentsError) throw componentsError;

      // Call the update_stock_quantities function to update both stock and costs
      const { error: updateError } = await supabase.rpc('update_stock_quantities');
      
      if (updateError) throw updateError;

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

  const validComponents = components.filter(c => c.component_sku && c.quantity > 0);
  const expectedStock = calculateBundleStock(validComponents);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Bundle Components - {product?.sku}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <BundleSummary 
            expectedStock={expectedStock}
            expectedCost={product?.product_cost || 0}
          />

          <div className="space-y-4">
            {components.map((component, index) => (
              <BundleComponentRow
                key={index}
                component={component}
                index={index}
                availableProducts={availableProducts}
                onComponentChange={handleComponentChange}
                onRemoveComponent={handleRemoveComponent}
              />
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
