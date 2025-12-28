import { ChevronRight, Calendar, RefreshCw, Plus, ChevronDown } from "lucide-react";
import { NeuronButton } from "./NeuronButton";
import { useState } from "react";

interface TopBarMinimalProps {
  breadcrumbs?: string[];
}

export function TopBarMinimal({ breadcrumbs = ["Dashboard", "Global"] }: TopBarMinimalProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);

  return (
    <div 
      style={{
        height: "64px",
        background: "var(--neuron-bg-elevated)",
        borderBottom: "1px solid var(--neuron-ui-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
      }}
    >
      {/* Left: Breadcrumbs */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {breadcrumbs.map((crumb, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span 
              style={{ 
                fontSize: "14px",
                fontWeight: idx === breadcrumbs.length - 1 ? 600 : 400,
                color: idx === breadcrumbs.length - 1 ? "var(--neuron-ink-primary)" : "var(--neuron-ink-muted)",
                lineHeight: "20px"
              }}
            >
              {crumb}
            </span>
            {idx < breadcrumbs.length - 1 && (
              <ChevronRight size={16} style={{ color: "var(--neuron-ink-muted)" }} />
            )}
          </div>
        ))}
      </div>

      {/* Right: Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Date Range */}
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            height: "40px",
            padding: "0 14px",
            background: "var(--neuron-bg-page)",
            border: "1px solid var(--neuron-ui-border)",
            borderRadius: "var(--neuron-radius-m)",
            fontSize: "14px",
            color: "var(--neuron-ink-secondary)",
            cursor: "pointer",
            transition: "all 120ms ease-out",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--neuron-state-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--neuron-bg-page)";
          }}
        >
          <Calendar size={16} style={{ color: "var(--neuron-ink-muted)" }} />
          <span>Last 30 days</span>
          <ChevronDown size={16} style={{ color: "var(--neuron-ink-muted)" }} />
        </button>

        {/* Auto-refresh */}
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            height: "40px",
            padding: "0 14px",
            background: autoRefresh ? "var(--neuron-brand-green-100)" : "var(--neuron-bg-page)",
            border: `1px solid ${autoRefresh ? "var(--neuron-brand-green)" : "var(--neuron-ui-border)"}`,
            borderRadius: "var(--neuron-radius-m)",
            fontSize: "14px",
            color: autoRefresh ? "var(--neuron-brand-green)" : "var(--neuron-ink-secondary)",
            cursor: "pointer",
            transition: "all 120ms ease-out",
          }}
        >
          <RefreshCw size={16} className={autoRefresh ? "animate-spin" : ""} />
          <span>Auto-refresh</span>
        </button>

        {/* Create Button (Split) */}
        <div style={{ position: "relative", display: "inline-block" }}>
          <NeuronButton variant="primary" icon={<Plus size={16} />}>
            Create
          </NeuronButton>
        </div>
      </div>
    </div>
  );
}
