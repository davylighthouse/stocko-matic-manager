
import { format } from "date-fns";

interface Column<T> {
  header: string;
  key: keyof T;
  align?: "left" | "right";
  format?: (value: any, row?: T) => string;
}

interface HistoryTableProps<T> {
  data: T[];
  columns: Column<T>[];
}

export function HistoryTable<T>({ data, columns }: HistoryTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            {columns.map((column) => (
              <th 
                key={String(column.key)} 
                className={`px-4 py-2 text-${column.align || 'left'}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-b">
              {columns.map((column) => (
                <td 
                  key={String(column.key)} 
                  className={`px-4 py-2 text-${column.align || 'left'}`}
                >
                  {column.format 
                    ? column.format(row[column.key], row)
                    : String(row[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
