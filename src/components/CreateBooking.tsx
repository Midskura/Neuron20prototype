import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  FileText,
  Plane,
  Ship,
  MapPin,
  Truck,
  Check,
  ChevronsUpDown,
  X,
  Plus,
  Trash2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "./ui/utils";
import { toast } from "./ui/toast-utils";

interface CreateBookingProps {
  onBack: () => void;
  onSubmit: (booking: any) => void;
  prefilledClientId?: string | null;
  prefilledTemplateId?: string | null;
}

type ShipmentType = "IMPS" | "EXPS" | "DOM" | "TRK";
type TransportMode = "AIR" | "SEA" | "TRK" | "DOM";
type LoadType = "FCL" | "LCL";

// Mock client data mapping
const clientDataMap: Record<string, { name: string; id: string }> = {
  "1": { name: "Acme Trading Corp", id: "1" },
  "2": { name: "Global Imports Ltd", id: "2" },
  "3": { name: "Metro Retail Group", id: "3" },
  "4": { name: "Pacific Distribution Co", id: "4" },
  "5": { name: "Sterling Supply Chain", id: "5" },
  "6": { name: "Northern Logistics Inc", id: "6" },
};

// Mock template data mapping
const templateDataMap: Record<string, {
  templateName: string;
  mode: TransportMode;
  route: string;
  notes: string;
  shipmentType: ShipmentType;
  loadType: LoadType;
}> = {
  "p1": { templateName: "Standard Retail Shipment", mode: "SEA", route: "Manila → Cebu", notes: "Temperature-controlled container", shipmentType: "IMPS", loadType: "LCL" },
  "p2": { templateName: "Express Delivery", mode: "AIR", route: "Manila → Cebu", notes: "Priority handling required", shipmentType: "IMPS", loadType: "LCL" },
  "p3": { templateName: "Bulk Container", mode: "SEA", route: "Manila → Davao", notes: "FCL - 40ft container", shipmentType: "IMPS", loadType: "FCL" },
  "p4": { templateName: "Temperature Controlled", mode: "AIR", route: "Manila → Cebu", notes: "Refrigerated cargo, maintain 2-8°C", shipmentType: "IMPS", loadType: "LCL" },
};

