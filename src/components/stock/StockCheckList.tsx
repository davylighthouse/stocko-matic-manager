
import { format } from "date-fns";
import { ClipboardList } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StockCheck } from "@/types/stock-checks";
import { useQuery } from "@tanstack/react-query";
import { getStockCheckItems } from "@/lib/supabase/database";

interface StockCheckListProps {
  stockChecks: StockCheck[];
  selectedCheckId: number | null;
  onSelectCheck: (id: number) => void;
}

export const StockCheckList = ({ stockChecks, selectedCheckId, onSelectCheck }: StockCheckListProps) => {
  const { data: selectedCheckItems = [] } = useQuery({
    queryKey: ['stock-check-items', selectedCheckId],
    queryFn: () => selectedCheckId ? getStockCheckItems(selectedCheckId) : Promise.resolve([]),
    enabled: !!selectedCheckId,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Previous Stock Checks</CardTitle>
        <CardDescription>Select a stock check to view details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stockChecks.map((check: StockCheck) => {
            const isSelected = selectedCheckId === check.id;
            const itemCount = isSelected ? selectedCheckItems.length : 0;

            return (
              <div
                key={check.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => onSelectCheck(check.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ClipboardList className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">
                        {format(new Date(check.check_date), "PPP")}
                      </p>
                      <p className="text-sm text-gray-500">
                        {isSelected ? (
                          <>
                            {itemCount} SKUs checked
                            {check.notes && (
                              <span className="block mt-1">{check.notes}</span>
                            )}
                          </>
                        ) : (
                          `${itemCount} SKUs checked`
                        )}
                      </p>
                    </div>
                  </div>
                  {check.completed ? (
                    <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                      Completed
                    </span>
                  ) : (
                    <span className="text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
