interface StatusBarProps {
  message?: string;
  status?: "idle" | "loading" | "success" | "error";
  fileInfo?: {
    name: string;
    lastModified?: Date;
  };
}

export function StatusBar({ message = "Ready", status = "idle", fileInfo }: StatusBarProps) {
  const statusColors = {
    idle: "bg-gray-100 text-gray-700",
    loading: "bg-blue-100 text-blue-700",
    success: "bg-green-100 text-green-700",
    error: "bg-red-100 text-red-700",
  };

  return (
    <div className={`border-t border-gray-200 px-4 py-2 flex items-center justify-between text-sm ${statusColors[status]}`}>
      <div className="flex items-center space-x-4">
        {status === "loading" && (
          <span className="animate-pulse">⏳</span>
        )}
        <span>{message}</span>
      </div>
      
      {fileInfo && (
        <div className="text-gray-600">
          <span>{fileInfo.name}</span>
          {fileInfo.lastModified && (
            <span className="ml-2">
              Modified: {fileInfo.lastModified.toLocaleString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}