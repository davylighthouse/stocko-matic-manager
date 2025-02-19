
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { useShippingRates } from "./hooks/useShippingRates";
import { AddRateForm } from "./components/AddRateForm";
import { RatesTable } from "./components/RatesTable";
import type { ShippingRateHistory } from "./types";

export const ShippingRatesHistory = () => {
  const { services, history, addMutation, updateMutation } = useShippingRates();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingRate, setEditingRate] = useState<Partial<ShippingRateHistory> | null>(null);
  const [newRate, setNewRate] = useState({
    service_id: "",
    weight_from: "",
    weight_to: "",
    price: "",
    effective_from: new Date(),
    notes: "",
  });

  const handleStartEdit = (rate: ShippingRateHistory) => {
    setEditingId(rate.id);
    setEditingRate({
      id: rate.id,
      weight_from: rate.weight_from,
      weight_to: rate.weight_to,
      price: rate.price,
      notes: rate.notes,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingRate(null);
  };

  const handleSaveEdit = () => {
    if (editingRate) {
      updateMutation.mutate(editingRate);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addMutation.mutate({
      service_id: parseInt(newRate.service_id),
      weight_from: parseFloat(newRate.weight_from),
      weight_to: parseFloat(newRate.weight_to),
      price: parseFloat(newRate.price),
      effective_from: format(newRate.effective_from, 'yyyy-MM-dd'),
      notes: newRate.notes || null,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setNewRate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewRate({
      service_id: "",
      weight_from: "",
      weight_to: "",
      price: "",
      effective_from: new Date(),
      notes: "",
    });
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Shipping Rate History</h3>
        <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Historical Rate
        </Button>
      </div>

      {isAdding && (
        <AddRateForm
          services={services}
          newRate={newRate}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      <RatesTable
        history={history}
        editingId={editingId}
        editingRate={editingRate}
        onStartEdit={handleStartEdit}
        onCancelEdit={handleCancelEdit}
        onSaveEdit={handleSaveEdit}
        setEditingRate={setEditingRate}
      />
    </Card>
  );
};
