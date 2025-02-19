
import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { EditableCell } from "./EditableCell"
import { ColumnWidths, ProfitabilityData } from "./types"
import { formatCurrency, formatDate, formatPercent } from "./utils"

interface EditableRowProps {
  sale: ProfitabilityData
  editedData: Partial<ProfitabilityData>
  columnWidths: Record<string, string>
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
        field="quantity"
        onChange={onChange}
        width={columnWidths.quantity}
        type="number"
      />
      <EditableCell
        value={currentData.total_price}
        field="total_price"
        onChange={onChange}
        width={columnWidths.salePrice}
        format={formatCurrency}
        type="number"
      />
      <EditableCell
        value={currentData.total_product_cost}
        field="total_product_cost"
        onChange={onChange}
        width={columnWidths.productCost}
        format={formatCurrency}
        type="number"
      />
      <EditableCell
        value={currentData.platform_fees}
        field="platform_fees"
        onChange={onChange}
        width={columnWidths.platformFees}
        format={formatCurrency}
        type="number"
      />
      <EditableCell
        value={currentData.shipping_cost}
        field="shipping_cost"
        onChange={onChange}
        width={columnWidths.shipping}
        format={formatCurrency}
        type="number"
      />
      <EditableCell
        value={currentData.vat_cost}
        field="vat_cost"
        onChange={onChange}
        width={columnWidths.vat}
        format={formatCurrency}
        type="number"
      />
      <EditableCell
        value={currentData.advertising_cost || 0}
        field="advertising_cost"
        onChange={onChange}
        width={columnWidths.advertising}
        format={formatCurrency}
        type="number"
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
