
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TabContentProps } from "../types/product-dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShippingService, PickingFee } from "../types/product-dialog";

export const ProductSettingsTab = ({ product, renderFieldWithCheck }: TabContentProps) => {
  const { data: shippingServices = [] } = useQuery({
    queryKey: ['shipping-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipping_services')
        .select('id, service_name, courier')
        .order('courier, service_name');
      
      if (error) throw error;
      return data as ShippingService[];
    },
  });

  const { data: pickingFees = [] } = useQuery({
    queryKey: ['picking-fees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('picking_fees')
        .select('id, fee_name, fee_amount')
        .order('fee_name');
      
      if (error) throw error;
      return data as PickingFee[];
    },
  });

  const { data: fbaTiers = [] } = useQuery({
    queryKey: ['amazon-fba-tiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('amazon_fba_tiers')
        .select('*')
        .order('tier_name');
      
      if (error) throw error;
      return data;
    },
  });

  // Get the ID of the first picking fee if available
  const defaultPickingFeeId = pickingFees[0]?.id.toString();

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="default_shipping_service_id">Default Shipping Service</Label>
        {renderFieldWithCheck("default_shipping_service_id",
          <Select 
            name="default_shipping_service_id" 
            defaultValue={product.default_shipping_service_id?.toString()}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select shipping service" />
            </SelectTrigger>
            <SelectContent>
              {shippingServices.map((service) => (
                <SelectItem key={service.id} value={service.id.toString()}>
                  {service.courier} - {service.service_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div>
        <Label htmlFor="default_picking_fee_id">Default Picking Fee</Label>
        {renderFieldWithCheck("default_picking_fee_id",
          <Select 
            name="default_picking_fee_id" 
            defaultValue={product.default_picking_fee_id?.toString() || defaultPickingFeeId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select picking fee" />
            </SelectTrigger>
            <SelectContent>
              {pickingFees.map((fee) => (
                <SelectItem key={fee.id} value={fee.id.toString()}>
                  {fee.fee_name} (£{fee.fee_amount.toFixed(2)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div>
        <Label htmlFor="vat_status">VAT Status</Label>
        {renderFieldWithCheck("vat_status",
          <Select name="vat_status" defaultValue={product.vat_status || "standard"}>
            <SelectTrigger>
              <SelectValue placeholder="Select VAT status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard Rate</SelectItem>
              <SelectItem value="reduced">Reduced Rate</SelectItem>
              <SelectItem value="zero">Zero Rate</SelectItem>
              <SelectItem value="exempt">Exempt</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <div>
        <Label htmlFor="promoted_listing_percentage">eBay Promoted Listing Percentage</Label>
        {renderFieldWithCheck("promoted_listing_percentage",
          <Input
            type="number"
            name="promoted_listing_percentage"
            step="0.1"
            min="0"
            max="100"
            defaultValue={product.promoted_listing_percentage?.toString() || "0"}
            placeholder="Enter percentage (e.g. 2.5)"
          />
        )}
      </div>

      <div>
        <Label htmlFor="amazon_fba_tier_id">Amazon FBA Tier</Label>
        {renderFieldWithCheck("amazon_fba_tier_id",
          <Select 
            name="amazon_fba_tier_id" 
            defaultValue={product.amazon_fba_tier_id?.toString() || ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select FBA tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {fbaTiers.map((tier) => (
                <SelectItem key={tier.id} value={tier.id.toString()}>
                  {tier.tier_name} - {tier.size_category} (£{tier.fee_amount.toFixed(2)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};
