
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BusinessSettingsSectionProps {
  vatStatus?: string;
  advertisingCost?: number;
  onVatStatusChange: (value: string) => void;
  onAdvertisingCostChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BusinessSettingsSection = ({
  vatStatus,
  advertisingCost,
  onVatStatusChange,
  onAdvertisingCostChange,
}: BusinessSettingsSectionProps) => {
  return (
    <>
      <div>
        <Label htmlFor="advertising_cost">Promotion Rate (%)</Label>
        <Input
          id="advertising_cost"
          name="advertising_cost"
          type="number"
          step="0.01"
          min="0"
          max="100"
          defaultValue={advertisingCost?.toString() ?? "0"}
          onChange={onAdvertisingCostChange}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="vat_status">VAT Status</Label>
        <Select onValueChange={onVatStatusChange} defaultValue={vatStatus}>
          <SelectTrigger id="vat_status">
            <SelectValue placeholder="Select VAT status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="exempt">Exempt</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
