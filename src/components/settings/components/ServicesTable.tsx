
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Save, Trash2 } from "lucide-react";
import { ShippingService, VALID_COURIERS } from "../hooks/useShippingServices";

interface ServicesTableProps {
  services: ShippingService[];
  onUpdate: (service: ShippingService) => void;
  onDelete: (id: number) => void;
}

export const ServicesTable = ({ services, onUpdate, onDelete }: ServicesTableProps) => {
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.courier]) {
      acc[service.courier] = [];
    }
    acc[service.courier].push(service);
    return acc;
  }, {} as Record<string, ShippingService[]>);

  return (
    <div className="overflow-x-auto">
      {VALID_COURIERS.map((courier) => (
        groupedServices[courier]?.length > 0 && (
          <div key={courier} className="mb-8">
            <h3 className="text-lg font-medium mb-4">{courier}</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Service Name</th>
                  <th className="px-4 py-2 text-right">Weight (g)</th>
                  <th className="px-4 py-2 text-right">Surcharge %</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {groupedServices[courier]?.map((service: ShippingService) => (
                  <tr key={service.id} className="border-b">
                    <td className="px-4 py-2">
                      {editingServiceId === service.id ? (
                        <Input
                          value={service.service_name}
                          onChange={(e) => {
                            const updated = { ...service, service_name: e.target.value };
                            onUpdate(updated);
                          }}
                        />
                      ) : (
                        service.service_name
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {editingServiceId === service.id ? (
                        <Input
                          type="number"
                          value={service.max_weight}
                          onChange={(e) => {
                            const updated = { ...service, max_weight: parseInt(e.target.value) };
                            onUpdate(updated);
                          }}
                          className="w-32 ml-auto"
                        />
                      ) : (
                        `${service.max_weight}g`
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {editingServiceId === service.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={service.surcharge_percentage}
                          onChange={(e) => {
                            const updated = { ...service, surcharge_percentage: parseFloat(e.target.value) };
                            onUpdate(updated);
                          }}
                          className="w-32 ml-auto"
                        />
                      ) : (
                        `${service.surcharge_percentage}%`
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingServiceId(editingServiceId === service.id ? null : service.id)}
                        >
                          {editingServiceId === service.id ? (
                            <Save className="h-4 w-4" />
                          ) : (
                            <Pencil className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this service?')) {
                              onDelete(service.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ))}
    </div>
  );
};
