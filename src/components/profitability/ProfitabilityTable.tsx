
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { ProfitabilityTableProps, ProfitabilityData, ColumnWidth } from "./types";
import { formatCurrency, formatPercentage, getCalculationTooltip, getMarginColor, getProfitColor } from "./utils";
import { EditableCell } from "./EditableCell";
import { ProfitabilityTableHeader } from "./TableHeader";

export const ProfitabilityTable = ({ sales }: ProfitabilityTableProps) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<Partial<ProfitabilityData>>({});

  const [columnWidths, setColumnWidths] = useState<ColumnWidth>({
    date: 120,
    platform: 100,
    sku: 120,
    title: 200,
    quantity: 80,
    salePrice: 100,
    productCost: 100,
    platformFees: 100,
    shipping: 100,
    vat: 100,
    totalCosts: 100,
    profit: 100,
    margin: 100,
  });

  const handleResize = (column: string, width: number) => {
    setColumnWidths(prev => ({
      ...prev,
      [column]: width
    }));
  };

  const handleEdit = (sale: ProfitabilityData) => {
    setEditingId(sale.id);
    setEditedData(sale);
  };

  const handleSave = async () => {
    console.log('Saving changes:', editedData);
    setEditingId(null);
    setEditedData({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedData({});
  };

  const handleChange = (field: keyof ProfitabilityData, value: string | number) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <Table>
          <ProfitabilityTableHeader 
            columnWidths={columnWidths}
            onResize={handleResize}
          />
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                {editingId === sale.id ? (
                  <>
                    <TableCell style={{ width: columnWidths.date }}>
                      <EditableCell value={editedData.sale_date?.split('T')[0] || ''} field="sale_date" type="date" onChange={handleChange} />
                    </TableCell>
                    <TableCell style={{ width: columnWidths.platform }}>
                      <EditableCell value={editedData.platform || ''} field="platform" onChange={handleChange} />
                    </TableCell>
                    <TableCell style={{ width: columnWidths.sku }}>
                      <EditableCell value={editedData.sku || ''} field="sku" onChange={handleChange} />
                    </TableCell>
                    <TableCell style={{ width: columnWidths.title }}>
                      <EditableCell value={editedData.listing_title || ''} field="listing_title" onChange={handleChange} />
                    </TableCell>
                    <TableCell style={{ width: columnWidths.quantity }}>
                      <EditableCell value={editedData.quantity || 0} field="quantity" type="number" onChange={handleChange} />
                    </TableCell>
                    <TableCell style={{ width: columnWidths.salePrice }}>
                      <EditableCell value={editedData.total_price || 0} field="total_price" type="number" onChange={handleChange} />
                    </TableCell>
                    <TableCell style={{ width: columnWidths.productCost }}>
                      <EditableCell value={editedData.total_product_cost || 0} field="total_product_cost" type="number" onChange={handleChange} />
                    </TableCell>
                    <TableCell style={{ width: columnWidths.platformFees }}>
                      <EditableCell value={editedData.platform_fees || 0} field="platform_fees" type="number" onChange={handleChange} />
                    </TableCell>
                    <TableCell style={{ width: columnWidths.shipping }}>
                      <EditableCell value={editedData.shipping_cost || 0} field="shipping_cost" type="number" onChange={handleChange} />
                    </TableCell>
                    <TableCell style={{ width: columnWidths.vat }}>
                      <EditableCell value={editedData.vat_cost || 0} field="vat_cost" type="number" onChange={handleChange} />
                    </TableCell>
                    <TableCell style={{ width: columnWidths.totalCosts }} className="space-x-2">
                      <Button size="sm" onClick={handleSave}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={handleCancel}>Cancel</Button>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell style={{ width: columnWidths.date }}>
                      {format(new Date(sale.sale_date), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell style={{ width: columnWidths.platform }}>{sale.platform}</TableCell>
                    <TableCell style={{ width: columnWidths.sku }}>{sale.sku}</TableCell>
                    <TableCell style={{ width: columnWidths.title }}>{sale.listing_title}</TableCell>
                    <TableCell className="text-right" style={{ width: columnWidths.quantity }}>
                      {sale.quantity}
                    </TableCell>
                    <TableCell className="text-right" style={{ width: columnWidths.salePrice }}>
                      {formatCurrency(sale.total_price)}
                    </TableCell>
                    <TableCell className="text-right cursor-pointer" style={{ width: columnWidths.productCost }}>
                      <Tooltip>
                        <TooltipTrigger>
                          {formatCurrency(sale.total_product_cost)}
                        </TooltipTrigger>
                        <TooltipContent>
                          <pre>Product Cost per Unit × Quantity = {formatCurrency(sale.total_product_cost)}</pre>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-right cursor-pointer" style={{ width: columnWidths.platformFees }}>
                      <Tooltip>
                        <TooltipTrigger>
                          {formatCurrency(sale.platform_fees)}
                        </TooltipTrigger>
                        <TooltipContent>
                          <pre>Platform Fee: {formatCurrency(sale.platform_fees)}</pre>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-right" style={{ width: columnWidths.shipping }}>
                      {formatCurrency(sale.shipping_cost)}
                    </TableCell>
                    <TableCell className="text-right cursor-pointer" style={{ width: columnWidths.vat }}>
                      <Tooltip>
                        <TooltipTrigger>
                          {formatCurrency(sale.vat_cost)}
                        </TooltipTrigger>
                        <TooltipContent>
                          <pre>VAT (20%): {formatCurrency(sale.vat_cost)}</pre>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-right cursor-pointer" style={{ width: columnWidths.totalCosts }}>
                      <Tooltip>
                        <TooltipTrigger>
                          {formatCurrency(sale.total_costs)}
                        </TooltipTrigger>
                        <TooltipContent>
                          <pre className="whitespace-pre-line">
                            {getCalculationTooltip(sale, 'total_costs', formatCurrency, formatPercentage)}
                          </pre>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell 
                      className={`text-right font-medium rounded-sm cursor-pointer ${getProfitColor(sale.profit)}`}
                      style={{ width: columnWidths.profit }}
                    >
                      <Tooltip>
                        <TooltipTrigger>
                          {formatCurrency(sale.profit)}
                        </TooltipTrigger>
                        <TooltipContent>
                          <pre className="whitespace-pre-line">
                            {getCalculationTooltip(sale, 'profit', formatCurrency, formatPercentage)}
                          </pre>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell 
                      className={`text-right rounded-sm cursor-pointer ${getMarginColor(sale.profit_margin)}`}
                      style={{ width: columnWidths.margin }}
                    >
                      <Tooltip>
                        <TooltipTrigger>
                          {formatPercentage(sale.profit_margin)}
                        </TooltipTrigger>
                        <TooltipContent>
                          <pre className="whitespace-pre-line">
                            {getCalculationTooltip(sale, 'profit_margin', formatCurrency, formatPercentage)}
                          </pre>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell style={{ width: 100 }}>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(sale)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};
