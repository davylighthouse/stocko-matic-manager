
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TabContentProps } from "../types/product-dialog";
import { useEffect, useState } from "react";

export const ProductCostTab = ({ product, renderFieldWithCheck }: TabContentProps) => {
  const [totalCost, setTotalCost] = useState<number>(0);
  const isBundle = Boolean(product.bundle_products);

  useEffect(() => {
    const total = (product.product_cost || 0) +
      (product.packaging_cost || 0) +
      (product.making_up_cost || 0) +
      (product.additional_costs || 0);
    setTotalCost(total);
  }, [product]);

  return (
    <div className="space-y-4">
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
            disabled={isBundle}
            className={isBundle ? "bg-gray-100" : ""}
          />
          {isBundle && (
            <p className="text-sm text-gray-500 mt-1">
              Product cost is automatically calculated as the sum of (component cost × quantity) for all bundle components
            </p>
          )}
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
    </div>
  );
};
