
import { useProductSettingsData } from '../hooks/useProductSettingsData';
import { ShippingSettingsSection } from './settings/ShippingSettingsSection';
import { BusinessSettingsSection } from './settings/BusinessSettingsSection';
import { AmazonSettingsSection } from './settings/AmazonSettingsSection';

interface ProductSettingsTabProps {
  sku: string;
  defaultPickingFeeId?: number;
  defaultShippingServiceId?: number;
  amazonFbaTierId?: number | null;
  vatStatus?: string;
  advertisingCost?: number;
  onSettingChange: (field: string, value: any) => void;
}

export const ProductSettingsTab = ({
  sku,
  defaultPickingFeeId,
  defaultShippingServiceId,
  amazonFbaTierId,
  vatStatus,
  advertisingCost,
  onSettingChange,
}: ProductSettingsTabProps) => {
  const { pickingFees, shippingServices, amazonFbaTiers } = useProductSettingsData();

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

  const handleAdvertisingCostChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    onSettingChange('advertising_cost', isNaN(value) ? 0 : value);
  };

  return (
    <div className="grid gap-4">
      <ShippingSettingsSection
        defaultPickingFeeId={defaultPickingFeeId}
        defaultShippingServiceId={defaultShippingServiceId}
        pickingFees={pickingFees}
        shippingServices={shippingServices}
        onPickingFeeChange={handlePickingFeeChange}
        onShippingServiceChange={handleShippingServiceChange}
      />

      <BusinessSettingsSection
        vatStatus={vatStatus}
        advertisingCost={advertisingCost}
        onVatStatusChange={handleVatStatusChange}
        onAdvertisingCostChange={handleAdvertisingCostChange}
      />

      <AmazonSettingsSection
        amazonFbaTierId={amazonFbaTierId}
        amazonFbaTiers={amazonFbaTiers}
        onAmazonFbaTierChange={handleAmazonFbaTierChange}
      />
    </div>
  );
};
