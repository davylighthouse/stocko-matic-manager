
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const useProductSettingsData = () => {
  const { data: pickingFees = [] } = useQuery({
    queryKey: ['picking-fees'],
    queryFn: async () => {
      const { data: currentPickingFees } = await supabase
        .from('current_picking_fees')
        .select('*');
      return currentPickingFees || [];
    },
  });

  const { data: shippingServices = [] } = useQuery({
    queryKey: ['shipping-services'],
    queryFn: async () => {
      const { data: currentShippingServices } = await supabase
        .from('shipping_services')
        .select('*');
      return currentShippingServices || [];
    },
  });

  const { data: amazonFbaTiers = [] } = useQuery({
    queryKey: ['amazon-fba-tiers'],
    queryFn: async () => {
      const { data } = await supabase
        .from('amazon_fba_tiers')
        .select('*')
        .order('tier_name');
      return data || [];
    },
  });

  return {
    pickingFees,
    shippingServices,
    amazonFbaTiers,
  };
};
