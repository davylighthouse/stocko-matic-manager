
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductEditDialogProps } from "./types/product-dialog";
import { FieldCheckIndicator } from "./components/FieldCheckIndicator";
import { ProductDetailsTab } from "./components/ProductDetailsTab";
import { ProductInformationTab } from "./components/ProductInformationTab";
import { ProductCostTab } from "./components/ProductCostTab";
import { ProductSettingsTab } from "./components/ProductSettingsTab";
import { BundleTab } from "./components/BundleTab";

export const ProductEditDialog = ({
  product,
  open,
  onOpenChange,
  onStockUpdate,
  onSubmit,
  updatedFields = [],
}: ProductEditDialogProps) => {
  const renderFieldWithCheck = (fieldName: string, children: React.ReactNode) => (
    <FieldCheckIndicator fieldName={fieldName} updatedFields={updatedFields}>
      {children}
    </FieldCheckIndicator>
  );

  const onSettingChange = (field: string) => {
    onSubmit({
      preventDefault: () => {},
      stopPropagation: () => {},
      currentTarget: null,
      target: null,
    } as any);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Product Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="details">Product Details</TabsTrigger>
              <TabsTrigger value="information">Product Information</TabsTrigger>
              <TabsTrigger value="cost">Product Cost</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="bundle">Bundle</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <ProductDetailsTab
                product={product}
                updatedFields={updatedFields}
                renderFieldWithCheck={renderFieldWithCheck}
                onStockUpdate={onStockUpdate}
              />
            </TabsContent>

            <TabsContent value="information">
              <ProductInformationTab
                product={product}
                updatedFields={updatedFields}
                renderFieldWithCheck={renderFieldWithCheck}
              />
            </TabsContent>

            <TabsContent value="cost">
              <ProductCostTab
                product={product}
                updatedFields={updatedFields}
                renderFieldWithCheck={renderFieldWithCheck}
              />
            </TabsContent>

            <TabsContent value="settings">
              <ProductSettingsTab
                sku={product.sku}
                defaultPickingFeeId={product.default_picking_fee_id}
                defaultShippingServiceId={product.default_shipping_service_id}
                amazonFbaTierId={product.amazon_fba_tier_id}
                vatStatus={product.vat_status}
                onSettingChange={onSettingChange}
              />
            </TabsContent>

            <TabsContent value="bundle">
              <BundleTab
                product={product}
                updatedFields={updatedFields}
                renderFieldWithCheck={renderFieldWithCheck}
                onStockUpdate={onStockUpdate}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
