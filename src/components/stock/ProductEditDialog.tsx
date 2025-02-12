
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/types/database";

interface ProductEditDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStockUpdate: (sku: string, quantity: number) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const ProductEditDialog = ({
  product,
  open,
  onOpenChange,
  onStockUpdate,
  onSubmit,
}: ProductEditDialogProps) => {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="listing_title">Title</Label>
            <Input
              id="listing_title"
              name="listing_title"
              defaultValue={product.listing_title}
            />
          </div>
          <div>
            <Label htmlFor="stock_quantity">Current Stock</Label>
            <Input
              id="stock_quantity"
              name="stock_quantity"
              type="number"
              defaultValue={product.stock_quantity}
              onChange={(e) => {
                const quantity = parseInt(e.target.value);
                if (!isNaN(quantity)) {
                  onStockUpdate(product.sku, quantity);
                }
              }}
            />
          </div>
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
          <div>
            <Label htmlFor="warehouse_location">Warehouse Location</Label>
            <Input
              id="warehouse_location"
              name="warehouse_location"
              defaultValue={product.warehouse_location}
            />
          </div>
          <div>
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              name="supplier"
              defaultValue={product.supplier}
            />
          </div>
          <div className="flex justify-end space-x-2">
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
