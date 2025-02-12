
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
} from "@/lib/supabase/database";
import { StockCheckHeader } from "@/components/stock/StockCheckHeader";
import { StockCheckList } from "@/components/stock/StockCheckList";
import { StockCheckItemsTable } from "@/components/stock/StockCheckItemsTable";

const StockChecks = () => {
  const [selectedCheckId, setSelectedCheckId] = useState<number | null>(null);
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
    </div>
  );
};

export default StockChecks;
