
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

interface PlatformFeeHistory {
  id: number;
  platform_name: string;
  percentage_fee: number;
  flat_fee: number;
  effective_from: string;
  effective_to: string | null;
  notes: string | null;
}

export const PlatformFeesHistory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newRate, setNewRate] = useState({
    platform_name: "",
    percentage_fee: "",
    flat_fee: "",
    effective_from: new Date(),
    notes: "",
  });

  // Initialize Amazon rate if it doesn't exist
  const initializeAmazonRate = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('platform_fee_history')
        .insert([{
          platform_name: 'Amazon FBM',
          percentage_fee: 15.3,
          flat_fee: 0,
          effective_from: format(new Date(), 'yyyy-MM-dd'),
          notes: 'Initial Amazon FBM rate'
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-fee-history'] });
      toast({ title: "Success", description: "Amazon rate initialized successfully" });
    },
  });

  const { data: history = [] } = useQuery({
    queryKey: ['platform-fee-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_fee_history')
        .select('*')
        .order('platform_name, effective_from');
      
      if (error) throw error;

      // Check if Amazon FBM rate exists
      const amazonFbmExists = data.some(rate => rate.platform_name === 'Amazon FBM');
      if (!amazonFbmExists) {
        initializeAmazonRate.mutate();
      }

      return data as PlatformFeeHistory[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (rate: Omit<PlatformFeeHistory, 'id' | 'effective_to'>) => {
      const { error } = await supabase
        .from('platform_fee_history')
        .insert([rate]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-fee-history'] });
      setIsAdding(false);
      setNewRate({
        platform_name: "",
        percentage_fee: "",
        flat_fee: "",
        effective_from: new Date(),
        notes: "",
      });
      toast({ title: "Success", description: "Historical rate added successfully" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate({
      platform_name: newRate.platform_name,
      percentage_fee: parseFloat(newRate.percentage_fee),
      flat_fee: parseFloat(newRate.flat_fee),
      effective_from: format(newRate.effective_from, 'yyyy-MM-dd'),
      notes: newRate.notes || null,
    });
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Platform Fee History</h3>
        <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Historical Rate
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <Input
                value={newRate.platform_name}
                onChange={(e) => setNewRate({ ...newRate, platform_name: e.target.value })}
                placeholder="Platform name"
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
              <label className="text-sm font-medium">Percentage Fee</label>
              <Input
                type="number"
                step="0.01"
                value={newRate.percentage_fee}
                onChange={(e) => setNewRate({ ...newRate, percentage_fee: e.target.value })}
                placeholder="Percentage fee"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Flat Fee</label>
              <Input
                type="number"
                step="0.01"
                value={newRate.flat_fee}
                onChange={(e) => setNewRate({ ...newRate, flat_fee: e.target.value })}
                placeholder="Flat fee"
              />
            </div>
            <div className="col-span-2 space-y-2">
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
              <th className="px-4 py-2 text-left">Platform</th>
              <th className="px-4 py-2 text-right">Percentage Fee</th>
              <th className="px-4 py-2 text-right">Flat Fee</th>
              <th className="px-4 py-2 text-left">Effective From</th>
              <th className="px-4 py-2 text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {history.map((rate) => (
              <tr key={rate.id} className="border-b">
                <td className="px-4 py-2">{rate.platform_name}</td>
                <td className="px-4 py-2 text-right">{rate.percentage_fee}%</td>
                <td className="px-4 py-2 text-right">£{rate.flat_fee.toFixed(2)}</td>
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
