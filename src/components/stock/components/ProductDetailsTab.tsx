
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabContentProps } from "../types/product-dialog";

export const ProductDetailsTab = ({ product, renderFieldWithCheck, onStockUpdate }: TabContentProps) => {
  return (
    <div className="space-y-4">
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
        <div className="relative">
          <Input
            id="stock_quantity"
            name="stock_quantity"
            type="number"
            value={product.stock_quantity}
            className="bg-gray-50"
            readOnly
          />
        </div>
      </div>
      <div>
        <Label htmlFor="promoted_listing_percentage">eBay Promoted Listing Percentage</Label>
        {renderFieldWithCheck("promoted_listing_percentage",
          <Input
            id="promoted_listing_percentage"
            name="promoted_listing_percentage"
            type="number"
            step="0.01"
            defaultValue={product.promoted_listing_percentage ?? 0}
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
    </div>
  );
};
