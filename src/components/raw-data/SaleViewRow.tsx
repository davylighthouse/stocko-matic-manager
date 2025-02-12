
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import type { SaleWithProduct } from "@/types/sales";

interface SaleViewRowProps {
  sale: SaleWithProduct;
  isDeleting: boolean;
  formatPrice: (price: number | null) => string;
  onEdit: () => void;
  onDelete: () => void;
}

export const SaleViewRow = ({
  sale,
  isDeleting,
  formatPrice,
  onEdit,
  onDelete,
}: SaleViewRowProps) => {
  return (
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
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={isDeleting}
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </>
  );
};
