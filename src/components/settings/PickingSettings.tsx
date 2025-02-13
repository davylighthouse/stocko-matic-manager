
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PickingFee {
  id: number;
  fee_name: string;
  fee_amount: number;
}

export const PickingSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newFee, setNewFee] = useState({
    fee_name: "",
    fee_amount: "0",
  });

  const { data: pickingFees = [] } = useQuery({
    queryKey: ['picking-fees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('picking_fees')
        .select('*')
        .order('fee_name');
      
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (fee: Omit<PickingFee, 'id'>) => {
      const { error } = await supabase
        .from('picking_fees')
        .insert([fee]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['picking-fees'] });
      setIsAdding(false);
      setNewFee({ fee_name: "", fee_amount: "0" });
      toast({ title: "Success", description: "Picking fee added successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...fee }: PickingFee) => {
      const { error } = await supabase
        .from('picking_fees')
        .update(fee)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['picking-fees'] });
      setEditingId(null);
      toast({ title: "Success", description: "Picking fee updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('picking_fees')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['picking-fees'] });
      toast({ title: "Success", description: "Picking fee deleted successfully" });
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate({
      fee_name: newFee.fee_name,
      fee_amount: parseFloat(newFee.fee_amount),
    });
  };

  const handleUpdateSubmit = (fee: PickingFee) => {
    updateMutation.mutate(fee);
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Picking Fees</h2>
        <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Fee
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddSubmit} className="mb-6 p-4 border rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Fee Name"
              value={newFee.fee_name}
              onChange={(e) => setNewFee({ ...newFee, fee_name: e.target.value })}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Fee Amount"
              value={newFee.fee_amount}
              onChange={(e) => setNewFee({ ...newFee, fee_amount: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Fee</Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left">Fee Name</th>
              <th className="px-4 py-2 text-right">Fee Amount</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {pickingFees.map((fee: PickingFee) => (
              <tr key={fee.id} className="border-b">
                <td className="px-4 py-2">
                  {editingId === fee.id ? (
                    <Input
                      value={fee.fee_name}
                      onChange={(e) => {
                        const updated = { ...fee, fee_name: e.target.value };
                        handleUpdateSubmit(updated);
                      }}
                    />
                  ) : (
                    fee.fee_name
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  {editingId === fee.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={fee.fee_amount}
                      onChange={(e) => {
                        const updated = { ...fee, fee_amount: parseFloat(e.target.value) };
                        handleUpdateSubmit(updated);
                      }}
                      className="w-32 ml-auto"
                    />
                  ) : (
                    `£${fee.fee_amount.toFixed(2)}`
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(editingId === fee.id ? null : fee.id)}
                    >
                      {editingId === fee.id ? (
                        <Save className="h-4 w-4" />
                      ) : (
                        <Pencil className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this fee?')) {
                          deleteMutation.mutate(fee.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
