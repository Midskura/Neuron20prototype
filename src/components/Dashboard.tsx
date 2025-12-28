import { TrendingUp, TrendingDown, Package, Clock, Timer, FileText, DollarSign, AlertTriangle, CheckCircle, XCircle, Ship, Plane, MapPin, Truck, Plus } from "lucide-react";
import { NeuronCard } from "./NeuronCard";
import { NeuronStatusPill } from "./NeuronStatusPill";
import { NeuronPageHeader } from "./NeuronPageHeader";

interface DashboardProps {
  currentUser?: { name: string; email: string } | null;
}

// KPI Card component matching Bookings design
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
        border: "1px solid var(--neuron-ui-border)",
        padding: "12px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Icon size={14} style={{ color: "var(--neuron-ink-muted)" }} />
        <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--neuron-ink-muted)" }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--neuron-brand-green)", lineHeight: "1.2" }}>
        {value}
      </div>
      <div style={{ fontSize: "11px", color: "var(--neuron-ink-muted)" }}>
        {subtext}
      </div>
    </div>
  );
}

export function Dashboard({ currentUser }: DashboardProps) {
  const kpis = [
    { label: "Active Bookings", value: "127", delta: "+12%", up: true, icon: Package },
    { label: "On-time %", value: "96%", delta: "+4%", up: true, icon: Clock },
    { label: "Avg Lead Time", value: "3.2d", delta: "-0.8d", up: true, icon: Timer },
    { label: "Pending RFPs", value: "23", delta: "+5", up: false, icon: FileText },
  ];

  const topClients = [
    { name: "Acme Retail", revenue: "₱450,000", avatar: "A" },
    { name: "Northport Foods", revenue: "₱380,000", avatar: "N" },
    { name: "Metro Distribution", revenue: "₱325,000", avatar: "M" },
    { name: "Pacific Trading Co", revenue: "₱285,000", avatar: "P" },
    { name: "Highland Imports", revenue: "₱240,000", avatar: "H" },
    { name: "SunMart Holdings", revenue: "₱210,000", avatar: "S" },
  ];

  const exceptions = [
    { 
      type: "SEA FCL", 
      route: "SHA → MNL", 
      carrier: "CMA CGM", 
      issue: "ETA +2d", 
      reason: "Port congestion",
      severity: "warning" as const
    },
    { 
      type: "AIR", 
      route: "NRT → MNL", 
      carrier: "NH", 
      issue: "Docs missing", 
      reason: "Commercial invoice",
      severity: "danger" as const
    },
    { 
      type: "SEA LCL", 
      route: "XMN → CEB", 
      carrier: "Maersk", 
      issue: "Hold at CFS", 
      reason: "Exam required",
      severity: "warning" as const
    },
  ];

  const demurrageRisk = [
    { container: "TCLU4567890", gateIn: "Oct 18", freeTime: 2, total: 7 },
    { container: "MSCU8901234", gateIn: "Oct 20", freeTime: 4, total: 7 },
    { container: "HLCU3456789", gateIn: "Oct 22", freeTime: 6, total: 7 },
  ];

  const activities = [
    { time: "14:22", action: "Booking FCL-IMPS-021-SEA moved to", detail: "Customs Clearance", icon: Package },
    { time: "13:58", action: "Invoice INV-2025-1173 posted", detail: "₱125,400", icon: DollarSign },
    { time: "13:10", action: "RFP RFP-00432 approved", detail: "Metro Distribution", icon: CheckCircle },
    { time: "12:45", action: "Container TCLU4567890", detail: "Gated out - delivered", icon: Truck },
    { time: "11:30", action: "Customs clearance complete", detail: "AIR-IMPS-003", icon: CheckCircle },
    { time: "10:15", action: "Document uploaded", detail: "BOL for FCL-IMPS-001-SEA", icon: FileText },
  ];

  const bookingsSample = [
    { 
      tracking: "FCL-IMPS-001-SEA", 
      client: "Acme Retail", 
      route: "Shanghai → Manila", 
      mode: "SEA FCL",
      status: "For Delivery",
      eta: "2025-10-26",
      docs: ["BL", "INV", "PL"],
      docsStatus: "complete" as const
    },
    { 
      tracking: "FCL-EXPS-002-SEA", 
      client: "Northport Foods", 
      route: "Manila → Singapore", 
      mode: "SEA FCL",
      status: "In Transit",
      eta: "2025-10-29",
      docs: ["S/O missing"],
      docsStatus: "missing" as const
    },
    { 
      tracking: "AIR-IMPS-003", 
      client: "Metro Distribution", 
      route: "NRT → MNL", 
      mode: "AIR",
      status: "At Customs",
      eta: "2025-10-25",
      docs: ["COO pending"],
      docsStatus: "pending" as const
    },
    { 
      tracking: "LCL-IMPS-004-SEA", 
      client: "Highland Imports", 
      route: "Xiamen → Cebu", 
      mode: "SEA LCL",
      status: "For Delivery",
      eta: "2025-10-27",
      docs: ["BL", "INV", "PL", "COO"],
      docsStatus: "complete" as const
    },
    { 
      tracking: "FCL-IMPS-005-SEA", 
      client: "Pacific Trading Co", 
      route: "Busan → Manila", 
      mode: "SEA FCL",
      status: "In Transit",
      eta: "2025-10-28",
      docs: ["BL", "INV", "PL"],
      docsStatus: "complete" as const
    },
  ];

  const compliance = [
    { doc: "Commercial Invoice", secured: 94, total: 127, missing: 6 },
    { doc: "Packing List", secured: 98, total: 127, missing: 2 },
    { doc: "BL/AWB", secured: 100, total: 127, missing: 0 },
    { doc: "Certificate of Origin", secured: 89, total: 127, missing: 14 },
    { doc: "Import Permit", secured: 91, total: 127, missing: 11 },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--neuron-bg-page)" }}>
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px" }}>
          
          {/* A) Gradient Operations Banner */}
          <div 
            className="relative overflow-hidden mb-6"
            style={{
              height: "160px",
              borderRadius: "14px",
              background: "linear-gradient(180deg, #8DBDAE 0%, #2C7D67 65%, rgba(44, 125, 103, 0.6) 100%)",
              boxShadow: "var(--elevation-2)",
            }}
          >
            {/* Grain overlay */}
            <div 
              className="absolute inset-0" 
              style={{ 
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E\")",
                opacity: 0.3
              }}
            />
            
            <div className="relative h-full flex items-center justify-between px-8">
              {/* Left: Title */}
              <div>
                <h1 style={{ 
                  fontSize: "32px", 
                  fontWeight: 600, 
                  lineHeight: "40px", 
                  color: "#12332B",
                  letterSpacing: "-0.8px"
                }}>
                  Dashboard
                </h1>
                <p style={{ fontSize: "14px", lineHeight: "20px", color: "rgba(255, 255, 255, 0.9)" }}>
                  Live view of bookings, exceptions, and cashflow.
                </p>
              </div>

              {/* Right: Metric Bubbles */}
              <div className="flex gap-3">
                <div 
                  className="px-5 py-3 rounded-full backdrop-blur-sm"
                  style={{ 
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    height: "72px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center"
                  }}
                >
                  <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.8)", lineHeight: "16px", marginBottom: "2px" }}>On-time deliveries</div>
                  <div style={{ fontSize: "24px", fontWeight: 600, color: "white", lineHeight: "28px", letterSpacing: "-0.01em" }}>96%</div>
                </div>
                <div 
                  className="px-5 py-3 rounded-full backdrop-blur-sm"
                  style={{ 
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    height: "72px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center"
                  }}
                >
                  <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.8)", lineHeight: "16px", marginBottom: "2px" }}>Docs flagged</div>
                  <div style={{ fontSize: "24px", fontWeight: 600, color: "white", lineHeight: "28px", letterSpacing: "-0.01em" }}>3</div>
                </div>
                <div 
                  className="px-5 py-3 rounded-full backdrop-blur-sm"
                  style={{ 
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    height: "72px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center"
                  }}
                >
                  <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.8)", lineHeight: "16px", marginBottom: "2px" }}>New bookings</div>
                  <div style={{ fontSize: "24px", fontWeight: 600, color: "white", lineHeight: "28px", letterSpacing: "-0.01em" }}>42</div>
                </div>
              </div>
            </div>
          </div>

          {/* B) KPI Row */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            {kpis.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <NeuronCard key={idx} padding="md" elevation="1">
                  <div className="flex items-start justify-between mb-3">
                    <div style={{ fontSize: "12px", color: "var(--neuron-ink-muted)", lineHeight: "16px", fontWeight: 500 }}>
                      {kpi.label}
                    </div>
                    <Icon size={16} style={{ color: "var(--neuron-ink-muted)" }} />
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: 600, color: "var(--neuron-ink-primary)", lineHeight: "28px", letterSpacing: "-0.005em", marginBottom: "4px" }}>
                    {kpi.value}
                  </div>
                  <div className="flex items-center gap-1">
                    {kpi.up ? (
                      <TrendingUp size={12} style={{ color: "var(--neuron-semantic-success)" }} />
                    ) : (
                      <TrendingDown size={12} style={{ color: "var(--neuron-semantic-danger)" }} />
                    )}
                    <span style={{ 
                      fontSize: "12px", 
                      color: kpi.up ? "var(--neuron-semantic-success)" : "var(--neuron-semantic-danger)",
                      fontWeight: 500
                    }}>
                      {kpi.delta}
                    </span>
                  </div>
                </NeuronCard>
              );
            })}
          </div>

          {/* C) Core Visuals Row */}
          <div className="grid grid-cols-12 gap-6 mb-6">
            {/* Bookings Chart - 8 columns */}
            <NeuronCard className="col-span-8" padding="lg" elevation="1">
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--neuron-ink-primary)", marginBottom: "16px" }}>
                Bookings per week (last 12w)
              </h3>
              <div style={{ height: "240px", position: "relative" }}>
                {/* Chart placeholder with grid and line */}
                <svg width="100%" height="100%" style={{ display: "block" }}>
                  {/* Grid lines */}
                  <line x1="0" y1="60" x2="100%" y2="60" stroke="var(--neuron-ui-divider)" strokeWidth="1" />
                  <line x1="0" y1="120" x2="100%" y2="120" stroke="var(--neuron-ui-divider)" strokeWidth="1" />
                  <line x1="0" y1="180" x2="100%" y2="180" stroke="var(--neuron-ui-divider)" strokeWidth="1" />
                  
                  {/* Area fill */}
                  <path
                    d="M 0 200 L 50 180 L 100 160 L 150 170 L 200 150 L 250 140 L 300 120 L 350 100 L 400 90 L 450 80 L 500 75 L 550 70 L 600 65 L 600 240 L 0 240 Z"
                    fill="var(--neuron-brand-green-100)"
                    opacity="0.5"
                  />
                  
                  {/* Line */}
                  <path
                    d="M 0 200 L 50 180 L 100 160 L 150 170 L 200 150 L 250 140 L 300 120 L 350 100 L 400 90 L 450 80 L 500 75 L 550 70 L 600 65"
                    stroke="var(--neuron-brand-green)"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  
                  {/* Event annotations */}
                  <circle cx="250" cy="140" r="5" fill="var(--neuron-semantic-warn)" />
                  <circle cx="450" cy="80" r="5" fill="var(--neuron-semantic-danger)" />
                </svg>
                
                {/* Event labels */}
                <div style={{ position: "absolute", top: "110px", left: "210px", fontSize: "11px", color: "var(--neuron-ink-muted)", background: "var(--neuron-bg-elevated)", padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--neuron-ui-border)" }}>
                  Vessel roll-over
                </div>
                <div style={{ position: "absolute", top: "50px", left: "400px", fontSize: "11px", color: "var(--neuron-ink-muted)", background: "var(--neuron-bg-elevated)", padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--neuron-ui-border)" }}>
                  Customs outage
                </div>
              </div>
            </NeuronCard>

            {/* Top Clients - 4 columns */}
            <NeuronCard className="col-span-4" padding="lg" elevation="1">
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--neuron-ink-primary)", marginBottom: "16px" }}>
                Top Clients (MRR)
              </h3>
              <div className="space-y-3">
                {topClients.map((client, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div 
                      className="flex items-center justify-center rounded-full"
                      style={{
                        width: "32px",
                        height: "32px",
                        background: "var(--neuron-brand-green-100)",
                        color: "var(--neuron-brand-green)",
                        fontSize: "13px",
                        fontWeight: 600,
                        flexShrink: 0
                      }}
                    >
                      {client.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-primary)", lineHeight: "18px" }}>
                        {client.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--neuron-ink-muted)", lineHeight: "16px" }}>
                        {client.revenue}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </NeuronCard>
          </div>

          {/* D) Exceptions & Risk Row */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* ETA Exceptions */}
            <NeuronCard padding="lg" elevation="1">
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--neuron-ink-primary)" }}>
                  ETA Exceptions (8)
                </h3>
                <AlertTriangle size={18} style={{ color: "var(--neuron-semantic-warn)" }} />
              </div>
              <div className="space-y-3">
                {exceptions.map((exc, idx) => (
                  <div 
                    key={idx}
                    style={{
                      padding: "12px",
                      background: "var(--neuron-bg-page)",
                      borderRadius: "var(--neuron-radius-m)",
                      border: "1px solid var(--neuron-ui-border)",
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <NeuronStatusPill variant="neutral" size="sm">{exc.type}</NeuronStatusPill>
                        <span style={{ fontSize: "13px", color: "var(--neuron-ink-secondary)", fontWeight: 500 }}>
                          {exc.route}
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--neuron-ink-muted)" }}>
                          · {exc.carrier}
                        </span>
                      </div>
                      <button
                        style={{
                          fontSize: "12px",
                          color: "var(--neuron-brand-green)",
                          fontWeight: 500,
                          cursor: "pointer",
                          background: "transparent",
                          border: "none",
                          padding: "4px 8px",
                        }}
                      >
                        Resolve
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <NeuronStatusPill variant={exc.severity} size="sm">{exc.issue}</NeuronStatusPill>
                      <span style={{ fontSize: "12px", color: "var(--neuron-ink-muted)" }}>
                        {exc.reason}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </NeuronCard>

            {/* Demurrage Risk */}
            <NeuronCard padding="lg" elevation="1">
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--neuron-ink-primary)" }}>
                  Demurrage/Detention Risk (5)
                </h3>
                <Clock size={18} style={{ color: "var(--neuron-semantic-warn)" }} />
              </div>
              <div className="space-y-4">
                {demurrageRisk.map((risk, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--neuron-ink-primary)", fontFamily: "monospace" }}>
                          {risk.container}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--neuron-ink-muted)" }}>
                          Gate-in: {risk.gateIn}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: risk.freeTime <= 2 ? "var(--neuron-semantic-danger)" : "var(--neuron-semantic-success)" }}>
                          {risk.freeTime}d left
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--neuron-ink-muted)" }}>
                          of {risk.total}d free time
                        </div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: "6px", background: "var(--neuron-ui-divider)", borderRadius: "3px", overflow: "hidden" }}>
                      <div 
                        style={{ 
                          height: "100%", 
                          width: `${(risk.freeTime / risk.total) * 100}%`,
                          background: risk.freeTime <= 2 ? "var(--neuron-semantic-danger)" : risk.freeTime <= 4 ? "var(--neuron-semantic-warn)" : "var(--neuron-semantic-success)",
                          transition: "width 300ms ease-out"
                        }} 
                      />
                    </div>
                  </div>
                ))}
                <button
                  style={{
                    width: "100%",
                    height: "36px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--neuron-brand-green)",
                    background: "var(--neuron-brand-green-100)",
                    border: "1px solid var(--neuron-brand-green)",
                    borderRadius: "var(--neuron-radius-m)",
                    cursor: "pointer",
                    marginTop: "8px",
                  }}
                >
                  Notify broker
                </button>
              </div>
            </NeuronCard>
          </div>

          {/* E) Map + Activity Feed */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Shipments Map */}
            <NeuronCard padding="lg" elevation="1">
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--neuron-ink-primary)", marginBottom: "16px" }}>
                Active Shipments
              </h3>
              <div style={{ height: "280px", background: "var(--neuron-bg-page)", borderRadius: "var(--neuron-radius-m)", position: "relative", overflow: "hidden" }}>
                {/* Simplified map placeholder */}
                <svg width="100%" height="100%" viewBox="0 0 400 280">
                  {/* Ocean background */}
                  <rect width="400" height="280" fill="#E8F2EE" />
                  
                  {/* Philippines outline (simplified) */}
                  <path d="M 200 80 L 220 100 L 240 90 L 250 110 L 260 130 L 250 150 L 240 170 L 220 180 L 210 190 L 200 185 L 190 175 L 180 160 L 185 140 L 180 120 L 190 100 Z" 
                    fill="var(--neuron-brand-green-100)" 
                    stroke="var(--neuron-brand-green)" 
                    strokeWidth="1.5"
                  />
                  
                  {/* Shipping lanes */}
                  <path d="M 50 120 Q 150 100 200 130" stroke="var(--neuron-brand-green)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
                  <path d="M 100 50 Q 180 60 210 110" stroke="var(--neuron-brand-green)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
                  <path d="M 350 140 Q 280 135 230 145" stroke="var(--neuron-brand-green)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
                  
                  {/* Port pins */}
                  <circle cx="210" cy="125" r="6" fill="var(--neuron-semantic-success)" stroke="white" strokeWidth="2" />
                  <circle cx="230" cy="155" r="6" fill="var(--neuron-semantic-warn)" stroke="white" strokeWidth="2" />
                  <circle cx="220" cy="175" r="6" fill="var(--neuron-brand-green)" stroke="white" strokeWidth="2" />
                  
                  {/* Origin pins */}
                  <circle cx="60" cy="125" r="4" fill="var(--neuron-ink-muted)" opacity="0.6" />
                  <circle cx="110" cy="55" r="4" fill="var(--neuron-ink-muted)" opacity="0.6" />
                  <circle cx="340" cy="145" r="4" fill="var(--neuron-ink-muted)" opacity="0.6" />
                </svg>
                
                {/* Tooltip example */}
                <div style={{
                  position: "absolute",
                  top: "100px",
                  left: "240px",
                  background: "var(--neuron-bg-elevated)",
                  border: "1px solid var(--neuron-ui-border)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "11px",
                  boxShadow: "var(--elevation-2)",
                  pointerEvents: "none"
                }}>
                  <div style={{ fontWeight: 600, color: "var(--neuron-ink-primary)", marginBottom: "2px" }}>FCL-IMPS-001-SEA</div>
                  <div style={{ color: "var(--neuron-ink-muted)" }}>ETA Oct 26 · For delivery</div>
                </div>
              </div>
            </NeuronCard>

            {/* Recent Activity */}
            <NeuronCard padding="lg" elevation="1">
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--neuron-ink-primary)", marginBottom: "16px" }}>
                Recent Activity
              </h3>
              <div className="space-y-0">
                {activities.map((activity, idx) => {
                  const Icon = activity.icon;
                  return (
                    <div 
                      key={idx} 
                      className="flex items-center gap-3 py-2 border-b last:border-b-0"
                      style={{ 
                        borderColor: "var(--neuron-ui-divider)",
                        minHeight: "44px"
                      }}
                    >
                      <div 
                        className="flex items-center justify-center rounded-lg"
                        style={{
                          width: "28px",
                          height: "28px",
                          background: "var(--neuron-bg-page)",
                          flexShrink: 0
                        }}
                      >
                        <Icon size={14} style={{ color: "var(--neuron-ink-muted)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize: "13px", color: "var(--neuron-ink-primary)", lineHeight: "18px" }}>
                          {activity.action} <span style={{ fontWeight: 600 }}>{activity.detail}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--neuron-ink-muted)", whiteSpace: "nowrap" }}>
                        {activity.time}
                      </div>
                    </div>
                  );
                })}
              </div>
            </NeuronCard>
          </div>

          {/* F) Document Compliance */}
          <NeuronCard padding="lg" elevation="1" style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--neuron-ink-primary)", marginBottom: "16px" }}>
              Document Compliance
            </h3>
            <div className="grid grid-cols-5 gap-4">
              {compliance.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontSize: "12px", color: "var(--neuron-ink-secondary)", fontWeight: 500 }}>
                      {item.doc}
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: item.missing > 5 ? "var(--neuron-semantic-danger)" : "var(--neuron-semantic-success)" }}>
                      {Math.round((item.secured / item.total) * 100)}%
                    </span>
                  </div>
                  <div style={{ height: "8px", background: "var(--neuron-ui-divider)", borderRadius: "4px", overflow: "hidden" }}>
                    <div 
                      style={{ 
                        height: "100%", 
                        width: `${(item.secured / item.total) * 100}%`,
                        background: item.missing > 5 ? "var(--neuron-semantic-danger)" : "var(--neuron-semantic-success)",
                      }} 
                    />
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--neuron-ink-muted)", marginTop: "4px" }}>
                    {item.missing > 0 ? `${item.missing} missing` : "Complete"}
                  </div>
                </div>
              ))}
            </div>
          </NeuronCard>

          {/* G) Mini Bookings Table */}
          <NeuronCard padding="lg" elevation="1">
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--neuron-ink-primary)", marginBottom: "16px" }}>
              Recent Bookings
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--neuron-ui-border)" }}>
                    <th style={{ padding: "12px 16px 12px 0", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--neuron-ink-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tracking No.</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--neuron-ink-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Client</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--neuron-ink-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Route</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--neuron-ink-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Mode</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--neuron-ink-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--neuron-ink-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>ETA</th>
                    <th style={{ padding: "12px 0 12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--neuron-ink-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Docs</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingsSample.map((booking, idx) => (
                    <tr 
                      key={idx}
                      style={{ 
                        borderBottom: idx < bookingsSample.length - 1 ? "1px solid var(--neuron-ui-divider)" : "none",
                        transition: "background 120ms ease-out",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--neuron-state-hover)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <td style={{ padding: "16px 16px 16px 0", fontSize: "13px", fontWeight: 600, color: "var(--neuron-ink-primary)", fontFamily: "monospace" }}>
                        {booking.tracking}
                      </td>
                      <td style={{ padding: "16px", fontSize: "13px", color: "var(--neuron-ink-secondary)" }}>
                        {booking.client}
                      </td>
                      <td style={{ padding: "16px", fontSize: "13px", color: "var(--neuron-ink-secondary)" }}>
                        {booking.route}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <NeuronStatusPill variant="neutral" size="sm">{booking.mode}</NeuronStatusPill>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <NeuronStatusPill 
                          variant={booking.status === "At Customs" ? "warning" : "success"} 
                          size="sm"
                        >
                          {booking.status}
                        </NeuronStatusPill>
                      </td>
                      <td style={{ padding: "16px", fontSize: "13px", color: "var(--neuron-ink-secondary)", fontVariantNumeric: "tabular-nums" }}>
                        {booking.eta}
                      </td>
                      <td style={{ padding: "16px 0 16px 16px" }}>
                        {booking.docsStatus === "complete" ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle size={14} style={{ color: "var(--neuron-semantic-success)" }} />
                            <span style={{ fontSize: "12px", color: "var(--neuron-semantic-success)", fontWeight: 500 }}>
                              {booking.docs.join(", ")}
                            </span>
                          </div>
                        ) : (
                          <NeuronStatusPill variant="danger" size="sm">
                            {booking.docs[0]}
                          </NeuronStatusPill>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </NeuronCard>

          {/* Watermark */}
          <div style={{ textAlign: "right", padding: "16px 0", fontSize: "11px", color: "var(--neuron-ink-muted)" }}>
            Powered by Neuron
          </div>
        </div>
      </div>
    </div>
  );
}