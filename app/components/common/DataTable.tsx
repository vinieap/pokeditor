import { useState } from "react";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  rowKey: (item: T) => string | number;
  className?: string;
}

export function DataTable<T>({ 
  data, 
  columns, 
  onRowClick, 
  rowKey,
  className = ""
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aVal = (a as any)[sortColumn];
    const bVal = (b as any)[sortColumn];
    
    if (aVal === bVal) return 0;
    
    const result = aVal < bVal ? -1 : 1;
    return sortDirection === "asc" ? result : -result;
  });

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full bg-white dark:bg-gray-800 border border-gray-200">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b ${
                  column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                }`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.header}</span>
                  {column.sortable && sortColumn === column.key && (
                    <span className="text-blue-500">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
          {sortedData.map(item => (
            <tr
              key={rowKey(item)}
              className={`hover:bg-gray-50 dark:bg-gray-900 ${onRowClick ? "cursor-pointer" : ""}`}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map(column => (
                <td key={column.key} className="px-4 py-3 text-sm text-gray-900">
                  {column.render 
                    ? column.render(item) 
                    : String((item as any)[column.key] || "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No data available
        </div>
      )}
    </div>
  );
}