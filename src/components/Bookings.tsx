import { useState } from "react";
import {
  Plus,
  Search,
  Download,
  Truck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  FileCheck,
  ArrowRight,
} from "lucide-react";

interface Booking {
  id: string;
  trackingNo: string;
  client: string;
  pickup: string;
  dropoff: string;
  status: "Created" | "For Delivery" | "In Transit" | "Delivered" | "Cancelled" | "Closed";
  deliveryType?: "Import" | "Export" | "Domestic";
  deliveryDate: string;
  delivered_at?: string;
  profit: number;
  driver?: string;
  vehicle?: string;
  notes?: string;
}

interface BookingsProps {
  bookings?: Booking[];
  onCreateBooking?: () => void;
  onViewDetail?: (bookingId: string) => void;
  onViewFull?: (bookingId: string) => void;
  onViewBooking?: (booking: Booking) => void;
}

// Status pill component
function StatusPill({ status }: { status: string }) {
  const statusConfig: Record<string, { bg: string; text: string }> = {
    "For Delivery": { bg: "#E8F2EE", text: "#0F766E" },
    "In Transit": { bg: "#FFF3E0", text: "#F25C05" },
    "Delivered": { bg: "#E8F5E9", text: "#10b981" },
    "Created": { bg: "#F3F4F6", text: "#6B7280" },
    "Cancelled": { bg: "#FEE2E2", text: "#EF4444" },
    "Closed": { bg: "#F9FAFB", text: "#6B7280" },
  };

  const config = statusConfig[status] || statusConfig["Created"];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 500,
        backgroundColor: config.bg,
        color: config.text,
      }}
    >
      {status}
    </div>
  );
}

// KPI Card component
function KPICard({
  icon: Icon,
  label,
  value,
  subtext,
}: {
  icon: any;
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: "transparent",
        borderRadius: "12px",
        border: "1px solid #E5E9F0",
        padding: "12px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Icon size={14} style={{ color: "#667085" }} />
        <span style={{ fontSize: "11px", fontWeight: 500, color: "#667085" }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: "24px", fontWeight: 700, color: "#0F766E", lineHeight: "1.2" }}>
        {value}
      </div>
      <div style={{ fontSize: "11px", color: "#667085" }}>{subtext}</div>
    </div>
  );
}

