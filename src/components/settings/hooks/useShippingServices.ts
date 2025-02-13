
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface ShippingService {
  id: number;
  service_name: string;
  courier: string;
  surcharge_percentage: number;
  max_weight: number;
}

export const VALID_COURIERS = ["Royal Mail", "Evri", "APC Overnight"];

export const useShippingServices = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services = [] } = useQuery({
    queryKey: ['shipping-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipping_services')
        .select('*')
        .order('courier, service_name');
      
      if (error) throw error;
      
      return (data || []).map(service => ({
        id: service.id,
        service_name: service.service_name,
        courier: service.courier,
        surcharge_percentage: service.surcharge_percentage,
        max_weight: service.max_weight || 0
      })) as ShippingService[];
    },
  });

  const addServiceMutation = useMutation({
    mutationFn: async (service: Omit<ShippingService, 'id'>) => {
      const { error } = await supabase
        .from('shipping_services')
        .insert([service]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-services'] });
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

  return {
    services,
    addServiceMutation,
    updateServiceMutation,
    deleteServiceMutation,
  };
};
