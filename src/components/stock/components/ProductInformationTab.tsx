
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TabContentProps } from "../types/product-dialog";

export const ProductInformationTab = ({ product, renderFieldWithCheck }: TabContentProps) => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};
