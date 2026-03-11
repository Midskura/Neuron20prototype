/**
 * AccountingBookingsShell — Thin wrapper that gives Accounting access to
 * all Operations booking modules via a service-type tab bar.
 *
 * Zero duplication: each tab renders the existing Operations booking list
 * component directly. Detail views are handled internally by each component
 * (Brokerage, Trucking, Marine Insurance, Others handle detail inline;
 * Forwarding uses a list→detail callback pattern managed here).
 */

import { useState, useEffect } from "react";
import { Container, Ship, Truck, FileText, Package } from "lucide-react";
import { ForwardingBookings } from "../operations/forwarding/ForwardingBookings";
import { ForwardingBookingDetails } from "../operations/forwarding/ForwardingBookingDetails";
import { BrokerageBookings } from "../operations/BrokerageBookings";
import { TruckingBookings } from "../operations/TruckingBookings";
import { MarineInsuranceBookings } from "../operations/MarineInsuranceBookings";
import { OthersBookings } from "../operations/OthersBookings";
import type { ForwardingBooking } from "../../types/operations";

type ServiceTab = "forwarding" | "brokerage" | "trucking" | "marine-insurance" | "others";

const SERVICE_TABS: { id: ServiceTab; label: string; icon: typeof Container }[] = [
  { id: "forwarding", label: "Forwarding", icon: Container },
  { id: "brokerage", label: "Brokerage", icon: Package },
  { id: "trucking", label: "Trucking", icon: Truck },
  { id: "marine-insurance", label: "Marine Insurance", icon: Ship },
  { id: "others", label: "Others", icon: FileText },
];

export function AccountingBookingsShell() {
  const [activeTab, setActiveTab] = useState<ServiceTab>("forwarding");

  // Forwarding uses an external list→detail pattern (like Operations.tsx)
  const [fwdSubView, setFwdSubView] = useState<"list" | "detail">("list");
  const [selectedFwdBooking, setSelectedFwdBooking] = useState<ForwardingBooking | null>(null);

  // Reset forwarding detail view when switching tabs
  useEffect(() => {
    setFwdSubView("list");
    setSelectedFwdBooking(null);
  }, [activeTab]);

  const handleSelectFwdBooking = (booking: ForwardingBooking) => {
    setSelectedFwdBooking(booking);
    setFwdSubView("detail");
  };

  const handleBackToList = () => {
    setFwdSubView("list");
    setSelectedFwdBooking(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "forwarding":
        if (fwdSubView === "detail" && selectedFwdBooking) {
          return (
            <ForwardingBookingDetails
              booking={selectedFwdBooking}
              onBack={handleBackToList}
              onBookingUpdated={() => console.log("Booking updated from Accounting")}
            />
          );
        }
        return <ForwardingBookings onSelectBooking={handleSelectFwdBooking} />;
      case "brokerage":
        return <BrokerageBookings />;
      case "trucking":
        return <TruckingBookings />;
      case "marine-insurance":
        return <MarineInsuranceBookings />;
      case "others":
        return <OthersBookings />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--neuron-bg-page)" }}>
      {/* Header */}
      <div className="px-8 pt-8 mb-8">
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 600,
            letterSpacing: "-1.2px",
            color: "var(--neuron-ink-primary)",
            lineHeight: "40px",
          }}
        >
          Bookings
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "var(--neuron-ink-secondary)",
            marginTop: "4px",
          }}
        >
          View and manage bookings across all service types
        </p>
      </div>

      {/* Service type tab bar */}
      <div
        className="px-8 flex gap-1"
        style={{
          borderBottom: "1px solid var(--neuron-ui-border)",
        }}
      >
        {SERVICE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 transition-colors"
              style={{
                fontSize: "13px",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "var(--neuron-brand-green)" : "var(--neuron-ink-secondary)",
                borderBottom: isActive ? "2px solid var(--neuron-brand-green)" : "2px solid transparent",
                marginBottom: "-1px",
                borderRadius: "0",
                background: "transparent",
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content area — renders the Operations booking component */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
}
