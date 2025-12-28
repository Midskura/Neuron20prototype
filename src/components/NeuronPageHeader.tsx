import { ReactNode } from "react";

interface NeuronPageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export function NeuronPageHeader({ title, subtitle, action }: NeuronPageHeaderProps) {
  return (
    <div 
      className="flex items-start justify-between"
      style={{
        padding: "32px 32px 24px 32px",
        borderBottom: "1px solid var(--neuron-ui-border)",
        background: "var(--neuron-bg-page)",
      }}
    >
      <div>
        <h1 
          style={{
            fontSize: "28px",
            fontWeight: 600,
            color: "var(--neuron-ink-primary)",
            lineHeight: "36px",
            marginBottom: "4px",
          }}
        >
          {title}
        </h1>
        <p 
          style={{
            fontSize: "14px",
            color: "var(--neuron-ink-muted)",
            lineHeight: "20px",
          }}
        >
          {subtitle}
        </p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
