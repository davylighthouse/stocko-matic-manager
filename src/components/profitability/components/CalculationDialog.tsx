
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calculator } from "lucide-react";

interface CalculationDialogProps {
  title: string;
  value: React.ReactNode;
  tooltipContent: string;
  className?: string;
}

export const CalculationDialog = ({ title, value, tooltipContent, className = "" }: CalculationDialogProps) => (
  <Dialog>
    <DialogTrigger asChild>
      <div className={`group inline-flex items-center gap-1 cursor-pointer ${className}`}>
        {value}
        <Calculator className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>
    </DialogTrigger>
    <DialogContent className="bg-slate-900 text-slate-50">
      <DialogHeader>
        <DialogTitle className="text-slate-200">{title}</DialogTitle>
        <DialogDescription>
          <pre className="text-sm whitespace-pre-wrap font-mono bg-slate-800 p-4 rounded mt-4 text-slate-100">
            {tooltipContent}
          </pre>
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
);
