
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShippingService, VALID_COURIERS } from "../hooks/useShippingServices";

interface AddServiceFormProps {
  onAdd: (service: Omit<ShippingService, 'id'>) => void;
  onCancel: () => void;
}

export const AddServiceForm = ({ onAdd, onCancel }: AddServiceFormProps) => {
  const [newService, setNewService] = useState({
    service_name: "",
    courier: VALID_COURIERS[0],
    price: "0",
    max_weight: "0",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      service_name: newService.service_name,
      courier: newService.courier,
      price: parseFloat(newService.price),
      max_weight: parseInt(newService.max_weight),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <label htmlFor="service-name" className="text-sm font-medium">Service Name</label>
          <Input
            id="service-name"
            placeholder="Service Name"
            value={newService.service_name}
            onChange={(e) => setNewService({ ...newService, service_name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="courier" className="text-sm font-medium">Courier</label>
          <select
            id="courier"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={newService.courier}
            onChange={(e) => setNewService({ ...newService, courier: e.target.value })}
          >
            {VALID_COURIERS.map((courier) => (
              <option key={courier} value={courier}>{courier}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium">Price (£)</label>
          <Input
            id="price"
            type="number"
            step="0.01"
            placeholder="Price"
            value={newService.price}
            onChange={(e) => setNewService({ ...newService, price: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="max-weight" className="text-sm font-medium">Maximum Weight (g)</label>
          <Input
            id="max-weight"
            type="number"
            placeholder="Max Weight (g)"
            value={newService.max_weight}
            onChange={(e) => setNewService({ ...newService, max_weight: e.target.value })}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Service</Button>
      </div>
    </form>
  );
};
