import { ArrowLeft, Building2, User, Mail, Phone, MapPin, Package, FileText, ArrowRight, Calendar } from "lucide-react";
import type { Inquiry } from "../../types/pricing";

interface InquiryDetailProps {
  inquiry: Inquiry;
  onBack: () => void;
  onConvertToQuotation: (inquiry: Inquiry) => void;
}

export function InquiryDetail({ inquiry, onBack, onConvertToQuotation }: InquiryDetailProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "#C88A2B";
      case "In Progress": return "#2B8A6E";
      case "Quoted": return "#0F766E";
      case "Declined": return "#6B7A76";
      default: return "#6B7A76";
    }
  };

  return (
    <div 
      className="h-full flex flex-col overflow-auto"
      style={{ background: "#FFFFFF" }}
    >
      {/* Header Section */}
      <div style={{ padding: "32px 48px 24px 48px" }}>
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-6 transition-colors"
          style={{ 
            color: "var(--neuron-ink-muted)",
            fontSize: "14px"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--neuron-ink-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--neuron-ink-muted)";
          }}
        >
          <ArrowLeft size={18} />
          Back to Inquiries
        </button>

        {/* Title and Actions */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 style={{ 
                fontSize: "28px",
                fontWeight: 600,
                color: "var(--neuron-ink-primary)"
              }}>
                {inquiry.inquiry_number}
              </h1>
              <span 
                className="px-3 py-1 rounded-full text-[13px]"
                style={{ 
                  background: `${getStatusColor(inquiry.status)}15`,
                  color: getStatusColor(inquiry.status),
                  fontWeight: 500
                }}
              >
                {inquiry.status}
              </span>
            </div>
            <p style={{ 
              fontSize: "15px",
              color: "var(--neuron-ink-muted)"
            }}>
              Created on {formatDate(inquiry.created_at)}
            </p>
          </div>

          {/* Action Button */}
          {(inquiry.status === "Pending" || inquiry.status === "In Progress") && (
            <button
              onClick={() => onConvertToQuotation(inquiry)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-[14px] transition-all"
              style={{
                background: "#0F766E",
                color: "#FFFFFF",
                border: "none",
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#0D6259";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#0F766E";
              }}
            >
              <ArrowRight size={18} />
              Convert to Quotation
            </button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: "0 48px 48px 48px" }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Customer Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Customer Card */}
            <div 
              className="rounded-lg p-6"
              style={{ 
                background: "#F9FAFB",
                border: "1px solid var(--neuron-ui-border)"
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="flex items-center justify-center rounded-lg"
                  style={{ 
                    width: "48px",
                    height: "48px",
                    background: "#E8F5F3"
                  }}
                >
                  <Building2 size={24} style={{ color: "#0F766E" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ 
                    fontSize: "12px",
                    color: "var(--neuron-ink-muted)",
                    marginBottom: "2px"
                  }}>
                    Customer
                  </p>
                  <p style={{ 
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "var(--neuron-ink-primary)"
                  }}>
                    {inquiry.customer_name}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              {inquiry.contact_person && (
                <div className="flex items-start gap-3 mb-3">
                  <User size={16} style={{ color: "var(--neuron-ink-muted)", marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <p style={{ 
                      fontSize: "12px",
                      color: "var(--neuron-ink-muted)",
                      marginBottom: "2px"
                    }}>
                      Contact Person
                    </p>
                    <p style={{ 
                      fontSize: "14px",
                      color: "var(--neuron-ink-primary)"
                    }}>
                      {inquiry.contact_person}
                    </p>
                  </div>
                </div>
              )}

              {inquiry.contact_email && (
                <div className="flex items-start gap-3 mb-3">
                  <Mail size={16} style={{ color: "var(--neuron-ink-muted)", marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <p style={{ 
                      fontSize: "12px",
                      color: "var(--neuron-ink-muted)",
                      marginBottom: "2px"
                    }}>
                      Email
                    </p>
                    <p style={{ 
                      fontSize: "14px",
                      color: "var(--neuron-ink-primary)"
                    }}>
                      {inquiry.contact_email}
                    </p>
                  </div>
                </div>
              )}

              {inquiry.contact_phone && (
                <div className="flex items-start gap-3">
                  <Phone size={16} style={{ color: "var(--neuron-ink-muted)", marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <p style={{ 
                      fontSize: "12px",
                      color: "var(--neuron-ink-muted)",
                      marginBottom: "2px"
                    }}>
                      Phone
                    </p>
                    <p style={{ 
                      fontSize: "14px",
                      color: "var(--neuron-ink-primary)"
                    }}>
                      {inquiry.contact_phone}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Assignment Card */}
            <div 
              className="rounded-lg p-6"
              style={{ 
                background: "#F9FAFB",
                border: "1px solid var(--neuron-ui-border)"
              }}
            >
              <p style={{ 
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--neuron-ink-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "12px"
              }}>
                Assignment
              </p>
              
              <div className="space-y-3">
                <div>
                  <p style={{ 
                    fontSize: "12px",
                    color: "var(--neuron-ink-muted)",
                    marginBottom: "4px"
                  }}>
                    Created By
                  </p>
                  <p style={{ 
                    fontSize: "14px",
                    color: "var(--neuron-ink-primary)"
                  }}>
                    {inquiry.created_by}
                  </p>
                </div>

                {inquiry.assigned_to && (
                  <div>
                    <p style={{ 
                      fontSize: "12px",
                      color: "var(--neuron-ink-muted)",
                      marginBottom: "4px"
                    }}>
                      Assigned To
                    </p>
                    <p style={{ 
                      fontSize: "14px",
                      color: "var(--neuron-ink-primary)"
                    }}>
                      {inquiry.assigned_to}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Inquiry Details */}
          <div className="lg:col-span-2">
            <div 
              className="rounded-lg p-6"
              style={{ 
                background: "#FFFFFF",
                border: "1px solid var(--neuron-ui-border)"
              }}
            >
              <h2 style={{ 
                fontSize: "18px",
                fontWeight: 600,
                color: "var(--neuron-ink-primary)",
                marginBottom: "24px"
              }}>
                Inquiry Details
              </h2>

              <div className="space-y-6">
                {/* Route */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={16} style={{ color: "var(--neuron-ink-muted)" }} />
                    <p style={{ 
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--neuron-ink-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Route
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div 
                      className="flex-1 px-4 py-3 rounded-lg"
                      style={{ background: "#F9FAFB" }}
                    >
                      <p style={{ 
                        fontSize: "12px",
                        color: "var(--neuron-ink-muted)",
                        marginBottom: "4px"
                      }}>
                        Origin
                      </p>
                      <p style={{ 
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "var(--neuron-ink-primary)"
                      }}>
                        {inquiry.origin}
                      </p>
                    </div>
                    <ArrowRight size={20} style={{ color: "var(--neuron-ink-muted)" }} />
                    <div 
                      className="flex-1 px-4 py-3 rounded-lg"
                      style={{ background: "#F9FAFB" }}
                    >
                      <p style={{ 
                        fontSize: "12px",
                        color: "var(--neuron-ink-muted)",
                        marginBottom: "4px"
                      }}>
                        Destination
                      </p>
                      <p style={{ 
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "var(--neuron-ink-primary)"
                      }}>
                        {inquiry.destination}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Package size={16} style={{ color: "var(--neuron-ink-muted)" }} />
                    <p style={{ 
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--neuron-ink-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Services Requested
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {inquiry.services.map((service, index) => (
                      <span 
                        key={index}
                        className="px-3 py-2 rounded-lg text-[13px]"
                        style={{ 
                          background: "#E8F5F3",
                          color: "#0F766E",
                          fontWeight: 500
                        }}
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cargo Information */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Package size={16} style={{ color: "var(--neuron-ink-muted)" }} />
                    <p style={{ 
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--neuron-ink-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Cargo Information
                    </p>
                  </div>
                  <div 
                    className="px-4 py-3 rounded-lg"
                    style={{ background: "#F9FAFB" }}
                  >
                    <p style={{ 
                      fontSize: "14px",
                      color: "var(--neuron-ink-primary)",
                      marginBottom: "12px"
                    }}>
                      {inquiry.cargo_description}
                    </p>
                    <div className="flex gap-6">
                      {inquiry.estimated_weight && (
                        <div>
                          <p style={{ 
                            fontSize: "12px",
                            color: "var(--neuron-ink-muted)",
                            marginBottom: "4px"
                          }}>
                            Est. Weight
                          </p>
                          <p style={{ 
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "var(--neuron-ink-primary)"
                          }}>
                            {inquiry.estimated_weight}
                          </p>
                        </div>
                      )}
                      {inquiry.estimated_volume && (
                        <div>
                          <p style={{ 
                            fontSize: "12px",
                            color: "var(--neuron-ink-muted)",
                            marginBottom: "4px"
                          }}>
                            Est. Volume
                          </p>
                          <p style={{ 
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "var(--neuron-ink-primary)"
                          }}>
                            {inquiry.estimated_volume}
                          </p>
                        </div>
                      )}
                      {inquiry.incoterm && (
                        <div>
                          <p style={{ 
                            fontSize: "12px",
                            color: "var(--neuron-ink-muted)",
                            marginBottom: "4px"
                          }}>
                            Incoterm
                          </p>
                          <p style={{ 
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "var(--neuron-ink-primary)"
                          }}>
                            {inquiry.incoterm}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {inquiry.notes && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FileText size={16} style={{ color: "var(--neuron-ink-muted)" }} />
                      <p style={{ 
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--neuron-ink-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}>
                        Notes
                      </p>
                    </div>
                    <div 
                      className="px-4 py-3 rounded-lg"
                      style={{ background: "#FEF3C7" }}
                    >
                      <p style={{ 
                        fontSize: "14px",
                        color: "var(--neuron-ink-primary)"
                      }}>
                        {inquiry.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
