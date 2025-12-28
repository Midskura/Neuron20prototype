import { ArrowLeft, Building2, Phone, Mail, Globe, MapPin, MessageSquare, FileText, User, Send, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import type { Customer, Contact } from "../../types/bd";
import type { QuotationNew } from "../../types/pricing";
import { NeuronStatusPill } from "../NeuronStatusPill";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

interface PricingCustomerDetailProps {
  customer: Customer;
  onBack: () => void;
  onCreateInquiry?: (customer: Customer) => void;
  onViewInquiry?: (inquiryId: string) => void;
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
    user_name: "Maria Santos",
    user_department: "BD",
    message: "This customer is requesting volume pricing for Q1 2025. Can we prepare a special rate card?",
    created_at: "2025-12-09T14:30:00"
  },
  {
    id: "cm2",
    user_name: "Juan Dela Cruz",
    user_department: "Pricing",
    message: "Sure! I'll prepare tiered pricing based on monthly volume. What's their expected monthly CBM?",
    created_at: "2025-12-09T15:15:00"
  },
  {
    id: "cm3",
    user_name: "Maria Santos",
    user_department: "BD",
    message: "They mentioned around 200-250 CBM per month. Mostly retail goods from China.",
    created_at: "2025-12-09T16:00:00"
  }
];

export function PricingCustomerDetail({ customer, onBack, onCreateInquiry, onViewInquiry }: PricingCustomerDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>("inquiries");
  const [newComment, setNewComment] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [quotations, setQuotations] = useState<QuotationNew[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch customer details from backend
  const fetchCustomerDetails = async () => {
    setIsLoading(true);
    try {
      console.log(`Fetching customer details for: ${customer.id} (${customer.company_name})`);
      
      // Pass role=PD to get minimal data
      const response = await fetch(`${API_URL}/customers/${customer.id}?role=PD`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      console.log('Customer details response (PD):', result);
      
      if (result.success && result.data) {
        if (result.data.quotations) {
          setQuotations(result.data.quotations);
          console.log(`✅ Fetched ${result.data.quotations.length} quotations for customer ${customer.company_name}:`, result.data.quotations);
        } else {
          setQuotations([]);
        }
        
        if (result.data.contacts) {
          setContacts(result.data.contacts);
          console.log(`✅ Fetched ${result.data.contacts.length} contacts for customer ${customer.company_name}:`, result.data.contacts);
        } else {
          setContacts([]);
        }
      } else {
        console.error('Error fetching customer details:', result.error);
        setQuotations([]);
        setContacts([]);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      setQuotations([]);
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchCustomerDetails();
  }, [customer.id]);

  const getCustomerContacts = () => {
    return contacts;
  };

  const getCustomerInquiries = () => {
    return quotations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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

  const customerContacts = getCustomerContacts();
  const inquiries = getCustomerInquiries();

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
          <span style={{ fontSize: "14px" }}>Back to Customers</span>
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 style={{ 
              color: "var(--neuron-ink-primary)", 
              marginBottom: "8px" 
            }}>
              {customer.company_name}
            </h1>
            {/* PD sees only company name - no industry, contact info, or address */}
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
            <div className="text-center">
              <div style={{ 
                fontSize: "24px", 
                fontWeight: 600, 
                color: "var(--neuron-ink-secondary)" 
              }}>
                {customerContacts.length}
              </div>
              <div style={{ fontSize: "13px", color: "var(--neuron-ink-muted)" }}>
                Contacts
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
            {/* Contacts Section */}
            <div className="mb-8">
              <h3 style={{ 
                color: "var(--neuron-ink-primary)", 
                marginBottom: "16px" 
              }}>
                Contacts
              </h3>
              
              {customerContacts.length === 0 ? (
                <div 
                  className="p-6 rounded-lg text-center"
                  style={{ 
                    background: "var(--neuron-bg-card)",
                    border: "1.5px solid var(--neuron-ui-border)"
                  }}
                >
                  <User size={24} style={{ color: "var(--neuron-ink-muted)", margin: "0 auto 8px" }} />
                  <p style={{ color: "var(--neuron-ink-muted)", fontSize: "14px" }}>
                    No contacts for this customer
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {customerContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-4 rounded-lg"
                      style={{
                        background: "var(--neuron-bg-card)",
                        border: "1.5px solid var(--neuron-ui-border)"
                      }}
                    >
                      {/* PD sees only contact name */}
                      <div style={{ color: "var(--neuron-ink-primary)", marginBottom: "4px" }}>
                        {contact.name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Inquiries Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ 
                  color: "var(--neuron-ink-primary)", 
                  margin: 0
                }}>
                  Inquiries
                </h3>
                {onCreateInquiry && (
                  <button
                    onClick={() => onCreateInquiry(customer)}
                    className="neuron-btn-primary"
                  >
                    <Plus size={16} />
                    Create Inquiry
                  </button>
                )}
              </div>
              
              {inquiries.length === 0 ? (
                <div 
                  className="p-12 rounded-lg text-center"
                  style={{ 
                    background: "var(--neuron-bg-card)",
                    border: "1.5px solid var(--neuron-ui-border)"
                  }}
                >
                  <FileText size={48} style={{ color: "var(--neuron-ink-muted)", margin: "0 auto 16px" }} />
                  <p style={{ color: "var(--neuron-ink-muted)", fontSize: "14px" }}>
                    No inquiries from this customer yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inquiries.map((inquiry) => (
                    <div
                      key={inquiry.id}
                      className="p-6 rounded-lg cursor-pointer transition-all"
                      style={{
                        background: "var(--neuron-bg-card)",
                        border: "1.5px solid var(--neuron-ui-border)"
                      }}
                      onClick={() => onViewInquiry && onViewInquiry(inquiry.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--neuron-brand-green)";
                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(15, 118, 110, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--neuron-ui-border)";
                        e.currentTarget.style.boxShadow = "none";
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