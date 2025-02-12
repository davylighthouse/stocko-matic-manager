
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { SaleEditRow } from "./SaleEditRow";
import { SaleViewRow } from "./SaleViewRow";
import type { SaleWithProduct } from "@/types/sales";

interface SalesTableProps {
  sales: SaleWithProduct[];
  editingId: number | null;
  editedData: Partial<SaleWithProduct>;
  isDeleting: number | null;
  selectedSales: number[];
  formatPrice: (price: number | null) => string;
  onInputChange: (field: keyof SaleWithProduct, value: string | number | boolean) => void;
  onEdit: (sale: SaleWithProduct) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: (id: number) => void;
  onSelectSale: (id: number) => void;
}

export const SalesTable = ({
  sales,
  editingId,
  editedData,
  isDeleting,
  selectedSales,
  formatPrice,
  onInputChange,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onSelectSale,
}: SalesTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">Select</TableHead>
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
        {sales.map((sale) => (
          <TableRow key={sale.id}>
            <TableCell>
              <Checkbox
                checked={selectedSales.includes(sale.id!)}
                onCheckedChange={() => onSelectSale(sale.id!)}
              />
            </TableCell>
            {editingId === sale.id ? (
              <SaleEditRow
                editedData={editedData}
                onInputChange={onInputChange}
                onSave={onSave}
                onCancel={onCancel}
              />
            ) : (
              <SaleViewRow
                sale={sale}
                isDeleting={isDeleting === sale.id}
                formatPrice={formatPrice}
                onEdit={() => onEdit(sale)}
                onDelete={() => onDelete(sale.id!)}
              />
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
