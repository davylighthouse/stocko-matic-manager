
import { BundleComponent } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface AvailableProduct {
  sku: string;
  listing_title: string;
  stock_quantity: number;
  product_cost: number;
}

interface BundleComponentRowProps {
  component: BundleComponent;
  index: number;
  availableProducts: AvailableProduct[];
  onComponentChange: (index: number, field: keyof BundleComponent, value: string | number) => void;
  onRemoveComponent: (index: number) => void;
}

export const BundleComponentRow = ({
  component,
  index,
  availableProducts,
  onComponentChange,
  onRemoveComponent,
}: BundleComponentRowProps) => {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex-1 space-y-2">
        <Label>Component SKU</Label>
        <select
          className="w-full p-2 border rounded-md"
          value={component.component_sku || ''}
          onChange={(e) => onComponentChange(index, 'component_sku', e.target.value)}
        >
          <option value="">Select a product</option>
          {availableProducts.map((p) => (
            <option key={p.sku} value={p.sku}>
              {p.sku} - {p.listing_title} (Stock: {p.stock_quantity})
            </option>
          ))}
        </select>
      </div>
      <div className="w-32 space-y-2">
        <Label>Quantity</Label>
        <Input
          type="number"
          min="1"
          value={component.quantity || 1}
          onChange={(e) => onComponentChange(index, 'quantity', parseInt(e.target.value) || 1)}
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="mt-8"
        onClick={() => onRemoveComponent(index)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
