import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Save, Trash2 } from "lucide-react";
import { ShippingService, CourierSettings, VALID_COURIERS } from "../hooks/useShippingServices";
import { useToast } from "@/components/ui/use-toast";

interface ServicesTableProps {
  services: ShippingService[];
  courierSettings: CourierSettings[];
  onUpdate: (service: ShippingService) => void;
  onUpdateCourierSettings: (settings: CourierSettings) => void;
  onDelete: (id: number) => void;
}

export const ServicesTable = ({ 
  services, 
  courierSettings, 
  onUpdate, 
  onUpdateCourierSettings, 
  onDelete 
}: ServicesTableProps) => {
  const { toast } = useToast();
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [editedServices, setEditedServices] = useState<Record<number, ShippingService>>({});
  const [editedSurcharges, setEditedSurcharges] = useState<Record<string, number>>({});

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.courier]) {
      acc[service.courier] = [];
    }
    acc[service.courier].push(service);
    return acc;
  }, {} as Record<string, ShippingService[]>);

  const handleSurchargeChange = (courier: string, value: number) => {
    setEditedSurcharges(prev => ({
      ...prev,
      [courier]: value
    }));
  };

  const handleSurchargeSave = (courier: string) => {
    const courierSetting = courierSettings.find(cs => cs.courier === courier);
    if (courierSetting) {
      onUpdateCourierSettings({
        ...courierSetting,
        surcharge_percentage: editedSurcharges[courier] ?? courierSetting.surcharge_percentage
      });
      toast({
        title: "Success",
        description: "Surcharge updated successfully"
      });
    }
  };

  const handleServiceEdit = (service: ShippingService) => {
    if (editingServiceId === service.id) {
      const editedService = editedServices[service.id];
      if (editedService) {
        onUpdate(editedService);
        toast({
          title: "Success",
          description: "Service updated successfully"
        });
      }
      setEditingServiceId(null);
      setEditedServices(prev => {
        const updated = { ...prev };
        delete updated[service.id];
        return updated;
      });
    } else {
      setEditingServiceId(service.id);
      setEditedServices(prev => ({
        ...prev,
        [service.id]: { ...service }
      }));
    }
  };

  const handleServiceChange = (id: number, field: keyof ShippingService, value: any) => {
    setEditedServices(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: field === 'max_weight' ? parseInt(value) : value
      }
    }));
  };

  return (
    <div className="overflow-x-auto">
      {VALID_COURIERS.map((courier) => {
        const courierSetting = courierSettings.find(cs => cs.courier === courier);
        const currentSurcharge = editedSurcharges[courier] ?? courierSetting?.surcharge_percentage ?? 0;

        return groupedServices[courier]?.length > 0 && (
          <div key={courier} className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{courier}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Surcharge:</span>
                <Input
                  type="number"
                  step="0.01"
                  value={currentSurcharge}
                  onChange={(e) => handleSurchargeChange(courier, parseFloat(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm">%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSurchargeSave(courier)}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Service Name</th>
                  <th className="px-4 py-2 text-right">Price (£)</th>
                  <th className="px-4 py-2 text-right">Max Weight (g)</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {groupedServices[courier]?.map((service: ShippingService) => {
                  const isEditing = editingServiceId === service.id;
                  const currentService = isEditing ? editedServices[service.id] : service;

                  return (
                    <tr key={service.id} className="border-b">
                      <td className="px-4 py-2">
                        {isEditing ? (
                          <Input
                            value={currentService.service_name}
                            onChange={(e) => handleServiceChange(service.id, 'service_name', e.target.value)}
                          />
                        ) : (
                          service.service_name
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={currentService.price}
                            onChange={(e) => handleServiceChange(service.id, 'price', parseFloat(e.target.value))}
                            className="w-32 ml-auto"
                          />
                        ) : (
                          `£${service.price.toFixed(2)}`
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            step="1"
                            min="0"
                            value={Math.round(currentService.max_weight)}
                            onChange={(e) => handleServiceChange(service.id, 'max_weight', e.target.value)}
                            className="w-32 ml-auto"
                          />
                        ) : (
                          `${Math.round(service.max_weight)}g`
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleServiceEdit(service)}
                          >
                            {isEditing ? (
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
                                toast({
                                  title: "Success",
                                  description: "Service deleted successfully"
                                });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};
