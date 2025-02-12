
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Product } from "@/types/database";
import { StockCheckItem } from "@/types/stock-checks";

interface StockCheckItemsTableProps {
  selectedCheckId: number | null;
  products: Product[];
  selectedCheckItems: StockCheckItem[];
  onUpdateItem: (sku: string) => void;
  onComplete: (checkId: number) => void;
}

export const StockCheckItemsTable = ({
  selectedCheckId,
  products,
  selectedCheckItems,
  onUpdateItem,
  onComplete,
}: StockCheckItemsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Check Items</CardTitle>
        <CardDescription>
          {selectedCheckId
            ? "Update quantities and locations for items"
            : "Select a stock check to view items"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {selectedCheckId ? (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const checkItem = selectedCheckItems.find(
                      (item) => item.sku === product.sku
                    );
                    console.log('CheckItem for SKU:', product.sku, checkItem); // Debug log
                    return (
                      <TableRow key={product.sku}>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{product.listing_title}</TableCell>
                        <TableCell>
                          {checkItem?.quantity ?? "Not counted"}
                        </TableCell>
                        <TableCell>
                          {checkItem?.product_cost
                            ? `£${checkItem.product_cost.toFixed(2)}`
                            : "Not set"}
                        </TableCell>
                        <TableCell>
                          {checkItem?.warehouse_location ?? "Not set"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onUpdateItem(product.sku)}
                          >
                            Update
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to complete this stock check?"
                    )
                  ) {
                    onComplete(selectedCheckId);
                  }
                }}
              >
                Complete Stock Check
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Select a stock check to view and update items
          </div>
        )}
      </CardContent>
    </Card>
  );
};
