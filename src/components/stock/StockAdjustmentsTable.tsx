
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import { CurrentStockLevel } from "@/types/stock-checks";

interface StockAdjustmentsTableProps {
  currentStock: CurrentStockLevel[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAdjustStock: (sku: string) => void;
}

export const StockAdjustmentsTable = ({
  currentStock,
  searchTerm,
  onSearchChange,
  onAdjustStock,
}: StockAdjustmentsTableProps) => {
  const filteredStock = currentStock?.filter(item =>
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.listing_title.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Stock Adjustments</h2>
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
                <th className="px-4 py-2 text-right">Initial Stock</th>
                <th className="px-4 py-2 text-right">Sold</th>
                <th className="px-4 py-2 text-right">Adjustments</th>
                <th className="px-4 py-2 text-right">Current Stock</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.map((item) => (
                <tr key={item.sku} className="border-b">
                  <td className="px-4 py-2">{item.sku}</td>
                  <td className="px-4 py-2">{item.listing_title}</td>
                  <td className="px-4 py-2 text-right">{item.initial_stock}</td>
                  <td className="px-4 py-2 text-right">{item.quantity_sold}</td>
                  <td className="px-4 py-2 text-right">{item.adjustments}</td>
                  <td className="px-4 py-2 text-right">{item.current_stock}</td>
                  <td className="px-4 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAdjustStock(item.sku)}
                    >
                      Adjust
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};
