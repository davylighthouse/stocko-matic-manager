
import { useEffect, useState } from "react";
import { TabContentProps } from "../types/product-dialog";
import { Button } from "@/components/ui/button";
import { BundleProductDialog } from "../BundleProductDialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const BundleTab = ({ product, renderFieldWithCheck, onStockUpdate }: TabContentProps) => {
  const [bundleDialogOpen, setBundleDialogOpen] = useState(false);
  const [isBundle, setIsBundle] = useState(false);
  const [isComponent, setIsComponent] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkBundleStatus = async () => {
      // Check if it's a bundle
      const { data: bundleData, error: bundleError } = await supabase
        .from('bundle_products')
        .select('bundle_sku')
        .eq('bundle_sku', product.sku)
        .maybeSingle();

      if (!bundleError) {
        setIsBundle(!!bundleData);
      }

      // Check if it's used as a component
      const { data: componentData, error: componentError } = await supabase
        .from('bundle_components')
        .select('component_sku')
        .eq('component_sku', product.sku)
        .maybeSingle();

      if (!componentError) {
        setIsComponent(!!componentData);
      }
    };

    checkBundleStatus();
  }, [product.sku]);

  const handleBundleUpdate = () => {
    if (onStockUpdate) {
      onStockUpdate(product.sku, product.stock_quantity);
    }
  };

  const handleBundleToggle = async (checked: boolean) => {
    try {
      if (checked) {
        // Mark as bundle
        const { error } = await supabase
          .from('bundle_products')
          .upsert({ 
            bundle_sku: product.sku,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      } else {
        // First, remove all components if any
        await supabase
          .from('bundle_components')
          .delete()
          .eq('bundle_sku', product.sku);

        // Then remove bundle status
        const { error } = await supabase
          .from('bundle_products')
          .delete()
          .eq('bundle_sku', product.sku);

        if (error) throw error;
      }

      setIsBundle(checked);
      handleBundleUpdate();

      toast({
        title: "Success",
        description: `Product ${checked ? 'marked as' : 'removed from'} bundle`,
      });
    } catch (error) {
      console.error('Error updating bundle status:', error);
      toast({
        title: "Error",
        description: "Failed to update bundle status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch 
          id="is-bundle"
          checked={isBundle}
          onCheckedChange={handleBundleToggle}
          disabled={isComponent}
        />
        <Label htmlFor="is-bundle">This product is a bundle</Label>
      </div>
      
      {isComponent && (
        <p className="text-sm text-yellow-600">
          This product cannot be marked as a bundle because it is currently used as a component in another bundle.
        </p>
      )}

      <div className="pt-4">
        {isBundle ? (
          <>
            <p className="text-sm text-gray-600 mb-4">
              This product is a bundle. Its stock and cost are automatically calculated from its components.
            </p>
            <Button 
              type="button"
              onClick={() => setBundleDialogOpen(true)}
            >
              Manage Bundle Components
            </Button>
          </>
        ) : (
          <p className="text-sm text-gray-600">
            This is a main product that can be used as a component in bundles.
          </p>
        )}
      </div>

      <BundleProductDialog
        product={product}
        open={bundleDialogOpen}
        onOpenChange={setBundleDialogOpen}
        onBundleUpdate={handleBundleUpdate}
      />
    </div>
  );
};
