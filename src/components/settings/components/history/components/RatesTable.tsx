
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X } from "lucide-react";
import { FormField } from "../shared/FormField";
import type { ShippingRateHistory } from "../types";

interface RatesTableProps {
  history: ShippingRateHistory[];
  editingId: number | null;
  editingRate: Partial<ShippingRateHistory> | null;
  onStartEdit: (rate: ShippingRateHistory) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  setEditingRate: (rate: Partial<ShippingRateHistory>) => void;
}

export const RatesTable = ({
  history,
  editingId,
  editingRate,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  setEditingRate,
}: RatesTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2 text-left">Service</th>
            <th className="px-4 py-2 text-right">Weight Range (g)</th>
            <th className="px-4 py-2 text-right">Price</th>
            <th className="px-4 py-2 text-left">Effective From</th>
            <th className="px-4 py-2 text-left">Notes</th>
            <th className="px-4 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {history.map((rate) => (
            <tr key={rate.id} className="border-b">
              <td className="px-4 py-2">{rate.shipping_services.service_name}</td>
              <td className="px-4 py-2 text-right">
                {editingId === rate.id ? (
                  <div className="flex gap-2">
                    <FormField
                      label="From"
                      value={String(editingRate?.weight_from ?? '')}
                      onChange={(value) => setEditingRate({ ...editingRate!, weight_from: parseFloat(value) })}
                      type="number"
                      step="0.001"
                      required
                    />
                    <FormField
                      label="To"
                      value={String(editingRate?.weight_to ?? '')}
                      onChange={(value) => setEditingRate({ ...editingRate!, weight_to: parseFloat(value) })}
                      type="number"
                      step="0.001"
                      required
                    />
                  </div>
                ) : (
                  `${Math.round(rate.weight_from)} - ${Math.round(rate.weight_to)}g`
                )}
              </td>
              <td className="px-4 py-2 text-right">
                {editingId === rate.id ? (
                  <FormField
                    label="Price"
                    value={String(editingRate?.price ?? '')}
                    onChange={(value) => setEditingRate({ ...editingRate!, price: parseFloat(value) })}
                    type="number"
                    step="0.01"
                    required
                  />
                ) : (
                  `£${rate.price.toFixed(2)}`
                )}
              </td>
              <td className="px-4 py-2">
                {format(new Date(rate.effective_from), 'dd MMM yyyy')}
              </td>
              <td className="px-4 py-2">
                {editingId === rate.id ? (
                  <FormField
                    label="Notes"
                    value={editingRate?.notes ?? ''}
                    onChange={(value) => setEditingRate({ ...editingRate!, notes: value })}
                    placeholder="Add notes"
                  />
                ) : (
                  rate.notes
                )}
              </td>
              <td className="px-4 py-2 text-right">
                {editingId === rate.id ? (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onCancelEdit}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={onSaveEdit}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStartEdit(rate)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
