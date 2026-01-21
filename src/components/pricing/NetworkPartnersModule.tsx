import { Search, Plus, Globe, Building2, MapPin, AlertCircle, Award, Mail, Calendar, Clock, Filter, X, ChevronDown, ChevronRight, Plane, Ship } from "lucide-react";
import { useState } from "react";
import { 
  NETWORK_PARTNERS, 
  COUNTRIES, 
  getPartnerStats, 
  isExpired, 
  expiresSoon,
  formatExpiryDate,
  getDaysUntilExpiry,
  type NetworkPartner,
  type PartnerType 
} from "../../data/networkPartners";
import React from "react";

type StatusFilter = "all" | "active" | "expiring" | "expired" | "wca";

// Get service icon component
const getServiceIcon = (service: string) => {
  const serviceLower = service.toLowerCase();
  if (serviceLower.includes("ocean")) {
    return <Ship size={13} color="#6B7280" title={service} />;
  }
  if (serviceLower.includes("air")) {
    return <Plane size={13} color="#6B7280" title={service} />;
  }
  // Fallback to first letter for other services
  return <span style={{ fontSize: "11px", color: "#6B7280", fontWeight: 600 }} title={service}>{service.charAt(0).toUpperCase()}</span>;
};

// Group partners by country
const groupPartnersByCountry = (partners: NetworkPartner[]) => {
  const grouped = partners.reduce((acc, partner) => {
    if (!acc[partner.country]) {
      acc[partner.country] = [];
    }
    acc[partner.country].push(partner);
    return acc;
  }, {} as Record<string, NetworkPartner[]>);

  // Sort countries by partner count (descending)
  return Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);
};

