import { ArrowLeft, Phone, Mail, Building2, MessageSquare, FileText, Send, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import type { Contact, Customer } from "../../types/bd";
import type { QuotationNew } from "../../types/pricing";
import { NeuronStatusPill } from "../NeuronStatusPill";
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

interface PricingContactDetailProps {
  contact: Contact;
  onBack: () => void;
  onCreateInquiry?: (customer: Customer, contact?: Contact) => void;
}

type TabType = "inquiries" | "comments";

interface Comment {
  id: string;
  user_name: string;
  user_department: "BD" | "Pricing";
  message: string;
  created_at: string;
}

// Mock comments for demo
const mockComments: Comment[] = [
  {
    id: "cm1",
    user_name: "Ana Reyes",
    user_department: "BD",
    message: "Hi Pricing team, this client needs urgent quotation for the Shanghai shipment. They're requesting cold storage throughout.",
    created_at: "2025-12-10T10:15:00"
  },
  {
    id: "cm2",
    user_name: "Juan Dela Cruz",
    user_department: "Pricing",
    message: "Got it! I'll prioritize this. Do we have their preferred vendor for cold chain?",
    created_at: "2025-12-10T10:45:00"
  },
  {
    id: "cm3",
    user_name: "Ana Reyes",
    user_department: "BD",
    message: "They usually work with Manila Cold Chain Solutions. Also mentioned they need delivery by Dec 15.",
    created_at: "2025-12-10T11:20:00"
  }
];

export function PricingContactDetail({ contact, onBack, onCreateInquiry }: PricingContactDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>("inquiries");
  const [newComment, setNewComment] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [quotations, setQuotations] = useState<QuotationNew[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch customer data
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!contact.company_id) return;
      
      try {
        const response = await fetch(`${API_URL}/customers/${contact.company_id}`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        });
        const result = await response.json();
        if (result.success) {
          setCustomer(result.data);
        }
      } catch (error) {
        console.error("Error fetching customer:", error);
      }
    };

    fetchCustomer();
  }, [contact.company_id]);

  // Fetch quotations for this contact
  useEffect(() => {
    const fetchQuotations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/quotations?contact_id=${contact.id}`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        });
        const result = await response.json();
        if (result.success) {
          setQuotations(result.data);
        }
      } catch (error) {
        console.error("Error fetching quotations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotations();
  }, [contact.id]);

  const getCompanyName = () => {
    return customer?.company_name || "—";
  };

  const getCompany = () => {
    return customer;
  };

  const getContactInquiries = () => {
    // Get quotations with status "Draft" (which are inquiries in Pricing module)
    return quotations
      .filter(q => q.status === "Draft")
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSendComment = () => {
    if (newComment.trim()) {
      // TODO: Add comment to database
      console.log("New comment:", newComment);
      setNewComment("");
    }
  };

  const inquiries = getContactInquiries();

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--neuron-bg-page)" }}>
      {/* Header */}
      <div style={{ padding: "32px 48px", borderBottom: "1.5px solid var(--neuron-ui-border)" }}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-6 transition-colors"
          style={{ color: "var(--neuron-ink-secondary)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--neuron-brand-green)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--neuron-ink-secondary)"; }}
        >
          <ArrowLeft size={18} />
          <span style={{ fontSize: "14px" }}>Back to Contacts</span>
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 style={{ 
              color: "var(--neuron-ink-primary)", 
              marginBottom: "8px" 
            }}>
              {contact.first_name} {contact.last_name}
            </h1>
            <div className="flex items-center gap-2 mb-4">
              <span style={{ fontSize: "14px", color: "var(--neuron-ink-secondary)" }}>
                {contact.job_title}
              </span>
              <span style={{ color: "var(--neuron-ink-muted)" }}>•</span>
              <span style={{ fontSize: "14px", color: "var(--neuron-ink-secondary)" }}>
                {getCompanyName()}
              </span>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail size={16} style={{ color: "var(--neuron-ink-muted)" }} />
                <span style={{ fontSize: "14px", color: "var(--neuron-ink-secondary)" }}>
                  {contact.email}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} style={{ color: "var(--neuron-ink-muted)" }} />
                <span style={{ fontSize: "14px", color: "var(--neuron-ink-secondary)" }}>
                  {contact.mobile_number}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <div style={{ 
                fontSize: "24px", 
                fontWeight: 600, 
                color: "var(--neuron-brand-green)" 
              }}>
                {inquiries.length}
              </div>
              <div style={{ fontSize: "13px", color: "var(--neuron-ink-muted)" }}>
                Inquiries
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        padding: "0 48px", 
        borderBottom: "1.5px solid var(--neuron-ui-border)",
        background: "var(--neuron-bg-page)"
      }}>
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("inquiries")}
            className="py-4 transition-all"
            style={{
              borderBottom: activeTab === "inquiries" ? "2px solid var(--neuron-brand-green)" : "2px solid transparent",
              color: activeTab === "inquiries" ? "var(--neuron-brand-green)" : "var(--neuron-ink-muted)",
              fontWeight: activeTab === "inquiries" ? 600 : 400,
              fontSize: "14px"
            }}
          >
            <div className="flex items-center gap-2">
              <FileText size={16} />
              Inquiries
            </div>
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className="py-4 transition-all"
            style={{
              borderBottom: activeTab === "comments" ? "2px solid var(--neuron-brand-green)" : "2px solid transparent",
              color: activeTab === "comments" ? "var(--neuron-brand-green)" : "var(--neuron-ink-muted)",
              fontWeight: activeTab === "comments" ? 600 : 400,
              fontSize: "14px"
            }}
          >
            <div className="flex items-center gap-2">
              <MessageSquare size={16} />
              Comments
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "32px 48px" }}>
        {activeTab === "inquiries" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 style={{ 
                color: "var(--neuron-ink-primary)", 
                margin: 0
              }}>
                Inquiries
              </h3>
              {onCreateInquiry && getCompany() && (
                <button
                  onClick={() => {
                    const company = getCompany();
                    if (company) onCreateInquiry(company, contact);
                  }}
                  className="neuron-btn-primary"
                >
                  <Plus size={16} />
                  Create Inquiry
                </button>
              )}
            </div>

            {isLoading ? (
              <div 
                className="p-12 rounded-lg text-center"
                style={{ 
                  background: "var(--neuron-bg-card)",
                  border: "1.5px solid var(--neuron-ui-border)"
                }}
              >
                <FileText size={48} style={{ color: "var(--neuron-ink-muted)", margin: "0 auto 16px" }} />
                <p style={{ color: "var(--neuron-ink-muted)", fontSize: "14px" }}>
                  Loading inquiries...
                </p>
              </div>
            ) : inquiries.length === 0 ? (
              <div 
                className="p-12 rounded-lg text-center"
                style={{ 
                  background: "var(--neuron-bg-card)",
                  border: "1.5px solid var(--neuron-ui-border)"
                }}
              >
                <FileText size={48} style={{ color: "var(--neuron-ink-muted)", margin: "0 auto 16px" }} />
                <p style={{ color: "var(--neuron-ink-muted)", fontSize: "14px" }}>
                  No inquiries from this contact yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className="p-6 rounded-lg"
                    style={{
                      background: "var(--neuron-bg-card)",
                      border: "1.5px solid var(--neuron-ui-border)"
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div style={{ 
                          color: "var(--neuron-ink-primary)",
                          fontWeight: 600,
                          marginBottom: "4px" 
                        }}>
                          {inquiry.quotation_name || inquiry.quote_number}
                        </div>
                        <div style={{ 
                          fontSize: "12px", 
                          color: "var(--neuron-ink-muted)",
                          marginBottom: "4px"
                        }}>
                          {inquiry.quote_number}
                        </div>
                        <div style={{ 
                          fontSize: "13px", 
                          color: "var(--neuron-ink-secondary)",
                          marginBottom: "8px"
                        }}>
                          {inquiry.movement} • {inquiry.pol_aol} → {inquiry.pod_aod}
                        </div>
                      </div>
                      <NeuronStatusPill status={inquiry.status} />
                    </div>

                    <div style={{ 
                      fontSize: "13px", 
                      color: "var(--neuron-ink-secondary)", 
                      marginBottom: "12px" 
                    }}>
                      {inquiry.commodity}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {inquiry.services.map((service, i) => (
                        <span 
                          key={i}
                          className="px-2 py-1 rounded text-[12px]"
                          style={{ 
                            background: "#F3F4F6",
                            color: "var(--neuron-ink-secondary)"
                          }}
                        >
                          {service}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 pt-3" style={{ borderTop: "1px solid var(--neuron-ui-divider)" }}>
                      <div style={{ fontSize: "13px", color: "var(--neuron-ink-muted)" }}>
                        <span style={{ fontWeight: 500 }}>Weight:</span> {inquiry.gross_weight ? `${inquiry.gross_weight} kg` : "—"}
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--neuron-ink-muted)" }}>
                        <span style={{ fontWeight: 500 }}>Volume:</span> {inquiry.volume || "—"}
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--neuron-ink-muted)" }}>
                        <span style={{ fontWeight: 500 }}>Carrier:</span> {inquiry.carrier || "—"}
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--neuron-ink-muted)" }}>
                        <span style={{ fontWeight: 500 }}>Created:</span> {formatDate(inquiry.created_at)}
                      </div>
                    </div>

                    {inquiry.notes && (
                      <div 
                        className="mt-3 p-3 rounded"
                        style={{ 
                          background: "#FEF3C7",
                          border: "1px solid #FDE68A"
                        }}
                      >
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#92400E", marginBottom: "4px" }}>
                          Note from BD:
                        </div>
                        <div style={{ fontSize: "13px", color: "#78350F" }}>
                          {inquiry.notes}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "comments" && (
          <div>
            {/* Comments List */}
            <div className="space-y-4 mb-6">
              {mockComments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 rounded-lg"
                  style={{
                    background: comment.user_department === "Pricing" 
                      ? "#E8F5F3" 
                      : "var(--neuron-bg-card)",
                    border: comment.user_department === "Pricing"
                      ? "1.5px solid #0F766E"
                      : "1.5px solid var(--neuron-ui-border)",
                    marginLeft: comment.user_department === "Pricing" ? "40px" : "0",
                    marginRight: comment.user_department === "BD" ? "40px" : "0"
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ 
                      fontSize: "13px", 
                      fontWeight: 600, 
                      color: comment.user_department === "Pricing" 
                        ? "var(--neuron-brand-green)" 
                        : "var(--neuron-ink-primary)" 
                    }}>
                      {comment.user_name}
                    </span>
                    <span 
                      className="px-2 py-0.5 rounded text-[11px]"
                      style={{ 
                        background: comment.user_department === "Pricing" ? "#0F766E" : "#6B7A76",
                        color: "#FFFFFF",
                        fontWeight: 500
                      }}
                    >
                      {comment.user_department}
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--neuron-ink-muted)" }}>
                      {formatDateTime(comment.created_at)}
                    </span>
                  </div>
                  <div style={{ fontSize: "14px", color: "var(--neuron-ink-secondary)" }}>
                    {comment.message}
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Input */}
            <div 
              className="sticky bottom-0 p-4 rounded-lg"
              style={{
                background: "var(--neuron-bg-card)",
                border: "1.5px solid var(--neuron-ui-border)"
              }}
            >
              <div className="flex gap-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment for BD team..."
                  rows={3}
                  className="flex-1 px-3 py-2 rounded-lg resize-none"
                  style={{
                    border: "1.5px solid var(--neuron-ui-border)",
                    background: "var(--neuron-bg-input)",
                    color: "var(--neuron-ink-primary)",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
                <button
                  onClick={handleSendComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                  style={{
                    background: newComment.trim() ? "#0F766E" : "#E5E7EB",
                    color: newComment.trim() ? "#FFFFFF" : "#9CA3AF",
                    border: "none",
                    cursor: newComment.trim() ? "pointer" : "not-allowed",
                    height: "fit-content"
                  }}
                >
                  <Send size={16} />
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}