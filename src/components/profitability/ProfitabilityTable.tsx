
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProfitabilityTableProps, ProfitabilityData } from "./types";
import { EditableRow } from "./EditableRow";
import { ViewRow } from "./ViewRow";
import { ProfitabilityTableHeader } from "./TableHeader";
import { updateSaleProfitability } from "@/lib/supabase/database/sales";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const ProfitabilityTable = ({ sales }: ProfitabilityTableProps) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<Partial<ProfitabilityData>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [columnWidths, setColumnWidths] = useState({
    date: 120,
    platform: 100,
    sku: 120,
    title: 200,
    quantity: 80,
    salePrice: 100,
    productCost: 100,
    platformFees: 100,
    shipping: 100,
    vat: 100,
    totalCosts: 100,
    profit: 100,
    margin: 100,
  });

  const handleResize = (column: string, width: number) => {
    setColumnWidths(prev => ({
      ...prev,
      [column]: width
    }));
  };

  const handleEdit = (sale: ProfitabilityData) => {
    setEditingId(sale.id);
    setEditedData(sale);
  };

  const handleSave = async () => {
    try {
      await updateSaleProfitability(editingId!, editedData);
      await queryClient.invalidateQueries({ queryKey: ['profitability'] });
      toast({
        title: "Changes saved",
        description: "The sale has been updated successfully.",
      });
      setEditingId(null);
      setEditedData({});
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedData({});
  };

  const handleChange = (field: keyof ProfitabilityData, value: string | number) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <Table>
          <ProfitabilityTableHeader 
            columnWidths={columnWidths}
            onResize={handleResize}
          />
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                {editingId === sale.id ? (
                  <EditableRow
                    sale={sale}
                    editedData={editedData}
                    columnWidths={columnWidths}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onChange={handleChange}
                  />
                ) : (
                  <ViewRow
                    sale={sale}
                    columnWidths={columnWidths}
                    onEdit={handleEdit}
                  />
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};
