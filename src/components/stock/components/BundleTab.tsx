
import { useState } from "react";
import { TabContentProps } from "../types/product-dialog";
import { Button } from "@/components/ui/button";
import { BundleProductDialog } from "../BundleProductDialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const BundleTab = ({ product, renderFieldWithCheck, onStockUpdate }: TabContentProps) => {
  const [bundleDialogOpen, setBundleDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch 
          id="is-bundle"
          name="is_bundle"
          defaultChecked={product.is_bundle}
          disabled
        />
        <Label htmlFor="is-bundle">This product is a bundle</Label>
      </div>

      <div className="pt-4">
        {product.is_bundle ? (
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
        onBundleUpdate={onStockUpdate}
      />
    </div>
  );
};
