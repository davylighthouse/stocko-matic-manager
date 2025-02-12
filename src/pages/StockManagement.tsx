import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Product = {
  sku: string;
  title: string;
  stock: number;
  cost: number;
};

const dummyProducts: Product[] = [
  { sku: "SKU001", title: "Product 1", stock: 100, cost: 10.99 },
  { sku: "SKU002", title: "Product 2", stock: 50, cost: 15.99 },
  { sku: "SKU003", title: "Product 3", stock: 75, cost: 20.99 },
];

const StockManagement = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>(dummyProducts);

  const filteredProducts = products.filter(
    (product) =>
      product.sku.toLowerCase().includes(search.toLowerCase()) ||
      product.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Stock Management
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your inventory and product details
          </p>
        </div>
        <Button className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card className="bg-white overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by SKU or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="stock-table">
            <thead>
              <tr className="bg-gray-50">
                <th>SKU</th>
                <th>Title</th>
                <th>Stock</th>
                <th>Cost</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.sku}>
                  <td className="font-medium">{product.sku}</td>
                  <td>{product.title}</td>
                  <td>
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        product.stock > 50
                          ? "bg-green-100 text-green-800"
                          : product.stock > 20
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      )}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td>${product.cost.toFixed(2)}</td>
                  <td>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default StockManagement;
