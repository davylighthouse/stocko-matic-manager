
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getSalesWithProducts, deleteSale, updateSale, deleteMultipleSales } from "@/lib/supabase/database";
import { SalesTable } from "@/components/raw-data/SalesTable";
import type { SaleWithProduct } from "@/types/sales";

const RawData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<Partial<SaleWithProduct>>({});
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [selectedSales, setSelectedSales] = useState<number[]>([]);

  const { data: sales = [] } = useQuery<SaleWithProduct[]>({
    queryKey: ['sales'],
    queryFn: getSalesWithProducts,
  });

  // Sort sales by date (earliest first)
  const sortedSales = [...sales].sort((a, b) => 
    new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime()
  );

  const handleEdit = (sale: SaleWithProduct) => {
    const editData = {
      ...sale,
      total_price: sale.total_price ? parseFloat(sale.total_price.toString().replace('£', '')) : 0,
      gross_profit: sale.gross_profit ? parseFloat(sale.gross_profit.toString().replace('£', '')) : 0
    };
    setEditingId(sale.id);
    setEditedData(editData);
  };

  const handleSave = async () => {
    if (!editingId || !editedData) return;

    try {
      await updateSale(editingId, editedData);
      await queryClient.invalidateQueries({ queryKey: ['sales'] });
      setEditingId(null);
      setEditedData({});
      toast({
        title: "Changes saved",
        description: "The sale has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setIsDeleting(id);
      await deleteSale(id);
      await queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({
        title: "Sale deleted",
        description: "The sale has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the sale. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedData({});
  };

  const handleInputChange = (field: keyof SaleWithProduct, value: string | number | boolean) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectAll = () => {
    if (selectedSales.length === sales.length) {
      setSelectedSales([]);
    } else {
      setSelectedSales(sales.map(sale => sale.id!));
    }
  };

  const handleSelectSale = (id: number) => {
    setSelectedSales(prev => {
      if (prev.includes(id)) {
        return prev.filter(saleId => saleId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedSales.length === 0) return;

    try {
      await deleteMultipleSales(selectedSales);
      await queryClient.invalidateQueries({ queryKey: ['sales'] });
      setSelectedSales([]);
      toast({
        title: "Sales deleted",
        description: `Successfully deleted ${selectedSales.length} sales.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the selected sales. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Format price with £ symbol and 2 decimal places
  const formatPrice = (price: number | null) => {
    if (price === null || isNaN(price)) return '£0.00';
    return `£${price.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Raw Sales Data</h1>
        <p className="mt-2 text-sm text-gray-600">
          View and edit individual sales records
        </p>
      </div>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handleSelectAll}
        >
          {selectedSales.length === sales.length ? 'Deselect All' : 'Select All'}
        </Button>
        {selectedSales.length > 0 && (
          <Button
            variant="destructive"
            onClick={handleDeleteSelected}
          >
            Delete Selected ({selectedSales.length})
          </Button>
        )}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <SalesTable
            sales={sortedSales}
            editingId={editingId}
            editedData={editedData}
            isDeleting={isDeleting}
            selectedSales={selectedSales}
            formatPrice={formatPrice}
            onInputChange={handleInputChange}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            onDelete={handleDelete}
            onSelectSale={handleSelectSale}
          />
        </div>
      </Card>
    </div>
  );
};

export default RawData;
