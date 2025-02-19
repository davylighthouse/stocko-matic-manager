
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ProfitabilityData } from "./types";
import { EditableCell } from "./EditableCell";

interface EditableRowProps {
  sale: ProfitabilityData;
  editedData: Partial<ProfitabilityData>;
  columnWidths: { [key: string]: number };
  onSave: () => void;
  onCancel: () => void;
  onChange: (field: keyof ProfitabilityData, value: string | number) => void;
}

export const EditableRow = ({ 
  sale, 
  editedData, 
  columnWidths, 
  onSave, 
  onCancel, 
  onChange 
}: EditableRowProps) => {
  return (
    <>
      <TableCell style={{ width: columnWidths.date }}>
        <EditableCell value={editedData.sale_date?.split('T')[0] || ''} field="sale_date" type="date" onChange={onChange} />
      </TableCell>
      <TableCell style={{ width: columnWidths.platform }}>
        <EditableCell value={editedData.platform || ''} field="platform" onChange={onChange} />
      </TableCell>
      <TableCell style={{ width: columnWidths.sku }}>
        <EditableCell value={editedData.sku || ''} field="sku" onChange={onChange} />
      </TableCell>
      <TableCell style={{ width: columnWidths.title }}>
        <EditableCell value={editedData.listing_title || ''} field="listing_title" onChange={onChange} />
      </TableCell>
      <TableCell style={{ width: columnWidths.quantity }}>
        <EditableCell value={editedData.quantity || 0} field="quantity" type="number" onChange={onChange} />
      </TableCell>
      <TableCell style={{ width: columnWidths.salePrice }}>
        <EditableCell value={editedData.total_price || 0} field="total_price" type="number" onChange={onChange} />
      </TableCell>
      <TableCell style={{ width: columnWidths.productCost }}>
        <EditableCell value={editedData.total_product_cost || 0} field="total_product_cost" type="number" onChange={onChange} />
      </TableCell>
      <TableCell style={{ width: columnWidths.platformFees }}>
        <EditableCell value={editedData.platform_fees || 0} field="platform_fees" type="number" onChange={onChange} />
      </TableCell>
      <TableCell style={{ width: columnWidths.shipping }}>
        <EditableCell value={editedData.shipping_cost || 0} field="shipping_cost" type="number" onChange={onChange} />
      </TableCell>
      <TableCell style={{ width: columnWidths.vat }}>
        <EditableCell value={editedData.vat_cost || 0} field="vat_cost" type="number" onChange={onChange} />
      </TableCell>
      <TableCell style={{ width: columnWidths.totalCosts }} className="space-x-2">
        <Button size="sm" onClick={onSave}>Save</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </TableCell>
    </>
  );
};
