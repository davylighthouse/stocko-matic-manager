
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StockSearchHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export const StockSearchHeader = ({ search, onSearchChange }: StockSearchHeaderProps) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by SKU or title..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button className="ml-4 flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
    </div>
  );
};
