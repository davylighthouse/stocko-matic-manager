
import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { EditableCell } from "./EditableCell"
import { ColumnWidth, ProfitabilityData } from "./types"
import { formatCurrency, formatDate, formatPercent } from "./utils"

interface EditableRowProps {
  sale: ProfitabilityData
  editedData: Partial<ProfitabilityData>
  columnWidths: Record<string, ColumnWidth>
  onSave: () => void
  onCancel: () => void
  onChange: (field: keyof ProfitabilityData, value: any) => void
  className?: string
}

export const EditableRow = ({
  sale,
  editedData,
  columnWidths,
  onSave,
  onCancel,
  onChange,
  className
}: EditableRowProps) => {
  const currentData = { ...sale, ...editedData }

  return (
    <TableRow className={className}>
      <TableCell style={{ width: columnWidths.date }}>
        {formatDate(currentData.sale_date)}
      </TableCell>
      <TableCell style={{ width: columnWidths.platform }}>
        {currentData.platform}
      </TableCell>
      <TableCell style={{ width: columnWidths.sku }}>{currentData.sku}</TableCell>
      <TableCell style={{ width: columnWidths.title }}>
        {currentData.listing_title}
      </TableCell>
      <EditableCell
        value={currentData.quantity}
        onChange={(value) => onChange("quantity", value)}
        width={columnWidths.quantity}
      />
      <EditableCell
        value={currentData.total_price}
        onChange={(value) => onChange("total_price", value)}
        width={columnWidths.salePrice}
        format={formatCurrency}
      />
      <EditableCell
        value={currentData.total_product_cost}
        onChange={(value) => onChange("total_product_cost", value)}
        width={columnWidths.productCost}
        format={formatCurrency}
      />
      <EditableCell
        value={currentData.platform_fees}
        onChange={(value) => onChange("platform_fees", value)}
        width={columnWidths.platformFees}
        format={formatCurrency}
      />
      <EditableCell
        value={currentData.shipping_cost}
        onChange={(value) => onChange("shipping_cost", value)}
        width={columnWidths.shipping}
        format={formatCurrency}
      />
      <EditableCell
        value={currentData.vat_cost}
        onChange={(value) => onChange("vat_cost", value)}
        width={columnWidths.vat}
        format={formatCurrency}
      />
      <EditableCell
        value={currentData.advertising_cost || 0}
        onChange={(value) => onChange("advertising_cost", value)}
        width={columnWidths.advertising}
        format={formatCurrency}
      />
      <TableCell style={{ width: columnWidths.totalCosts }}>
        {formatCurrency(currentData.total_costs)}
      </TableCell>
      <TableCell style={{ width: columnWidths.profit }}>
        {formatCurrency(currentData.profit)}
      </TableCell>
      <TableCell style={{ width: columnWidths.margin }}>
        {formatPercent(currentData.profit_margin)}
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onSave()
            }}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onCancel()
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
