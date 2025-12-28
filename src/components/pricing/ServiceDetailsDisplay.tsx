import React from "react";

// Helper component for displaying a single field
interface FieldDisplayProps {
  label: string;
  value: any;
  fullWidth?: boolean;
}

function FieldDisplay({ label, value, fullWidth = false }: FieldDisplayProps) {
  return (
    <div style={{ gridColumn: fullWidth ? "1 / -1" : "auto" }}>
      <label style={{
        display: "block",
        fontSize: "13px",
        fontWeight: 500,
        color: "var(--neuron-ink-base)",
        marginBottom: "8px"
      }}>
        {label}
      </label>
      <div style={{
        padding: "10px 14px",
        backgroundColor: "#F9FAFB",
        border: "1px solid var(--neuron-ui-border)",
        borderRadius: "6px",
        fontSize: "14px",
        color: value ? "var(--neuron-ink-primary)" : "#9CA3AF"
      }}>
        {value || "—"}
      </div>
    </div>
  );
}

// Helper component for checkbox fields
function CheckboxDisplay({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 14px",
      backgroundColor: "#F9FAFB",
      border: "1px solid var(--neuron-ui-border)",
      borderRadius: "6px"
    }}>
      <div style={{
        width: "18px",
        height: "18px",
        borderRadius: "4px",
        border: "2px solid var(--neuron-brand-green)",
        backgroundColor: checked ? "var(--neuron-brand-green)" : "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{ fontSize: "14px", color: "var(--neuron-ink-primary)" }}>
        {label}
      </span>
    </div>
  );
}

// Comprehensive Brokerage Service Display
export function BrokerageServiceDisplay({ details }: { details: any }) {
  const showFCL = details.cargoType === "FCL";
  const showLCL = details.cargoType === "LCL";
  const showAir = details.mode === "Air";
  const isAllInclusive = details.brokerageType === "All-Inclusive";

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
        Brokerage Service Details
      </h2>

      <div style={{ display: "grid", gap: "20px" }}>
        {/* Brokerage Type */}
        <FieldDisplay label="Brokerage Type" value={details.brokerageType} fullWidth />

        {/* Type of Entry (for Standard & Non-Regular) */}
        {details.brokerageType !== "All-Inclusive" && (
          <FieldDisplay label="Type of Entry" value={details.typeOfEntry} fullWidth />
        )}

        {/* Checkboxes (for Standard & Non-Regular) */}
        {details.brokerageType !== "All-Inclusive" && (
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <CheckboxDisplay label="Consumption" checked={details.consumption || false} />
            <CheckboxDisplay label="Warehousing" checked={details.warehousing || false} />
            <CheckboxDisplay label="PEZA" checked={details.peza || false} />
          </div>
        )}

        {/* 2-column grid for common fields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <FieldDisplay label="POD" value={details.pod} />
          <FieldDisplay label="Mode" value={details.mode} />
          <FieldDisplay label="Cargo Type" value={details.cargoType} />
        </div>

        {/* FCL Container Details */}
        {showFCL && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <FieldDisplay label="FCL Container Type" value={details.fclContainerType} />
            <FieldDisplay label="FCL Quantity" value={details.fclQty} />
          </div>
        )}

        {/* LCL Details */}
        {showLCL && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <FieldDisplay label="LCL GWT" value={details.lclGwt} />
            <FieldDisplay label="LCL Dimensions" value={details.lclDims} />
          </div>
        )}

        {/* Air Details */}
        {showAir && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <FieldDisplay label="Air GWT" value={details.airGwt} />
            <FieldDisplay label="Air CWT" value={details.airCwt} />
          </div>
        )}

        {/* Full-width fields */}
        <FieldDisplay label="Commodity Description" value={details.commodityDescription} fullWidth />
        <FieldDisplay label="Delivery Address" value={details.deliveryAddress} fullWidth />

        {/* All-Inclusive specific fields */}
        {isAllInclusive && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <FieldDisplay label="Country of Origin" value={details.countryOfOrigin} />
            <FieldDisplay label="Preferential Treatment" value={details.preferentialTreatment} />
          </div>
        )}
      </div>
    </div>
  );
}

