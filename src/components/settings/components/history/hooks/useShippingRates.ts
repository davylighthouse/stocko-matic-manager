
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import type { ShippingRateHistory, ShippingService, NewRate } from "../types";

export const useShippingRates = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      toast({ title: "Success", description: "Rate updated successfully" });
    },
  });

  return {
    services,
    history,
    addMutation,
    updateMutation,
  };
};
