import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, ClipboardList, Package, Plus, Upload, Download } from "lucide-react";
import {
  createStockCheck,
  getStockChecks,
  getStockLevels,
  getStockCheckItems,
  updateStockCheckItem,
  completeStockCheck,
  generateStockCheckTemplate,
  processStockCheckCSV,
  StockCheck,
} from "@/lib/supabase/database";
import { useToast } from "@/components/ui/use-toast";

const StockChecks = () => {
  const [selectedCheckId, setSelectedCheckId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stockChecks = [] } = useQuery({
    queryKey: ['stock-checks'],
    queryFn: getStockChecks,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getStockLevels,
  });

  const { data: selectedCheckItems = [] } = useQuery({
    queryKey: ['stock-check-items', selectedCheckId],
    queryFn: () => selectedCheckId ? getStockCheckItems(selectedCheckId) : Promise.resolve([]),
    enabled: !!selectedCheckId,
  });

  const createStockCheckMutation = useMutation({
    mutationFn: createStockCheck,
    onSuccess: (newCheck) => {
      queryClient.invalidateQueries({ queryKey: ['stock-checks'] });
      setSelectedCheckId(newCheck.id);
      toast({
        title: "Success",
        description: "New stock check created",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ stockCheckId, sku, data }: {
      stockCheckId: number;
      sku: string;
      data: { quantity: number; product_cost?: number; warehouse_location?: string; }
    }) => updateStockCheckItem(stockCheckId, sku, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-check-items', selectedCheckId] });
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
    },
  });

  const completeCheckMutation = useMutation({
    mutationFn: completeStockCheck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-checks'] });
      toast({
        title: "Success",
        description: "Stock check completed",
      });
    },
  });

  const handleUpdateItem = async (sku: string) => {
    if (!selectedCheckId) return;

    const quantity = prompt("Enter quantity:");
    if (quantity === null) return;

    const productCost = prompt("Enter product cost (optional):");
    const location = prompt("Enter warehouse location (optional):");

    updateItemMutation.mutate({
      stockCheckId: selectedCheckId,
      sku,
      data: {
        quantity: parseInt(quantity),
        ...(productCost ? { product_cost: parseFloat(productCost) } : {}),
        ...(location ? { warehouse_location: location } : {}),
      },
    });
  };

  const handleNewStockCheck = async () => {
    const notes = prompt("Enter notes for this stock check (optional):");
    if (notes !== null) {
      createStockCheckMutation.mutate(notes || undefined);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedCheckId) {
      toast({
        title: "Error",
        description: "Please select a file and ensure a stock check is selected",
        variant: "destructive",
      });
      return;
    }

    const result = await processStockCheckCSV(file, selectedCheckId);
    
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ['stock-check-items', selectedCheckId] });
      toast({
        title: "Success",
        description: "Stock check data processed successfully",
      });

      if (result.discrepancies && result.discrepancies.length > 0) {
        // Create discrepancy report
        const reportContent = result.discrepancies.map(d => 
          `${d.sku} (${d.product_title}): Current Stock: ${d.current_stock}, Check Quantity: ${d.check_quantity}, Difference: ${d.difference}`
        ).join('\n');

        toast({
          title: "Stock Discrepancies Found",
          description: `${result.discrepancies.length} discrepancies found. Check the notes for details.`,
        });

        // Update stock check notes with discrepancy report
        const { error } = await supabase
          .from('stock_checks')
          .update({ 
            notes: `Discrepancy Report:\n${reportContent}`
          })
          .eq('id', selectedCheckId);

        if (!error) {
          queryClient.invalidateQueries({ queryKey: ['stock-checks'] });
        }
      }
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Stock Checks</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your inventory checks and update stock levels
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNewStockCheck} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            New Stock Check
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Download className="mr-2 h-4 w-4" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => generateStockCheckTemplate()}>
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  if (!selectedCheckId) {
                    toast({
                      title: "Error",
                      description: "Please create and select a stock check first",
                      variant: "destructive",
                    });
                    return;
                  }
                  document.getElementById('file-upload')?.click();
                }}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Stock Check
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <input
          id="file-upload"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Previous Stock Checks</CardTitle>
            <CardDescription>Select a stock check to view details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stockChecks.map((check: StockCheck) => (
                <div
                  key={check.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedCheckId === check.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedCheckId(check.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ClipboardList className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">
                          {format(new Date(check.check_date), "PPP")}
                        </p>
                        {check.notes && (
                          <p className="text-sm text-gray-500">{check.notes}</p>
                        )}
                      </div>
                    </div>
                    {check.completed ? (
                      <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                        Completed
                      </span>
                    ) : (
                      <span className="text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                        In Progress
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                                onClick={() => handleUpdateItem(product.sku)}
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
                        completeCheckMutation.mutate(selectedCheckId);
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
      </div>
    </div>
  );
};

export default StockChecks;
