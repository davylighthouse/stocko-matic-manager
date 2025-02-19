
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TabContentProps } from "../types/product-dialog";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export const ProductCostTab = ({ product, renderFieldWithCheck }: TabContentProps) => {
  const [totalCost, setTotalCost] = useState<number>(0);
  const [expandedNotes, setExpandedNotes] = useState<{[key: string]: boolean}>({});
  const isBundle = Boolean(product.bundle_products);

  useEffect(() => {
    const total = (product.product_cost || 0) +
      (product.packaging_cost || 0) +
      (product.making_up_cost || 0) +
      (product.additional_costs || 0);
    setTotalCost(total);
  }, [product]);

  const toggleNotes = (field: string) => {
    setExpandedNotes(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const renderCostField = (
    fieldName: string, 
    label: string, 
    value: number | null | undefined,
    notes: string | null | undefined,
    disabled: boolean = false
  ) => {
    const isExpanded = expandedNotes[fieldName] || false;

    return renderFieldWithCheck(fieldName,
      <div className="space-y-2">
        <Label htmlFor={fieldName}>{label}</Label>
        <div className="space-y-2">
          <Input
            id={fieldName}
            name={fieldName}
            type="number"
            step="0.01"
            defaultValue={value ?? undefined}
            disabled={disabled}
            className={disabled ? "bg-gray-100" : ""}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full flex justify-between items-center py-1 text-gray-600"
            onClick={() => toggleNotes(fieldName)}
          >
            <span className="text-sm">Notes</span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          {isExpanded && (
            <Textarea
              name={`${fieldName}_notes`}
              defaultValue={notes ?? ""}
              placeholder="Add notes about this cost..."
              className="mt-2"
            />
          )}
        </div>
      </div>
    );
  };

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
      
      {renderCostField(
        "product_cost",
        "Product Cost",
        product.product_cost,
        product.product_cost_notes,
        isBundle
      )}
      {isBundle && (
        <p className="text-sm text-gray-500 mt-1">
          Product cost is automatically calculated as the sum of (component cost × quantity) for all bundle components
        </p>
      )}
      
      {renderCostField(
        "packaging_cost",
        "Packaging Cost",
        product.packaging_cost,
        product.packaging_cost_notes
      )}
      
      {renderCostField(
        "making_up_cost",
        "Making Up Cost",
        product.making_up_cost,
        product.making_up_cost_notes
      )}
      
      {renderCostField(
        "additional_costs",
        "Additional Costs",
        product.additional_costs,
        product.additional_costs_notes
      )}
    </div>
  );
};

