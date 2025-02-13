
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdjustmentRecord {
  id: number;
  sku: string;
  quantity: number;
  notes: string | null;
  adjustment_date: string;
}

interface AdjustmentsHistoryDialogProps {
  sku: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdjustmentsHistoryDialog = ({
  sku,
  open,
  onOpenChange,
}: AdjustmentsHistoryDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedQuantity, setEditedQuantity] = useState<string>("");
  const [editedNotes, setEditedNotes] = useState<string>("");

  const { data: adjustments = [] } = useQuery({
    queryKey: ['adjustments-history', sku],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_adjustments')
        .select('*')
        .eq('sku', sku)
        .order('adjustment_date', { ascending: false });

      if (error) throw error;
      return data as AdjustmentRecord[];
    },
    enabled: open,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, quantity, notes }: { id: number; quantity: number; notes: string }) => {
      const { error } = await supabase
        .from('stock_adjustments')
        .update({ quantity, notes })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adjustments-history', sku] });
      queryClient.invalidateQueries({ queryKey: ['current-stock-levels'] });
      toast({
        title: "Success",
        description: "Adjustment updated successfully",
      });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('stock_adjustments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adjustments-history', sku] });
      queryClient.invalidateQueries({ queryKey: ['current-stock-levels'] });
      toast({
        title: "Success",
        description: "Adjustment deleted successfully",
      });
    },
  });

  const handleStartEdit = (adjustment: AdjustmentRecord) => {
    setEditingId(adjustment.id);
    setEditedQuantity(adjustment.quantity.toString());
    setEditedNotes(adjustment.notes || "");
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    
    const quantity = parseInt(editedQuantity);
    if (isNaN(quantity)) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({
      id: editingId,
      quantity,
      notes: editedNotes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adjustment History for SKU: {sku}</DialogTitle>
        </DialogHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-right">Quantity</th>
                <th className="px-4 py-2 text-left">Notes</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {adjustments.map((adjustment) => (
                <tr key={adjustment.id} className="border-b">
                  <td className="px-4 py-2">
                    {new Date(adjustment.adjustment_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {editingId === adjustment.id ? (
                      <Input
                        type="number"
                        value={editedQuantity}
                        onChange={(e) => setEditedQuantity(e.target.value)}
                        className="w-24 text-right inline-block"
                      />
                    ) : (
                      adjustment.quantity
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingId === adjustment.id ? (
                      <Textarea
                        value={editedNotes || ""}
                        onChange={(e) => setEditedNotes(e.target.value)}
                        className="min-h-[60px]"
                      />
                    ) : (
                      adjustment.notes
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingId === adjustment.id ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleStartEdit(adjustment)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this adjustment?")) {
                                deleteMutation.mutate(adjustment.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
};
