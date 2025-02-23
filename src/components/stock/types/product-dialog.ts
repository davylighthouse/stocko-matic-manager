
import { Product } from "@/types/database";

export interface ProductEditDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStockUpdate: (sku: string, quantity: number) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  updatedFields?: string[];
}

export interface ShippingService {
  id: number;
  service_name: string;
  courier: string;
}

export interface PickingFee {
  id: number;
  fee_name: string;
  fee_amount: number;
}

export interface TabContentProps {
  product: Product;
  updatedFields: string[];
  renderFieldWithCheck: (fieldName: string, children: React.ReactNode) => React.ReactElement;
  onStockUpdate?: (sku: string, quantity: number) => void;
}

