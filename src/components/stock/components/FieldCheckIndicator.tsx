
import { Check } from "lucide-react";

interface FieldCheckIndicatorProps {
  fieldName: string;
  updatedFields: string[];
  children: React.ReactNode;
}

export const FieldCheckIndicator = ({
  fieldName,
  updatedFields,
  children,
}: FieldCheckIndicatorProps) => {
  return (
    <div className="relative">
      {children}
      {updatedFields.includes(fieldName) && (
        <Check className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
      )}
    </div>
  );
};
