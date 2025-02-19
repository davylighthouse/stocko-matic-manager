
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { UploadZone } from "./UploadZone";

interface UploadSectionProps {
  title: string;
  type: 'sales' | 'products';
  file: File | null;
  isDragging: boolean;
  setDragging: (dragging: boolean) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onDownloadTemplate: () => Promise<void>;
  onUpload: () => Promise<void>;
  isUploading: boolean;
}

export const UploadSection = ({
  title,
  type,
  file,
  isDragging,
  setDragging,
  onDrop,
  onFileSelect,
  onRemoveFile,
  onDownloadTemplate,
  onUpload,
  isUploading,
}: UploadSectionProps) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="space-y-4">
        <Button
          onClick={onDownloadTemplate}
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download {type === 'sales' ? 'Sales' : 'Product'} Template
        </Button>
        <UploadZone
          isDragging={isDragging}
          file={file}
          setDragging={setDragging}
          onDrop={onDrop}
          onFileSelect={onFileSelect}
          onRemoveFile={onRemoveFile}
          inputId={`${type}-file-upload`}
        />
        <Button
          onClick={onUpload}
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? "Processing..." : `Upload ${type === 'sales' ? 'Sales' : 'Product'} Data`}
        </Button>
      </div>
    </div>
  );
};
