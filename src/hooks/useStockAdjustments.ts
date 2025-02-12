
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import {
  getCurrentStockLevels,
  setInitialStock,
  addStockAdjustment,
  processInitialStockCSV,
} from "@/lib/supabase/database/stock-checks";

export const useStockAdjustments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentStock = [] } = useQuery({
    queryKey: ['current-stock-levels'],
    queryFn: getCurrentStockLevels,
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

  const handleInitialStockUpload = async (file: File) => {
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

  return {
    searchTerm,
    setSearchTerm,
    currentStock,
    setInitialStock: initialStockMutation.mutate,
    addStockAdjustment: stockAdjustmentMutation.mutate,
    handleInitialStockUpload,
  };
};
