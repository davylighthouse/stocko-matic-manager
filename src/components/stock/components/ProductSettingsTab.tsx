import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface ProductSettingsTabProps {
  sku: string;
  defaultPickingFeeId?: number;
  defaultShippingServiceId?: number;
  amazonFbaTierId?: number | null;
  vatStatus?: string;
  onSettingChange: (field: string, value: any) => void;
}

export const ProductSettingsTab = ({
  sku,
  defaultPickingFeeId,
  defaultShippingServiceId,
  amazonFbaTierId,
  vatStatus,
  onSettingChange,
}: ProductSettingsTabProps) => {
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
        .from('current_shipping_services')
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

  const handlePickingFeeChange = (value: string) => {
    const pickingFeeId = parseInt(value);
    onSettingChange('default_picking_fee_id', pickingFeeId);
  };

  const handleShippingServiceChange = (value: string) => {
    const shippingServiceId = parseInt(value);
    onSettingChange('default_shipping_service_id', shippingServiceId);
  };

  const handleVatStatusChange = (value: string) => {
    onSettingChange('vat_status', value);
  };

  const handleAmazonFbaTierChange = (value: string) => {
    const tierId = value === 'null' ? null : parseInt(value);
    onSettingChange('amazon_fba_tier_id', tierId);
  };

  return (
    <div className="grid gap-4">
      <div>
        <Label htmlFor="picking-fee">Default Picking Fee</Label>
        <Select onValueChange={handlePickingFeeChange} defaultValue={defaultPickingFeeId?.toString()}>
          <SelectTrigger id="picking-fee">
            <SelectValue placeholder="Select picking fee" />
          </SelectTrigger>
          <SelectContent>
            {pickingFees.map((fee) => (
              <SelectItem key={fee.id} value={fee.id.toString()}>
                {fee.fee_name} (£{fee.fee_amount})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="shipping-service">Default Shipping Service</Label>
        <Select onValueChange={handleShippingServiceChange} defaultValue={defaultShippingServiceId?.toString()}>
          <SelectTrigger id="shipping-service">
            <SelectValue placeholder="Select shipping service" />
          </SelectTrigger>
          <SelectContent>
            {shippingServices.map((service) => (
              <SelectItem key={service.id} value={service.id.toString()}>
                {service.service_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="vat-status">VAT Status</Label>
        <Select onValueChange={handleVatStatusChange} defaultValue={vatStatus}>
          <SelectTrigger id="vat-status">
            <SelectValue placeholder="Select VAT status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="exempt">Exempt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="amazon-fba-tier">Amazon FBA Tier</Label>
        <Select onValueChange={handleAmazonFbaTierChange} defaultValue={amazonFbaTierId?.toString() || 'null'}>
          <SelectTrigger id="amazon-fba-tier">
            <SelectValue placeholder="Select Amazon FBA Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="null">None</SelectItem>
            {amazonFbaTiers.map((tier) => (
              <SelectItem key={tier.id} value={tier.id.toString()}>
                {tier.tier_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
