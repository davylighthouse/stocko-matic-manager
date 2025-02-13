import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { getStockLevels } from "@/lib/supabase/database";
import { generateStockCheckTemplate } from "@/lib/supabase/database";
import { StockCheckHeader } from "@/components/stock/StockCheckHeader";
import { StockCheckList } from "@/components/stock/StockCheckList";
import { StockCheckItemsTable } from "@/components/stock/StockCheckItemsTable";
import { InitialStockUpload } from "@/components/stock/InitialStockUpload";
import { StockAdjustmentsTable } from "@/components/stock/StockAdjustmentsTable";
import { useStockChecks } from "@/hooks/useStockChecks";
import { useStockAdjustments } from "@/hooks/useStockAdjustments";

const StockChecks = () => {
  const { toast } = useToast();
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getStockLevels,
  });

  const {
    selectedCheckId,
    setSelectedCheckId,
    stockChecks,
    selectedCheckItems,
    createStockCheck,
    updateItem,
    completeCheck,
    handleFileUpload,
  } = useStockChecks();

  const {
    searchTerm,
    setSearchTerm,
    currentStock,
    handleInitialStockUpload,
    addStockAdjustment,
  } = useStockAdjustments();

  const handleNewStockCheck = async () => {
    const notes = prompt("Enter notes for this stock check (optional):");
    if (notes !== null) {
      createStockCheck(notes || undefined);
    }
  };

  const handleUpdateItem = async (sku: string) => {
    if (!selectedCheckId) return;

    const quantity = prompt("Enter quantity:");
    if (quantity === null) return;

    const productCost = prompt("Enter product cost (optional):");
    const location = prompt("Enter warehouse location (optional):");

    updateItem({
      stockCheckId: selectedCheckId,
      sku,
      data: {
        quantity: parseInt(quantity),
        ...(productCost ? { product_cost: parseFloat(productCost) } : {}),
        ...(location ? { warehouse_location: location } : {}),
      },
    });
  };

  const handleStockAdjustment = async (sku: string, quantity: number, notes?: string) => {
    await addStockAdjustment({
      sku,
      quantity,
      notes,
    });
  };

  return (
    <div className="space-y-6">
      <StockCheckHeader
        onNewCheck={handleNewStockCheck}
        onDownloadTemplate={generateStockCheckTemplate}
        onUploadClick={() => {
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
        selectedCheckId={selectedCheckId}
      />
      <input
        id="file-upload"
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StockCheckList
          stockChecks={stockChecks}
          selectedCheckId={selectedCheckId}
          onSelectCheck={setSelectedCheckId}
        />
        <StockCheckItemsTable
          selectedCheckId={selectedCheckId}
          products={products}
          selectedCheckItems={selectedCheckItems}
          onUpdateItem={handleUpdateItem}
          onComplete={() => selectedCheckId && completeCheck(selectedCheckId)}
        />
      </div>

      <InitialStockUpload
        onFileUpload={(e) => e.target.files?.[0] && handleInitialStockUpload(e.target.files[0])}
      />

      <StockAdjustmentsTable
        currentStock={currentStock}
        products={products}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAdjustStock={handleStockAdjustment}
      />
    </div>
  );
};

export default StockChecks;
