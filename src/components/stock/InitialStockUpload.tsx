
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";
import { generateStockCheckTemplate } from "@/lib/supabase/database/csv/initial-stock-csv";

interface InitialStockUploadProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InitialStockUpload = ({ onFileUpload }: InitialStockUploadProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Initial Stock Upload</h2>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Upload initial stock levels with effective dates. This will be used as the baseline for stock calculations.
        </p>
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".csv"
            onChange={onFileUpload}
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={generateStockCheckTemplate}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>
        </div>
      </div>
    </Card>
  );
};
