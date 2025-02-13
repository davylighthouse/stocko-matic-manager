
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface FBATier {
  id: number;
  tier_name: string;
  size_category: string;
  fee_amount: number;
}

export const AmazonFBASettings = () => {
  const queryClient = useQueryClient();
  const [newTier, setNewTier] = useState({
    tier_name: "",
    size_category: "",
    fee_amount: "",
  });

  const { data: fbaTiers = [] } = useQuery({
    queryKey: ["amazon-fba-tiers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("amazon_fba_tiers")
        .select("*")
        .order("tier_name");

      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.from("amazon_fba_tiers").insert({
        tier_name: newTier.tier_name,
        size_category: newTier.size_category,
        fee_amount: parseFloat(newTier.fee_amount),
      });

      if (error) throw error;

      toast.success("FBA tier added successfully");
      queryClient.invalidateQueries({ queryKey: ["amazon-fba-tiers"] });
      setNewTier({ tier_name: "", size_category: "", fee_amount: "" });
    } catch (error) {
      toast.error("Failed to add FBA tier");
      console.error("Error adding FBA tier:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from("amazon_fba_tiers")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("FBA tier deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["amazon-fba-tiers"] });
    } catch (error) {
      toast.error("Failed to delete FBA tier");
      console.error("Error deleting FBA tier:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Add New FBA Tier</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tier_name">Tier Name</Label>
              <Input
                id="tier_name"
                value={newTier.tier_name}
                onChange={(e) =>
                  setNewTier({ ...newTier, tier_name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="size_category">Size Category</Label>
              <Input
                id="size_category"
                value={newTier.size_category}
                onChange={(e) =>
                  setNewTier({ ...newTier, size_category: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="fee_amount">Fee Amount (£)</Label>
              <Input
                id="fee_amount"
                type="number"
                step="0.01"
                value={newTier.fee_amount}
                onChange={(e) =>
                  setNewTier({ ...newTier, fee_amount: e.target.value })
                }
                required
              />
            </div>
          </div>
          <Button type="submit">Add FBA Tier</Button>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Existing FBA Tiers</h3>
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Tier Name</th>
                <th className="px-6 py-3">Size Category</th>
                <th className="px-6 py-3">Fee Amount</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fbaTiers.map((tier: FBATier) => (
                <tr key={tier.id} className="bg-white border-b">
                  <td className="px-6 py-4">{tier.tier_name}</td>
                  <td className="px-6 py-4">{tier.size_category}</td>
                  <td className="px-6 py-4">£{tier.fee_amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(tier.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
