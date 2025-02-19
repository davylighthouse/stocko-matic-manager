import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Upload as UploadIcon, FileText, X, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { processCSV, downloadProductTemplate } from "@/lib/supabase/database/csv";
import { downloadSalesTemplate } from "@/lib/supabase/database/sales";
import { Separator } from "@/components/ui/separator";

const Upload = () => {
  const [isDraggingSales, setIsDraggingSales] = useState(false);
  const [isDraggingProducts, setIsDraggingProducts] = useState(false);
  const [salesFile, setSalesFile] = useState<File | null>(null);
  const [productsFile, setProductsFile] = useState<File | null>(null);
  const [isUploadingSales, setIsUploadingSales] = useState(false);
  const [isUploadingProducts, setIsUploadingProducts] = useState(false);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent, setDragging: (dragging: boolean) => void) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent, setDragging: (dragging: boolean) => void) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = async (e: React.DragEvent, type: 'sales' | 'products') => {
    e.preventDefault();
    if (type === 'sales') {
      setIsDraggingSales(false);
    } else {
      setIsDraggingProducts(false);
    }

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type !== "text/csv") {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    if (type === 'sales') {
      setSalesFile(droppedFile);
    } else {
      setProductsFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'sales' | 'products') => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "text/csv") {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    if (type === 'sales') {
      setSalesFile(selectedFile);
    } else {
      setProductsFile(selectedFile);
    }
  };

  const handleUpload = async (type: 'sales' | 'products') => {
    const file = type === 'sales' ? salesFile : productsFile;
    if (!file) return;

    if (type === 'sales') {
      setIsUploadingSales(true);
    } else {
      setIsUploadingProducts(true);
    }

    try {
      const result = await processCSV(file);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "File processed successfully",
        });
        if (type === 'sales') {
          setSalesFile(null);
        } else {
          setProductsFile(null);
        }
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process the CSV file",
        variant: "destructive",
      });
    } finally {
      if (type === 'sales') {
        setIsUploadingSales(false);
      } else {
        setIsUploadingProducts(false);
      }
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadProductTemplate();
      toast({
        title: "Success",
        description: "Template downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download template",
        variant: "destructive",
      });
    }
  };

  const handleDownloadSalesTemplate = async () => {
    try {
      await downloadSalesTemplate();
      toast({
        title: "Success",
        description: "Sales template downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download template",
        variant: "destructive",
      });
    }
  };

  const renderUploadZone = (type: 'sales' | 'products') => {
    const isDragging = type === 'sales' ? isDraggingSales : isDraggingProducts;
    const file = type === 'sales' ? salesFile : productsFile;
    const setDragging = type === 'sales' ? setIsDraggingSales : setIsDraggingProducts;
    const isUploading = type === 'sales' ? isUploadingSales : isUploadingProducts;
    const inputId = `${type}-file-upload`;

    return (
      <div
        className={cn(
          "dropzone",
          isDragging ? "dropzone-active" : "border-gray-300",
          file ? "bg-gray-50" : ""
        )}
        onDragOver={(e) => handleDragOver(e, setDragging)}
        onDragLeave={(e) => handleDragLeave(e, setDragging)}
        onDrop={(e) => handleDrop(e, type)}
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
                  onChange={(e) => handleFileSelect(e, type)}
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
              onClick={() => type === 'sales' ? setSalesFile(null) : setProductsFile(null)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Upload Data</h1>
        <p className="mt-2 text-sm text-gray-600">
          Upload your data files or download templates
        </p>
      </div>

      <Card className="bg-white">
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Product Information</h2>
            <div className="space-y-4">
              <Button
                onClick={handleDownloadTemplate}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Product Template
              </Button>
              {renderUploadZone('products')}
              <Button
                onClick={() => handleUpload('products')}
                disabled={!productsFile || isUploadingProducts}
                className="w-full"
              >
                {isUploadingProducts ? "Processing..." : "Upload Product Data"}
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-lg font-semibold mb-4">Sales Data</h2>
            <div className="space-y-4">
              <Button
                onClick={handleDownloadSalesTemplate}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Sales Template
              </Button>
              {renderUploadZone('sales')}
              <Button
                onClick={() => handleUpload('sales')}
                disabled={!salesFile || isUploadingSales}
                className="w-full"
              >
                {isUploadingSales ? "Processing..." : "Upload Sales Data"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Upload;
