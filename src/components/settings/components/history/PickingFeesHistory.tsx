
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
            <div className="space-y-2">
              <label className="text-sm font-medium">Fee Name</label>
              <Input
                value={newRate.fee_name}
                onChange={(e) => setNewRate({ ...newRate, fee_name: e.target.value })}
                placeholder="Enter fee name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Effective From</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(newRate.effective_from, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newRate.effective_from}
                    onSelect={(date) => date && setNewRate({ ...newRate, effective_from: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fee Amount</label>
              <Input
                type="number"
                step="0.01"
                value={newRate.fee_amount}
                onChange={(e) => setNewRate({ ...newRate, fee_amount: e.target.value })}
                placeholder="Enter fee amount"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Input
                value={newRate.notes}
                onChange={(e) => setNewRate({ ...newRate, notes: e.target.value })}
                placeholder="Add notes about this change"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Rate</Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left">Fee Name</th>
              <th className="px-4 py-2 text-right">Fee Amount</th>
              <th className="px-4 py-2 text-left">Effective From</th>
              <th className="px-4 py-2 text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {history.map((rate) => (
              <tr key={rate.id} className="border-b">
                <td className="px-4 py-2">{rate.fee_name}</td>
                <td className="px-4 py-2 text-right">£{rate.fee_amount.toFixed(2)}</td>
                <td className="px-4 py-2">{format(new Date(rate.effective_from), 'dd MMM yyyy')}</td>
                <td className="px-4 py-2">{rate.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
