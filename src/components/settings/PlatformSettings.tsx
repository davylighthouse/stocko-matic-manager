import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface PlatformFee {
  id: number;
  platform_name: string;
  percentage_fee: number;
  flat_fee: number;
  effective_from: string;
  effective_to: string | null;
  notes: string | null;
}

export const PlatformSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newPlatform, setNewPlatform] = useState({
    platform_name: "",
    percentage_fee: "0",
    flat_fee: "0",
    effective_from: format(new Date(), 'yyyy-MM-dd'),
    notes: "",
  });

  const { data: platforms = [] } = useQuery({
    queryKey: ['platform-fees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('current_platform_fees')
        .select('*')
        .order('platform_name');
      
      if (error) throw error;
      return data as PlatformFee[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (platform: Omit<PlatformFee, 'id' | 'effective_to'>) => {
      const { error } = await supabase
        .from('platform_fee_history')
        .insert([platform]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-fees'] });
      setIsAdding(false);
      setNewPlatform({
        platform_name: "",
        percentage_fee: "0",
        flat_fee: "0",
        effective_from: format(new Date(), 'yyyy-MM-dd'),
        notes: "",
      });
      toast({ title: "Success", description: "Platform added successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...platform }: PlatformFee) => {
      const { error } = await supabase
        .from('platform_fee_history')
        .update(platform)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-fees'] });
      setEditingId(null);
      toast({ title: "Success", description: "Platform updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('platform_fee_history')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-fees'] });
      toast({ title: "Success", description: "Platform deleted successfully" });
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate({
      platform_name: newPlatform.platform_name,
      percentage_fee: parseFloat(newPlatform.percentage_fee),
      flat_fee: parseFloat(newPlatform.flat_fee),
      effective_from: newPlatform.effective_from,
      notes: newPlatform.notes || null,
    });
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Platform Fees</h2>
        <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Platform
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddSubmit} className="mb-6 p-4 border rounded-lg space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <Input
              placeholder="Platform Name"
              value={newPlatform.platform_name}
              onChange={(e) => setNewPlatform({ ...newPlatform, platform_name: e.target.value })}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Percentage Fee"
              value={newPlatform.percentage_fee}
              onChange={(e) => setNewPlatform({ ...newPlatform, percentage_fee: e.target.value })}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Flat Fee"
              value={newPlatform.flat_fee}
              onChange={(e) => setNewPlatform({ ...newPlatform, flat_fee: e.target.value })}
            />
            <Input
              type="date"
              value={newPlatform.effective_from}
              onChange={(e) => setNewPlatform({ ...newPlatform, effective_from: e.target.value })}
            />
            <Input
              placeholder="Notes"
              value={newPlatform.notes}
              onChange={(e) => setNewPlatform({ ...newPlatform, notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Platform</Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left">Platform</th>
              <th className="px-4 py-2 text-right">Percentage Fee</th>
              <th className="px-4 py-2 text-right">Flat Fee</th>
              <th className="px-4 py-2 text-left">Effective From</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {platforms.map((platform) => (
              <tr key={platform.id} className="border-b">
                <td className="px-4 py-2">
                  {editingId === platform.id ? (
                    <Input
                      value={platform.platform_name}
                      onChange={(e) => {
                        const updated = { ...platform, platform_name: e.target.value };
                        updateMutation.mutate(updated);
                      }}
                    />
                  ) : (
                    platform.platform_name
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  {editingId === platform.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={platform.percentage_fee}
                      onChange={(e) => {
                        const updated = { ...platform, percentage_fee: parseFloat(e.target.value) };
                        updateMutation.mutate(updated);
                      }}
                      className="w-32 ml-auto"
                    />
                  ) : (
                    `${platform.percentage_fee}%`
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  {editingId === platform.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={platform.flat_fee}
                      onChange={(e) => {
                        const updated = { ...platform, flat_fee: parseFloat(e.target.value) };
                        updateMutation.mutate(updated);
                      }}
                      className="w-32 ml-auto"
                    />
                  ) : (
                    `£${platform.flat_fee.toFixed(2)}`
                  )}
                </td>
                <td className="px-4 py-2">
                  {format(new Date(platform.effective_from), 'dd MMM yyyy')}
                </td>
                <td className="px-4 py-2">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(editingId === platform.id ? null : platform.id)}
                    >
                      {editingId === platform.id ? (
                        <Save className="h-4 w-4" />
                      ) : (
                        <Pencil className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this platform?')) {
                          deleteMutation.mutate(platform.id);
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
