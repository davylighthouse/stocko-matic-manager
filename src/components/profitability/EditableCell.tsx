
import { Input } from "@/components/ui/input";
import { EditableCellProps } from "./types";

export const EditableCell = ({ value, field, type = 'text', onChange }: EditableCellProps) => {
  return (
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(field, type === 'number' ? parseFloat(e.target.value) : e.target.value)}
      className="w-full"
    />
  );
};
