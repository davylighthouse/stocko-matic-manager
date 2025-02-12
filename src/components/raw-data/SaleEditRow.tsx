
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Save, X } from "lucide-react";
import type { SaleWithProduct } from "@/types/sales";

interface SaleEditRowProps {
  editedData: Partial<SaleWithProduct>;
  onInputChange: (field: keyof SaleWithProduct, value: string | number | boolean) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const SaleEditRow = ({
  editedData,
  onInputChange,
  onSave,
  onCancel,
}: SaleEditRowProps) => {
  return (
    <>
      <TableCell>
        <Input
          type="date"
          value={editedData.sale_date?.split('T')[0]}
          onChange={(e) => onInputChange('sale_date', e.target.value)}
        />
      </TableCell>
      <TableCell>
        <Input
          value={editedData.platform}
          onChange={(e) => onInputChange('platform', e.target.value)}
        />
      </TableCell>
      <TableCell>
        <Input
          value={editedData.sku}
          onChange={(e) => onInputChange('sku', e.target.value)}
        />
      </TableCell>
      <TableCell>
        <Input
          value={editedData.listing_title}
          onChange={(e) => onInputChange('listing_title', e.target.value)}
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={editedData.quantity}
          onChange={(e) => onInputChange('quantity', parseInt(e.target.value))}
          className="text-right"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          step="0.01"
          value={editedData.total_price}
          onChange={(e) => onInputChange('total_price', parseFloat(e.target.value))}
          className="text-right"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          step="0.01"
          value={editedData.gross_profit}
          onChange={(e) => onInputChange('gross_profit', parseFloat(e.target.value))}
          className="text-right"
        />
      </TableCell>
      <TableCell>
        <Input
          type="checkbox"
          checked={editedData.promoted}
          onChange={(e) => onInputChange('promoted', e.target.checked)}
        />
      </TableCell>
      <TableCell className="space-x-2 text-right">
        <Button variant="ghost" size="icon" onClick={onSave}>
          <Save className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </TableCell>
    </>
  );
};
