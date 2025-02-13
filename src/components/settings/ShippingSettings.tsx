
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useShippingServices } from "./hooks/useShippingServices";
import { AddServiceForm } from "./components/AddServiceForm";
import { ServicesTable } from "./components/ServicesTable";

export const ShippingSettings = () => {
  const [isAddingService, setIsAddingService] = useState(false);
  const { 
    services, 
    courierSettings,
    addServiceMutation, 
    updateServiceMutation,
    updateCourierSettingsMutation,
    deleteServiceMutation 
  } = useShippingServices();

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Shipping Services</h2>
        <Button onClick={() => setIsAddingService(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </div>

      {isAddingService && (
        <AddServiceForm
          onAdd={(service) => {
            addServiceMutation.mutate(service);
            setIsAddingService(false);
          }}
          onCancel={() => setIsAddingService(false)}
        />
      )}

      <ServicesTable
        services={services}
        courierSettings={courierSettings}
        onUpdate={updateServiceMutation.mutate}
        onUpdateCourierSettings={updateCourierSettingsMutation.mutate}
        onDelete={deleteServiceMutation.mutate}
      />
    </Card>
  );
};
