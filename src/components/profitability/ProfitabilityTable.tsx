
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProfitabilityTableProps, ProfitabilityData, ColumnWidths } from "./types";
import { EditableRow } from "./EditableRow";
import { ViewRow } from "./ViewRow";
import { ProfitabilityTableHeader } from "./TableHeader";
import { updateSaleProfitability } from "@/lib/supabase/database/sales";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { RowContextMenu } from "./components/RowContextMenu";

export const ProfitabilityTable = ({ sales }: ProfitabilityTableProps) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<Partial<ProfitabilityData>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [columnWidths] = useState<ColumnWidths>({
    date: '120px',
    platform: '100px',
    sku: '120px',
    title: '250px',
    quantity: '80px',
    salePrice: '100px',
    productCost: '100px',
    platformFees: '100px',
    shipping: '100px',
    vat: '100px',
    advertising: '100px',
    totalCosts: '100px',
    profit: '100px',
    margin: '100px',
  });

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

  const handleVerify = async (id: number) => {
    try {
      await updateSaleProfitability(id, { verified: true });
      await queryClient.invalidateQueries({ queryKey: ['profitability'] });
      toast({
        title: "Sale Verified",
        description: "The sale has been marked as verified.",
      });
    } catch (error) {
      console.error('Error verifying sale:', error);
      toast({
        title: "Error",
        description: "Failed to verify sale. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnverify = async (id: number) => {
    try {
      await updateSaleProfitability(id, { verified: false });
      await queryClient.invalidateQueries({ queryKey: ['profitability'] });
      toast({
        title: "Verification Removed",
        description: "The verification status has been removed from the sale.",
      });
    } catch (error) {
      console.error('Error removing verification:', error);
      toast({
        title: "Error",
        description: "Failed to remove verification. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="overflow-x-auto relative">
        <div className="flex justify-end p-4 text-sm text-gray-500">
          Total Rows: {sales.length}
        </div>
        <Table>
          <ProfitabilityTableHeader columnWidths={columnWidths} />
          <TableBody>
            {sales.map((sale) => (
              <RowContextMenu
                key={sale.id}
                onVerify={() => handleVerify(sale.id)}
                onUnverify={() => handleUnverify(sale.id)}
                verified={sale.verified || false}
              >
                {editingId === sale.id ? (
                  <EditableRow
                    sale={sale}
                    editedData={editedData}
                    columnWidths={columnWidths}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onChange={handleChange}
                    className={`border-b transition-colors hover:bg-gray-50/50 ${sale.verified ? "bg-green-50/50" : ""}`}
                  />
                ) : (
                  <ViewRow
                    sale={sale}
                    columnWidths={columnWidths}
                    onEdit={() => handleEdit(sale)}
                    className={`border-b transition-colors hover:bg-gray-50/50 ${sale.verified ? "bg-green-50/50" : ""}`}
                  />
                )}
              </RowContextMenu>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};