export function CreateBooking({ onBack, onSubmit, prefilledClientId, prefilledTemplateId }: CreateBookingProps) {
  // Get prefilled client and template data
  const prefilledClient = prefilledClientId ? clientDataMap[prefilledClientId] : null;
  const prefilledTemplate = prefilledTemplateId ? templateDataMap[prefilledTemplateId] : null;
  
  // Booking source flag - determines if this is a normal create or template edit
  const initialBookingSource = prefilledTemplateId ? "template" : "new";
  const [bookingSource, setBookingSource] = useState<"new" | "template">(initialBookingSource);
  
  // New state management for smart form
  const [shipmentType, setShipmentType] = useState<ShipmentType>("IMPS"); // Import, Export, Domestic, Trucking
  const [mode, setMode] = useState<TransportMode>("SEA"); // AIR, SEA, TRK, DOM
  const [loadType, setLoadType] = useState<LoadType>("LCL"); // LCL, FCL
  const [sequenceNumber, setSequenceNumber] = useState("001");
  
  const [selectedClient, setSelectedClient] = useState(initialBookingSource === "template" && prefilledClient ? prefilledClient.name : "");
  const [clientInputValue, setClientInputValue] = useState(initialBookingSource === "template" && prefilledClient ? prefilledClient.name : "");
  const [openClientDropdown, setOpenClientDropdown] = useState(false);
  const [isClientLocked, setIsClientLocked] = useState(initialBookingSource === "template" && !!prefilledClient);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  
  const clientDropdownRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    shipper: "",
    consignee: "",
    etd: "",
    eta: "",
    containerNo: "",
    origin: "",
    destination: "",
    weight: "",
    weightUnit: "kg",
    awbBlNo: "",
    measurement: "",
    commodity: "",
    shippingLine: "",
    registryNo: "",
    warehouse: "",
    port: "",
    specialInstructions: "",
  });

  // Billing state management
  interface BillingLineItem {
    id: string;
    description: string;
    amount: number;
  }

  const [billingData, setBillingData] = useState({
    clientName: "",
    billingDate: new Date().toISOString().split("T")[0],
    billTo: "",
    billingNo: `BIL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`,
    clientAddress: "",
    company: "",
    notes: "Kindly make check payable to CONFORME CARGO EXPRESS",
    lineItems: [
      { id: "1", description: "", amount: 0 },
    ] as BillingLineItem[],
    paymentDetails: {
      bankName: "",
      accountName: "",
      accountNo: "",
      branch: "",
      swiftCode: "",
    },
  });

  const updateBillingLineItem = (id: string, updates: Partial<BillingLineItem>) => {
    setBillingData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };

  const addBillingLineItem = () => {
    setBillingData(prev => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        { id: Date.now().toString(), description: "", amount: 0 },
      ],
    }));
  };

  const deleteBillingLineItem = (id: string) => {
    if (billingData.lineItems.length === 1) return;
    setBillingData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== id),
    }));
  };

  const calculateBillingTotal = () => {
    return billingData.lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  // Client options
  const clients = [
    "Acme Trading Corp",
    "Delta Trading Ltd",
    "Sterling Supply Chain",
    "Apex Supply Co",
    "Global Imports Ltd",
    "Omega Industries",
    "Metro Retail Group",
    "Pacific Distribution Co",
    "Northern Logistics Inc",
    "Summit Freight Corp"
  ];

  // Template options with full mock data including billing
  const templates = [
    { 
      id: "t1", 
      name: "Standard Retail Shipment",
      client: "Acme Trading Corp",
      shipmentType: "IMPS" as ShipmentType,
      mode: "SEA" as TransportMode,
      loadType: "FCL" as LoadType,
      route: "Manila → Cebu", 
      notes: "Temperature-controlled container",
      shipper: "Global Trade Solutions Inc.",
      consignee: "Cebu Distribution Center",
      etd: "2025-12-01",
      eta: "2025-12-05",
      containerNo: "MSCU1234567",
      weight: "15000",
      weightUnit: "kg",
      awbBlNo: "MAEU456789012",
      measurement: "33.2 CBM",
      commodity: "Consumer Electronics",
      shippingLine: "Maersk Line",
      registryNo: "REG-2025-001234",
      warehouse: "Manila South Port",
      port: "Port of Manila",
      billing: {
        billTo: "Global Trade Solutions Inc.",
        clientAddress: "123 Business Park, Makati City, Metro Manila",
        company: "Global Trade Solutions Inc.",
        lineItems: [
          { id: "1", description: "Ocean Freight - FCL 40ft", amount: 45000 },
          { id: "2", description: "Documentation Fees", amount: 2500 },
          { id: "3", description: "Port Handling", amount: 8000 },
          { id: "4", description: "Customs Clearance", amount: 5500 },
        ]
      }
    },
    { 
      id: "t2", 
      name: "Express Delivery",
      client: "Delta Trading Ltd",
      shipmentType: "EXPS" as ShipmentType,
      mode: "AIR" as TransportMode,
      loadType: "LCL" as LoadType,
      route: "Manila → Cebu", 
      notes: "Priority handling required - fragile items",
      shipper: "Tech Export Corp.",
      consignee: "Cebu Tech Hub",
      etd: "2025-11-20",
      eta: "2025-11-21",
      containerNo: "N/A",
      weight: "850",
      weightUnit: "kg",
      awbBlNo: "235-45678901",
      measurement: "4.5 CBM",
      commodity: "Computer Parts",
      shippingLine: "Philippine Airlines Cargo",
      registryNo: "REG-2025-002456",
      warehouse: "NAIA Cargo Complex",
      port: "Ninoy Aquino International Airport",
      billing: {
        billTo: "Tech Export Corp.",
        clientAddress: "456 Technology Ave, Quezon City, Metro Manila",
        company: "Tech Export Corp.",
        lineItems: [
          { id: "1", description: "Air Freight - Express", amount: 28500 },
          { id: "2", description: "Priority Handling Fee", amount: 3500 },
          { id: "3", description: "Packaging & Crating", amount: 4200 },
          { id: "4", description: "Insurance Premium", amount: 2800 },
        ]
      }
    },
    { 
      id: "t3", 
      name: "Bulk Container",
      client: "Sterling Supply Chain",
      shipmentType: "DOMS" as ShipmentType,
      mode: "SEA" as TransportMode,
      loadType: "FCL" as LoadType,
      route: "Manila → Davao", 
      notes: "FCL - 40ft container, heavy machinery",
      shipper: "Industrial Equipment Philippines",
      consignee: "Davao Construction Supply",
      etd: "2025-11-25",
      eta: "2025-11-30",
      containerNo: "TEMU9876543",
      weight: "25000",
      weightUnit: "kg",
      awbBlNo: "OOLU987654321",
      measurement: "67.5 CBM",
      commodity: "Industrial Machinery",
      shippingLine: "Cosco Shipping",
      registryNo: "REG-2025-003789",
      warehouse: "Manila North Harbor",
      port: "Port of Manila",
      billing: {
        billTo: "Industrial Equipment Philippines",
        clientAddress: "789 Industrial Complex, Pasig City, Metro Manila",
        company: "Industrial Equipment Philippines",
        lineItems: [
          { id: "1", description: "Domestic Sea Freight - FCL 40ft", amount: 35000 },
          { id: "2", description: "Heavy Lift Surcharge", amount: 12000 },
          { id: "3", description: "Lashing & Securing", amount: 6500 },
          { id: "4", description: "Documentation & Processing", amount: 3500 },
          { id: "5", description: "Port Dues", amount: 4000 },
        ]
      }
    },
  ];

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generate tracking number based on JJB schema: {LOADTYPE}-{DELTYPE}-{###}-{MODE}
  const generateTrackingNumber = (): string => {
    let deliveryType = shipmentType;
    let transportMode = mode;
    
    // Special handling for Trucking: use DOM for delivery type and TRK for mode
    if (shipmentType === "TRK") {
      deliveryType = "DOM";
      transportMode = "TRK";
    }
    
    return `${loadType}-${deliveryType}-${sequenceNumber}-${transportMode}`;
  };

  // Live tracking number
  const trackingNumber = generateTrackingNumber();

  // Handle shipment type change
  const handleShipmentTypeChange = (type: ShipmentType) => {
    setShipmentType(type);
    
    // If switching to Trucking, set mode to TRK automatically
    if (type === "TRK") {
      setMode("TRK");
    } else if (mode === "TRK") {
      // If switching away from Trucking, reset to SEA
      setMode("SEA");
    }
  };

  // Handle mode change (AIR/SEA)
  const handleModeChange = (newMode: "AIR" | "SEA") => {
    setMode(newMode);
    
    // If AIR is selected, lock load type to LCL
    if (newMode === "AIR") {
      setLoadType("LCL");
    }
  };

  // Load template data when prefilledTemplateId is provided AND bookingSource is "template"
  useEffect(() => {
    if (prefilledTemplate && bookingSource === "template") {
      const [origin, destination] = prefilledTemplate.route.split(" → ");
      setFormData(prev => ({
        ...prev,
        origin: origin || "",
        destination: destination || "",
        specialInstructions: prefilledTemplate.notes || "",
      }));
      
      // Set shipment type, mode, and load type based on template
      setShipmentType(prefilledTemplate.shipmentType);
      setMode(prefilledTemplate.mode);
      setLoadType(prefilledTemplate.loadType);
    }
  }, [prefilledTemplate, bookingSource]);

  // Handle click outside to close client dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setOpenClientDropdown(false);
      }
    };

    if (openClientDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openClientDropdown]);

  // Debug: Log formData changes
  useEffect(() => {
    console.log("formData updated:", formData);
    console.log("  - shipper:", formData.shipper);
    console.log("  - consignee:", formData.consignee);
    console.log("  - origin:", formData.origin);
    console.log("  - destination:", formData.destination);
  }, [formData]);

  // Debug: Log billingData changes
  useEffect(() => {
    console.log("billingData updated:", billingData);
  }, [billingData]);

  // Sync client to billing data
  useEffect(() => {
    setBillingData(prev => ({
      ...prev,
      clientName: selectedClient,
    }));
  }, [selectedClient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if billing information is filled
    const isBillingFilled = billingData.clientName.trim() !== "" || 
                            billingData.lineItems.some(item => item.description.trim() !== "" || item.amount > 0);

    onSubmit({
      trackingNumber: trackingNumber,
      shipmentType,
      mode,
      loadType,
      client: selectedClient,
      ...formData,
    });

    // Show appropriate success message based on billing status
    if (isBillingFilled) {
      toast.success("Booking created successfully! Invoice has been generated.", `Tracking: ${trackingNumber} | Billing: ${billingData.billingNo}`);
    } else {
      toast.success("Booking created successfully!", `Tracking: ${trackingNumber}`);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    if (!templateId) return;

    const template = templates.find(t => t.id === templateId);
    if (!template) {
      console.log("Template not found for ID:", templateId);
      return;
    }

    console.log("Applying template:", template.name, template);
    console.log("Template shipper:", template.shipper);
    console.log("Template consignee:", template.consignee);
    console.log("Template billing:", template.billing);

    // Set client from template
    if (template.client) {
      setSelectedClient(template.client);
      setClientInputValue(template.client);
      console.log("Set client to:", template.client);
    }

    // Prefill form fields from template
    const [origin, destination] = template.route.split(" → ");
    const newFormData = {
      shipper: template.shipper || "",
      consignee: template.consignee || "",
      etd: template.etd || "",
      eta: template.eta || "",
      containerNo: template.containerNo || "",
      origin: origin || "",
      destination: destination || "",
      weight: template.weight || "",
      weightUnit: template.weightUnit || "kg",
      awbBlNo: template.awbBlNo || "",
      measurement: template.measurement || "",
      commodity: template.commodity || "",
      shippingLine: template.shippingLine || "",
      registryNo: template.registryNo || "",
      warehouse: template.warehouse || "",
      port: template.port || "",
      specialInstructions: template.notes || "",
    };
    console.log("Setting formData to:", newFormData);
    console.log("About to call setFormData...");
    setFormData(newFormData);
    console.log("Called setFormData");

    // Set shipment type, mode, and load type based on template
    console.log("Setting shipment type:", template.shipmentType, "mode:", template.mode, "loadType:", template.loadType);
    setShipmentType(template.shipmentType);
    setMode(template.mode);
    setLoadType(template.loadType);

    // Populate billing data from template
    if (template.billing) {
      console.log("Setting billing data:", template.billing);
      setBillingData(prev => ({
        ...prev,
        billTo: template.billing?.billTo || "",
        clientAddress: template.billing?.clientAddress || "",
        company: template.billing?.company || "",
        lineItems: template.billing?.lineItems || [{ id: "1", description: "", amount: 0 }],
      }));
    }
  };

  // Check if tracking number is valid (all segments filled)
  const isTrackingNumberValid = loadType && shipmentType && sequenceNumber && mode;

  // Handle clear template
  const handleClearTemplate = () => {
    // Switch to "new" mode
    setBookingSource("new");
    
    // Reset form to defaults
    setShipmentType("IMPS");
    setMode("SEA");
    setLoadType("LCL");
    setFormData({
      shipper: "",
      consignee: "",
      etd: "",
      eta: "",
      containerNo: "",
      origin: "",
      destination: "",
      weight: "",
      weightUnit: "kg",
      awbBlNo: "",
      measurement: "",
      commodity: "",
      shippingLine: "",
      registryNo: "",
      warehouse: "",
      port: "",
      specialInstructions: "",
    });
    
    // Clear client if it was prefilled from template
    if (prefilledClient) {
      setSelectedClient("");
      setClientInputValue("");
      setIsClientLocked(false);
    }
    
    toast.success("Template cleared");
  };

  // Handle save as template
  const handleSaveAsTemplate = () => {
    const finalTemplateName = templateName.trim() || (bookingSource === "template" && prefilledTemplate ? prefilledTemplate.templateName : "");
    
    if (!finalTemplateName) {
      toast.error("Please enter a template name");
      return;
    }

    // If editing an existing template
    if (bookingSource === "template") {
      toast.success(`Template "${finalTemplateName}" updated successfully!`);
    } else {
      // Creating a new template
      toast.success(`Template "${finalTemplateName}" saved successfully!`);
    }
    
    setShowSaveTemplateModal(false);
    setTemplateName("");
  };

  const philippinePorts = [
    "Manila - Port Area",
    "Manila - NAIA",
    "Batangas",
    "Cebu - Mactan",
    "Davao",
    "Subic",
    "Clark",
    "Cagayan de Oro",
    "Iloilo",
    "Zamboanga"
  ];

  // Show AIR/SEA selector only for Import, Export, Domestic (not Trucking)
  const showModeSelector = shipmentType !== "TRK";

  // Determine if Load Type can be changed
  const isLoadTypeChangeable = mode !== "AIR"; // LCL locked for AIR

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Back Button Section */}
      <div className="px-12 pt-8 pb-4">
        <div className="max-w-[1280px] mx-auto">
          <Button
            variant="ghost"
            onClick={onBack}
            className="hover:bg-[#E4EFEA] rounded-lg h-9 px-3 -ml-3 text-[#12332B]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {/* Main Header Section */}
      <div className="px-12 pb-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-start justify-between">
            {/* Left: Page Title */}
            <div className="flex flex-col gap-2">
              <h1 style={{ fontSize: '32px', fontWeight: 600, color: '#12332B', lineHeight: '1.2', marginBottom: '4px', letterSpacing: '-1.2px' }}>
                Create New Booking
              </h1>
              <div className="flex flex-col gap-1">
                {bookingSource === "template" && prefilledClient && (
                  <p className="text-[14px] text-[#0F766E]">
                    Creating a booking for {prefilledClient.name}
                  </p>
                )}
                <p style={{ fontSize: '14px', color: '#6B7A76' }}>
                  Configure shipment type, mode, and details
                </p>
                {bookingSource === "template" && prefilledTemplate && (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[13px] text-[#0F766E]">
                      Loaded from template: {prefilledTemplate.templateName}
                    </p>
                    <button
                      onClick={handleClearTemplate}
                      className="text-[13px] text-[#6B7A76] hover:text-[#12332B] underline"
                    >
                      Clear template
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowSaveTemplateModal(true)}
                variant="outline"
                className="border-[#E5ECE9] text-[#2E5147] hover:bg-[#F1F6F4] rounded-xl h-12 px-6"
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Template
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isTrackingNumberValid}
                className="bg-[#0F766E] hover:bg-[#0D6259] text-white rounded-xl h-12 px-6 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Create Booking
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="px-12 pb-12">
        <div className="max-w-[1280px] mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-3 gap-6">
              {/* Left Column - Form Details (2/3) */}
              <div className="col-span-2 space-y-6">
                {/* Shipment Type Selector */}
                <Card className="p-6 bg-white border border-[#E5E9F0] rounded-xl">
                  <div className="space-y-6">
                    {/* Shipment Type Pills */}
                    <div>
                      <Label className="text-[11px] text-[#6B7A76] mb-3 block">
                        Shipment Type <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex gap-2">
                        {[
                          { value: "IMPS" as ShipmentType, label: "Import" },
                          { value: "EXPS" as ShipmentType, label: "Export" },
                          { value: "DOM" as ShipmentType, label: "Domestic" },
                          { value: "TRK" as ShipmentType, label: "Trucking" },
                        ].map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => handleShipmentTypeChange(type.value)}
                            className={cn(
                              "flex-1 px-4 py-3 rounded-lg text-[13px] font-medium transition-all border",
                              shipmentType === type.value
                                ? "bg-[#0F766E] text-white border-[#0F766E]"
                                : "bg-white text-[#6B7A76] border-[#E5ECE9] hover:border-[#237F66] hover:bg-[#F7FAF8]"
                            )}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Mode of Transport (AIR/SEA) - Conditional */}
                    {showModeSelector && (
                      <div>
                        <Label className="text-[11px] text-[#6B7A76] mb-3 block">
                          Mode of Transport <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex gap-2">
                          {[
                            { value: "AIR" as const, label: "AIR", icon: Plane },
                            { value: "SEA" as const, label: "SEA", icon: Ship },
                          ].map((transportMode) => (
                            <button
                              key={transportMode.value}
                              type="button"
                              onClick={() => handleModeChange(transportMode.value)}
                              className={cn(
                                "flex-1 px-4 py-3 rounded-lg text-[13px] font-medium transition-all border flex items-center justify-center gap-2",
                                mode === transportMode.value
                                  ? "bg-[#0F766E] text-white border-[#0F766E]"
                                  : "bg-white text-[#6B7A76] border-[#E5ECE9] hover:border-[#237F66] hover:bg-[#F7FAF8]"
                              )}
                            >
                              <transportMode.icon className="w-4 h-4" />
                              {transportMode.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Load Type (LCL/FCL) */}
                    <div>
                      <Label className="text-[11px] text-[#6B7A76] mb-3 block">
                        Load Type <span className="text-red-500">*</span>
                        {mode === "AIR" && (
                          <span className="text-[#6B7280] text-[10px] ml-2">(Locked to LCL for AIR)</span>
                        )}
                      </Label>
                      <div className="flex gap-2">
                        {[
                          { value: "LCL" as LoadType, label: "LCL" },
                          { value: "FCL" as LoadType, label: "FCL" },
                        ].map((load) => (
                          <button
                            key={load.value}
                            type="button"
                            onClick={() => isLoadTypeChangeable && setLoadType(load.value)}
                            disabled={mode === "AIR" && load.value === "FCL"}
                            className={cn(
                              "flex-1 px-4 py-3 rounded-lg text-[13px] font-medium transition-all border",
                              loadType === load.value
                                ? "bg-[#0F766E] text-white border-[#0F766E]"
                                : "bg-white text-[#6B7A76] border-[#E5ECE9] hover:border-[#237F66] hover:bg-[#F7FAF8]",
                              mode === "AIR" && load.value === "FCL" && "opacity-30 cursor-not-allowed"
                            )}
                          >
                            {load.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Client & Template Selection */}
                <Card className="p-6 bg-white border border-[#E5E9F0] rounded-xl">
                  <div className="space-y-6">
                    {/* Client */}
                    <div className="relative" ref={clientDropdownRef}>
                      <Label htmlFor="client" className="text-[11px] text-[#6B7280] mb-2 block">
                        Client {isClientLocked && <span className="text-[#0F766E] text-[10px] ml-1">(Auto-filled)</span>}
                      </Label>
                      <div className="relative">
                        <Input
                          id="client"
                          type="text"
                          value={clientInputValue}
                          disabled={isClientLocked}
                          onChange={(e) => {
                            setClientInputValue(e.target.value);
                            setSelectedClient(e.target.value);
                            setOpenClientDropdown(true);
                            if (errors.client) {
                              setErrors({ ...errors, client: "" });
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              setOpenClientDropdown(false);
                            }
                          }}
                          onFocus={() => !isClientLocked && setOpenClientDropdown(true)}
                          placeholder="Select or type client name"
                          className={cn(
                            "h-11 border-[#E5E7EB] rounded-lg text-[13px] pr-8",
                            isClientLocked && "bg-[#F9FAFB] cursor-not-allowed",
                            errors.client && "border-red-500"
                          )}
                        />
                        {!isClientLocked && (
                          <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                        )}
                      </div>
                      
                      {/* Dropdown suggestions */}
                      {openClientDropdown && !isClientLocked && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-[#E5E7EB] rounded-lg shadow-lg overflow-hidden">
                          <div className="max-h-[300px] overflow-y-auto">
                            {clients
                              .filter(client => 
                                client.toLowerCase().includes(clientInputValue.toLowerCase())
                              )
                              .map((client) => (
                                <button
                                  key={client}
                                  type="button"
                                  onClick={() => {
                                    setClientInputValue(client);
                                    setSelectedClient(client);
                                    setOpenClientDropdown(false);
                                    if (errors.client) {
                                      setErrors({ ...errors, client: "" });
                                    }
                                  }}
                                  className={cn(
                                    "w-full px-3 py-2.5 text-left text-[13px] hover:bg-[#F9FAFB] transition-colors flex items-center justify-between",
                                    selectedClient === client && "bg-[#0F766E] text-white hover:bg-[#0F766E]"
                                  )}
                                >
                                  <span>{client}</span>
                                  {selectedClient === client && (
                                    <Check className="h-4 w-4" />
                                  )}
                                </button>
                              ))}
                            {clients.filter(client => 
                              client.toLowerCase().includes(clientInputValue.toLowerCase())
                            ).length === 0 && clientInputValue && (
                              <div className="px-3 py-2.5 text-[13px] text-[#6B7280]">
                                No matches found. Press Enter to use "{clientInputValue}"
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {errors.client && (
                        <p className="text-red-500 text-[11px] mt-1">{errors.client}</p>
                      )}
                    </div>

                    {/* Template */}
                    <div>
                      <Label htmlFor="template" className="text-[11px] text-[#6B7280] mb-2 block">
                        Template
                      </Label>
                      <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                        <SelectTrigger className="h-11 border-[#E5E7EB] rounded-lg text-[13px] font-medium">
                          <SelectValue placeholder="No template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedTemplate && (
                        <p className="text-[#6B7280] text-[11px] mt-2 flex items-center gap-1">
                          <span className="inline-block w-1 h-1 rounded-full bg-[#0F766E]"></span>
                          Fields prefilled from template. You can edit them.
                        </p>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Shipment Details Form */}
                <Card key={selectedTemplate || 'no-template'} className="p-6 bg-white border border-[#E5E9F0] rounded-xl">
                  <div className="mb-6">
                    <h2 className="text-[14px] font-medium text-[#0A1D4D] mb-1">Shipment Details</h2>
                    <p className="text-[11px] text-[#6B7280]">Enter shipment information and route details</p>
                    <div className="mt-4 border-b border-[#E5E7EB]"></div>
                  </div>

                  <div className="space-y-6">
                    {/* Shipper */}
                    <div>
                      <Label htmlFor="shipper" className="text-[11px] text-[#6B7280] mb-2 block">
                        Shipper
                      </Label>
                      <Input
                        id="shipper"
                        value={formData.shipper}
                        onChange={(e) => {
                          setFormData({ ...formData, shipper: e.target.value });
                          if (errors.shipper) setErrors({ ...errors, shipper: "" });
                        }}
                        placeholder="Enter shipper name"
                        className={`h-11 border-[#E5E7EB] rounded-lg bg-white transition-colors text-[13px] font-medium ${
                          errors.shipper ? "border-red-500" : ""
                        }`}
                      />
                      {errors.shipper && (
                        <p className="text-red-500 text-[11px] mt-1">{errors.shipper}</p>
                      )}
                    </div>

                    {/* Consignee */}
                    <div>
                      <Label htmlFor="consignee" className="text-[11px] text-[#6B7280] mb-2 block">
                        Consignee
                      </Label>
                      <Input
                        id="consignee"
                        value={formData.consignee}
                        onChange={(e) => {
                          setFormData({ ...formData, consignee: e.target.value });
                          if (errors.consignee) setErrors({ ...errors, consignee: "" });
                        }}
                        placeholder="Enter consignee name"
                        className={`h-11 border-[#E5E7EB] rounded-lg bg-white transition-colors text-[13px] font-medium ${
                          errors.consignee ? "border-red-500" : ""
                        }`}
                      />
                      {errors.consignee && (
                        <p className="text-red-500 text-[11px] mt-1">{errors.consignee}</p>
                      )}
                    </div>

                    {/* ETD / ETA */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="etd" className="text-[11px] text-[#6B7280] mb-2 block">
                          ETD (Estimated Time of Departure)
                        </Label>
                        <Input
                          id="etd"
                          type="date"
                          value={formData.etd}
                          onChange={(e) => {
                            setFormData({ ...formData, etd: e.target.value });
                            if (errors.etd) setErrors({ ...errors, etd: "" });
                          }}
                          className={`h-11 border-[#E5E7EB] rounded-lg bg-white transition-colors text-[13px] font-medium ${
                            errors.etd ? "border-red-500" : ""
                          }`}
                        />
                        {errors.etd && (
                          <p className="text-red-500 text-[11px] mt-1">{errors.etd}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="eta" className="text-[11px] text-[#6B7280] mb-2 block">
                          ETA (Estimated Time of Arrival)
                        </Label>
                        <Input
                          id="eta"
                          type="date"
                          value={formData.eta}
                          onChange={(e) => {
                            setFormData({ ...formData, eta: e.target.value });
                            if (errors.eta) setErrors({ ...errors, eta: "" });
                          }}
                          className={`h-11 border-[#E5E7EB] rounded-lg bg-white transition-colors text-[13px] font-medium ${
                            errors.eta ? "border-red-500" : ""
                          }`}
                        />
                        {errors.eta && (
                          <p className="text-red-500 text-[11px] mt-1">{errors.eta}</p>
                        )}
                      </div>
                    </div>

                    {/* Origin / Destination */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="origin" className="text-[11px] text-[#6B7280] mb-2 block">
                          Origin
                        </Label>
                        <Input
                          id="origin"
                          value={formData.origin}
                          onChange={(e) => {
                            setFormData({ ...formData, origin: e.target.value });
                            if (errors.origin) setErrors({ ...errors, origin: "" });
                          }}
                          placeholder="Enter origin location"
                          className={`h-11 border-[#E5E7EB] rounded-lg bg-white transition-colors text-[13px] font-medium ${
                            errors.origin ? "border-red-500" : ""
                          }`}
                        />
                        {errors.origin && (
                          <p className="text-red-500 text-[11px] mt-1">{errors.origin}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="destination" className="text-[11px] text-[#6B7280] mb-2 block">
                          Destination
                        </Label>
                        <Input
                          id="destination"
                          value={formData.destination}
                          onChange={(e) => {
                            setFormData({ ...formData, destination: e.target.value });
                            if (errors.destination) setErrors({ ...errors, destination: "" });
                          }}
                          placeholder="Enter destination location"
                          className={`h-11 border-[#E5E7EB] rounded-lg bg-white transition-colors text-[13px] font-medium ${
                            errors.destination ? "border-red-500" : ""
                          }`}
                        />
                        {errors.destination && (
                          <p className="text-red-500 text-[11px] mt-1">{errors.destination}</p>
                        )}
                      </div>
                    </div>

                    {/* Container No. */}
                    <div>
                      <Label htmlFor="containerNo" className="text-[11px] text-[#6B7280] mb-2 block">
                        Container No.
                      </Label>
                      <Input
                        id="containerNo"
                        value={formData.containerNo}
                        onChange={(e) => setFormData({ ...formData, containerNo: e.target.value })}
                        placeholder="Enter container number"
                        className="h-11 border-[#E5E7EB] rounded-lg bg-white transition-colors text-[13px] font-medium"
                      />
                    </div>

                    {/* Weight */}
                    <div>
                      <Label htmlFor="weight" className="text-[11px] text-[#6B7280] mb-2 block">
                        Weight
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="weight"
                          type="number"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          placeholder="Enter weight"
                          className="h-11 border-[#E5E7EB] rounded-lg bg-white transition-colors text-[13px] font-medium flex-1"
                        />
                        <Select 
                          value={formData.weightUnit} 
                          onValueChange={(value) => setFormData({ ...formData, weightUnit: value })}
                        >
                          <SelectTrigger className="h-11 w-24 border-[#E5E7EB] rounded-lg text-[13px] font-medium">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="lbs">lbs</SelectItem>
                            <SelectItem value="tons">tons</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* AWB/BL No. */}
                    <div>
                      <Label htmlFor="awbBlNo" className="text-[11px] text-[#6B7280] mb-2 block">
                        AWB/BL No.
                      </Label>
                      <Input
                        id="awbBlNo"
                        value={formData.awbBlNo}
                        onChange={(e) => setFormData({ ...formData, awbBlNo: e.target.value })}
                        placeholder="Enter AWB or Bill of Lading number"
                        className="h-11 border-[#E5E7EB] rounded-lg bg-white transition-colors text-[13px] font-medium"
                      />
                    </div>

                    {/* Measurement */}
                    <div>
                      <Label htmlFor="measurement" className="text-[11px] text-[#6B7280] mb-2 block">
                        Measurement (CBM)
                      </Label>
                      <Input
                        id="measurement"
                        type="number"
                        value={formData.measurement}
                        onChange={(e) => setFormData({ ...formData, measurement: e.target.value })}
                        placeholder="Enter measurement in cubic meters"
                        className="h-11 border-[#E5E7EB] rounded-lg bg-white transition-colors text-[13px] font-medium"
                      />
                    </div>

                    {/* Commodity */}
                    <div>
                      <Label htmlFor="commodity" className="text-[11px] text-[#6B7280] mb-2 block">
                        Commodity
                      </Label>
                      <Input
                        id="commodity"
                        value={formData.commodity}
                        onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                        placeholder="Enter commodity description"
                        className="h-11 border-[#E5E7EB] rounded-lg bg-white transition-colors text-[13px] font-medium"
                      />
                    </div>

                    {/* Shipping Line */}
                    <div>
                      <Label htmlFor="shippingLine" className="text-[11px] text-[#6B7280] mb-2 block">
                        Shipping Line / Airline
                      </Label>
                      <Input
                        id="shippingLine"
                        value={formData.shippingLine}
                        onChange={(e) => setFormData({ ...formData, shippingLine: e.target.value })}
                        placeholder="Enter shipping line or airline"
                        className="h-11 border-[#E5E7EB] rounded-lg bg-white transition-colors text-[13px] font-medium"
                      />
                    </div>

                    {/* Registry No. */}
                    <div>
                      <Label htmlFor="registryNo" className="text-[11px] text-[#6B7280] mb-2 block">
                        Registry No.
                      </Label>
                      <Input
                        id="registryNo"
                        value={formData.registryNo}
                        onChange={(e) => setFormData({ ...formData, registryNo: e.target.value })}
                        placeholder="Enter registry number"
                        className="h-11 border-[#E5E7EB] rounded-lg bg-white transition-colors text-[13px] font-medium"
                      />
                    </div>

                    {/* Warehouse */}
                    <div>
                      <Label htmlFor="warehouse" className="text-[11px] text-[#6B7280] mb-2 block">
                        Warehouse
                      </Label>
                      <Input
                        id="warehouse"
                        value={formData.warehouse}
                        onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                        placeholder="Enter warehouse location"
                        className="h-11 border-[#E5E7EB] rounded-lg bg-white transition-colors text-[13px] font-medium"
                      />
                    </div>

                    {/* Port */}
                    <div>
                      <Label htmlFor="port" className="text-[11px] text-[#6B7280] mb-2 block">
                        Port
                      </Label>
                      <Select 
                        value={formData.port} 
                        onValueChange={(value) => setFormData({ ...formData, port: value })}
                      >
                        <SelectTrigger className="h-11 border-[#E5E7EB] rounded-lg text-[13px] font-medium">
                          <SelectValue placeholder="Select port" />
                        </SelectTrigger>
                        <SelectContent>
                          {philippinePorts.map((port) => (
                            <SelectItem key={port} value={port}>
                              {port}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Special Instructions */}
                    <div>
                      <Label htmlFor="specialInstructions" className="text-[11px] text-[#6B7280] mb-2 block">
                        Special Instructions
                      </Label>
                      <Textarea
                        id="specialInstructions"
                        value={formData.specialInstructions}
                        onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                        placeholder="Enter any special handling instructions or notes"
                        rows={4}
                        className="border-[#E5E7EB] rounded-lg bg-white transition-colors resize-none text-[13px] font-medium"
                      />
                    </div>
                  </div>
                </Card>

                {/* Billing Information Section */}
                <Card key={`billing-${selectedTemplate || 'no-template'}`} className="p-6 bg-white border border-[#E5E9F0] rounded-xl">
                  <div className="mb-6">
                    <h2 className="text-[14px] font-semibold text-[#12332B] mb-1">Billing Information</h2>
                    <p className="text-[11px] text-[#667085]">Create a billing invoice for this booking</p>
                    <div className="mt-4 border-b border-[#E5E9F0]"></div>
                  </div>

                  <div className="space-y-6">
                    {/* Billing & Client Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
                      <div>
                        <Label className="text-[13px] text-[#12332B] mb-2 block font-medium">
                          Client Name
                        </Label>
                        <Input
                          value={billingData.clientName}
                          onChange={(e) => setBillingData({ ...billingData, clientName: e.target.value })}
                          className="rounded-lg border-[#E5E9F0] text-[13px] focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                          style={{ height: "40px" }}
                          placeholder="Enter client name"
                        />
                      </div>
                      <div>
                        <Label className="text-[13px] text-[#12332B] mb-2 block font-medium">
                          Billing Date
                        </Label>
                        <Input
                          type="date"
                          value={billingData.billingDate}
                          onChange={(e) => setBillingData({ ...billingData, billingDate: e.target.value })}
                          className="rounded-lg border-[#E5E9F0] text-[13px] focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                          style={{ height: "40px" }}
                        />
                      </div>
                      <div>
                        <Label className="text-[13px] text-[#12332B] mb-2 block font-medium">
                          Bill To / Attention To
                        </Label>
                        <Input
                          value={billingData.billTo}
                          onChange={(e) => setBillingData({ ...billingData, billTo: e.target.value })}
                          className="rounded-lg border-[#E5E9F0] text-[13px] focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                          style={{ height: "40px" }}
                          placeholder="e.g., Mr. Sandesh Mhatre"
                        />
                      </div>
                      <div>
                        <Label className="text-[13px] text-[#12332B] mb-2 block font-medium">
                          Billing No.
                        </Label>
                        <Input
                          value={billingData.billingNo}
                          disabled
                          className="rounded-lg border-[#E5E9F0] text-[13px] bg-[#F9FAFB]"
                          style={{ height: "40px" }}
                        />
                      </div>
                      <div>
                        <Label className="text-[13px] text-[#12332B] mb-2 block font-medium">
                          Client Address / Location
                        </Label>
                        <Input
                          value={billingData.clientAddress}
                          onChange={(e) => setBillingData({ ...billingData, clientAddress: e.target.value })}
                          className="rounded-lg border-[#E5E9F0] text-[13px] focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                          style={{ height: "40px" }}
                          placeholder="e.g., MAHARASHTRA, INDIA"
                        />
                      </div>
                      <div>
                        <Label className="text-[13px] text-[#12332B] mb-2 block font-medium">
                          Company
                        </Label>
                        <Select value={billingData.company} onValueChange={(value) => setBillingData({ ...billingData, company: value })}>
                          <SelectTrigger 
                            className="rounded-lg border-[#E5E9F0] text-[13px] focus:ring-[#0F766E] focus:border-[#0F766E]"
                            style={{ height: "40px" }}
                          >
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                          <SelectContent>
                            {["JLCS", "CCE", "CPTC", "ZNICF"].map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-[13px] text-[#12332B] mb-2 block font-medium">
                          Notes / Remarks <span className="text-[#667085] font-normal">(Optional)</span>
                        </Label>
                        <Input
                          value={billingData.notes || ""}
                          onChange={(e) => setBillingData({ ...billingData, notes: e.target.value })}
                          className="rounded-lg border-[#E5E9F0] text-[13px] focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                          style={{ height: "40px" }}
                          placeholder="e.g., Kindly make check payable to CONFORME CARGO EXPRESS"
                        />
                      </div>
                    </div>

                    {/* Particular Charges */}
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[14px] font-semibold text-[#12332B]">
                          Particular Charges
                        </h3>
                        <Button
                          type="button"
                          onClick={addBillingLineItem}
                          variant="ghost"
                          className="text-[#0F766E] hover:bg-[#0F766E]/10 h-9 text-[13px]"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Line Item
                        </Button>
                      </div>

                      {/* Line Items */}
                      <div className="space-y-3">
                        {billingData.lineItems.map((item) => (
                          <div key={item.id} className="grid grid-cols-12 gap-3">
                            <div className="col-span-7">
                              <Input
                                value={item.description}
                                onChange={(e) => updateBillingLineItem(item.id, { description: e.target.value })}
                                placeholder="Particular description"
                                className="rounded-lg border-[#E5E9F0] text-[13px] focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                                style={{ height: "40px" }}
                              />
                            </div>
                            <div className="col-span-4">
                              <Input
                                type="number"
                                value={item.amount || ""}
                                onChange={(e) => updateBillingLineItem(item.id, { amount: parseFloat(e.target.value) || 0 })}
                                placeholder="Amount (₱)"
                                className="rounded-lg border-[#E5E9F0] text-[13px] text-right focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                                style={{ height: "40px" }}
                              />
                            </div>
                            <div className="col-span-1 flex items-center justify-center">
                              {billingData.lineItems.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteBillingLineItem(item.id)}
                                  className="h-9 w-9 text-[#667085] hover:text-red-500 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="mt-6 pt-4 border-t border-[#E5E9F0]">
                        <div className="flex justify-between items-center">
                          <span className="text-[15px] font-semibold text-[#12332B]">GRAND TOTAL</span>
                          <span className="text-[24px] font-bold text-[#0F766E]">
                            ₱{calculateBillingTotal().toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="mt-8 p-6 bg-[#F9FAFB] rounded-xl border border-[#E5E9F0]">
                      <h3 className="text-[14px] font-semibold text-[#12332B] mb-5">
                        Payment Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                        <div>
                          <Label className="text-[12px] text-[#12332B] mb-2 block font-medium">
                            Bank Name
                          </Label>
                          <Input
                            value={billingData.paymentDetails.bankName}
                            onChange={(e) =>
                              setBillingData({
                                ...billingData,
                                paymentDetails: { ...billingData.paymentDetails, bankName: e.target.value },
                              })
                            }
                            className="rounded-lg border-[#E5E9F0] text-[13px] bg-white focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                            style={{ height: "40px" }}
                            placeholder="e.g., BDO"
                          />
                        </div>
                        <div>
                          <Label className="text-[12px] text-[#12332B] mb-2 block font-medium">
                            Account Name
                          </Label>
                          <Input
                            value={billingData.paymentDetails.accountName}
                            onChange={(e) =>
                              setBillingData({
                                ...billingData,
                                paymentDetails: { ...billingData.paymentDetails, accountName: e.target.value },
                              })
                            }
                            className="rounded-lg border-[#E5E9F0] text-[13px] bg-white focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                            style={{ height: "40px" }}
                            placeholder="e.g., CONFORME CARGO EXPRESS"
                          />
                        </div>
                        <div>
                          <Label className="text-[12px] text-[#12332B] mb-2 block font-medium">
                            Account No.
                          </Label>
                          <Input
                            value={billingData.paymentDetails.accountNo}
                            onChange={(e) =>
                              setBillingData({
                                ...billingData,
                                paymentDetails: { ...billingData.paymentDetails, accountNo: e.target.value },
                              })
                            }
                            className="rounded-lg border-[#E5E9F0] text-[13px] bg-white focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                            style={{ height: "40px" }}
                            placeholder="e.g., 0014-8803-0454"
                          />
                        </div>
                        <div>
                          <Label className="text-[12px] text-[#12332B] mb-2 block font-medium">
                            Branch
                          </Label>
                          <Input
                            value={billingData.paymentDetails.branch}
                            onChange={(e) =>
                              setBillingData({
                                ...billingData,
                                paymentDetails: { ...billingData.paymentDetails, branch: e.target.value },
                              })
                            }
                            className="rounded-lg border-[#E5E9F0] text-[13px] bg-white focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                            style={{ height: "40px" }}
                            placeholder="e.g., SM City Sucat A"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-[12px] text-[#12332B] mb-2 block font-medium">
                            Swift Code
                          </Label>
                          <Input
                            value={billingData.paymentDetails.swiftCode}
                            onChange={(e) =>
                              setBillingData({
                                ...billingData,
                                paymentDetails: { ...billingData.paymentDetails, swiftCode: e.target.value },
                              })
                            }
                            className="rounded-lg border-[#E5E9F0] text-[13px] bg-white focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                            style={{ height: "40px" }}
                            placeholder="e.g., BNORPHMM"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column - Booking Summary (1/3) */}
              <div className="col-span-1">
                <div className="lg:sticky lg:top-6">
                  <Card className="p-6 bg-white border border-[#E5E9F0] rounded-xl">
                    <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[#E5E9F0]">
                      <FileText className="w-5 h-5 text-[#0A1D4D]" />
                      <h3 className="text-[14px] font-medium text-[#0A1D4D]">Booking Summary</h3>
                    </div>

                    <div className="space-y-4">
                      {/* Tracking Number - Live Generated */}
                      <div className="p-4 bg-gradient-to-br from-[#0A1D4D]/5 to-[#F25C05]/5 rounded-lg border border-[#0A1D4D]/10">
                        <p className="text-[11px] text-[#6B7280] mb-1">Tracking Number</p>
                        <p className="text-[15px] font-semibold text-[#0A1D4D] font-mono">
                          {trackingNumber}
                        </p>
                      </div>

                      {/* Booking Type */}
                      <div>
                        <p className="text-[11px] text-[#6B7280] mb-1">Booking Type</p>
                        <p className="text-[13px] font-medium text-[#0A1D4D]">
                          {shipmentType === "IMPS" && "Import"}
                          {shipmentType === "EXPS" && "Export"}
                          {shipmentType === "DOM" && "Domestic"}
                          {shipmentType === "TRK" && "Trucking"}
                        </p>
                      </div>

                      {/* Mode of Shipment */}
                      <div>
                        <p className="text-[11px] text-[#6B7280] mb-1">Mode of Shipment</p>
                        <p className="text-[13px] font-medium text-[#0A1D4D]">
                          {mode === "AIR" && "AIR"}
                          {mode === "SEA" && "SEA"}
                          {mode === "TRK" && "TRK"}
                          {mode === "DOM" && "DOM"}
                        </p>
                      </div>

                      {/* Load Type */}
                      <div>
                        <p className="text-[11px] text-[#6B7280] mb-1">Load Type</p>
                        <p className="text-[13px] font-medium text-[#0A1D4D]">
                          {loadType}
                        </p>
                      </div>

                      {/* Client */}
                      <div>
                        <p className="text-[11px] text-[#6B7280] mb-1">Client</p>
                        <p className="text-[13px] font-medium text-[#0A1D4D]">
                          {selectedClient || "Not specified"}
                        </p>
                      </div>

                      {/* Origin / Destination */}
                      {(formData.origin || formData.destination) && (
                        <div>
                          <p className="text-[11px] text-[#6B7280] mb-1">Route</p>
                          <p className="text-[13px] font-medium text-[#0A1D4D]">
                            {formData.origin || "—"} → {formData.destination || "—"}
                          </p>
                        </div>
                      )}

                      {/* ETD / ETA */}
                      {(formData.etd || formData.eta) && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[11px] text-[#6B7280] mb-1">ETD</p>
                            <p className="text-[13px] font-medium text-[#0A1D4D]">
                              {formData.etd ? new Date(formData.etd).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-[#6B7280] mb-1">ETA</p>
                            <p className="text-[13px] font-medium text-[#0A1D4D]">
                              {formData.eta ? new Date(formData.eta).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Helper Note */}
                  <div className="mt-4 p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                    <p className="text-[11px] text-[#6B7280] leading-relaxed">
                      <span className="font-semibold text-[#0A1D4D]">Tip:</span> The tracking number updates automatically based on your shipment type, mode, and load type selections.
                    </p>
                  </div>

                  {/* Billing Summary */}
                  <Card className="mt-4 p-6 bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl">
                    <h3 className="text-[14px] font-semibold text-[#12332B] mb-5">
                      Billing Summary
                    </h3>
                    
                    <div className="space-y-4 mb-6">
                      <div>
                        <div className="text-[11px] text-[#667085] mb-1">Client</div>
                        <div className="text-[13px] text-[#12332B] font-medium">
                          {billingData.clientName || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#667085] mb-1">Date</div>
                        <div className="text-[13px] text-[#12332B] font-medium">
                          {billingData.billingDate}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#667085] mb-1">Linked Booking</div>
                        <div className="text-[13px] text-[#12332B] font-medium">
                          {trackingNumber || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#667085] mb-1">Company</div>
                        <div className="text-[13px] text-[#12332B] font-medium">
                          {billingData.company || "—"}
                        </div>
                      </div>
                    </div>

                    <div className="mb-6 pb-6 border-t border-[#E5E9F0] pt-4">
                      <div className="text-[11px] text-[#667085] mb-1">Total Amount</div>
                      <div className="text-[32px] font-bold text-[#0F766E]">
                        ₱{calculateBillingTotal().toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="p-3 bg-[#0F766E]/5 rounded-lg border border-[#0F766E]/20">
                      <p className="text-[11px] text-[#12332B] leading-relaxed">
                        <span className="font-semibold">Auto-Invoice:</span> If billing details are filled, an invoice will be automatically generated when you create the booking.
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Save as Template Modal */}
      <Dialog open={showSaveTemplateModal} onOpenChange={setShowSaveTemplateModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[20px] text-[#0A1D4D]">
              {bookingSource === "template" ? "Update Template" : "Save as Template"}
            </DialogTitle>
            <DialogDescription className="text-[14px] text-[#6B7280]">
              {bookingSource === "template"
                ? `Update the existing template "${prefilledTemplate?.templateName}" with current form values.`
                : "Save the current booking configuration as a reusable template."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[13px] text-[#374151]">Template Name *</Label>
              <Input
                value={templateName || (bookingSource === "template" && prefilledTemplate ? prefilledTemplate.templateName : "")}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Standard Retail Shipment"
                className="border-[#E5E7EB] rounded-lg"
              />
            </div>

            {bookingSource === "new" && (
              <div className="space-y-2">
                <Label className="text-[13px] text-[#374151]">Attach to Client (Optional)</Label>
                <Select>
                  <SelectTrigger className="border-[#E5E7EB] rounded-lg">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client} value={client}>
                        {client}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <p className="text-[12px] text-[#6B7280] mb-2">Template will include:</p>
              <ul className="text-[11px] text-[#374151] space-y-1 list-disc list-inside">
                <li>Shipment Type: {shipmentType === "IMPS" ? "Import" : shipmentType === "EXPS" ? "Export" : shipmentType === "DOM" ? "Domestic" : "Trucking"}</li>
                <li>Mode: {mode}</li>
                <li>Load Type: {loadType}</li>
                {formData.origin && <li>Origin: {formData.origin}</li>}
                {formData.destination && <li>Destination: {formData.destination}</li>}
                {formData.specialInstructions && <li>Special Instructions</li>}
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <Button
              variant="outline"
              onClick={() => {
                setShowSaveTemplateModal(false);
                setTemplateName("");
              }}
              className="border-[#E5E7EB] rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAsTemplate}
              className="bg-[#F25C05] hover:bg-[#D84D00] text-white rounded-lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {bookingSource === "template" ? "Update Template" : "Save Template"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}