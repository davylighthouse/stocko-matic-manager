
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

interface ShippingRateHistory {
  id: number;
  service_id: number;
  weight_from: number;
  weight_to: number;
  price: number;
  effective_from: string;
  effective_to: string | null;
  notes: string | null;
}

interface ShippingService {
  id: number;
  service_name: string;
}

export const ShippingRatesHistory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newRate, setNewRate] = useState({
    service_id: "",
    weight_from: "",
    weight_to: "",
    price: "",
    effective_from: new Date(),
    notes: "",
  });

  const { data: services = [] } = useQuery({
    queryKey: ['shipping-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipping_services')
        .select('id, service_name');
      
      if (error) throw error;
      return data as ShippingService[];
    },
  });

  const { data: history = [] } = useQuery({
    queryKey: ['shipping-rate-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipping_rate_history')
        .select(`
          *,
          shipping_services (
            service_name
          )
        `)
        .order('service_id, weight_from, effective_from');
      
      if (error) throw error;
      return data as (ShippingRateHistory & { shipping_services: { service_name: string } })[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (rate: Omit<ShippingRateHistory, 'id' | 'effective_to'>) => {
      const { error } = await supabase
        .from('shipping_rate_history')
        .insert([rate]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-rate-history'] });
      setIsAdding(false);
      setNewRate({
        service_id: "",
        weight_from: "",
        weight_to: "",
        price: "",
        effective_from: new Date(),
        notes: "",
      });
      toast({ title: "Success", description: "Historical rate added successfully" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate({
      service_id: parseInt(newRate.service_id),
      weight_from: parseFloat(newRate.weight_from),
      weight_to: parseFloat(newRate.weight_to),
      price: parseFloat(newRate.price),
      effective_from: format(newRate.effective_from, 'yyyy-MM-dd'),
      notes: newRate.notes || null,
    });
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Shipping Rate History</h3>
        <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Historical Rate
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Shipping Service</label>
              <select 
                className="w-full px-3 py-2 rounded-md border"
                value={newRate.service_id}
                onChange={(e) => setNewRate({ ...newRate, service_id: e.target.value })}
                required
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.service_name}
                  </option>
                ))}
              </select>
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
              <label className="text-sm font-medium">Weight From (kg)</label>
              <Input
                type="number"
                step="0.001"
                value={newRate.weight_from}
                onChange={(e) => setNewRate({ ...newRate, weight_from: e.target.value })}
                placeholder="Minimum weight"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Weight To (kg)</label>
              <Input
                type="number"
                step="0.001"
                value={newRate.weight_to}
                onChange={(e) => setNewRate({ ...newRate, weight_to: e.target.value })}
                placeholder="Maximum weight"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Price</label>
              <Input
                type="number"
                step="0.01"
                value={newRate.price}
                onChange={(e) => setNewRate({ ...newRate, price: e.target.value })}
                placeholder="Rate price"
                required
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
              <th className="px-4 py-2 text-left">Service</th>
              <th className="px-4 py-2 text-right">Weight Range</th>
              <th className="px-4 py-2 text-right">Price</th>
              <th className="px-4 py-2 text-left">Effective From</th>
              <th className="px-4 py-2 text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {history.map((rate) => (
              <tr key={rate.id} className="border-b">
                <td className="px-4 py-2">{rate.shipping_services.service_name}</td>
                <td className="px-4 py-2 text-right">
                  {rate.weight_from.toFixed(3)} - {rate.weight_to.toFixed(3)} kg
                </td>
                <td className="px-4 py-2 text-right">£{rate.price.toFixed(2)}</td>
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
