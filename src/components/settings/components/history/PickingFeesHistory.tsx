
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

interface PickingFeeHistory {
  id: number;
  fee_name: string;
  fee_amount: number;
  effective_from: string;
  effective_to: string | null;
  notes: string | null;
}

export const PickingFeesHistory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newRate, setNewRate] = useState({
    fee_name: "",
    fee_amount: "",
    effective_from: new Date(),
    notes: "",
  });

  const { data: history = [] } = useQuery({
    queryKey: ['picking-fee-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('picking_fee_history')
        .select('*')
        .order('fee_name, effective_from');
      
      if (error) throw error;
      return data as PickingFeeHistory[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (rate: Omit<PickingFeeHistory, 'id' | 'effective_to'>) => {
      const { error } = await supabase
        .from('picking_fee_history')
        .insert([rate]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['picking-fee-history'] });
      setIsAdding(false);
      setNewRate({
        fee_name: "",
        fee_amount: "",
        effective_from: new Date(),
        notes: "",
      });
      toast({ title: "Success", description: "Historical rate added successfully" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate({
      fee_name: newRate.fee_name,
      fee_amount: parseFloat(newRate.fee_amount),
      effective_from: format(newRate.effective_from, 'yyyy-MM-dd'),
      notes: newRate.notes || null,
    });
  };

  const columns = [
    { header: "Fee Name", key: "fee_name" as const },
    { 
      header: "Fee Amount", 
      key: "fee_amount" as const, 
      align: "right" as const,
      format: (value: number) => `£${value.toFixed(2)}`
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
        <h3 className="text-lg font-semibold">Picking Fee History</h3>
        <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Historical Rate
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Fee Name"
              value={newRate.fee_name}
              onChange={(value) => setNewRate({ ...newRate, fee_name: value })}
              placeholder="Enter fee name"
              required
            />
            <DatePickerField
              label="Effective From"
              date={newRate.effective_from}
              onChange={(date) => setNewRate({ ...newRate, effective_from: date })}
            />
            <FormField
              label="Fee Amount"
              value={newRate.fee_amount}
              onChange={(value) => setNewRate({ ...newRate, fee_amount: value })}
              placeholder="Enter fee amount"
              type="number"
              step="0.01"
              required
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
