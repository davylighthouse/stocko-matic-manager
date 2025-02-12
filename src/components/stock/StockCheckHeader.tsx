
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, Plus, Upload } from "lucide-react";

interface StockCheckHeaderProps {
  onNewCheck: () => void;
  onDownloadTemplate: () => void;
  onUploadClick: () => void;
  selectedCheckId: number | null;
}

export const StockCheckHeader = ({
  onNewCheck,
  onDownloadTemplate,
  onUploadClick,
  selectedCheckId,
}: StockCheckHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Stock Checks</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your inventory checks and update stock levels
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onNewCheck} className="flex items-center">
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
            <DropdownMenuItem onClick={onDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onUploadClick}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Stock Check
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
