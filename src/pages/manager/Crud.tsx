import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManageDestinations from "@/pages/admin/ManageDestinations";
import ManageHotels from "@/pages/admin/ManageHotels";
import ManageRestaurants from "@/pages/admin/ManageRestaurants";
import ManageTransport from "@/pages/admin/ManageTransport";

const Crud = () => (
  <div className="space-y-6">
    <header>
      <h1 className="font-display font-extrabold text-3xl md:text-4xl">Manage Catalog</h1>
      <p className="text-muted-foreground mt-1">Add, edit & delete content.</p>
    </header>
    <Tabs defaultValue="dest">
      <TabsList className="grid grid-cols-4 w-full sm:w-fit">
        <TabsTrigger value="dest">Destinations</TabsTrigger>
        <TabsTrigger value="hotels">Hotels</TabsTrigger>
        <TabsTrigger value="resto">Restaurants</TabsTrigger>
        <TabsTrigger value="trans">Transport</TabsTrigger>
      </TabsList>
      <TabsContent value="dest" className="mt-6"><ManageDestinations /></TabsContent>
      <TabsContent value="hotels" className="mt-6"><ManageHotels /></TabsContent>
      <TabsContent value="resto" className="mt-6"><ManageRestaurants /></TabsContent>
      <TabsContent value="trans" className="mt-6"><ManageTransport /></TabsContent>
    </Tabs>
  </div>
);

export default Crud;
