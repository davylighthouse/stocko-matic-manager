
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlatformSettings } from "@/components/settings/PlatformSettings";
import { ShippingSettings } from "@/components/settings/ShippingSettings";
import { PickingSettings } from "@/components/settings/PickingSettings";
import { AmazonFBASettings } from "@/components/settings/components/AmazonFBASettings";
import { HistoricalRatesTab } from "@/components/settings/components/HistoricalRatesTab";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your platform fees, shipping rates, and other settings
        </p>
      </div>

      <Tabs defaultValue="platforms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="picking">Picking Fees</TabsTrigger>
          <TabsTrigger value="fba">Amazon FBA</TabsTrigger>
          <TabsTrigger value="history">Historical Rates</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-4">
          <PlatformSettings />
        </TabsContent>

        <TabsContent value="shipping" className="space-y-4">
          <ShippingSettings />
        </TabsContent>

        <TabsContent value="picking" className="space-y-4">
          <PickingSettings />
        </TabsContent>

        <TabsContent value="fba" className="space-y-4">
          <AmazonFBASettings />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <HistoricalRatesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
