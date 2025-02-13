
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface ProductsTableHeaderProps {
  showStatus: boolean;
  onShowStatusChange: (show: boolean) => void;
}

export const ProductsTableHeader = ({
  showStatus,
  onShowStatusChange,
}: ProductsTableHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="status-toggle"
            checked={showStatus}
            onCheckedChange={onShowStatusChange}
            className="data-[state=checked]:bg-[#9b87f5] data-[state=unchecked]:bg-gray-200"
          />
          <Label htmlFor="status-toggle" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Show Status
          </Label>
        </div>
      </div>
      <Button className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Add Product
      </Button>
    </div>
  );
};
