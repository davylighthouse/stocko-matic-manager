
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ColumnWidth } from "./types";
import { Resizable } from "re-resizable";

interface TableHeaderProps {
  columnWidths: ColumnWidth;
  onResize: (column: string, width: number) => void;
}

interface ResizableColumnProps {
  width: number;
  onResize: (width: number) => void;
  children: React.ReactNode;
}

const ResizableColumn = ({ width, onResize, children }: ResizableColumnProps) => (
  <Resizable
    size={{ width, height: "auto" }}
    onResizeStop={(e, direction, ref, d) => {
      onResize(width + d.width);
    }}
    enable={{ right: true }}
    minWidth={80}
    maxWidth={400}
  >
    <div className="h-full">{children}</div>
  </Resizable>
);

export const ProfitabilityTableHeader = ({ columnWidths, onResize }: TableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>
          <ResizableColumn width={columnWidths.date} onResize={(w) => onResize('date', w)}>
            Date
          </ResizableColumn>
        </TableHead>
        <TableHead>
          <ResizableColumn width={columnWidths.platform} onResize={(w) => onResize('platform', w)}>
            Platform
          </ResizableColumn>
        </TableHead>
        <TableHead>
          <ResizableColumn width={columnWidths.sku} onResize={(w) => onResize('sku', w)}>
            SKU
          </ResizableColumn>
        </TableHead>
        <TableHead>
          <ResizableColumn width={columnWidths.title} onResize={(w) => onResize('title', w)}>
            Title
          </ResizableColumn>
        </TableHead>
        <TableHead className="text-right">
          <ResizableColumn width={columnWidths.quantity} onResize={(w) => onResize('quantity', w)}>
            Qty
          </ResizableColumn>
        </TableHead>
        <TableHead className="text-right">
          <ResizableColumn width={columnWidths.salePrice} onResize={(w) => onResize('salePrice', w)}>
            Sale Price
          </ResizableColumn>
        </TableHead>
        <TableHead className="text-right">
          <ResizableColumn width={columnWidths.productCost} onResize={(w) => onResize('productCost', w)}>
            Product Cost
          </ResizableColumn>
        </TableHead>
        <TableHead className="text-right">
          <ResizableColumn width={columnWidths.platformFees} onResize={(w) => onResize('platformFees', w)}>
            Platform Fees
          </ResizableColumn>
        </TableHead>
        <TableHead className="text-right">
          <ResizableColumn width={columnWidths.shipping} onResize={(w) => onResize('shipping', w)}>
            Shipping
          </ResizableColumn>
        </TableHead>
        <TableHead className="text-right">
          <ResizableColumn width={columnWidths.vat} onResize={(w) => onResize('vat', w)}>
            VAT
          </ResizableColumn>
        </TableHead>
        <TableHead className="text-right">
          <ResizableColumn width={columnWidths.totalCosts} onResize={(w) => onResize('totalCosts', w)}>
            Total Costs
          </ResizableColumn>
        </TableHead>
        <TableHead className="text-right">
          <ResizableColumn width={columnWidths.profit} onResize={(w) => onResize('profit', w)}>
            Profit
          </ResizableColumn>
        </TableHead>
        <TableHead className="text-right">
          <ResizableColumn width={columnWidths.margin} onResize={(w) => onResize('margin', w)}>
            Margin
          </ResizableColumn>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};
