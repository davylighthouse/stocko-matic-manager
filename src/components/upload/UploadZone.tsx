
import { FileText, Upload as UploadIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  isDragging: boolean;
  file: File | null;
  setDragging: (dragging: boolean) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  inputId: string;
}

export const UploadZone = ({
  isDragging,
  file,
  setDragging,
  onDrop,
  onFileSelect,
  onRemoveFile,
  inputId,
}: UploadZoneProps) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  return (
    <div
      className={cn(
        "dropzone",
        isDragging ? "dropzone-active" : "border-gray-300",
        file ? "bg-gray-50" : ""
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={onDrop}
    >
      {!file ? (
        <div className="text-center">
          <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label
              htmlFor={inputId}
              className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none"
            >
              <span>Upload a file</span>
              <input
                id={inputId}
                name={inputId}
                type="file"
                accept=".csv"
                className="sr-only"
                onChange={onFileSelect}
              />
            </label>
            <p className="text-sm text-gray-500">
              or drag and drop your CSV file here
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-gray-400" />
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {file.name}
              </div>
              <div className="text-sm text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </div>
            </div>
          </div>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onClick={onRemoveFile}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};
