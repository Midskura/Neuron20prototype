import { ArrowLeft, User, Building2, Calendar, MessageSquare } from "lucide-react";
import type { Activity, Contact, Customer } from "../../types/bd";

interface ActivityDetailInlineProps {
  activity: Activity;
  onBack: () => void;
  contactInfo?: Contact | null; // Full contact object passed from parent
  customerInfo?: Customer | null; // Full customer object passed from parent
  userName?: string; // User name passed from parent
}

export function ActivityDetailInline({ 
  activity, 
  onBack, 
  contactInfo = null,
  customerInfo = null,
  userName = "—"
}: ActivityDetailInlineProps) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const contact = contactInfo;
  const customer = customerInfo;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-lg transition-colors"
          style={{
            border: "1px solid var(--neuron-ui-border)",
            backgroundColor: "#FFFFFF"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F9FAFB";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#FFFFFF";
          }}
        >
          <ArrowLeft size={16} style={{ color: "#12332B" }} />
        </button>
        <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#12332B" }}>
          Activity Details
        </h3>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-auto space-y-4">
        {/* Activity Type & Date */}
        <div 
          className="rounded-lg p-4"
          style={{
            border: "1px solid var(--neuron-ui-border)",
            backgroundColor: "#FFFFFF"
          }}
        >
          <div className="mb-3">
            <label className="block text-[11px] font-medium uppercase tracking-wide mb-2" style={{ color: "var(--neuron-ink-muted)" }}>
              Type
            </label>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: "#E8F5F3" }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#0F766E" }} />
              <span className="text-[12px] font-medium uppercase tracking-wide" style={{ color: "#0F766E" }}>
                {activity.type}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wide mb-2" style={{ color: "var(--neuron-ink-muted)" }}>
              <Calendar size={11} className="inline mr-1" />
              Date
            </label>
            <span className="text-[13px]" style={{ color: "#12332B" }}>
              {formatDateTime(activity.date)}
            </span>
          </div>
        </div>

        {/* Description */}
        <div 
          className="rounded-lg p-4"
          style={{
            border: "1px solid var(--neuron-ui-border)",
            backgroundColor: "#FFFFFF"
          }}
        >
          <label className="block text-[11px] font-medium uppercase tracking-wide mb-2" style={{ color: "var(--neuron-ink-muted)" }}>
            <MessageSquare size={11} className="inline mr-1" />
            Description
          </label>
          <p className="text-[13px]" style={{ color: "#12332B" }}>
            {activity.description}
          </p>
        </div>

        {/* Logged By */}
        <div 
          className="rounded-lg p-4"
          style={{
            border: "1px solid var(--neuron-ui-border)",
            backgroundColor: "#FFFFFF"
          }}
        >
          <label className="block text-[11px] font-medium uppercase tracking-wide mb-2" style={{ color: "var(--neuron-ink-muted)" }}>
            Logged By
          </label>
          <span className="text-[13px]" style={{ color: "#12332B" }}>
            {userName}
          </span>
        </div>

        {/* Related Contact & Customer */}
        {(contact || customer) && (
          <div 
            className="rounded-lg p-4"
            style={{
              border: "1px solid var(--neuron-ui-border)",
              backgroundColor: "#FFFFFF"
            }}
          >
            <h4 className="text-[12px] font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--neuron-ink-muted)" }}>
              Related To
            </h4>

            <div className="space-y-3">
              {contact && (
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wide mb-2" style={{ color: "var(--neuron-ink-muted)" }}>
                    Related Contact
                  </label>
                  <div className="flex items-start gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: "#F3F4F6",
                        border: "1px solid var(--neuron-ui-divider)"
                      }}
                    >
                      <User size={14} style={{ color: "#9CA3AF" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-[12px] font-medium" style={{ color: "var(--neuron-ink-primary)" }}>
                        {contact.name} {/* ✅ Use 'name' field */}
                      </h5>
                      <p className="text-[11px]" style={{ color: "var(--neuron-ink-muted)" }}>
                        {contact.title} {/* ✅ Use 'title' field */}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {customer && (
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wide mb-2" style={{ color: "var(--neuron-ink-muted)" }}>
                    Related Customer
                  </label>
                  <div className="flex items-start gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: "#E8F5F3",
                        border: "1px solid #0F766E30"
                      }}
                    >
                      <Building2 size={14} style={{ color: "#0F766E" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-[12px] font-medium" style={{ color: "var(--neuron-ink-primary)" }}>
                        {customer.name}
                      </h5>
                      <p className="text-[11px]" style={{ color: "var(--neuron-ink-muted)" }}>
                        {customer.industry}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}