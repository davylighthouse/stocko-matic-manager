
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Check, Edit2 } from "lucide-react";
import { CurrentStockLevel } from "@/types/stock-checks";
import { ManualStockAdjustment } from "./ManualStockAdjustment";
import { Product } from "@/types/database";
import { AdjustmentsHistoryDialog } from "./AdjustmentsHistoryDialog";

interface StockAdjustmentsTableProps {
  currentStock: CurrentStockLevel[];
  products: Product[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAdjustStock: (sku: string, quantity: number, notes?: string) => void;
}

export const StockAdjustmentsTable = ({
  currentStock,
  products,
  searchTerm,
  onSearchChange,
  onAdjustStock,
}: StockAdjustmentsTableProps) => {
  const [editingSku, setEditingSku] = useState<string | null>(null);
  const [editedCurrentStock, setEditedCurrentStock] = useState<number | null>(null);
  const [editedInitialStock, setEditedInitialStock] = useState<number | null>(null);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const filteredStock = currentStock?.filter(item =>
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.listing_title.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  const handleAdjustClick = (item: CurrentStockLevel) => {
    if (editingSku === item.sku) {
      // Confirm the edit
      if (editedCurrentStock !== null) {
        onAdjustStock(item.sku, editedCurrentStock - item.current_stock);
      }
      setEditingSku(null);
      setEditedCurrentStock(null);
      setEditedInitialStock(null);
    } else {
      // Start editing
      setEditingSku(item.sku);
      setEditedCurrentStock(item.current_stock);
      setEditedInitialStock(item.initial_stock);
    }
  };

  const handleShowHistory = (sku: string) => {
    setSelectedSku(sku);
    setIsHistoryOpen(true);
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Stock Adjustments</h2>
        <ManualStockAdjustment products={products} onAdjustStock={onAdjustStock} />
      </div>
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by SKU or title..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">SKU</th>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-right">Current Stock</th>
                <th className="px-4 py-2 text-right">Sold</th>
                <th className="px-4 py-2 text-right">Adjustments</th>
                <th className="px-4 py-2 text-right">Initial Stock</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.map((item) => (
                <tr key={item.sku} className="border-b">
                  <td className="px-4 py-2">{item.sku}</td>
                  <td className="px-4 py-2">{item.listing_title}</td>
                  <td className="px-4 py-2 text-right">
                    {editingSku === item.sku ? (
                      <Input
                        type="number"
                        value={editedCurrentStock ?? ""}
                        onChange={(e) => setEditedCurrentStock(parseInt(e.target.value))}
                        className="w-24 text-right inline-block"
                      />
                    ) : (
                      item.current_stock
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">{item.quantity_sold}</td>
                  <td className="px-4 py-2 text-right">
                    <Button
                      variant="link"
                      className="px-2"
                      onClick={() => handleShowHistory(item.sku)}
                    >
                      {item.adjustments}
                    </Button>
                  </td>
                  <td className="px-4 py-2 text-right">
                    {editingSku === item.sku ? (
                      <Input
                        type="number"
                        value={editedInitialStock ?? ""}
                        onChange={(e) => setEditedInitialStock(parseInt(e.target.value))}
                        className="w-24 text-right inline-block"
                      />
                    ) : (
                      item.initial_stock
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <Button
                      variant={editingSku === item.sku ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleAdjustClick(item)}
                    >
                      {editingSku === item.sku ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Confirm
                        </>
                      ) : (
                        <>
                          <Edit2 className="h-4 w-4 mr-1" />
                          Adjust
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSku && (
        <AdjustmentsHistoryDialog
          sku={selectedSku}
          open={isHistoryOpen}
          onOpenChange={setIsHistoryOpen}
        />
      )}
    </Card>
  );
};
