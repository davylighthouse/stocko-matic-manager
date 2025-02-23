
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ShippingSettingsSectionProps {
  defaultPickingFeeId?: number;
  defaultShippingServiceId?: number;
  pickingFees: any[];
  shippingServices: any[];
  onPickingFeeChange: (value: string) => void;
  onShippingServiceChange: (value: string) => void;
}

export const ShippingSettingsSection = ({
  defaultPickingFeeId,
  defaultShippingServiceId,
  pickingFees,
  shippingServices,
  onPickingFeeChange,
  onShippingServiceChange,
}: ShippingSettingsSectionProps) => {
  return (
    <>
      <div>
        <Label htmlFor="picking-fee">Default Picking Fee</Label>
        <Select onValueChange={onPickingFeeChange} defaultValue={defaultPickingFeeId?.toString()}>
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
        <Select onValueChange={onShippingServiceChange} defaultValue={defaultShippingServiceId?.toString()}>
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
    </>
  );
};
