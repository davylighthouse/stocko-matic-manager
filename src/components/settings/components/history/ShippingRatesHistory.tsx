
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

interface ShippingRateHistory {
  id: number;
  service_id: number;
  weight_from: number;
  weight_to: number;
  price: number;
  effective_from: string;
  effective_to: string | null;
  notes: string | null;
  shipping_services: {
    service_name: string;
  };
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
      return data as ShippingRateHistory[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (rate: Omit<ShippingRateHistory, 'id' | 'effective_to' | 'shipping_services'>) => {
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
    e.stopPropagation(); // Prevent event bubbling
    addMutation.mutate({
      service_id: parseInt(newRate.service_id),
      weight_from: parseFloat(newRate.weight_from),
      weight_to: parseFloat(newRate.weight_to),
      price: parseFloat(newRate.price),
      effective_from: format(newRate.effective_from, 'yyyy-MM-dd'),
      notes: newRate.notes || null,
    });
  };

  const handleFormClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
  };

  const handleInputChange = (field: string, value: string) => {
    setNewRate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const columns = [
    { 
      header: "Service", 
      key: "shipping_services" as const,
      format: (value: { service_name: string }) => value.service_name
    },
    { 
      header: "Weight Range (g)", 
      key: "weight_from" as const,
      align: "right" as const,
      format: (value: number, row: ShippingRateHistory) => 
        `${Math.round(row.weight_from)} - ${Math.round(row.weight_to)}g`
    },
    { 
      header: "Price", 
      key: "price" as const,
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
        <h3 className="text-lg font-semibold">Shipping Rate History</h3>
        <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Historical Rate
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} onClick={handleFormClick} className="mb-6 p-4 border rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Shipping Service</label>
              <select 
                className="w-full px-3 py-2 rounded-md border"
                value={newRate.service_id}
                onChange={(e) => handleInputChange('service_id', e.target.value)}
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
            <DatePickerField
              label="Effective From"
              date={newRate.effective_from}
              onChange={(date) => date && handleInputChange('effective_from', date.toISOString())}
            />
            <FormField
              label="Weight From (kg)"
              value={newRate.weight_from}
              onChange={(value) => handleInputChange('weight_from', value)}
              placeholder="Minimum weight"
              type="number"
              step="0.001"
              required
            />
            <FormField
              label="Weight To (kg)"
              value={newRate.weight_to}
              onChange={(value) => handleInputChange('weight_to', value)}
              placeholder="Maximum weight"
              type="number"
              step="0.001"
              required
            />
            <FormField
              label="Price"
              value={newRate.price}
              onChange={(value) => handleInputChange('price', value)}
              placeholder="Rate price"
              type="number"
              step="0.01"
              required
            />
            <FormField
              label="Notes"
              value={newRate.notes}
              onChange={(value) => handleInputChange('notes', value)}
              placeholder="Add notes about this change"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={(e) => {
              e.stopPropagation();
              setIsAdding(false);
            }}>
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
