
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { FormField } from "../shared/FormField";
import { DatePickerField } from "../shared/DatePickerField";
import type { ShippingService, NewRate } from "../types";

interface AddRateFormProps {
  services: ShippingService[];
  newRate: NewRate;
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const AddRateForm = ({ 
  services, 
  newRate, 
  onInputChange, 
  onSubmit, 
  onCancel 
}: AddRateFormProps) => {
  const handleFormClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <form onSubmit={onSubmit} onClick={handleFormClick} className="mb-6 p-4 border rounded-lg space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Shipping Service</label>
          <select 
            className="w-full px-3 py-2 rounded-md border"
            value={newRate.service_id}
            onChange={(e) => onInputChange('service_id', e.target.value)}
            required
          >
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.service_name}
              </option>
            ))}
          </select>
        </div>
        <DatePickerField
          label="Effective From"
          date={newRate.effective_from}
          onChange={(date) => date && onInputChange('effective_from', date.toISOString())}
        />
        <FormField
          label="Weight From (kg)"
          value={newRate.weight_from}
          onChange={(value) => onInputChange('weight_from', value)}
          placeholder="Minimum weight"
          type="number"
          step="0.001"
          required
        />
        <FormField
          label="Weight To (kg)"
          value={newRate.weight_to}
          onChange={(value) => onInputChange('weight_to', value)}
          placeholder="Maximum weight"
          type="number"
          step="0.001"
          required
        />
        <FormField
          label="Price"
          value={newRate.price}
          onChange={(value) => onInputChange('price', value)}
          placeholder="Rate price"
          type="number"
          step="0.01"
          required
        />
        <FormField
          label="Notes"
          value={newRate.notes}
          onChange={(value) => onInputChange('notes', value)}
          placeholder="Add notes about this change"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Rate</Button>
      </div>
    </form>
  );
};
