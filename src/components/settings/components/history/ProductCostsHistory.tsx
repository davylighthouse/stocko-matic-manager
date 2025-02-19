
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FormField } from "./shared/FormField";
import { DatePickerField } from "./shared/DatePickerField";
import { HistoryTable } from "./shared/HistoryTable";

interface ProductCostHistory {
  id: number;
  sku: string;
  product_cost: number;
  packaging_cost: number | null;
  making_up_cost: number | null;
  effective_from: string;
  effective_to: string | null;
  notes: string | null;
}

export const ProductCostsHistory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newRate, setNewRate] = useState({
    sku: "",
    product_cost: "",
    packaging_cost: "",
    making_up_cost: "",
    effective_from: new Date(),
    notes: "",
  });

  const { data: history = [] } = useQuery({
    queryKey: ['product-cost-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_cost_history')
        .select('*')
        .order('sku, effective_from');
      
      if (error) throw error;
      return data as ProductCostHistory[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (rate: Omit<ProductCostHistory, 'id' | 'effective_to'>) => {
      const { error } = await supabase
        .from('product_cost_history')
        .insert([rate]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-cost-history'] });
      setIsAdding(false);
      setNewRate({
        sku: "",
        product_cost: "",
        packaging_cost: "",
        making_up_cost: "",
        effective_from: new Date(),
        notes: "",
      });
      toast({ title: "Success", description: "Historical rate added successfully" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate({
      sku: newRate.sku,
      product_cost: parseFloat(newRate.product_cost),
      packaging_cost: newRate.packaging_cost ? parseFloat(newRate.packaging_cost) : null,
      making_up_cost: newRate.making_up_cost ? parseFloat(newRate.making_up_cost) : null,
      effective_from: format(newRate.effective_from, 'yyyy-MM-dd'),
      notes: newRate.notes || null,
    });
  };

  const columns = [
    { header: "SKU", key: "sku" as const },
    { 
      header: "Product Cost", 
      key: "product_cost" as const,
      align: "right" as const,
      format: (value: number) => `£${value.toFixed(2)}`
    },
    { 
      header: "Packaging Cost", 
      key: "packaging_cost" as const,
      align: "right" as const,
      format: (value: number | null) => value ? `£${value.toFixed(2)}` : '-'
    },
    { 
      header: "Making Up Cost", 
      key: "making_up_cost" as const,
      align: "right" as const,
      format: (value: number | null) => value ? `£${value.toFixed(2)}` : '-'
    },
    { 
      header: "Effective From", 
      key: "effective_from" as const,
      format: (value: string) => format(new Date(value), 'dd MMM yyyy')
    },
    { header: "Notes", key: "notes" as const },
  ];

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Product Cost History</h3>
        <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Historical Rate
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="SKU"
              value={newRate.sku}
              onChange={(value) => setNewRate({ ...newRate, sku: value })}
              placeholder="Product SKU"
              required
            />
            <DatePickerField
              label="Effective From"
              date={newRate.effective_from}
              onChange={(date) => setNewRate({ ...newRate, effective_from: date })}
            />
            <FormField
              label="Product Cost"
              value={newRate.product_cost}
              onChange={(value) => setNewRate({ ...newRate, product_cost: value })}
              placeholder="Base product cost"
              type="number"
              step="0.01"
              required
            />
            <FormField
              label="Packaging Cost"
              value={newRate.packaging_cost}
              onChange={(value) => setNewRate({ ...newRate, packaging_cost: value })}
              placeholder="Packaging cost (optional)"
              type="number"
              step="0.01"
            />
            <FormField
              label="Making Up Cost"
              value={newRate.making_up_cost}
              onChange={(value) => setNewRate({ ...newRate, making_up_cost: value })}
              placeholder="Making up cost (optional)"
              type="number"
              step="0.01"
            />
            <FormField
              label="Notes"
              value={newRate.notes}
              onChange={(value) => setNewRate({ ...newRate, notes: value })}
              placeholder="Add notes about this change"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Rate</Button>
          </div>
        </form>
      )}

      <HistoryTable data={history} columns={columns} />
    </Card>
  );
};
