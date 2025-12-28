import { useState } from "react";
import { X, Save, FileText } from "lucide-react";
import { GeneralDetailsSection } from "./GeneralDetailsSection";
import { VendorsSection } from "./VendorsSection";
import { BrokerageServiceForm } from "./BrokerageServiceForm";
import { ForwardingServiceForm } from "./ForwardingServiceForm";
import { TruckingServiceForm } from "./TruckingServiceForm";
import { MarineInsuranceServiceForm } from "./MarineInsuranceServiceForm";
import { OthersServiceForm } from "./OthersServiceForm";
import { ChargeCategoriesSection } from "./ChargeCategoriesSection";
import { FinancialSummaryPanel } from "./FinancialSummaryPanel";
import type { QuotationNew, QuotationChargeCategory, InquiryService, QuotationStatus } from "../../../types/pricing";
import { calculateFinancialSummary } from "../../../utils/quotationCalculations";

interface Vendor {
  id: string;
  type: "Overseas Agent" | "Local Agent" | "Subcontractor";
  name: string;
}

interface ContainerEntry {
  id: string;
  type: "20ft" | "40ft" | "45ft" | "";
  qty: number;
}

interface BrokerageFormData {
  brokerageType: "Standard" | "All-Inclusive" | "Non-Regular" | "";
  typeOfEntry?: string;
  consumption?: boolean;
  warehousing?: boolean;
  peza?: boolean;
  pod?: string;
  mode?: string;
  cargoType?: string;
  commodityDescription?: string;
  deliveryAddress?: string;
  // Changed: Now using containers array instead of individual fields
  containers?: ContainerEntry[];
  // Legacy fields for backward compatibility
  fcl20ft?: number;
  fcl40ft?: number;
  fcl45ft?: number;
  fclQty?: number;
  lclGwt?: string;
  lclDims?: string;
  airGwt?: string;
  airCwt?: string;
  countryOfOrigin?: string;
  preferentialTreatment?: string;
  shipmentType?: string; // Add shipmentType field
  declaredValue?: number;
  psic?: string;
  aeo?: string;
}

interface ForwardingFormData {
  incoterms?: string;
  cargoType?: string;
  commodityDescription?: string;
  deliveryAddress?: string;
  aodPod?: string;
  mode?: string;
  aolPol?: string;
  cargoNature?: string;
  // Changed: Now using containers array instead of individual fields
  containers?: ContainerEntry[];
  // Legacy fields for backward compatibility
  fcl20ft?: number;
  fcl40ft?: number;
  fcl45ft?: number;
  fclQty?: number;
  lclGwt?: string;
  lclDims?: string;
  airGwt?: string;
  airCwt?: string;
  collectionAddress?: string;
  carrierAirline?: string;
  transitTime?: string;
  route?: string;
  stackable?: string;
  // Cross-service fields that may also be in Brokerage
  countryOfOrigin?: string;
  preferentialTreatment?: string;
  aol?: string;
  pol?: string;
  aod?: string;
  pod?: string;
}

interface TruckingFormData {
  pullOut?: string;
  deliveryAddress?: string;
  truckType?: string;
  qty?: number;
  deliveryInstructions?: string;
}

interface MarineInsuranceFormData {
  commodityDescription?: string;
  hsCode?: string;
  aolPol?: string;
  aodPod?: string;
  invoiceValue?: number;
  aol?: string;
  pol?: string;
  aod?: string;
  pod?: string;
}

interface OthersFormData {
  serviceDescription?: string;
}

interface QuotationBuilderV3Props {
  onClose: () => void;
  onSave: (quotation: QuotationNew) => void;
  initialData?: Partial<QuotationNew>;
  mode?: "create" | "edit";
  customerData?: any;
  contactData?: any; // Add contact data prop
  builderMode?: "inquiry" | "quotation"; // New prop: inquiry mode hides pricing, quotation mode shows everything
}