// Comprehensive Forwarding Service Display
export function ForwardingServiceDisplay({ details }: { details: any }) {
  const showFCL = details.mode === "Sea" && details.cargoType === "FCL";
  const showLCL = details.mode === "Sea" && details.cargoType === "LCL";
  const showAir = details.mode === "Air";
  const showInctermDetails = ["EXW", "FOB", "FCA"].includes(details.incoterms);
  const showCollectionAddress = details.incoterms === "EXW";

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
        Forwarding Service Details
      </h2>

      <div style={{ display: "grid", gap: "20px" }}>
        {/* Main details in 2-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <FieldDisplay label="Incoterms" value={details.incoterms} />
          <FieldDisplay label="Mode" value={details.mode} />
          <FieldDisplay label="AOL / POL" value={details.aolPol} />
          <FieldDisplay label="AOD / POD" value={details.aodPod} />
          <FieldDisplay label="Cargo Type" value={details.cargoType} />
          <FieldDisplay label="Cargo Nature" value={details.cargoNature} />
        </div>

        {/* FCL Container Details */}
        {showFCL && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <FieldDisplay label="FCL Container Type" value={details.fclContainerType} />
            <FieldDisplay label="FCL Quantity" value={details.fclQty} />
          </div>
        )}

        {/* LCL Details */}
        {showLCL && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <FieldDisplay label="LCL GWT" value={details.lclGwt} />
            <FieldDisplay label="LCL Dimensions" value={details.lclDims} />
          </div>
        )}

        {/* Air Details */}
        {showAir && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <FieldDisplay label="Air GWT" value={details.airGwt} />
            <FieldDisplay label="Air CWT" value={details.airCwt} />
          </div>
        )}

        {/* Full-width fields */}
        <FieldDisplay label="Commodity Description" value={details.commodityDescription} fullWidth />
        <FieldDisplay label="Delivery Address" value={details.deliveryAddress} fullWidth />

        {/* Collection Address (EXW only) */}
        {showCollectionAddress && (
          <FieldDisplay label="Collection Address" value={details.collectionAddress} fullWidth />
        )}

        {/* Incoterm-specific details (EXW/FOB/FCA) */}
        {showInctermDetails && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <FieldDisplay label="Carrier / Airline" value={details.carrierAirline} />
              <FieldDisplay label="Transit Time" value={details.transitTime} />
            </div>
            <FieldDisplay label="Route" value={details.route} fullWidth />
            <FieldDisplay label="Stackable" value={details.stackable} fullWidth />
          </>
        )}
      </div>
    </div>
  );
}

// Trucking Service Display
export function TruckingServiceDisplay({ details }: { details: any }) {
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
        Trucking Service Details
      </h2>

      <div style={{ display: "grid", gap: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <FieldDisplay label="Truck Type" value={details.truckType} />
          <FieldDisplay label="Cargo Type" value={details.cargoType} />
        </div>
        <FieldDisplay label="Pickup Address" value={details.pickupAddress} fullWidth />
        <FieldDisplay label="Delivery Address" value={details.deliveryAddress} fullWidth />
        <FieldDisplay label="Commodity Description" value={details.commodityDescription} fullWidth />
      </div>
    </div>
  );
}

// Marine Insurance Service Display
export function MarineInsuranceServiceDisplay({ details }: { details: any }) {
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
        Marine Insurance Service Details
      </h2>

      <div style={{ display: "grid", gap: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <FieldDisplay label="Insurance Type" value={details.insuranceType} />
          <FieldDisplay label="Coverage Amount" value={details.coverageAmount} />
        </div>
        <FieldDisplay label="Commodity Description" value={details.commodityDescription} fullWidth />
      </div>
    </div>
  );
}

// Others Service Display
export function OthersServiceDisplay({ details }: { details: any }) {
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
        Other Service Details
      </h2>

      <div style={{ display: "grid", gap: "20px" }}>
        <FieldDisplay label="Service Description" value={details.serviceDescription} fullWidth />
        <FieldDisplay label="Additional Details" value={details.additionalDetails} fullWidth />
      </div>
    </div>
  );
}
