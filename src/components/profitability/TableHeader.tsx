
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ColumnWidth } from "./types";

interface TableHeaderProps {
  columnWidths: ColumnWidth;
}

export const TableHeaderComponent = ({ columnWidths }: TableHeaderProps) => (
  <TableHeader>
    <TableRow>
      <TableHead style={{ width: columnWidths.date }}>Date</TableHead>
      <TableHead style={{ width: columnWidths.platform }}>Platform</TableHead>
      <TableHead style={{ width: columnWidths.sku }}>SKU</TableHead>
      <TableHead style={{ width: columnWidths.title }}>Title</TableHead>
      <TableHead className="text-right" style={{ width: columnWidths.quantity }}>Qty</TableHead>
      <TableHead className="text-right" style={{ width: columnWidths.salePrice }}>Sale Price</TableHead>
      <TableHead className="text-right" style={{ width: columnWidths.productCost }}>Product Cost</TableHead>
      <TableHead className="text-right" style={{ width: columnWidths.platformFees }}>Platform Fees</TableHead>
      <TableHead className="text-right" style={{ width: columnWidths.shipping }}>Shipping</TableHead>
      <TableHead className="text-right" style={{ width: columnWidths.vat }}>VAT</TableHead>
      <TableHead className="text-right" style={{ width: columnWidths.advertising }}>Advertising</TableHead>
      <TableHead className="text-right" style={{ width: columnWidths.totalCosts }}>Total Costs</TableHead>
      <TableHead className="text-right" style={{ width: columnWidths.profit }}>Profit</TableHead>
      <TableHead className="text-right" style={{ width: columnWidths.margin }}>Margin</TableHead>
      <TableHead style={{ width: 100 }}>Actions</TableHead>
    </TableRow>
  </TableHeader>
);
