import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  createStockCheck,
  getStockChecks,
  getStockLevels,
  getStockCheckItems,
  updateStockCheckItem,
  completeStockCheck,
  generateStockCheckTemplate,
  processStockCheckCSV,
  getCurrentStockLevels,
  setInitialStock,
  addStockAdjustment,
  processInitialStockCSV,
} from "@/lib/supabase/database";
import { StockCheckHeader } from "@/components/stock/StockCheckHeader";
import { StockCheckList } from "@/components/stock/StockCheckList";
import { StockCheckItemsTable } from "@/components/stock/StockCheckItemsTable";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const StockChecks = () => {
  const [selectedCheckId, setSelectedCheckId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stockChecks = [] } = useQuery({
    queryKey: ['stock-checks'],
    queryFn: getStockChecks,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getStockLevels,
  });

  const { data: selectedCheckItems = [] } = useQuery({
    queryKey: ['stock-check-items', selectedCheckId],
    queryFn: () => selectedCheckId ? getStockCheckItems(selectedCheckId) : Promise.resolve([]),
    enabled: !!selectedCheckId,
  });

  const { data: currentStock = [] } = useQuery({
    queryKey: ['current-stock-levels'],
    queryFn: getCurrentStockLevels,
  });

  const createStockCheckMutation = useMutation({
    mutationFn: createStockCheck,
    onSuccess: (newCheck) => {
      queryClient.invalidateQueries({ queryKey: ['stock-checks'] });
      setSelectedCheckId(newCheck.id);
      toast({
        title: "Success",
        description: "New stock check created",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ stockCheckId, sku, data }: {
      stockCheckId: number;
      sku: string;
      data: { quantity: number; product_cost?: number; warehouse_location?: string; }
    }) => updateStockCheckItem(stockCheckId, sku, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-check-items', selectedCheckId] });
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
    },
  });

  const completeCheckMutation = useMutation({
    mutationFn: completeStockCheck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-checks'] });
      toast({
        title: "Success",
        description: "Stock check completed",
      });
    },
  });

  const initialStockMutation = useMutation({
    mutationFn: setInitialStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-stock-levels'] });
      toast({
        title: "Success",
        description: "Initial stock set successfully",
      });
    },
  });

  const stockAdjustmentMutation = useMutation({
    mutationFn: addStockAdjustment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-stock-levels'] });
      toast({
        title: "Success",
        description: "Stock adjustment added successfully",
      });
    },
  });

  const handleUpdateItem = async (sku: string) => {
    if (!selectedCheckId) return;

    const quantity = prompt("Enter quantity:");
    if (quantity === null) return;

    const productCost = prompt("Enter product cost (optional):");
    const location = prompt("Enter warehouse location (optional):");

    updateItemMutation.mutate({
      stockCheckId: selectedCheckId,
      sku,
      data: {
        quantity: parseInt(quantity),
        ...(productCost ? { product_cost: parseFloat(productCost) } : {}),
        ...(location ? { warehouse_location: location } : {}),
      },
    });
  };

  const handleNewStockCheck = async () => {
    const notes = prompt("Enter notes for this stock check (optional):");
    if (notes !== null) {
      createStockCheckMutation.mutate(notes || undefined);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedCheckId) {
      toast({
        title: "Error",
        description: "Please select a file and ensure a stock check is selected",
        variant: "destructive",
      });
      return;
    }

    const result = await processStockCheckCSV(file, selectedCheckId);
    
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ['stock-check-items', selectedCheckId] });
      toast({
        title: "Success",
        description: "Stock check data processed successfully",
      });

      if (result.discrepancies && result.discrepancies.length > 0) {
        const reportContent = result.discrepancies.map(d => 
          `${d.sku} (${d.product_title}): Current Stock: ${d.current_stock}, Check Quantity: ${d.check_quantity}, Difference: ${d.difference}`
        ).join('\n');

        toast({
          title: "Stock Discrepancies Found",
          description: `${result.discrepancies.length} discrepancies found. Check the notes for details.`,
        });

        const { error } = await supabase
          .from('stock_checks')
          .update({ 
            notes: `Discrepancy Report:\n${reportContent}`
          })
          .eq('id', selectedCheckId);

        if (!error) {
          queryClient.invalidateQueries({ queryKey: ['stock-checks'] });
        }
      }
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleInitialStockUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await processInitialStockCSV(file);
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ['current-stock-levels'] });
      toast({
        title: "Success",
        description: "Initial stock data processed successfully",
      });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleStockAdjustment = async (sku: string) => {
    const quantity = prompt("Enter quantity (positive for addition, negative for reduction):");
    if (quantity === null) return;

    const notes = prompt("Enter notes for this adjustment:");
    
    await stockAdjustmentMutation.mutate({
      sku,
      quantity: parseInt(quantity),
      notes: notes || undefined,
    });
  };

  const filteredStock = currentStock.filter(item =>
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.listing_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <StockCheckHeader
        onNewCheck={handleNewStockCheck}
        onDownloadTemplate={generateStockCheckTemplate}
        onUploadClick={() => {
          if (!selectedCheckId) {
            toast({
              title: "Error",
              description: "Please create and select a stock check first",
              variant: "destructive",
            });
            return;
          }
          document.getElementById('file-upload')?.click();
        }}
        selectedCheckId={selectedCheckId}
      />
      <input
        id="file-upload"
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StockCheckList
          stockChecks={stockChecks}
          selectedCheckId={selectedCheckId}
          onSelectCheck={setSelectedCheckId}
        />
        <StockCheckItemsTable
          selectedCheckId={selectedCheckId}
          products={products}
          selectedCheckItems={selectedCheckItems}
          onUpdateItem={handleUpdateItem}
          onComplete={completeCheckMutation.mutate}
        />
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Initial Stock Upload</h2>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Upload initial stock levels with effective dates. This will be used as the baseline for stock calculations.
          </p>
          <Input
            type="file"
            accept=".csv"
            onChange={handleInitialStockUpload}
            className="mb-4"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Stock Adjustments</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by SKU or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                        onClick={() => handleStockAdjustment(item.sku)}
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
    </div>
  );
};

export default StockChecks;
