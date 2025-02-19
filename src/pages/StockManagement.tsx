
import { Card } from "@/components/ui/card";
import { useStockManagement } from "@/components/stock/hooks/useStockManagement";
import { StockSearchHeader } from "@/components/stock/components/StockSearchHeader";
import { DraggableProductsList } from "@/components/stock/components/DraggableProductsList";

const StockManagement = () => {
  const {
    search,
    setSearch,
    selectedProduct,
    setSelectedProduct,
    updatedFields,
    filteredProducts,
    isLoading,
    updateStockMutation,
    updateOrderMutation,
    updateProductMutation,
  } = useStockManagement();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const handleStockUpdate = (sku: string, quantity: number) => {
    updateStockMutation.mutate({ sku, quantity });
  };

  const handleProductUpdate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProduct) return;

    const formData = new FormData(event.currentTarget);
    const updates: Record<string, any> = {};
    const updatedFieldNames: string[] = [];

    formData.forEach((value, key) => {
      if (value !== '' && value !== null) {
        updates[key] = value;
        updatedFieldNames.push(key);
      }
    });

    if (Object.keys(updates).length > 0) {
      updateProductMutation.mutate({ 
        sku: selectedProduct.sku, 
        data: updates 
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Stock Management
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your inventory and product details
        </p>
      </div>

      <Card className="bg-white overflow-hidden">
        <StockSearchHeader 
          search={search}
          onSearchChange={setSearch}
        />
        
        <DraggableProductsList
          products={filteredProducts}
          selectedProduct={selectedProduct}
          onProductSelect={setSelectedProduct}
          onStockUpdate={handleStockUpdate}
          onProductUpdate={handleProductUpdate}
          onOrderUpdate={(updates) => updateOrderMutation.mutate(updates)}
          updatedFields={updatedFields}
        />
      </Card>
    </div>
  );
};

export default StockManagement;
