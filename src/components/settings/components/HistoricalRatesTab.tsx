
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlatformFeesHistory } from "./history/PlatformFeesHistory";
import { ProductCostsHistory } from "./history/ProductCostsHistory";
import { ShippingRatesHistory } from "./history/ShippingRatesHistory";
import { PickingFeesHistory } from "./history/PickingFeesHistory";

export const HistoricalRatesTab = () => {
  return (
    <Tabs defaultValue="platform-fees" className="space-y-4">
      <TabsList>
        <TabsTrigger value="platform-fees">Platform Fees</TabsTrigger>
        <TabsTrigger value="product-costs">Product Costs</TabsTrigger>
        <TabsTrigger value="shipping-rates">Shipping Rates</TabsTrigger>
        <TabsTrigger value="picking-fees">Picking Fees</TabsTrigger>
      </TabsList>

      <TabsContent value="platform-fees">
        <PlatformFeesHistory />
      </TabsContent>

      <TabsContent value="product-costs">
        <ProductCostsHistory />
      </TabsContent>

      <TabsContent value="shipping-rates">
        <ShippingRatesHistory />
      </TabsContent>

      <TabsContent value="picking-fees">
        <PickingFeesHistory />
      </TabsContent>
    </Tabs>
  );
};
