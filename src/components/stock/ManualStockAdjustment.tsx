
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { Product } from "@/types/database";

interface ManualStockAdjustmentProps {
  products: Product[];
  onAdjustStock: (sku: string, quantity: number, notes: string) => void;
}

export const ManualStockAdjustment = ({ products, onAdjustStock }: ManualStockAdjustmentProps) => {
  const [open, setOpen] = useState(false);
  const [selectedSku, setSelectedSku] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSku && quantity) {
      onAdjustStock(selectedSku, parseInt(quantity), notes);
      setOpen(false);
      setSelectedSku("");
      setQuantity("");
      setNotes("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Adjustment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Stock Adjustment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">SKU</label>
            <Select value={selectedSku} onValueChange={setSelectedSku}>
              <SelectTrigger>
                <SelectValue placeholder="Select SKU" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.sku} value={product.sku}>
                    {product.sku} - {product.listing_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Adjustment Quantity</label>
            <Input
              type="number"
              placeholder="Enter quantity (positive for addition, negative for reduction)"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              placeholder="Enter reason for adjustment"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Confirm Adjustment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
