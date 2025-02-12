
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getSalesWithProducts, deleteSale, updateSale } from "@/lib/supabase/database";
import type { SaleWithProduct } from "@/types/sales";

const RawData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<Partial<SaleWithProduct>>({});
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const { data: sales = [] } = useQuery<SaleWithProduct[]>({
    queryKey: ['sales'],
    queryFn: getSalesWithProducts,
  });

  // Sort sales by date (earliest first)
  const sortedSales = [...sales].sort((a, b) => 
    new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime()
  );

  const handleEdit = (sale: SaleWithProduct) => {
    // When starting to edit, strip the '£' symbol and convert to number
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

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sale Date</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Product Title</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Total Price</TableHead>
                <TableHead className="text-right">Gross Profit</TableHead>
                <TableHead>Promoted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSales.map((sale) => (
                <TableRow key={sale.id}>
                  {editingId === sale.id ? (
                    <>
                      <TableCell>
                        <Input
                          type="date"
                          value={editedData.sale_date?.split('T')[0]}
                          onChange={(e) => handleInputChange('sale_date', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editedData.platform}
                          onChange={(e) => handleInputChange('platform', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editedData.sku}
                          onChange={(e) => handleInputChange('sku', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editedData.listing_title}
                          onChange={(e) => handleInputChange('listing_title', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={editedData.quantity}
                          onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                          className="text-right"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={editedData.total_price}
                          onChange={(e) => handleInputChange('total_price', parseFloat(e.target.value))}
                          className="text-right"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={editedData.gross_profit}
                          onChange={(e) => handleInputChange('gross_profit', parseFloat(e.target.value))}
                          className="text-right"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="checkbox"
                          checked={editedData.promoted}
                          onChange={(e) => handleInputChange('promoted', e.target.checked)}
                        />
                      </TableCell>
                      <TableCell className="space-x-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleSave}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCancel}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{format(new Date(sale.sale_date), 'dd MMM yyyy')}</TableCell>
                      <TableCell>{sale.platform}</TableCell>
                      <TableCell>{sale.sku}</TableCell>
                      <TableCell>{sale.listing_title}</TableCell>
                      <TableCell className="text-right">{sale.quantity}</TableCell>
                      <TableCell className="text-right">{formatPrice(sale.total_price)}</TableCell>
                      <TableCell className="text-right">{formatPrice(sale.gross_profit)}</TableCell>
                      <TableCell>{sale.promoted ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="space-x-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(sale)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isDeleting === sale.id}
                          onClick={() => handleDelete(sale.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default RawData;
