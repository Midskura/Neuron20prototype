/**
 * NeuronTypography Components
 * 
 * Reusable typography components following the Neuron Module Typography System.
 * Use these to ensure consistency across all modules.
 */

import { CSSProperties, ReactNode } from "react";

interface SectionHeaderProps {
  children: ReactNode;
  style?: CSSProperties;
}

/**
 * Section Header (h2)
 * Used for major sections within module detail views
 */
export function NeuronSectionHeader({ children, style }: SectionHeaderProps) {
  return (
    <h2 
      style={{ 
        fontSize: "16px", 
        fontWeight: 600, 
        color: "var(--neuron-ink-primary)",
        marginBottom: "20px",
        paddingBottom: "12px",
        borderBottom: "2px solid #E5E7EB",
        ...style
      }}
    >
      {children}
    </h2>
  );
}

interface FieldLabelProps {
  children: ReactNode;
  htmlFor?: string;
  style?: CSSProperties;
}

/**
 * Field Label
 * Uppercase labels for form fields and data displays
 */
export function NeuronFieldLabel({ children, htmlFor, style }: FieldLabelProps) {
  return (
    <label 
      htmlFor={htmlFor}
      style={{ 
        display: "block",
        fontSize: "11px", 
        fontWeight: 600,
        color: "#6B7280",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        marginBottom: "8px",
        ...style
      }}
    >
      {children}
    </label>
  );
}

interface FieldValueProps {
  children: ReactNode;
  style?: CSSProperties;
}

/**
 * Field Value
 * Standard text display for field values
 */
export function NeuronFieldValue({ children, style }: FieldValueProps) {
  return (
    <div 
      style={{ 
        fontSize: "14px", 
        color: "var(--neuron-ink-primary)",
        ...style
      }}
    >
      {children || "—"}
    </div>
  );
}

interface FieldGroupProps {
  label: string;
  value?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
}

/**
 * Field Group
 * Combines label and value in a standard layout
 */
export function NeuronFieldGroup({ label, value, children, style }: FieldGroupProps) {
  return (
    <div style={style}>
      <NeuronFieldLabel>{label}</NeuronFieldLabel>
      {children ? children : <NeuronFieldValue>{value}</NeuronFieldValue>}
    </div>
  );
}

interface ModuleTitleProps {
  children: ReactNode;
  subtitle?: string;
  style?: CSSProperties;
}

/**
 * Module Title (h1)
 * Main page title for modules
 */
export function NeuronModuleTitle({ children, subtitle, style }: ModuleTitleProps) {
  return (
    <div>
      <h1 
        style={{ 
          fontSize: "32px", 
          fontWeight: 600, 
          color: "#12332B", 
          marginBottom: subtitle ? "4px" : "0",
          letterSpacing: "-1.2px",
          ...style
        }}
      >
        {children}
      </h1>
      {subtitle && (
        <p style={{ 
          fontSize: "14px", 
          color: "#667085"
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

interface DetailTitleProps {
  children: ReactNode;
  subtitle?: ReactNode;
  style?: CSSProperties;
}

/**
 * Detail Title
 * For detail view pages (e.g., Project Detail, Customer Detail)
 */
export function NeuronDetailTitle({ children, subtitle, style }: DetailTitleProps) {
  return (
    <div>
      <h1 
        style={{ 
          fontSize: "32px", 
          fontWeight: 600, 
          color: "#12332B", 
          lineHeight: "40px",
          marginBottom: subtitle ? "8px" : "0",
          letterSpacing: "-1.2px",
          ...style
        }}
      >
        {children}
      </h1>
      {subtitle && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

/**
 * Usage Examples:
 * 
 * // Module page header
 * <NeuronModuleTitle subtitle="Manage your customer database">
 *   Customers
 * </NeuronModuleTitle>
 * 
 * // Detail page header
 * <NeuronDetailTitle subtitle={<NeuronStatusPill status="Active" />}>
 *   PROJ-2024-001
 * </NeuronDetailTitle>
 * 
 * // Section header
 * <NeuronSectionHeader>
 *   Customer Information
 * </NeuronSectionHeader>
 * 
 * // Field group
 * <NeuronFieldGroup label="Customer Name" value="Acme Corp" />
 * 
 * // Field group with custom content
 * <NeuronFieldGroup label="Status">
 *   <NeuronStatusPill status="Active" />
 * </NeuronFieldGroup>
 * 
 * // Individual field label and value
 * <NeuronFieldLabel>Contact Person</NeuronFieldLabel>
 * <NeuronFieldValue>John Doe</NeuronFieldValue>
 */
