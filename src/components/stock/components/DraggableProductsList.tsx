
import { Product } from "@/types/database";
import { ProductsTable } from "../ProductsTable";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface DraggableProductsListProps {
  products: Product[];
  selectedProduct: Product | null;
  onProductSelect: (product: Product) => void;
  onStockUpdate: (sku: string, quantity: number) => void;
  onProductUpdate: (event: React.FormEvent<HTMLFormElement>) => void;
  onOrderUpdate: (updates: { sku: string; order_index: number }[]) => void;
  updatedFields: string[];
}

export const DraggableProductsList = ({
  products,
  selectedProduct,
  onProductSelect,
  onStockUpdate,
  onProductUpdate,
  onOrderUpdate,
  updatedFields,
}: DraggableProductsListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = products.findIndex((item) => item.sku === active.id);
      const newIndex = products.findIndex((item) => item.sku === over.id);
      
      const newOrder = arrayMove(products, oldIndex, newIndex);
      const updates = newOrder.map((product, index) => ({
        sku: product.sku,
        order_index: index,
      }));
      
      onOrderUpdate(updates);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[]}
    >
      <SortableContext
        items={products.map(p => p.sku)}
        strategy={verticalListSortingStrategy}
      >
        <ProductsTable
          products={products}
          selectedProduct={selectedProduct}
          onProductSelect={onProductSelect}
          onStockUpdate={onStockUpdate}
          onProductUpdate={onProductUpdate}
          updatedFields={updatedFields}
        />
      </SortableContext>
    </DndContext>
  );
};
