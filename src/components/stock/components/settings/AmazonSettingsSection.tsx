
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AmazonSettingsSectionProps {
  amazonFbaTierId?: number | null;
  amazonFbaTiers: any[];
  onAmazonFbaTierChange: (value: string) => void;
}

export const AmazonSettingsSection = ({
  amazonFbaTierId,
  amazonFbaTiers,
  onAmazonFbaTierChange,
}: AmazonSettingsSectionProps) => {
  return (
    <div>
      <Label htmlFor="amazon-fba-tier">Amazon FBA Tier</Label>
      <Select onValueChange={onAmazonFbaTierChange} defaultValue={amazonFbaTierId?.toString() || 'null'}>
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
  );
};