export function NetworkPartnersModule() {
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedPartner, setSelectedPartner] = useState<NetworkPartner | null>(null);
  
  // Initialize with all countries collapsed by default
  const [collapsedCountries, setCollapsedCountries] = useState<Set<string>>(() => {
    const allCountries = new Set<string>();
    NETWORK_PARTNERS.forEach(partner => allCountries.add(partner.country));
    return allCountries;
  });

  // Category collapse state - all collapsed by default
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(["international", "co-loader", "all-in"])
  );

  const stats = getPartnerStats();

  // Toggle category collapse
  const toggleCategory = (category: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  // Toggle country collapse
  const toggleCountry = (country: string) => {
    const newCollapsed = new Set(collapsedCountries);
    if (newCollapsed.has(country)) {
      newCollapsed.delete(country);
    } else {
      newCollapsed.add(country);
    }
    setCollapsedCountries(newCollapsed);
  };

  // Filter partners
  const filteredPartners = NETWORK_PARTNERS.filter(partner => {
    const matchesSearch = 
      partner.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (partner.contact_person && partner.contact_person.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (partner.wca_id && partner.wca_id.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCountry = countryFilter === "All" || partner.country === countryFilter;

    let matchesStatus = true;
    if (statusFilter === "expired" && partner.expires) {
      matchesStatus = isExpired(partner.expires);
    } else if (statusFilter === "expiring" && partner.expires) {
      matchesStatus = expiresSoon(partner.expires) && !isExpired(partner.expires);
    } else if (statusFilter === "active") {
      matchesStatus = !partner.expires || (!isExpired(partner.expires) && !expiresSoon(partner.expires));
    } else if (statusFilter === "wca") {
      matchesStatus = partner.is_wca_conference;
    }

    return matchesSearch && matchesCountry && matchesStatus;
  });

  // Separate partners by type (default to "international" for backwards compatibility)
  const internationalPartners = filteredPartners.filter(p => !p.partner_type || p.partner_type === "international");
  const coLoaderPartners = filteredPartners.filter(p => p.partner_type === "co-loader");
  const allInPartners = filteredPartners.filter(p => p.partner_type === "all-in");

  // Group filtered partners by country
  const groupedInternational = groupPartnersByCountry(internationalPartners);
  const groupedCoLoaders = groupPartnersByCountry(coLoaderPartners);
  const groupedAllIn = groupPartnersByCountry(allInPartners);

  const getStatusColor = (partner: NetworkPartner): string => {
    if (!partner.expires) return "#9CA3AF"; // gray
    if (isExpired(partner.expires)) return "#DC2626"; // red
    if (expiresSoon(partner.expires)) return "#D97706"; // amber
    return "#059669"; // green
  };

  const getStatusLabel = (partner: NetworkPartner): string => {
    if (!partner.expires) return "No expiry";
    if (isExpired(partner.expires)) return "EXPIRED";
    if (expiresSoon(partner.expires)) {
      const days = getDaysUntilExpiry(partner.expires);
      return `${days}d left`;
    }
    return "Active";
  };

  // Format date compactly
  const formatCompactDate = (dateStr: string): string => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        backgroundColor: "white",
        position: "relative",
      }}
    >
      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "32px 48px",
            borderBottom: "1px solid var(--neuron-ui-border)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "24px",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: 600,
                  color: "#12332B",
                  marginBottom: "4px",
                  letterSpacing: "-1.2px",
                }}
              >
                Network Partners
              </h1>
              <p
                style={{
                  fontSize: "14px",
                  color: "#667085",
                  margin: 0,
                }}
              >
                {stats.total} active agents across {COUNTRIES.length} countries
              </p>
            </div>

            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                height: "48px",
                padding: "0 24px",
                backgroundColor: "#0F766E",
                border: "none",
                borderRadius: "16px",
                fontSize: "14px",
                fontWeight: 600,
                color: "white",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#0F544A";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#0F766E";
              }}
            >
              <Plus size={16} />
              Add Partner
            </button>
          </div>

          {/* Stats Pills */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <button
              onClick={() => setStatusFilter("all")}
              style={{
                padding: "6px 12px",
                borderRadius: "16px",
                fontSize: "12px",
                fontWeight: 600,
                backgroundColor: statusFilter === "all" ? "#E8F5F3" : "#F9FAFB",
                color: statusFilter === "all" ? "#0F766E" : "#6B7280",
                border: statusFilter === "all" ? "2px solid #0F766E" : "1px solid #E5E7EB",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              All • {stats.total}
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              style={{
                padding: "6px 12px",
                borderRadius: "16px",
                fontSize: "12px",
                fontWeight: 600,
                backgroundColor: statusFilter === "active" ? "#D1FAE5" : "#F9FAFB",
                color: statusFilter === "active" ? "#047857" : "#6B7280",
                border: statusFilter === "active" ? "2px solid #047857" : "1px solid #E5E7EB",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              Active • {stats.active}
            </button>
            <button
              onClick={() => setStatusFilter("expiring")}
              style={{
                padding: "6px 12px",
                borderRadius: "16px",
                fontSize: "12px",
                fontWeight: 600,
                backgroundColor: statusFilter === "expiring" ? "#FEF3C7" : "#F9FAFB",
                color: statusFilter === "expiring" ? "#D97706" : "#6B7280",
                border: statusFilter === "expiring" ? "2px solid #D97706" : "1px solid #E5E7EB",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              Expiring • {stats.expiringSoon}
            </button>
            <button
              onClick={() => setStatusFilter("expired")}
              style={{
                padding: "6px 12px",
                borderRadius: "16px",
                fontSize: "12px",
                fontWeight: 600,
                backgroundColor: statusFilter === "expired" ? "#FEE2E2" : "#F9FAFB",
                color: statusFilter === "expired" ? "#DC2626" : "#6B7280",
                border: statusFilter === "expired" ? "2px solid #DC2626" : "1px solid #E5E7EB",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              Expired • {stats.expired}
            </button>
            <button
              onClick={() => setStatusFilter("wca")}
              style={{
                padding: "6px 12px",
                borderRadius: "16px",
                fontSize: "12px",
                fontWeight: 600,
                backgroundColor: statusFilter === "wca" ? "#EDE9FE" : "#F9FAFB",
                color: statusFilter === "wca" ? "#7C3AED" : "#6B7280",
                border: statusFilter === "wca" ? "2px solid #7C3AED" : "1px solid #E5E7EB",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <Award size={12} />
              WCA • {stats.wcaConference}
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: "8px" }}>
            {/* Search */}
            <div style={{ position: "relative", flex: 1 }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--neuron-ink-muted)",
                }}
              />
              <input
                type="text"
                placeholder="Search partners, countries, contacts, WCA IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px 8px 34px",
                  border: "1px solid var(--neuron-ui-border)",
                  borderRadius: "6px",
                  fontSize: "13px",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--neuron-brand-green)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--neuron-ui-border)";
                }}
              />
            </div>

            {/* Country Filter */}
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              style={{
                padding: "8px 32px 8px 12px",
                border: "1px solid var(--neuron-ui-border)",
                borderRadius: "6px",
                fontSize: "13px",
                color: "var(--neuron-ink-secondary)",
                backgroundColor: "white",
                cursor: "pointer",
                outline: "none",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
                minWidth: "160px",
              }}
            >
              <option value="All">All Countries</option>
              {COUNTRIES.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dense Table */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {filteredPartners.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 20px",
                color: "var(--neuron-ink-muted)",
              }}
            >
              <Globe size={48} style={{ marginBottom: "16px", opacity: 0.3 }} />
              <p style={{ fontSize: "15px", fontWeight: 500, color: "var(--neuron-ink-primary)", marginBottom: "8px" }}>
                No partners found
              </p>
              <p style={{ fontSize: "13px", marginTop: "0" }}>
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <div style={{ padding: "32px 48px" }}>
              {/* INTERNATIONAL PARTNERS CATEGORY */}
              {internationalPartners.length > 0 && (
                <>
                  {/* Category Header - Clickable */}
                  <div
                    onClick={() => toggleCategory("international")}
                    style={{
                      marginBottom: "16px",
                      paddingBottom: "12px",
                      borderBottom: "2px solid var(--neuron-ui-border)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.7";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                  >
                    {collapsedCategories.has("international") ? (
                      <ChevronRight size={20} color="var(--neuron-ink-primary)" />
                    ) : (
                      <ChevronDown size={20} color="var(--neuron-ink-primary)" />
                    )}
                    <div style={{ flex: 1 }}>
                      <h2
                        style={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "var(--neuron-ink-primary)",
                          margin: 0,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        International Partners
                        <span style={{ marginLeft: "12px", color: "var(--neuron-ink-muted)", fontWeight: 500 }}>
                          • {internationalPartners.length}
                        </span>
                      </h2>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--neuron-ink-muted)",
                          margin: "4px 0 0 0",
                        }}
                      >
                        Overseas agents and international freight forwarders
                      </p>
                    </div>
                  </div>

                  {/* Table Container with Border */}
                  {!collapsedCategories.has("international") && (
                    <div
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        borderRadius: "8px",
                        overflow: "hidden",
                        backgroundColor: "white",
                      }}
                    >
                      {/* Table Header - Sticky */}
                      <div
                        style={{
                          position: "sticky",
                          top: 0,
                          backgroundColor: "#F9FAFB",
                          borderBottom: "1px solid var(--neuron-ui-border)",
                          zIndex: 10,
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "24px 1fr 120px 90px 150px 100px 80px",
                            gap: "12px",
                            padding: "10px 16px",
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "#6B7280",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          <div style={{ textAlign: "center" }}>•</div>
                          <div>Company</div>
                          <div>Location</div>
                          <div>WCA ID</div>
                          <div>Contact</div>
                          <div>Expires</div>
                          <div>Services</div>
                        </div>
                      </div>

                      {/* Grouped Rows */}
                      {groupedInternational.map(([country, partners]) => {
                  const isCollapsed = collapsedCountries.has(country);
                  
                  return (
                    <div key={country}>
                      {/* Country Header */}
                      <div
                        onClick={() => toggleCountry(country)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 16px",
                          backgroundColor: "#F3F4F6",
                          borderBottom: "1px solid #E5E7EB",
                          cursor: "pointer",
                          transition: "background-color 0.15s",
                          position: "sticky",
                          top: "41px",
                          zIndex: 9,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#E5E7EB";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#F3F4F6";
                        }}
                      >
                        {isCollapsed ? (
                          <ChevronRight size={16} color="#6B7280" />
                        ) : (
                          <ChevronDown size={16} color="#6B7280" />
                        )}
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#374151",
                            textTransform: "uppercase",
                            letterSpacing: "0.3px",
                          }}
                        >
                          {country}
                        </span>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#6B7280",
                            fontWeight: 500,
                          }}
                        >
                          • {partners.length}
                        </span>
                      </div>

                      {/* Partner Rows */}
                      {!isCollapsed && partners.map((partner, index) => {
                        const statusColor = getStatusColor(partner);
                        const statusLabel = getStatusLabel(partner);
                        
                        return (
                          <div
                            key={partner.id}
                            onClick={() => setSelectedPartner(partner)}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "24px 1fr 120px 90px 150px 100px 80px",
                              gap: "12px",
                              padding: "10px 16px",
                              borderBottom: "1px solid #F3F4F6",
                              cursor: "pointer",
                              transition: "background-color 0.1s ease",
                              backgroundColor: index % 2 === 0 ? "white" : "#FAFAFA",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#F0F9FF";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = index % 2 === 0 ? "white" : "#FAFAFA";
                            }}
                          >
                            {/* Status Dot */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <div
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "50%",
                                  backgroundColor: statusColor,
                                }}
                                title={statusLabel}
                              />
                            </div>

                            {/* Company */}
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 500,
                                  color: "var(--neuron-ink-primary)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                                title={partner.company_name}
                              >
                                {partner.company_name}
                              </span>
                              {partner.is_wca_conference && (
                                <Award size={12} color="#7C3AED" style={{ flexShrink: 0 }} title="WCA Conference" />
                              )}
                            </div>

                            {/* Location */}
                            <div style={{ display: "flex", alignItems: "center" }}>
                              <span style={{ fontSize: "12px", color: "var(--neuron-ink-secondary)" }}>
                                {partner.territory ? `${partner.country} · ${partner.territory.substring(0, 3)}` : partner.country}
                              </span>
                            </div>

                            {/* WCA ID */}
                            <div style={{ display: "flex", alignItems: "center" }}>
                              {partner.wca_id ? (
                                <span
                                  style={{
                                    fontSize: "11px",
                                    color: "#6B7280",
                                    fontFamily: "monospace",
                                    backgroundColor: "#F9FAFB",
                                    padding: "2px 6px",
                                    borderRadius: "3px",
                                  }}
                                >
                                  {partner.wca_id}
                                </span>
                              ) : (
                                <span style={{ fontSize: "12px", color: "#D1D5DB" }}>—</span>
                              )}
                            </div>

                            {/* Contact */}
                            <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                              <span
                                style={{
                                  fontSize: "12px",
                                  color: "var(--neuron-ink-secondary)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                                title={partner.contact_person || "No contact"}
                              >
                                {partner.contact_person || "—"}
                              </span>
                            </div>

                            {/* Expires */}
                            <div style={{ display: "flex", alignItems: "center" }}>
                              <span
                                style={{
                                  fontSize: "12px",
                                  color: isExpired(partner.expires) ? "#DC2626" : 
                                         expiresSoon(partner.expires) ? "#D97706" : 
                                         "#6B7280",
                                  fontWeight: (isExpired(partner.expires) || expiresSoon(partner.expires)) ? 600 : 400,
                                }}
                              >
                                {formatCompactDate(partner.expires)}
                              </span>
                            </div>

                            {/* Services */}
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              {partner.services.map((service, i) => (
                                <React.Fragment key={i}>
                                  {getServiceIcon(service)}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                    </div>
                  )}
                </>
              )}

              {/* CO-LOADER PARTNERS SECTION */}
              {coLoaderPartners.length > 0 && (
                <>
                  {/* Category Header - Clickable */}
                  <div
                    onClick={() => toggleCategory("co-loader")}
                    style={{
                      marginTop: "48px",
                      marginBottom: "16px",
                      paddingBottom: "12px",
                      borderBottom: "2px solid var(--neuron-ui-border)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.7";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                  >
                    {collapsedCategories.has("co-loader") ? (
                      <ChevronRight size={20} color="var(--neuron-ink-primary)" />
                    ) : (
                      <ChevronDown size={20} color="var(--neuron-ink-primary)" />
                    )}
                    <div style={{ flex: 1 }}>
                      <h2
                        style={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "var(--neuron-ink-primary)",
                          margin: 0,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          }}
                        >
                          Co-loader Partners
                          <span style={{ marginLeft: "12px", color: "var(--neuron-ink-muted)", fontWeight: 500 }}>
                            • {coLoaderPartners.length}
                          </span>
                        </h2>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "var(--neuron-ink-muted)",
                            margin: "4px 0 0 0",
                          }}
                        >
                          Local Philippines co-loaders and consolidators
                        </p>
                      </div>
                  </div>

                  {/* Table Container with Border */}
                  {!collapsedCategories.has("co-loader") && (
                    <div
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        borderRadius: "8px",
                        overflow: "hidden",
                        backgroundColor: "white",
                    }}
                  >
                    {/* Table Header - Sticky */}
                    <div
                      style={{
                        position: "sticky",
                        top: 0,
                        backgroundColor: "#F9FAFB",
                        borderBottom: "1px solid var(--neuron-ui-border)",
                        zIndex: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "24px 1fr 120px 90px 150px 100px 80px",
                          gap: "12px",
                          padding: "10px 16px",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#6B7280",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        <div style={{ textAlign: "center" }}>•</div>
                        <div>Company</div>
                        <div>Location</div>
                        <div>Phone</div>
                        <div>Contact</div>
                        <div>Mobile</div>
                        <div>Services</div>
                      </div>
                    </div>

                    {/* Grouped Rows */}
                    {groupedCoLoaders.map(([country, partners]) => {
                      const isCollapsed = collapsedCountries.has(country);
                      
                      return (
                        <div key={country}>
                          {/* Country Header */}
                          <div
                            onClick={() => toggleCountry(country)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "8px 16px",
                              backgroundColor: "#F3F4F6",
                              borderBottom: "1px solid #E5E7EB",
                              cursor: "pointer",
                              transition: "background-color 0.15s",
                              position: "sticky",
                              top: "41px",
                              zIndex: 9,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#E5E7EB";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#F3F4F6";
                            }}
                          >
                            {isCollapsed ? (
                              <ChevronRight size={16} color="#6B7280" />
                            ) : (
                              <ChevronDown size={16} color="#6B7280" />
                            )}
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#374151",
                                textTransform: "uppercase",
                                letterSpacing: "0.3px",
                              }}
                            >
                              {country}
                            </span>
                            <span
                              style={{
                                fontSize: "12px",
                                color: "#6B7280",
                                fontWeight: 500,
                              }}
                            >
                              • {partners.length}
                            </span>
                          </div>

                          {/* Partner Rows */}
                          {!isCollapsed && partners.map((partner, index) => {
                            const statusColor = getStatusColor(partner);
                            const statusLabel = getStatusLabel(partner);
                            
                            return (
                              <div
                                key={partner.id}
                                onClick={() => setSelectedPartner(partner)}
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "24px 1fr 120px 90px 150px 100px 80px",
                                  gap: "12px",
                                  padding: "10px 16px",
                                  borderBottom: "1px solid #F3F4F6",
                                  cursor: "pointer",
                                  transition: "background-color 0.1s ease",
                                  backgroundColor: index % 2 === 0 ? "white" : "#FAFAFA",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "#F0F9FF";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = index % 2 === 0 ? "white" : "#FAFAFA";
                                }}
                              >
                                {/* Status Dot */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <div
                                    style={{
                                      width: "8px",
                                      height: "8px",
                                      borderRadius: "50%",
                                      backgroundColor: statusColor,
                                    }}
                                    title={statusLabel}
                                  />
                                </div>

                                {/* Company */}
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: 500,
                                      color: "var(--neuron-ink-primary)",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                    title={partner.company_name}
                                  >
                                    {partner.company_name}
                                  </span>
                                </div>

                                {/* Location */}
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  <span style={{ fontSize: "12px", color: "var(--neuron-ink-secondary)" }}>
                                    {partner.territory ? `${partner.country} · ${partner.territory.substring(0, 3)}` : partner.country}
                                  </span>
                                </div>

                                {/* Phone */}
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  {partner.phone ? (
                                    <span
                                      style={{
                                        fontSize: "11px",
                                        color: "#6B7280",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                      title={partner.phone}
                                    >
                                      {partner.phone}
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: "12px", color: "#D1D5DB" }}>—</span>
                                  )}
                                </div>

                                {/* Contact */}
                                <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      color: "var(--neuron-ink-secondary)",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                    title={partner.contact_person || "No contact"}
                                  >
                                    {partner.contact_person || "—"}
                                  </span>
                                </div>

                                {/* Mobile */}
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  {partner.mobile ? (
                                    <span
                                      style={{
                                        fontSize: "11px",
                                        color: "#6B7280",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                      title={partner.mobile}
                                    >
                                      {partner.mobile}
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: "12px", color: "#D1D5DB" }}>—</span>
                                  )}
                                </div>

                                {/* Services */}
                                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                  {partner.services.map((service, i) => (
                                    <React.Fragment key={i}>
                                      {getServiceIcon(service)}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                    )}
                  </>
                )}

              {/* ALL-IN PARTNERS SECTION */}
              {allInPartners.length > 0 && (
                <>
                  {/* Category Header - Clickable */}
                  <div
                    onClick={() => toggleCategory("all-in")}
                    style={{
                      marginTop: "48px",
                      marginBottom: "16px",
                      paddingBottom: "12px",
                      borderBottom: "2px solid var(--neuron-ui-border)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.7";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                  >
                    {collapsedCategories.has("all-in") ? (
                      <ChevronRight size={20} color="var(--neuron-ink-primary)" />
                    ) : (
                      <ChevronDown size={20} color="var(--neuron-ink-primary)" />
                    )}
                    <div style={{ flex: 1 }}>
                      <h2
                        style={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "var(--neuron-ink-primary)",
                          margin: 0,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        All-in Partners
                        <span style={{ marginLeft: "12px", color: "var(--neuron-ink-muted)", fontWeight: 500 }}>
                          • {allInPartners.length}
                        </span>
                    </h2>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--neuron-ink-muted)",
                        margin: "4px 0 0 0",
                      }}
                    >
                        Comprehensive service providers
                      </p>
                    </div>
                  </div>

                  {/* Table Container with Border */}
                  {!collapsedCategories.has("all-in") && (
                    <div
                      style={{
                        border: "1px solid var(--neuron-ui-border)",
                        borderRadius: "8px",
                        overflow: "hidden",
                        backgroundColor: "white",
                      }}
                    >
                    {/* Table Header - Sticky */}
                    <div
                      style={{
                        position: "sticky",
                        top: 0,
                        backgroundColor: "#F9FAFB",
                        borderBottom: "1px solid var(--neuron-ui-border)",
                        zIndex: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "24px 1fr 120px 90px 150px 100px 80px",
                          gap: "12px",
                          padding: "10px 16px",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#6B7280",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        <div style={{ textAlign: "center" }}>•</div>
                        <div>Company</div>
                        <div>Location</div>
                        <div>Phone</div>
                        <div>Contact</div>
                        <div>Mobile</div>
                        <div>Services</div>
                      </div>
                    </div>

                    {/* Grouped Rows */}
                    {groupedAllIn.map(([country, partners]) => {
                      const isCollapsed = collapsedCountries.has(country);
                      
                      return (
                        <div key={country}>
                          {/* Country Header */}
                          <div
                            onClick={() => toggleCountry(country)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "8px 16px",
                              backgroundColor: "#F3F4F6",
                              borderBottom: "1px solid #E5E7EB",
                              cursor: "pointer",
                              transition: "background-color 0.15s",
                              position: "sticky",
                              top: "41px",
                              zIndex: 9,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#E5E7EB";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#F3F4F6";
                            }}
                          >
                            {isCollapsed ? (
                              <ChevronRight size={16} color="#6B7280" />
                            ) : (
                              <ChevronDown size={16} color="#6B7280" />
                            )}
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#374151",
                                textTransform: "uppercase",
                                letterSpacing: "0.3px",
                              }}
                            >
                              {country}
                            </span>
                            <span
                              style={{
                                fontSize: "12px",
                                color: "#6B7280",
                                fontWeight: 500,
                              }}
                            >
                              • {partners.length}
                            </span>
                          </div>

                          {/* Partner Rows */}
                          {!isCollapsed && partners.map((partner, index) => {
                            const statusColor = getStatusColor(partner);
                            const statusLabel = getStatusLabel(partner);
                            
                            return (
                              <div
                                key={partner.id}
                                onClick={() => setSelectedPartner(partner)}
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "24px 1fr 120px 90px 150px 100px 80px",
                                  gap: "12px",
                                  padding: "10px 16px",
                                  borderBottom: "1px solid #F3F4F6",
                                  cursor: "pointer",
                                  transition: "background-color 0.1s ease",
                                  backgroundColor: index % 2 === 0 ? "white" : "#FAFAFA",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "#F0F9FF";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = index % 2 === 0 ? "white" : "#FAFAFA";
                                }}
                              >
                                {/* Status Dot */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <div
                                    style={{
                                      width: "8px",
                                      height: "8px",
                                      borderRadius: "50%",
                                      backgroundColor: statusColor,
                                    }}
                                    title={statusLabel}
                                  />
                                </div>

                                {/* Company */}
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: 500,
                                      color: "var(--neuron-ink-primary)",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                    title={partner.company_name}
                                  >
                                    {partner.company_name}
                                  </span>
                                </div>

                                {/* Location */}
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  <span style={{ fontSize: "12px", color: "var(--neuron-ink-secondary)" }}>
                                    {partner.territory ? `${partner.country} · ${partner.territory.substring(0, 3)}` : partner.country}
                                  </span>
                                </div>

                                {/* Phone */}
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  {partner.phone ? (
                                    <span
                                      style={{
                                        fontSize: "11px",
                                        color: "#6B7280",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                      title={partner.phone}
                                    >
                                      {partner.phone}
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: "12px", color: "#D1D5DB" }}>—</span>
                                  )}
                                </div>

                                {/* Contact */}
                                <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      color: "var(--neuron-ink-secondary)",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                    title={partner.contact_person || "No contact"}
                                  >
                                    {partner.contact_person || "—"}
                                  </span>
                                </div>

                                {/* Mobile */}
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  {partner.mobile ? (
                                    <span
                                      style={{
                                        fontSize: "11px",
                                        color: "#6B7280",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                      title={partner.mobile}
                                    >
                                      {partner.mobile}
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: "12px", color: "#D1D5DB" }}>—</span>
                                  )}
                                </div>

                                {/* Services */}
                                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                  {partner.services.map((service, i) => (
                                    <React.Fragment key={i}>
                                      {getServiceIcon(service)}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                    )}
                  </>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Right Slide-out Panel */}
      {selectedPartner && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              zIndex: 999,
            }}
            onClick={() => setSelectedPartner(null)}
          />

          {/* Slide-out Panel */}
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "480px",
              backgroundColor: "white",
              boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.1)",
              zIndex: 1000,
              display: "flex",
              flexDirection: "column",
              animation: "slideIn 0.2s ease-out",
            }}
          >
            <style>
              {`
                @keyframes slideIn {
                  from {
                    transform: translateX(100%);
                  }
                  to {
                    transform: translateX(0);
                  }
                }
              `}
            </style>

            {/* Panel Header */}
            <div
              style={{
                padding: "24px",
                borderBottom: "1px solid var(--neuron-ui-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                  <h2
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      color: "var(--neuron-ink-primary)",
                      margin: 0,
                    }}
                  >
                    {selectedPartner.company_name}
                  </h2>
                  {selectedPartner.is_wca_conference && (
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "10px",
                        fontSize: "10px",
                        fontWeight: 600,
                        backgroundColor: "#EDE9FE",
                        color: "#7C3AED",
                        border: "1px solid #7C3AED30",
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                      }}
                    >
                      <Award size={10} />
                      WCA
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "13px", color: "var(--neuron-ink-muted)" }}>
                  {selectedPartner.country}
                  {selectedPartner.territory && ` • ${selectedPartner.territory}`}
                </div>
              </div>
              <button
                onClick={() => setSelectedPartner(null)}
                style={{
                  padding: "6px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "#6B7280",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: "12px",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Panel Content */}
            <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
              {/* Status */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <Calendar size={14} color="#6B7280" />
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Partnership Status
                  </span>
                </div>
                {selectedPartner.expires ? (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <span
                        style={{
                          padding: "5px 12px",
                          borderRadius: "10px",
                          fontSize: "12px",
                          fontWeight: 600,
                          backgroundColor: isExpired(selectedPartner.expires) ? "#FEE2E2" : 
                                         expiresSoon(selectedPartner.expires) ? "#FEF3C7" : 
                                         "#D1FAE5",
                          color: isExpired(selectedPartner.expires) ? "#DC2626" : 
                                expiresSoon(selectedPartner.expires) ? "#D97706" : 
                                "#047857",
                          border: `1px solid ${isExpired(selectedPartner.expires) ? "#DC2626" : 
                                              expiresSoon(selectedPartner.expires) ? "#D97706" : 
                                              "#047857"}30`,
                        }}
                      >
                        {getStatusLabel(selectedPartner)}
                      </span>
                      <span style={{ fontSize: "13px", color: "var(--neuron-ink-secondary)" }}>
                        {formatExpiryDate(selectedPartner.expires)}
                      </span>
                    </div>
                    {(isExpired(selectedPartner.expires) || expiresSoon(selectedPartner.expires)) && (
                      <div
                        style={{
                          padding: "10px",
                          borderRadius: "6px",
                          backgroundColor: isExpired(selectedPartner.expires) ? "#FEE2E2" : "#FEF3C7",
                          border: `1px solid ${isExpired(selectedPartner.expires) ? "#DC2626" : "#D97706"}30`,
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                        }}
                      >
                        <AlertCircle size={14} color={isExpired(selectedPartner.expires) ? "#DC2626" : "#D97706"} style={{ marginTop: "1px", flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: "12px", fontWeight: 600, color: isExpired(selectedPartner.expires) ? "#DC2626" : "#D97706", marginBottom: "3px" }}>
                            {isExpired(selectedPartner.expires) ? "Partnership Expired" : "Renewal Required Soon"}
                          </div>
                          <div style={{ fontSize: "11px", color: isExpired(selectedPartner.expires) ? "#991B1B" : "#92400E" }}>
                            {isExpired(selectedPartner.expires) 
                              ? "Contact agent to renew partnership."
                              : `Expires in ${getDaysUntilExpiry(selectedPartner.expires)} days.`
                            }
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: "13px", color: "var(--neuron-ink-muted)" }}>
                    No expiration date on file
                  </div>
                )}
              </div>

              {/* WCA ID */}
              {selectedPartner.wca_id && (
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                    WCA ID
                  </div>
                  <div
                    style={{
                      fontSize: "15px",
                      color: "var(--neuron-ink-primary)",
                      backgroundColor: "#F9FAFB",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontFamily: "monospace",
                      fontWeight: 600,
                      display: "inline-block",
                    }}
                  >
                    {selectedPartner.wca_id}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <Mail size={14} color="#6B7280" />
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Contact Information
                  </span>
                </div>
                {selectedPartner.contact_person && (
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "4px" }}>Contact Person</div>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--neuron-ink-primary)" }}>
                      {selectedPartner.contact_person}
                    </div>
                  </div>
                )}
                {selectedPartner.emails.length > 0 && (
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "6px" }}>Email Address{selectedPartner.emails.length > 1 ? "es" : ""}</div>
                    {selectedPartner.emails.map((email, i) => (
                      <a
                        key={i}
                        href={`mailto:${email}`}
                        style={{
                          display: "block",
                          fontSize: "13px",
                          color: "#0F766E",
                          textDecoration: "none",
                          marginBottom: "5px",
                          padding: "6px 10px",
                          backgroundColor: "#F0FDF4",
                          borderRadius: "4px",
                          border: "1px solid #BBF7D0",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#DCFCE7";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#F0FDF4";
                        }}
                      >
                        {email}
                      </a>
                    ))}
                  </div>
                )}
                {selectedPartner.phone && (
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "4px" }}>Phone</div>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-primary)" }}>
                      {selectedPartner.phone}
                    </div>
                  </div>
                )}
                {selectedPartner.mobile && (
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "4px" }}>Mobile</div>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--neuron-ink-primary)" }}>
                      {selectedPartner.mobile}
                    </div>
                  </div>
                )}
                {selectedPartner.website && (
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "4px" }}>Website</div>
                    <a
                      href={`https://${selectedPartner.website.replace(/^https?:\/\//, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "13px",
                        color: "#0F766E",
                        textDecoration: "underline",
                      }}
                    >
                      {selectedPartner.website}
                    </a>
                  </div>
                )}
                {selectedPartner.address && (
                  <div>
                    <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "4px" }}>Address</div>
                    <div style={{ fontSize: "13px", color: "var(--neuron-ink-secondary)", lineHeight: "1.5" }}>
                      {selectedPartner.address}
                    </div>
                  </div>
                )}
              </div>

              {/* Services */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
                  Services Offered
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {selectedPartner.services.map((service, i) => (
                    <span
                      key={i}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "5px",
                        fontSize: "12px",
                        backgroundColor: "#E8F5F3",
                        color: "#0F766E",
                        fontWeight: 500,
                        border: "1px solid #0F766E20",
                      }}
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedPartner.notes && (
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                    Notes
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "var(--neuron-ink-secondary)",
                      padding: "10px",
                      backgroundColor: "#F9FAFB",
                      borderRadius: "6px",
                      border: "1px solid #E5E7EB",
                      lineHeight: "1.5",
                    }}
                  >
                    {selectedPartner.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid var(--neuron-ui-border)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={() => setSelectedPartner(null)}
                style={{
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--neuron-ink-secondary)",
                  backgroundColor: "white",
                  border: "1px solid var(--neuron-ui-border)",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "white",
                  backgroundColor: "var(--neuron-brand-green)",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Edit Details
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}