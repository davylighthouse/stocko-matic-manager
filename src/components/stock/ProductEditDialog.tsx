import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/types/database";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";

interface ProductEditDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStockUpdate: (sku: string, quantity: number) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  updatedFields?: string[];
}

export const ProductEditDialog = ({
  product,
  open,
  onOpenChange,
  onStockUpdate,
  onSubmit,
  updatedFields = [],
}: ProductEditDialogProps) => {
  const [totalCost, setTotalCost] = useState<number>(0);

  useEffect(() => {
    if (product) {
      const total = (product.product_cost || 0) +
        (product.packaging_cost || 0) +
        (product.making_up_cost || 0) +
        (product.additional_costs || 0);
      setTotalCost(total);
    }
  }, [product]);

  const renderFieldWithCheck = (fieldName: string, children: React.ReactNode) => (
    <div className="relative">
      {children}
      {updatedFields.includes(fieldName) && (
        <Check className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
      )}
    </div>
  );

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Product Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Product Details</TabsTrigger>
              <TabsTrigger value="information">Product Information</TabsTrigger>
              <TabsTrigger value="cost">Product Cost</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div>
                <Label htmlFor="listing_title">Title</Label>
                {renderFieldWithCheck("listing_title",
                  <Input
                    id="listing_title"
                    name="listing_title"
                    defaultValue={product.listing_title}
                  />
                )}
              </div>
              <div>
                <Label htmlFor="stock_quantity">Current Stock</Label>
                {renderFieldWithCheck("stock_quantity",
                  <Input
                    id="stock_quantity"
                    name="stock_quantity"
                    type="number"
                    defaultValue={product.current_stock ?? 0}
                    onChange={(e) => {
                      const quantity = parseInt(e.target.value);
                      if (!isNaN(quantity)) {
                        onStockUpdate(product.sku, quantity);
                      }
                    }}
                  />
                )}
              </div>
              <div>
                <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
                {renderFieldWithCheck("low_stock_threshold",
                  <Input
                    id="low_stock_threshold"
                    name="low_stock_threshold"
                    type="number"
                    defaultValue={product.low_stock_threshold ?? 20}
                  />
                )}
              </div>
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                {renderFieldWithCheck("supplier",
                  <Input
                    id="supplier"
                    name="supplier"
                    defaultValue={product.supplier}
                  />
                )}
              </div>
              <div>
                <Label htmlFor="product_status">Product Status</Label>
                {renderFieldWithCheck("product_status",
                  <Select name="product_status" defaultValue={product.product_status || "active"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div>
                <Label htmlFor="default_shipping_service">Default Shipping Service</Label>
                {renderFieldWithCheck("default_shipping_service",
                  <Input
                    id="default_shipping_service"
                    name="default_shipping_service"
                    defaultValue={product.default_shipping_service}
                  />
                )}
              </div>
              <div>
                <Label htmlFor="vat_status">VAT Status</Label>
                {renderFieldWithCheck("vat_status",
                  <Select name="vat_status" defaultValue={product.vat_status || "standard"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select VAT status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Rate</SelectItem>
                      <SelectItem value="reduced">Reduced Rate</SelectItem>
                      <SelectItem value="zero">Zero Rate</SelectItem>
                      <SelectItem value="exempt">Exempt</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </TabsContent>

            <TabsContent value="information" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {renderFieldWithCheck("dimensions_height",
                  <div>
                    <Label htmlFor="dimensions_height">Height (mm)</Label>
                    <Input
                      id="dimensions_height"
                      name="dimensions_height"
                      type="number"
                      defaultValue={product.dimensions_height}
                    />
                  </div>
                )}
                {renderFieldWithCheck("dimensions_width",
                  <div>
                    <Label htmlFor="dimensions_width">Width (mm)</Label>
                    <Input
                      id="dimensions_width"
                      name="dimensions_width"
                      type="number"
                      defaultValue={product.dimensions_width}
                    />
                  </div>
                )}
                {renderFieldWithCheck("dimensions_length",
                  <div>
                    <Label htmlFor="dimensions_length">Length (mm)</Label>
                    <Input
                      id="dimensions_length"
                      name="dimensions_length"
                      type="number"
                      defaultValue={product.dimensions_length}
                    />
                  </div>
                )}
              </div>
              {renderFieldWithCheck("weight",
                <div>
                  <Label htmlFor="weight">Weight (g)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    defaultValue={product.weight}
                  />
                </div>
              )}
              {renderFieldWithCheck("warehouse_location",
                <div>
                  <Label htmlFor="warehouse_location">Warehouse Location</Label>
                  <Input
                    id="warehouse_location"
                    name="warehouse_location"
                    defaultValue={product.warehouse_location}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="cost" className="space-y-4">
              <div>
                <Label>Total Product Cost</Label>
                <Input
                  type="number"
                  value={totalCost.toFixed(2)}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              {renderFieldWithCheck("product_cost",
                <div>
                  <Label htmlFor="product_cost">Product Cost</Label>
                  <Input
                    id="product_cost"
                    name="product_cost"
                    type="number"
                    step="0.01"
                    defaultValue={product.product_cost}
                  />
                </div>
              )}
              {renderFieldWithCheck("packaging_cost",
                <div>
                  <Label htmlFor="packaging_cost">Packaging Cost</Label>
                  <Input
                    id="packaging_cost"
                    name="packaging_cost"
                    type="number"
                    step="0.01"
                    defaultValue={product.packaging_cost}
                  />
                </div>
              )}
              {renderFieldWithCheck("making_up_cost",
                <div>
                  <Label htmlFor="making_up_cost">Making Up Cost</Label>
                  <Input
                    id="making_up_cost"
                    name="making_up_cost"
                    type="number"
                    step="0.01"
                    defaultValue={product.making_up_cost}
                  />
                </div>
              )}
              {renderFieldWithCheck("additional_costs",
                <div>
                  <Label htmlFor="additional_costs">Additional Costs</Label>
                  <Input
                    id="additional_costs"
                    name="additional_costs"
                    type="number"
                    step="0.01"
                    defaultValue={product.additional_costs}
                  />
                </div>
              )}
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
