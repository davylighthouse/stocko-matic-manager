
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
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteSale, getSalesWithProducts, getSalesTotals } from "@/lib/supabase/database";
import { useToast } from "@/components/ui/use-toast";
import type { SaleWithProduct, SalesTotals } from "@/types/sales";

const Sales = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const { data: sales = [] } = useQuery<SaleWithProduct[]>({
    queryKey: ['sales'],
    queryFn: getSalesWithProducts,
  });

  const { data: totals } = useQuery<SalesTotals>({
    queryKey: ['salesTotals'],
    queryFn: getSalesTotals,
  });

  const handleDelete = async (id: number) => {
    try {
      setIsDeleting(id);
      await deleteSale(id);
      await queryClient.invalidateQueries({ queryKey: ['sales'] });
      await queryClient.invalidateQueries({ queryKey: ['salesTotals'] });
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Sales Data</h1>
        <p className="mt-2 text-sm text-gray-600">
          View and manage all sales records
        </p>
      </div>

      {totals && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="text-sm text-gray-500">Total Sales</div>
            <div className="text-2xl font-semibold">£{totals.total_sales?.toFixed(2) || '0.00'}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Units Sold</div>
            <div className="text-2xl font-semibold">{totals.total_quantity || 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Unique Products</div>
            <div className="text-2xl font-semibold">{totals.unique_products || 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Date Range</div>
            <div className="text-sm font-semibold">
              {totals.earliest_sale ? format(new Date(totals.earliest_sale), 'dd MMM yyyy') : 'N/A'} - 
              {totals.latest_sale ? format(new Date(totals.latest_sale), 'dd MMM yyyy') : 'N/A'}
            </div>
          </Card>
        </div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Total Price</TableHead>
                <TableHead className="text-right">Gross Profit</TableHead>
                <TableHead>Promoted</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{format(new Date(sale.sale_date), 'dd MMM yyyy')}</TableCell>
                  <TableCell>{sale.platform}</TableCell>
                  <TableCell>{sale.sku}</TableCell>
                  <TableCell>{sale.listing_title}</TableCell>
                  <TableCell className="text-right">{sale.quantity}</TableCell>
                  <TableCell className="text-right">£{sale.total_price?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell className="text-right">£{sale.gross_profit?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>{sale.promoted ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isDeleting === sale.id}
                      onClick={() => handleDelete(sale.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default Sales;
