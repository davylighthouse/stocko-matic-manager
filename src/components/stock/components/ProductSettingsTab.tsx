
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
  onSettingChange,
}: ProductSettingsTabProps) => {
  const { pickingFees, shippingServices, amazonFbaTiers } = useProductSettingsData();

  const handlePickingFeeChange = (value: string) => {
    const formData = new FormData();
    formData.append('default_picking_fee_id', value);
    onSettingChange('default_picking_fee_id', parseInt(value));
  };

  const handleShippingServiceChange = (value: string) => {
    const formData = new FormData();
    formData.append('default_shipping_service_id', value);
    onSettingChange('default_shipping_service_id', parseInt(value));
  };

  const handleVatStatusChange = (value: string) => {
    const formData = new FormData();
    formData.append('vat_status', value);
    onSettingChange('vat_status', value);
  };

  const handleAmazonFbaTierChange = (value: string) => {
    const tierId = value === 'null' ? null : parseInt(value);
    const formData = new FormData();
    formData.append('amazon_fba_tier_id', String(tierId));
    onSettingChange('amazon_fba_tier_id', tierId);
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
        onVatStatusChange={handleVatStatusChange}
      />

      <AmazonSettingsSection
        amazonFbaTierId={amazonFbaTierId}
        amazonFbaTiers={amazonFbaTiers}
        onAmazonFbaTierChange={handleAmazonFbaTierChange}
      />
    </div>
  );
};
