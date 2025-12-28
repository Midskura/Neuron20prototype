import { useState } from "react";
import { FormSelect } from "./FormSelect";
import { CompanyAutocomplete } from "../../crm/CompanyAutocomplete";
import { ContactPersonAutocomplete } from "../../crm/ContactPersonAutocomplete";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

interface GeneralDetailsSectionProps {
  // Customer (Company)
  customerId: string;
  setCustomerId: (value: string) => void;
  customerName: string;
  setCustomerName: (value: string) => void;
  
  // Contact Person
  contactPersonId: string;
  setContactPersonId: (value: string) => void;
  contactPersonName: string;
  setContactPersonName: (value: string) => void;
  
  // Quotation Name
  quotationName: string;
  setQuotationName: (value: string) => void;
  
  // Services (multi-select)
  selectedServices: string[];
  setSelectedServices: (services: string[]) => void;
  
  // Dates
  date: string;
  setDate: (value: string) => void;
  
  // Terms
  creditTerms: string;
  setCreditTerms: (value: string) => void;
  validity: string;
  setValidity: (value: string) => void;
}

const AVAILABLE_SERVICES = [
  "Brokerage",
  "Forwarding",
  "Trucking",
  "Marine Insurance",
  "Others"
];

export function GeneralDetailsSection({
  customerId,
  setCustomerId,
  customerName,
  setCustomerName,
  contactPersonId,
  setContactPersonId,
  contactPersonName,
  setContactPersonName,
  quotationName,
  setQuotationName,
  selectedServices,
  setSelectedServices,
  date,
  setDate,
  creditTerms,
  setCreditTerms,
  validity,
  setValidity
}: GeneralDetailsSectionProps) {
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  const handleServiceToggle = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  return (
    <div style={{
      backgroundColor: "white",
      border: "1px solid var(--neuron-ui-border)",
      borderRadius: "8px",
      padding: "24px",
      marginBottom: "24px"
    }}>
      <h2 style={{
        fontSize: "16px",
        fontWeight: 600,
        color: "var(--neuron-brand-green)",
        marginBottom: "20px"
      }}>
        General Details
      </h2>

      <div style={{ display: "grid", gap: "20px" }}>
        {/* Customer Selection */}
        <div>
          <label style={{
            display: "block",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--neuron-ink-base)",
            marginBottom: "8px"
          }}>
            Select Customer *
          </label>
          <CompanyAutocomplete
            value={customerName}
            companyId={customerId}
            onChange={(name, id) => {
              setCustomerName(name);
              setCustomerId(id);
              // Clear contact person when customer changes
              setContactPersonName("");
              setContactPersonId("");
            }}
            placeholder="Select or search customer..."
          />
        </div>

        {/* Contact Person Selection */}
        <div>
          <label style={{
            display: "block",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--neuron-ink-base)",
            marginBottom: "8px"
          }}>
            Select Contact Person *
          </label>
          <ContactPersonAutocomplete
            value={contactPersonName}
            contactId={contactPersonId}
            customerId={customerId} // ✅ Pass customerId instead of companyName
            disabled={!customerId} // ✅ Disable until customer is selected
            onChange={(name, id) => {
              setContactPersonName(name);
              setContactPersonId(id);
            }}
            placeholder="Select or search contact person..."
          />
        </div>

        {/* Quotation Name */}
        <div>
          <label style={{
            display: "block",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--neuron-ink-base)",
            marginBottom: "8px"
          }}>
            Quotation Name *
          </label>
          <input
            type="text"
            value={quotationName}
            onChange={(e) => setQuotationName(e.target.value)}
            placeholder="Enter quotation name..."
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: "13px",
              color: "var(--neuron-ink-base)",
              backgroundColor: "white",
              border: "1px solid var(--neuron-ui-border)",
              borderRadius: "6px",
              outline: "none",
              transition: "border-color 0.15s ease"
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--neuron-brand-teal)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--neuron-ui-border)";
            }}
          />
        </div>

        {/* Services Selection (Multi-select with chips) */}
        <div>
          <label style={{
            display: "block",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--neuron-ink-base)",
            marginBottom: "8px"
          }}>
            Select Service/s *
          </label>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px"
          }}>
            {AVAILABLE_SERVICES.map(service => {
              const isSelected = selectedServices.includes(service);
              const isHovered = hoveredService === service;
              
              // Compute styles based on state
              let backgroundColor = "white";
              let borderColor = "var(--neuron-ui-border)";
              let textColor = "var(--neuron-ink-base)";
              
              if (isSelected) {
                backgroundColor = "#0F766E";
                borderColor = "#0F766E";
                textColor = "white";
              } else if (isHovered) {
                backgroundColor = "#F8FBFB";
                borderColor = "#0F766E";
              }
              
              return (
                <button
                  key={service}
                  type="button"
                  onClick={() => handleServiceToggle(service)}
                  onMouseEnter={() => setHoveredService(service)}
                  onMouseLeave={() => setHoveredService(null)}
                  style={{
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: textColor,
                    backgroundColor: backgroundColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  {service}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date, Credit Terms, Validity in a grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--neuron-ink-base)",
              marginBottom: "8px"
            }}>
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "13px",
                color: "var(--neuron-ink-base)",
                backgroundColor: "white",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "6px",
                outline: "none",
                transition: "border-color 0.15s ease"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--neuron-brand-teal)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--neuron-ui-border)";
              }}
            />
          </div>

          <div>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--neuron-ink-base)",
              marginBottom: "8px"
            }}>
              Credit Terms
            </label>
            <input
              type="text"
              value={creditTerms}
              onChange={(e) => setCreditTerms(e.target.value)}
              placeholder="e.g., Net 30, COD"
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "13px",
                color: "var(--neuron-ink-base)",
                backgroundColor: "white",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "6px",
                outline: "none",
                transition: "border-color 0.15s ease"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--neuron-brand-teal)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--neuron-ui-border)";
              }}
            />
          </div>

          <div>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--neuron-ink-base)",
              marginBottom: "8px"
            }}>
              Validity
            </label>
            <input
              type="text"
              value={validity}
              onChange={(e) => setValidity(e.target.value)}
              placeholder="e.g., 7 days, 30 days"
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "13px",
                color: "var(--neuron-ink-base)",
                backgroundColor: "white",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "6px",
                outline: "none",
                transition: "border-color 0.15s ease"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--neuron-brand-teal)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--neuron-ui-border)";
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}