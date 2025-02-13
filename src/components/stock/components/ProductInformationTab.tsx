
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabContentProps } from "../types/product-dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const ProductInformationTab = ({ product, renderFieldWithCheck }: TabContentProps) => {
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {renderFieldWithCheck("dimensions_height",
          <div>
            <Label htmlFor="dimensions_height">Height (mm)</Label>
            <Input
              id="dimensions_height"
              name="dimensions_height"
              type="number"
              defaultValue={product.dimensions_height}
            />
          </div>
        )}
        {renderFieldWithCheck("dimensions_width",
          <div>
            <Label htmlFor="dimensions_width">Width (mm)</Label>
            <Input
              id="dimensions_width"
              name="dimensions_width"
              type="number"
              defaultValue={product.dimensions_width}
            />
          </div>
        )}
        {renderFieldWithCheck("dimensions_length",
          <div>
            <Label htmlFor="dimensions_length">Length (mm)</Label>
            <Input
              id="dimensions_length"
              name="dimensions_length"
              type="number"
              defaultValue={product.dimensions_length}
            />
          </div>
        )}
      </div>
      {renderFieldWithCheck("weight",
        <div>
          <Label htmlFor="weight">Weight (g)</Label>
          <Input
            id="weight"
            name="weight"
            type="number"
            defaultValue={product.weight}
          />
        </div>
      )}
      {renderFieldWithCheck("warehouse_location",
        <div>
          <Label htmlFor="warehouse_location">Warehouse Location</Label>
          <Input
            id="warehouse_location"
            name="warehouse_location"
            defaultValue={product.warehouse_location}
          />
        </div>
      )}
      {renderFieldWithCheck("amazon_fba_tier_id",
        <div>
          <Label htmlFor="amazon_fba_tier_id">Amazon FBA Tier</Label>
          <Select name="amazon_fba_tier_id" defaultValue={product.amazon_fba_tier_id?.toString() || "null"}>
            <SelectTrigger>
              <SelectValue placeholder="Select FBA tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="null">None</SelectItem>
              {fbaTiers.map((tier) => (
                <SelectItem key={tier.id} value={tier.id.toString()}>
                  {tier.tier_name} - {tier.size_category} - £{tier.fee_amount.toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
