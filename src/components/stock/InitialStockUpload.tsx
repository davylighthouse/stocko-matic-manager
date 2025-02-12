
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
        <Input
          type="file"
          accept=".csv"
          onChange={onFileUpload}
          className="mb-4"
        />
      </div>
    </Card>
  );
};
