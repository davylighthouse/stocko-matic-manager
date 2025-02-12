
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  createStockCheck,
  getStockChecks,
  getStockCheckItems,
  updateStockCheckItem,
  completeStockCheck,
  processStockCheckCSV,
} from "@/lib/supabase/database";

export const useStockChecks = () => {
  const [selectedCheckId, setSelectedCheckId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stockChecks = [] } = useQuery({
    queryKey: ['stock-checks'],
    queryFn: getStockChecks,
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

  const handleFileUpload = async (file: File) => {
    if (!selectedCheckId) {
      toast({
        title: "Error",
        description: "Please select a stock check first",
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

  return {
    selectedCheckId,
    setSelectedCheckId,
    stockChecks,
    selectedCheckItems,
    createStockCheck: createStockCheckMutation.mutate,
    updateItem: updateItemMutation.mutate,
    completeCheck: completeCheckMutation.mutate,
    handleFileUpload,
  };
};
