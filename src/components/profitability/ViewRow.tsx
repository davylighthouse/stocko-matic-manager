
import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { ColumnWidth } from "./types"
import { ProfitabilityData } from "./types"
import { formatCurrency, formatDate, formatPercent } from "./utils"

interface ViewRowProps {
  sale: ProfitabilityData
  columnWidths: Record<string, ColumnWidth>
  onEdit: () => void
  className?: string
}

export const ViewRow = ({ sale, columnWidths, onEdit, className }: ViewRowProps) => {
  return (
    <TableRow className={className}>
      <TableCell style={{ width: columnWidths.date }}>
        {formatDate(sale.sale_date)}
      </TableCell>
      <TableCell style={{ width: columnWidths.platform }}>
        {sale.platform}
      </TableCell>
      <TableCell style={{ width: columnWidths.sku }}>{sale.sku}</TableCell>
      <TableCell style={{ width: columnWidths.title }}>
        {sale.listing_title}
      </TableCell>
      <TableCell style={{ width: columnWidths.quantity }}>
        {sale.quantity}
      </TableCell>
      <TableCell style={{ width: columnWidths.salePrice }}>
        {formatCurrency(sale.total_price)}
      </TableCell>
      <TableCell style={{ width: columnWidths.productCost }}>
        {formatCurrency(sale.total_product_cost)}
      </TableCell>
      <TableCell style={{ width: columnWidths.platformFees }}>
        {formatCurrency(sale.platform_fees)}
      </TableCell>
      <TableCell style={{ width: columnWidths.shipping }}>
        {formatCurrency(sale.shipping_cost)}
      </TableCell>
      <TableCell style={{ width: columnWidths.vat }}>
        {formatCurrency(sale.vat_cost)}
      </TableCell>
      <TableCell style={{ width: columnWidths.advertising }}>
        {formatCurrency(sale.advertising_cost || 0)}
      </TableCell>
      <TableCell style={{ width: columnWidths.totalCosts }}>
        {formatCurrency(sale.total_costs)}
      </TableCell>
      <TableCell style={{ width: columnWidths.profit }}>
        {formatCurrency(sale.profit)}
      </TableCell>
      <TableCell style={{ width: columnWidths.margin }}>
        {formatPercent(sale.profit_margin)}
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  )
}
