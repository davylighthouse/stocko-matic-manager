
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { processCSV, downloadProductTemplate } from "@/lib/supabase/database/csv";
import { downloadSalesTemplate } from "@/lib/supabase/database/sales";
import { Separator } from "@/components/ui/separator";
import { UploadSection } from "@/components/upload/UploadSection";

const Upload = () => {
  const [isDraggingSales, setIsDraggingSales] = useState(false);
  const [isDraggingProducts, setIsDraggingProducts] = useState(false);
  const [salesFile, setSalesFile] = useState<File | null>(null);
  const [productsFile, setProductsFile] = useState<File | null>(null);
  const [isUploadingSales, setIsUploadingSales] = useState(false);
  const [isUploadingProducts, setIsUploadingProducts] = useState(false);
  const { toast } = useToast();

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
          <UploadSection
            title="Product Information"
            type="products"
            file={productsFile}
            isDragging={isDraggingProducts}
            setDragging={setIsDraggingProducts}
            onDrop={(e) => handleDrop(e, 'products')}
            onFileSelect={(e) => handleFileSelect(e, 'products')}
            onRemoveFile={() => setProductsFile(null)}
            onDownloadTemplate={downloadProductTemplate}
            onUpload={() => handleUpload('products')}
            isUploading={isUploadingProducts}
          />

          <Separator />

          <UploadSection
            title="Sales Data"
            type="sales"
            file={salesFile}
            isDragging={isDraggingSales}
            setDragging={setIsDraggingSales}
            onDrop={(e) => handleDrop(e, 'sales')}
            onFileSelect={(e) => handleFileSelect(e, 'sales')}
            onRemoveFile={() => setSalesFile(null)}
            onDownloadTemplate={downloadSalesTemplate}
            onUpload={() => handleUpload('sales')}
            isUploading={isUploadingSales}
          />
        </div>
      </Card>
    </div>
  );
};

export default Upload;
