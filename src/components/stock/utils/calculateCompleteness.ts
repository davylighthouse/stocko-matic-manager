
import { Product } from "@/types/database";

export const calculateCompleteness = (product: Product): { percentage: number; missingFields: string[] } => {
  const requiredFields = [
    { name: 'listing_title', label: 'Title', defaultValue: product.sku },
    { name: 'product_cost', label: 'Product Cost', defaultValue: null },
    { name: 'supplier', label: 'Supplier', defaultValue: null },
    { name: 'warehouse_location', label: 'Warehouse Location', defaultValue: null },
    { name: 'product_status', label: 'Product Status', defaultValue: null },
    { name: 'default_shipping_service', label: 'Shipping Service', defaultValue: null },
    { name: 'vat_status', label: 'VAT Status', defaultValue: null },
    { name: 'dimensions_height', label: 'Height', defaultValue: null },
    { name: 'dimensions_width', label: 'Width', defaultValue: null },
    { name: 'dimensions_length', label: 'Length', defaultValue: null },
    { name: 'weight', label: 'Weight', defaultValue: null },
    { name: 'packaging_cost', label: 'Packaging Cost', defaultValue: null },
    { name: 'making_up_cost', label: 'Making Up Cost', defaultValue: null }
  ];

  const missingFields = requiredFields.filter(field => {
    const value = product[field.name as keyof Product];
    return value !== field.defaultValue && (value === null || value === undefined || value === '');
  });

  const percentage = ((requiredFields.length - missingFields.length) / requiredFields.length) * 100;

  return {
    percentage,
    missingFields: missingFields.map(f => f.label)
  };
};
