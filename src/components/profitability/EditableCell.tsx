
import { TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { EditableCellProps } from "./types";

interface EditableCellWithWidthProps extends EditableCellProps {
  width?: string;
}

export const EditableCell = ({ value, field, onChange, format, width, type = 'text' }: EditableCellWithWidthProps) => {
  return (
    <TableCell style={{ width }}>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(field, type === 'number' ? parseFloat(e.target.value) : e.target.value)}
        className="w-full px-2 py-1 text-sm"
      />
    </TableCell>
  );
};