export function QuotationBuilderV3({ onClose, onSave, initialData, mode = "create", customerData, contactData, builderMode = "quotation" }: QuotationBuilderV3Props) {
  // Check if quotation is locked (converted to project)
  const isLocked = mode === "edit" && initialData?.project_id;
  
  // Generate quotation number
  const generateQuoteNumber = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `QUO${year}${month}${day}${random}`;
  };

  const [quoteNumber] = useState(initialData?.quote_number || generateQuoteNumber());

  // General Details State - Auto-fill from customerData and contactData
  const [customerId, setCustomerId] = useState(
    initialData?.customer_id || 
    customerData?.id || 
    contactData?.customer_id || 
    ""
  );
  const [customerName, setCustomerName] = useState(
    initialData?.customer_name || 
    customerData?.company_name || 
    customerData?.name || 
    ""
  );
  const [contactPersonId, setContactPersonId] = useState(
    initialData?.contact_person_id || 
    contactData?.id || 
    ""
  );
  const [contactPersonName, setContactPersonName] = useState(
    initialData?.contact_person_name || 
    contactData?.name || 
    (contactData?.first_name && contactData?.last_name 
      ? `${contactData.first_name} ${contactData.last_name}`.trim() 
      : "") ||
    ""
  );
  const [quotationName, setQuotationName] = useState(initialData?.quotation_name || "");
  const [selectedServices, setSelectedServices] = useState<string[]>(initialData?.services || []);
  const [date, setDate] = useState(initialData?.created_date || new Date().toISOString().split('T')[0]);
  const [creditTerms, setCreditTerms] = useState(initialData?.credit_terms || "");
  const [validity, setValidity] = useState(initialData?.validity_period || "");
  const [vendors, setVendors] = useState<Vendor[]>([]);

  // Load service-specific form data from initialData.services_metadata
  const loadServiceData = <T extends Record<string, any>>(serviceType: string, defaultData: T): T => {
    const serviceMetadata = initialData?.services_metadata?.find(s => s.service_type === serviceType);
    if (!serviceMetadata) return defaultData;
    
    const details = serviceMetadata.service_details as any;
    
    // Handle backward compatibility: map snake_case (correct) to camelCase (form data)
    // This allows old data with camelCase AND new data with snake_case to load correctly
    if (serviceType === "Brokerage") {
      return {
        ...defaultData,
        brokerageType: details.subtype || details.brokerageType || "",
        shipmentType: details.shipment_type || details.shipmentType,
        typeOfEntry: details.type_of_entry || details.typeOfEntry,
        pod: details.pod,
        mode: details.mode,
        cargoType: details.cargo_type || details.cargoType,
        commodityDescription: details.commodity || details.commodityDescription,
        declaredValue: details.declared_value || details.declaredValue,
        deliveryAddress: details.delivery_address || details.deliveryAddress,
        countryOfOrigin: details.country_of_origin || details.countryOfOrigin,
        preferentialTreatment: details.preferential_treatment || details.preferentialTreatment,
        psic: details.psic,
        aeo: details.aeo
      } as T;
    }
    
    if (serviceType === "Forwarding") {
      // Reconstruct compound fields from separate aol/pol and aod/pod
      const aolPol = details.aolPol || (details.aol && details.pol ? `${details.aol} → ${details.pol}` : "");
      const aodPod = details.aodPod || (details.aod && details.pod ? `${details.aod} → ${details.pod}` : "");
      
      return {
        ...defaultData,
        incoterms: details.incoterms,
        cargoType: details.cargo_type || details.cargoType,
        commodityDescription: details.commodity || details.commodityDescription,
        deliveryAddress: details.delivery_address || details.deliveryAddress,
        mode: details.mode,
        aolPol: aolPol,
        aodPod: aodPod,
        aol: details.aol,
        pol: details.pol,
        aod: details.aod,
        pod: details.pod
      } as T;
    }
    
    if (serviceType === "Trucking") {
      return {
        ...defaultData,
        pullOut: details.pull_out || details.pullOut,
        deliveryAddress: details.delivery_address || details.deliveryAddress,
        truckType: details.truck_type || details.truckType,
        deliveryInstructions: details.delivery_instructions || details.deliveryInstructions
      } as T;
    }
    
    if (serviceType === "Marine Insurance") {
      const aolPol = details.aolPol || (details.aol && details.pol ? `${details.aol} → ${details.pol}` : "");
      const aodPod = details.aodPod || (details.aod && details.pod ? `${details.aod} → ${details.pod}` : "");
      
      return {
        ...defaultData,
        commodityDescription: details.commodity_description || details.commodityDescription,
        hsCode: details.hs_code || details.hsCode,
        aolPol: aolPol,
        aodPod: aodPod,
        aol: details.aol,
        pol: details.pol,
        aod: details.aod,
        pod: details.pod,
        invoiceValue: details.invoice_value || details.invoiceValue
      } as T;
    }
    
    if (serviceType === "Others") {
      return {
        ...defaultData,
        serviceDescription: details.service_description || details.serviceDescription
      } as T;
    }
    
    return { ...defaultData, ...details };
  };

  // Service-specific form data
  const [brokerageData, setBrokerageData] = useState<BrokerageFormData>(
    loadServiceData("Brokerage", { brokerageType: "" })
  );
  const [forwardingData, setForwardingData] = useState<ForwardingFormData>(
    loadServiceData("Forwarding", {})
  );
  const [truckingData, setTruckingData] = useState<TruckingFormData>(
    loadServiceData("Trucking", {})
  );
  const [marineInsuranceData, setMarineInsuranceData] = useState<MarineInsuranceFormData>(
    loadServiceData("Marine Insurance", {})
  );
  const [othersData, setOthersData] = useState<OthersFormData>(
    loadServiceData("Others", {})
  );

  // Pricing
  const [chargeCategories, setChargeCategories] = useState<QuotationChargeCategory[]>(initialData?.charge_categories || []);
  const [currency, setCurrency] = useState(initialData?.currency || "USD");
  const [taxRate, setTaxRate] = useState(initialData?.financial_summary?.tax_rate || 0.12);
  const [otherCharges, setOtherCharges] = useState(initialData?.financial_summary?.other_charges || 0);

  // Auto-sync handlers - when a field changes in one service, update it in all others
  const handleBrokerageChange = (newData: BrokerageFormData) => {
    setBrokerageData(newData);
    
    // Sync overlapping fields to other services (only sync if value exists)
    if (selectedServices.includes("Forwarding")) {
      setForwardingData(prev => ({
        ...prev,
        ...(newData.pod && { aodPod: newData.pod }),
        ...(newData.commodityDescription && { commodityDescription: newData.commodityDescription }),
        ...(newData.cargoType && { cargoType: newData.cargoType }),
        ...(newData.mode && { mode: newData.mode }),
        ...(newData.deliveryAddress && { deliveryAddress: newData.deliveryAddress }),
        ...(newData.containers && { containers: newData.containers }),
        ...(newData.fcl20ft !== undefined && { fcl20ft: newData.fcl20ft }),
        ...(newData.fcl40ft !== undefined && { fcl40ft: newData.fcl40ft }),
        ...(newData.fcl45ft !== undefined && { fcl45ft: newData.fcl45ft }),
        ...(newData.fclQty !== undefined && { fclQty: newData.fclQty }),
        ...(newData.lclGwt && { lclGwt: newData.lclGwt }),
        ...(newData.lclDims && { lclDims: newData.lclDims }),
        ...(newData.airGwt && { airGwt: newData.airGwt }),
        ...(newData.airCwt && { airCwt: newData.airCwt }),
        ...(newData.countryOfOrigin && { countryOfOrigin: newData.countryOfOrigin }),
        ...(newData.preferentialTreatment && { preferentialTreatment: newData.preferentialTreatment }),
      }));
    }
    
    if (selectedServices.includes("Trucking")) {
      setTruckingData(prev => ({
        ...prev,
        ...(newData.deliveryAddress && { deliveryAddress: newData.deliveryAddress }),
      }));
    }
    
    if (selectedServices.includes("Marine Insurance")) {
      setMarineInsuranceData(prev => ({
        ...prev,
        ...(newData.pod && { aodPod: newData.pod }),
        ...(newData.commodityDescription && { commodityDescription: newData.commodityDescription }),
      }));
    }
  };

  const handleForwardingChange = (newData: ForwardingFormData) => {
    setForwardingData(newData);
    
    // Sync overlapping fields to other services (only sync if value exists)
    if (selectedServices.includes("Brokerage")) {
      setBrokerageData(prev => ({
        ...prev,
        ...(newData.aodPod && { pod: newData.aodPod }),
        ...(newData.commodityDescription && { commodityDescription: newData.commodityDescription }),
        ...(newData.cargoType && { cargoType: newData.cargoType }),
        ...(newData.mode && { mode: newData.mode }),
        ...(newData.deliveryAddress && { deliveryAddress: newData.deliveryAddress }),
        ...(newData.containers && { containers: newData.containers }),
        ...(newData.fcl20ft !== undefined && { fcl20ft: newData.fcl20ft }),
        ...(newData.fcl40ft !== undefined && { fcl40ft: newData.fcl40ft }),
        ...(newData.fcl45ft !== undefined && { fcl45ft: newData.fcl45ft }),
        ...(newData.fclQty !== undefined && { fclQty: newData.fclQty }),
        ...(newData.lclGwt && { lclGwt: newData.lclGwt }),
        ...(newData.lclDims && { lclDims: newData.lclDims }),
        ...(newData.airGwt && { airGwt: newData.airGwt }),
        ...(newData.airCwt && { airCwt: newData.airCwt }),
        ...(newData.countryOfOrigin && { countryOfOrigin: newData.countryOfOrigin }),
        ...(newData.preferentialTreatment && { preferentialTreatment: newData.preferentialTreatment }),
      }));
    }
    
    if (selectedServices.includes("Trucking")) {
      setTruckingData(prev => ({
        ...prev,
        ...(newData.deliveryAddress && { deliveryAddress: newData.deliveryAddress }),
      }));
    }
    
    if (selectedServices.includes("Marine Insurance")) {
      setMarineInsuranceData(prev => ({
        ...prev,
        ...(newData.aolPol && { aolPol: newData.aolPol }),
        ...(newData.aodPod && { aodPod: newData.aodPod }),
        ...(newData.commodityDescription && { commodityDescription: newData.commodityDescription }),
      }));
    }
  };

  const handleTruckingChange = (newData: TruckingFormData) => {
    setTruckingData(newData);
    
    // Sync delivery address to other services (only sync if value exists)
    if (newData.deliveryAddress) {
      if (selectedServices.includes("Brokerage")) {
        setBrokerageData(prev => ({
          ...prev,
          deliveryAddress: newData.deliveryAddress,
        }));
      }
      
      if (selectedServices.includes("Forwarding")) {
        setForwardingData(prev => ({
          ...prev,
          deliveryAddress: newData.deliveryAddress,
        }));
      }
    }
  };

  const handleMarineInsuranceChange = (newData: MarineInsuranceFormData) => {
    setMarineInsuranceData(newData);
    
    // Sync overlapping fields to other services (only sync if value exists)
    if (selectedServices.includes("Forwarding")) {
      setForwardingData(prev => ({
        ...prev,
        ...(newData.aolPol && { aolPol: newData.aolPol }),
        ...(newData.aodPod && { aodPod: newData.aodPod }),
        ...(newData.commodityDescription && { commodityDescription: newData.commodityDescription }),
      }));
    }
    
    if (selectedServices.includes("Brokerage")) {
      setBrokerageData(prev => ({
        ...prev,
        ...(newData.aodPod && { pod: newData.aodPod }),
        ...(newData.commodityDescription && { commodityDescription: newData.commodityDescription }),
      }));
    }
  };

  // Calculate financial summary
  const financialSummary = calculateFinancialSummary(chargeCategories, taxRate, otherCharges);

  const handleSaveAsDraft = () => {
    // When saving as draft, preserve existing status or default to Draft
    const draftStatus = initialData?.status || "Draft";
    saveQuotation(draftStatus);
  };

  const handleSubmit = () => {
    // Determine the submit status based on builder mode
    if (builderMode === "inquiry") {
      // BD submitting inquiry to Pricing Department
      saveQuotation("Pending Pricing");
    } else {
      // PD finishing pricing
      saveQuotation("Priced");
    }
  };

  const saveQuotation = (targetStatus: QuotationStatus) => {
    // Build services_metadata from form data
    const services_metadata: InquiryService[] = [];
    
    if (selectedServices.includes("Brokerage")) {
      services_metadata.push({
        service_type: "Brokerage",
        service_details: {
          // Map camelCase form data to snake_case TypeScript types
          subtype: brokerageData.brokerageType as any, // brokerageType maps to subtype
          shipment_type: brokerageData.shipmentType as any, // Add shipment_type field
          type_of_entry: brokerageData.typeOfEntry,
          pod: brokerageData.pod,
          mode: brokerageData.mode,
          cargo_type: brokerageData.cargoType,
          commodity: brokerageData.commodityDescription, // commodityDescription maps to commodity
          declared_value: brokerageData.declaredValue,
          delivery_address: brokerageData.deliveryAddress,
          country_of_origin: brokerageData.countryOfOrigin,
          preferential_treatment: brokerageData.preferentialTreatment,
          psic: brokerageData.psic,
          aeo: brokerageData.aeo
        }
      });
    }
    
    if (selectedServices.includes("Forwarding")) {
      // Parse aolPol and aodPod if they exist (they might be combined fields)
      let aol = forwardingData.aol;
      let pol = forwardingData.pol;
      let aod = forwardingData.aod;
      let pod = forwardingData.pod;
      
      // Handle compound fields if they exist
      if (forwardingData.aolPol && !aol && !pol) {
        [aol, pol] = forwardingData.aolPol.split('→').map(s => s.trim());
      }
      if (forwardingData.aodPod && !aod && !pod) {
        [aod, pod] = forwardingData.aodPod.split('→').map(s => s.trim());
      }
      
      services_metadata.push({
        service_type: "Forwarding",
        service_details: {
          // Map camelCase form data to snake_case TypeScript types
          incoterms: forwardingData.incoterms,
          cargo_type: forwardingData.cargoType,
          commodity: forwardingData.commodityDescription || forwardingData.commodity,
          delivery_address: forwardingData.deliveryAddress,
          mode: forwardingData.mode,
          aol: aol,
          pol: pol || forwardingData.pol,
          aod: aod,
          pod: pod || forwardingData.pod
        }
      });
    }
    
    if (selectedServices.includes("Trucking")) {
      services_metadata.push({
        service_type: "Trucking",
        service_details: {
          // Map camelCase form data to snake_case TypeScript types
          pull_out: truckingData.pullOut,
          delivery_address: truckingData.deliveryAddress,
          truck_type: truckingData.truckType,
          delivery_instructions: truckingData.deliveryInstructions
        }
      });
    }
    
    if (selectedServices.includes("Marine Insurance")) {
      // Parse aolPol and aodPod if they exist
      let aol = marineInsuranceData.aol;
      let pol = marineInsuranceData.pol;
      let aod = marineInsuranceData.aod;
      let pod = marineInsuranceData.pod;
      
      if (marineInsuranceData.aolPol && !aol && !pol) {
        [aol, pol] = marineInsuranceData.aolPol.split('→').map(s => s.trim());
      }
      if (marineInsuranceData.aodPod && !aod && !pod) {
        [aod, pod] = marineInsuranceData.aodPod.split('→').map(s => s.trim());
      }
      
      services_metadata.push({
        service_type: "Marine Insurance",
        service_details: {
          // Map camelCase form data to snake_case TypeScript types
          commodity_description: marineInsuranceData.commodityDescription,
          hs_code: marineInsuranceData.hsCode,
          aol: aol,
          pol: pol || marineInsuranceData.pol,
          aod: aod,
          pod: pod || marineInsuranceData.pod,
          invoice_value: marineInsuranceData.invoiceValue
        }
      });
    }
    
    if (selectedServices.includes("Others")) {
      services_metadata.push({
        service_type: "Others",
        service_details: {
          // Map camelCase form data to snake_case TypeScript types
          service_description: othersData.serviceDescription
        }
      });
    }

    const quotation: QuotationNew = {
      id: initialData?.id || `quot-${Date.now()}`,
      quote_number: quoteNumber,
      quotation_name: quotationName || `${customerName} - ${selectedServices.join(", ")}`,
      created_date: date,
      valid_until: validity,
      customer_id: customerId,
      customer_name: customerName,
      contact_person_id: contactPersonId, // Save contact person relationship
      contact_person_name: contactPersonName,
      
      movement: "IMPORT",
      category: "SEA FREIGHT",
      shipment_freight: "LCL",
      services: selectedServices,
      services_metadata,
      incoterm: forwardingData.incoterms || "",
      carrier: forwardingData.carrierAirline || "TBA",
      transit_days: parseInt(forwardingData.transitTime || "0"),
      
      commodity: brokerageData.commodityDescription || forwardingData.commodityDescription || marineInsuranceData.commodityDescription || "",
      pol_aol: forwardingData.aolPol || marineInsuranceData.aolPol || "",
      pod_aod: forwardingData.aodPod || marineInsuranceData.aodPod || "",
      
      charge_categories: chargeCategories,
      currency,
      financial_summary: financialSummary,
      
      credit_terms: creditTerms,
      validity_period: validity,
      
      // Set status based on builder mode and current state
      // Inquiry mode (BD): Draft or Pending Pricing when submitted
      // Quotation mode (PD): Preserve existing status, default to Priced if new
      status: targetStatus,
      created_by: "current-user-id",
      created_at: initialData?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSave(quotation);
  };

  const isFormValid = () => {
    // In inquiry mode, don't require charge categories
    if (builderMode === "inquiry") {
      return (
        customerName &&
        selectedServices.length > 0 &&
        date
      );
    }
    
    // In quotation mode, require charge categories
    return (
      customerName &&
      selectedServices.length > 0 &&
      date &&
      chargeCategories.length > 0
    );
  };

  return (
    <div style={{ 
      backgroundColor: "white",
      display: "flex",
      flexDirection: "column",
      height: "100vh"
    }}>
      {/* Header Bar */}
      <div style={{
        padding: "20px 48px",
        borderBottom: "1px solid var(--neuron-ui-border)",
        backgroundColor: "#F8FBFB",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <h1 style={{ 
            fontSize: "24px",
            fontWeight: 600,
            color: "var(--neuron-brand-green)",
            marginBottom: "4px"
          }}>
            {builderMode === "inquiry" 
              ? (mode === "create" ? "Create Inquiry" : "Edit Inquiry")
              : (mode === "create" ? "Create Quotation" : "Edit Quotation")
            }
          </h1>
          <p style={{ fontSize: "13px", color: "var(--neuron-ink-muted)", margin: 0 }}>
            Quote Number: <strong>{quoteNumber}</strong>
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--neuron-ink-muted)",
              backgroundColor: "white",
              border: "1px solid var(--neuron-ui-border)",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <X size={16} />
            Cancel
          </button>

          <button
            onClick={handleSaveAsDraft}
            disabled={isLocked}
            style={{
              padding: "8px 20px",
              fontSize: "13px",
              fontWeight: 500,
              color: isLocked ? "#9CA3AF" : "var(--neuron-brand-green)",
              backgroundColor: "white",
              border: "1px solid var(--neuron-ui-border)",
              borderRadius: "6px",
              cursor: isLocked ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: isLocked ? 0.5 : 1
            }}
          >
            <Save size={16} />
            Save as Draft
          </button>

          <button
            onClick={handleSubmit}
            disabled={!isFormValid() || isLocked}
            style={{
              padding: "8px 24px",
              fontSize: "13px",
              fontWeight: 600,
              color: "white",
              backgroundColor: (isFormValid() && !isLocked) ? "var(--neuron-brand-green)" : "#D1D5DB",
              border: "none",
              borderRadius: "6px",
              cursor: (isFormValid() && !isLocked) ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <FileText size={16} />
            {builderMode === "inquiry" ? "Submit Inquiry to Pricing" : "Submit for Approval"}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ 
        flex: 1,
        overflow: "auto"
      }}>
        {/* Locked Warning Banner */}
        {isLocked && (
          <div style={{
            backgroundColor: "#FEF3C7",
            border: "1px solid #FCD34D",
            borderRadius: "8px",
            padding: "16px 20px",
            margin: "24px 48px",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <div style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "#F59E0B",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: 600,
              flexShrink: 0
            }}>
              🔒
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#92400E", marginBottom: "4px" }}>
                This quotation is locked
              </div>
              <div style={{ fontSize: "13px", color: "#92400E", lineHeight: "1.5" }}>
                This quotation has been converted to project <strong>{initialData?.project_number}</strong>. 
                Pricing cannot be changed to maintain data integrity. You are in view-only mode.
              </div>
            </div>
          </div>
        )}
        
        {/* Form Sections (Scrollable) */}
        <div style={{ 
          padding: "32px 48px",
          maxWidth: "1400px",
          margin: "0 auto",
          overflow: "visible"
        }}>
          
          {/* General Details Section */}
          <GeneralDetailsSection
            customerId={customerId}
            setCustomerId={setCustomerId}
            customerName={customerName}
            setCustomerName={setCustomerName}
            contactPersonId={contactPersonId}
            setContactPersonId={setContactPersonId}
            contactPersonName={contactPersonName}
            setContactPersonName={setContactPersonName}
            quotationName={quotationName}
            setQuotationName={setQuotationName}
            selectedServices={selectedServices}
            setSelectedServices={setSelectedServices}
            date={date}
            setDate={setDate}
            creditTerms={creditTerms}
            setCreditTerms={setCreditTerms}
            validity={validity}
            setValidity={setValidity}
          />

          {/* Service-specific Forms (Dynamically rendered based on selectedServices) */}
          {selectedServices.includes("Brokerage") && (
            <BrokerageServiceForm
              data={brokerageData}
              onChange={handleBrokerageChange}
            />
          )}

          {selectedServices.includes("Forwarding") && (
            <ForwardingServiceForm
              data={forwardingData}
              onChange={handleForwardingChange}
              builderMode={builderMode}
            />
          )}

          {selectedServices.includes("Trucking") && (
            <TruckingServiceForm
              data={truckingData}
              onChange={handleTruckingChange}
            />
          )}

          {selectedServices.includes("Marine Insurance") && (
            <MarineInsuranceServiceForm
              data={marineInsuranceData}
              onChange={handleMarineInsuranceChange}
            />
          )}

          {selectedServices.includes("Others") && (
            <OthersServiceForm
              data={othersData}
              onChange={setOthersData}
            />
          )}

          {/* Vendors Section - Only visible in quotation mode (PD users) */}
          {builderMode === "quotation" && (
            <VendorsSection
              vendors={vendors}
              setVendors={setVendors}
            />
          )}

          {/* Charge Categories Section - Only visible in quotation mode */}
          {builderMode === "quotation" && (
            <ChargeCategoriesSection
              chargeCategories={chargeCategories}
              setChargeCategories={setChargeCategories}
              currency={currency}
              setCurrency={setCurrency}
            />
          )}

          {/* Financial Summary - Only visible in quotation mode */}
          {builderMode === "quotation" && (
            <FinancialSummaryPanel
              financialSummary={financialSummary}
              currency={currency}
              taxRate={taxRate}
              setTaxRate={setTaxRate}
              otherCharges={otherCharges}
              setOtherCharges={setOtherCharges}
            />
          )}

        </div>
      </div>
    </div>
  );
}