export function Bookings({ bookings = [], onCreateBooking, onViewDetail, onViewFull, onViewBooking }: BookingsProps) {
  const [currentDate] = useState(new Date(2025, 10, 1)); // November 2025
  const [searchTerm, setSearchTerm] = useState("");

  const monthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Sample data exactly as specified with two date groups
  const bookingGroups = [
    {
      date: "2025-10-26",
      label: "SUN, OCT 26",
      bookings: [
        {
          id: "1",
          trackingNo: "LCL-IMPS-001-SEA",
          client: "Global Imports Ltd",
          pickup: "Shanghai",
          dropoff: "Manila",
          status: "For Delivery",
          deliveryDate: "2025-10-26",
        },
        {
          id: "2",
          trackingNo: "FCL-EXPS-002-SEA",
          client: "Unilab",
          pickup: "Manila",
          dropoff: "Singapore",
          status: "For Delivery",
          deliveryDate: "2025-10-26",
        },
        {
          id: "3",
          trackingNo: "LCL-IMPS-003-AIR",
          client: "Acme Trading Corp",
          pickup: "Busan",
          dropoff: "Manila",
          status: "For Delivery",
          deliveryDate: "2025-10-26",
        },
      ],
    },
    {
      date: "2025-10-25",
      label: "SAT, OCT 25",
      bookings: [
        {
          id: "4",
          trackingNo: "FCL-IMPS-004-SEA",
          client: "Metro Retail Group",
          pickup: "Ningbo",
          dropoff: "Manila",
          status: "For Delivery",
          deliveryDate: "2025-10-25",
        },
        {
          id: "5",
          trackingNo: "LCL-IMPS-005-SEA",
          client: "Apex Supply Co",
          pickup: "Xiamen",
          dropoff: "Manila",
          status: "For Delivery",
          deliveryDate: "2025-10-25",
        },
        {
          id: "6",
          trackingNo: "FCL-IMPS-006-SEA",
          client: "Sterling Supply Chain",
          pickup: "Port Klang",
          dropoff: "Manila",
          status: "For Delivery",
          deliveryDate: "2025-10-25",
        },
      ],
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFFFFF",
      }}
    >
      {/* Main Content */}
      <div
        style={{
          padding: "32px 48px",
          maxWidth: "100%",
          margin: "0 auto",
        }}
      >
        {/* Page Header Row - Title + CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: 600, color: "#12332B", marginBottom: "4px", letterSpacing: "-1.2px" }}>
              Bookings
            </h1>
            <p style={{ fontSize: "14px", color: "#667085" }}>
              Manage Bookings
            </p>
          </div>
          <button
            onClick={() => onCreateBooking?.()}
            style={{
              height: "48px",
              padding: "0 24px",
              borderRadius: "16px",
              background: "#0F766E",
              border: "none",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(15, 118, 110, 0.2)",
              transition: "all 200ms ease-out",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#0D6560";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(15, 118, 110, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#0F766E";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(15, 118, 110, 0.2)";
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.background = "#0B5952";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.background = "#0D6560";
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(15, 118, 110, 0.2), 0 0 0 2px #0F766E40";
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(15, 118, 110, 0.2)";
            }}
          >
            <Plus size={20} />
            Create New Booking
          </button>
        </div>

        {/* KPI Cards */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
          <KPICard
            icon={Truck}
            label="Active Shipments"
            value="96"
            subtext="Live across clients"
          />
          <KPICard
            icon={Clock}
            label="Pending Deliveries"
            value="42"
            subtext="Due this week"
          />
          <KPICard
            icon={FileCheck}
            label="Completed Bookings"
            value="324"
            subtext="This month"
          />
        </div>

        {/* Month Navigator */}
        <div
          style={{
            background: "transparent",
            borderRadius: "12px",
            border: "1px solid #E5E9F0",
            padding: "12px 20px",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <button
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              border: "1px solid #E5E9F0",
              background: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <ChevronLeft size={20} style={{ color: "#667085" }} />
          </button>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#12332B", flexShrink: 0 }}>
            {monthYear}
          </div>
          <button
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              border: "1px solid #E5E9F0",
              background: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <ChevronRight size={20} style={{ color: "#667085" }} />
          </button>
        </div>

        {/* Filter Bar */}
        <div
          style={{
            background: "transparent",
            borderRadius: "12px",
            border: "1px solid #E5E9F0",
            padding: "12px 20px",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {/* Search Input */}
          <div style={{ position: "relative", flex: "1 1 280px", minWidth: "280px" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#667085",
              }}
            />
            <input
              placeholder="Search bookings…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                paddingLeft: "36px",
                paddingRight: "12px",
                height: "40px",
                fontSize: "14px",
                border: "1px solid #E5E9F0",
                borderRadius: "12px",
                background: "#FFFFFF",
                outline: "none",
                color: "#12332B",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Filter Pills */}
          <button
            style={{
              height: "40px",
              padding: "0 12px",
              borderRadius: "12px",
              border: "1px solid #E5E9F0",
              background: "#FFFFFF",
              fontSize: "14px",
              color: "#12332B",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            All Types
            <ChevronDown size={16} style={{ color: "#667085" }} />
          </button>
          <button
            style={{
              height: "40px",
              padding: "0 12px",
              borderRadius: "12px",
              border: "1px solid #E5E9F0",
              background: "#FFFFFF",
              fontSize: "14px",
              color: "#12332B",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            All Clients
            <ChevronDown size={16} style={{ color: "#667085" }} />
          </button>
          <button
            style={{
              height: "40px",
              padding: "0 12px",
              borderRadius: "12px",
              border: "1px solid #E5E9F0",
              background: "#FFFFFF",
              fontSize: "14px",
              color: "#12332B",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            All Modes
            <ChevronDown size={16} style={{ color: "#667085" }} />
          </button>
          <button
            style={{
              height: "40px",
              padding: "0 12px",
              borderRadius: "12px",
              border: "1px solid #E5E9F0",
              background: "#FFFFFF",
              fontSize: "14px",
              color: "#12332B",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            All Status
            <ChevronDown size={16} style={{ color: "#667085" }} />
          </button>

          {/* Export Button */}
          <button
            style={{
              height: "40px",
              padding: "0 16px",
              borderRadius: "12px",
              border: "1px solid #E5E9F0",
              background: "transparent",
              fontSize: "14px",
              fontWeight: 500,
              color: "#12332B",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        {/* Bookings Table */}
        <div
          style={{
            background: "transparent",
            borderRadius: "12px",
            border: "1px solid #E5E9F0",
            overflow: "hidden",
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.5fr 2fr 1fr 1.5fr",
              padding: "12px 20px",
              borderBottom: "1px solid #E5E9F0",
              background: "#F9FAFB",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#667085", letterSpacing: "0.5px" }}>
              TRACKING NO.
            </div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#667085", letterSpacing: "0.5px" }}>
              CLIENT
            </div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#667085", letterSpacing: "0.5px" }}>
              ROUTE
            </div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#667085", letterSpacing: "0.5px" }}>
              STATUS
            </div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#667085", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "4px" }}>
              DELIVERY
              <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#E5E9F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#667085", cursor: "help" }}>
                i
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div>
            {bookingGroups.map((group) => (
              <div key={group.date}>
                {/* Date Group Header */}
                <div
                  style={{
                    padding: "8px 20px",
                    background: "#F9FAFB",
                    borderBottom: "1px solid #E5E9F0",
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#667085", letterSpacing: "0.5px" }}>
                    {group.label}
                  </div>
                </div>

                {/* Bookings in this date group */}
                {group.bookings.map((booking, index) => (
                  <div
                    key={booking.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1.5fr 2fr 1fr 1.5fr",
                      padding: "16px 20px",
                      borderBottom: index < group.bookings.length - 1 || bookingGroups.indexOf(group) < bookingGroups.length - 1 ? "1px solid #E5E9F0" : "none",
                      cursor: "pointer",
                      transition: "background 150ms ease",
                    }}
                    onClick={() => onViewBooking?.(booking as any)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#F9FAFB";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {/* Tracking Number */}
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#0F766E" }}>
                      {booking.trackingNo}
                    </div>

                    {/* Client */}
                    <div style={{ fontSize: "14px", color: "#12332B" }}>
                      {booking.client}
                    </div>

                    {/* Route */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#667085" }}>
                      <Truck size={14} style={{ flexShrink: 0 }} />
                      <span>{booking.pickup}</span>
                      <ArrowRight size={14} style={{ flexShrink: 0 }} />
                      <span>{booking.dropoff}</span>
                    </div>

                    {/* Status */}
                    <div>
                      <StatusPill status={booking.status} />
                    </div>

                    {/* Delivery */}
                    <div style={{ fontSize: "14px", color: "#667085" }}>
                      ETA • {booking.deliveryDate}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}