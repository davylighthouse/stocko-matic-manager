
import { cn } from "@/lib/utils";

interface StockLevelIndicatorProps {
  stockLevel: number;
  threshold: number;
}

export const StockLevelIndicator = ({ stockLevel, threshold }: StockLevelIndicatorProps) => {
  return (
    <div 
      className={cn(
        "px-3 py-1 rounded-full inline-flex items-center",
        stockLevel <= threshold 
          ? "bg-red-100 text-red-800" 
          : "bg-green-100 text-green-800"
      )}
    >
      <span className="text-sm font-medium">{stockLevel}</span>
      {stockLevel <= threshold && (
        <span className="ml-1 text-xs">Low Stock</span>
      )}
    </div>
  );
};
