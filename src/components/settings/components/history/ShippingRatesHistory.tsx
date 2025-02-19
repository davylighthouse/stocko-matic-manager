
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Pencil, Check, X } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FormField } from "./shared/FormField";
import { DatePickerField } from "./shared/DatePickerField";

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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingRate, setEditingRate] = useState<Partial<ShippingRateHistory> | null>(null);
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

  const updateMutation = useMutation({
    mutationFn: async (rate: Partial<ShippingRateHistory>) => {
      const { error } = await supabase
        .from('shipping_rate_history')
        .update({
          weight_from: rate.weight_from,
          weight_to: rate.weight_to,
          price: rate.price,
          notes: rate.notes,
        })
        .eq('id', rate.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-rate-history'] });
      setEditingId(null);
      setEditingRate(null);
      toast({ title: "Success", description: "Rate updated successfully" });
    },
  });

  const handleStartEdit = (rate: ShippingRateHistory) => {
    setEditingId(rate.id);
    setEditingRate({
      id: rate.id,
      weight_from: rate.weight_from,
      weight_to: rate.weight_to,
      price: rate.price,
      notes: rate.notes,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingRate(null);
  };

  const handleSaveEdit = () => {
    if (editingRate) {
      updateMutation.mutate(editingRate);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    e.stopPropagation();
  };

  const handleInputChange = (field: string, value: string) => {
    setNewRate(prev => ({
      ...prev,
      [field]: value
    }));
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

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left">Service</th>
              <th className="px-4 py-2 text-right">Weight Range (g)</th>
              <th className="px-4 py-2 text-right">Price</th>
              <th className="px-4 py-2 text-left">Effective From</th>
              <th className="px-4 py-2 text-left">Notes</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {history.map((rate) => (
              <tr key={rate.id} className="border-b">
                <td className="px-4 py-2">{rate.shipping_services.service_name}</td>
                <td className="px-4 py-2 text-right">
                  {editingId === rate.id ? (
                    <div className="flex gap-2">
                      <FormField
                        value={String(editingRate?.weight_from ?? '')}
                        onChange={(value) => setEditingRate(prev => ({ ...prev!, weight_from: parseFloat(value) }))}
                        type="number"
                        step="0.001"
                        required
                      />
                      <FormField
                        value={String(editingRate?.weight_to ?? '')}
                        onChange={(value) => setEditingRate(prev => ({ ...prev!, weight_to: parseFloat(value) }))}
                        type="number"
                        step="0.001"
                        required
                      />
                    </div>
                  ) : (
                    `${Math.round(rate.weight_from)} - ${Math.round(rate.weight_to)}g`
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  {editingId === rate.id ? (
                    <FormField
                      value={String(editingRate?.price ?? '')}
                      onChange={(value) => setEditingRate(prev => ({ ...prev!, price: parseFloat(value) }))}
                      type="number"
                      step="0.01"
                      required
                    />
                  ) : (
                    `£${rate.price.toFixed(2)}`
                  )}
                </td>
                <td className="px-4 py-2">
                  {format(new Date(rate.effective_from), 'dd MMM yyyy')}
                </td>
                <td className="px-4 py-2">
                  {editingId === rate.id ? (
                    <FormField
                      value={editingRate?.notes ?? ''}
                      onChange={(value) => setEditingRate(prev => ({ ...prev!, notes: value }))}
                      placeholder="Add notes"
                    />
                  ) : (
                    rate.notes
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  {editingId === rate.id ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStartEdit(rate)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
