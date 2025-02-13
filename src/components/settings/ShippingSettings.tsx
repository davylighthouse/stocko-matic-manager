
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Save, Weight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ShippingService {
  id: number;
  service_name: string;
  courier: string;
  surcharge_percentage: number;
  max_weight: number;
}

const VALID_COURIERS = ["Royal Mail", "Evri", "APC Overnight"];

export const ShippingSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [isAddingService, setIsAddingService] = useState(false);
  const [newService, setNewService] = useState({
    service_name: "",
    courier: VALID_COURIERS[0],
    surcharge_percentage: "0",
    max_weight: "0",
  });

  const { data: services = [] } = useQuery({
    queryKey: ['shipping-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipping_services')
        .select('*')
        .order('courier, service_name');
      
      if (error) throw error;
      
      // Transform the data to ensure max_weight is included with a default value if missing
      return (data || []).map(service => ({
        id: service.id,
        service_name: service.service_name,
        courier: service.courier,
        surcharge_percentage: service.surcharge_percentage,
        max_weight: service.max_weight || 0
      })) as ShippingService[];
    },
  });

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.courier]) {
      acc[service.courier] = [];
    }
    acc[service.courier].push(service);
    return acc;
  }, {} as Record<string, ShippingService[]>);

  const addServiceMutation = useMutation({
    mutationFn: async (service: Omit<ShippingService, 'id'>) => {
      const { error } = await supabase
        .from('shipping_services')
        .insert([service]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-services'] });
      setIsAddingService(false);
      setNewService({ service_name: "", courier: VALID_COURIERS[0], surcharge_percentage: "0", max_weight: "0" });
      toast({ title: "Success", description: "Shipping service added successfully" });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, ...service }: ShippingService) => {
      const { error } = await supabase
        .from('shipping_services')
        .update(service)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-services'] });
      setEditingServiceId(null);
      toast({ title: "Success", description: "Shipping service updated successfully" });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('shipping_services')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-services'] });
      toast({ title: "Success", description: "Shipping service deleted successfully" });
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addServiceMutation.mutate({
      service_name: newService.service_name,
      courier: newService.courier,
      surcharge_percentage: parseFloat(newService.surcharge_percentage),
      max_weight: parseInt(newService.max_weight),
    });
  };

  const handleUpdateSubmit = (service: ShippingService) => {
    updateServiceMutation.mutate(service);
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Shipping Services</h2>
        <Button onClick={() => setIsAddingService(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </div>

      {isAddingService && (
        <form onSubmit={handleAddSubmit} className="mb-6 p-4 border rounded-lg space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <Input
              placeholder="Service Name"
              value={newService.service_name}
              onChange={(e) => setNewService({ ...newService, service_name: e.target.value })}
            />
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={newService.courier}
              onChange={(e) => setNewService({ ...newService, courier: e.target.value })}
            >
              {VALID_COURIERS.map((courier) => (
                <option key={courier} value={courier}>{courier}</option>
              ))}
            </select>
            <Input
              type="number"
              step="0.01"
              placeholder="Surcharge %"
              value={newService.surcharge_percentage}
              onChange={(e) => setNewService({ ...newService, surcharge_percentage: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Max Weight (g)"
              value={newService.max_weight}
              onChange={(e) => setNewService({ ...newService, max_weight: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsAddingService(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Service</Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        {VALID_COURIERS.map((courier) => (
          groupedServices[courier]?.length > 0 && (
            <div key={courier} className="mb-8">
              <h3 className="text-lg font-medium mb-4">{courier}</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Service Name</th>
                    <th className="px-4 py-2 text-right">Weight (g)</th>
                    <th className="px-4 py-2 text-right">Surcharge %</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {groupedServices[courier]?.map((service: ShippingService) => (
                    <tr key={service.id} className="border-b">
                      <td className="px-4 py-2">
                        {editingServiceId === service.id ? (
                          <Input
                            value={service.service_name}
                            onChange={(e) => {
                              const updated = { ...service, service_name: e.target.value };
                              handleUpdateSubmit(updated);
                            }}
                          />
                        ) : (
                          service.service_name
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {editingServiceId === service.id ? (
                          <Input
                            type="number"
                            value={service.max_weight}
                            onChange={(e) => {
                              const updated = { ...service, max_weight: parseInt(e.target.value) };
                              handleUpdateSubmit(updated);
                            }}
                            className="w-32 ml-auto"
                          />
                        ) : (
                          `${service.max_weight}g`
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {editingServiceId === service.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={service.surcharge_percentage}
                            onChange={(e) => {
                              const updated = { ...service, surcharge_percentage: parseFloat(e.target.value) };
                              handleUpdateSubmit(updated);
                            }}
                            className="w-32 ml-auto"
                          />
                        ) : (
                          `${service.surcharge_percentage}%`
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingServiceId(editingServiceId === service.id ? null : service.id)}
                          >
                            {editingServiceId === service.id ? (
                              <Save className="h-4 w-4" />
                            ) : (
                              <Pencil className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this service?')) {
                                deleteServiceMutation.mutate(service.id);
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
          )
        ))}
      </div>
    </Card>
  );
};
