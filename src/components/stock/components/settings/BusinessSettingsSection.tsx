
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BusinessSettingsSectionProps {
  vatStatus?: string;
  onVatStatusChange: (value: string) => void;
}

export const BusinessSettingsSection = ({
  vatStatus,
  onVatStatusChange,
}: BusinessSettingsSectionProps) => {
  return (
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
  );
};
