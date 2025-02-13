
import { Circle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ProductStatusIndicatorProps {
  percentage: number;
  missingFields: string[];
}

export const ProductStatusIndicator = ({ percentage, missingFields }: ProductStatusIndicatorProps) => {
  const completenessColor = 
    percentage === 100 ? "text-green-500" :
    percentage >= 70 ? "text-yellow-500" :
    "text-red-500";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex items-center">
            <Circle className={cn("h-4 w-4 fill-current", completenessColor)} />
            <span className="ml-2 text-sm text-gray-500">
              {percentage.toFixed(0)}%
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {missingFields.length > 0
            ? `Missing information: ${missingFields.join(', ')}`
            : 'All information complete'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
