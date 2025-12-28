import { useState } from "react";
import {
  Plus,
  Search,
  Phone,
  Mail,
  Building2,
  TrendingUp,
  Users,
  Package,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { toast } from "./ui/toast-utils";

interface Client {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address?: string;
  defaultOrigin: string;
  defaultDestination: string;
  services: Array<"Import" | "Export" | "Domestic">;
  notes: string;
  activeBookings: number;
  totalRevenue: number;
  paymentTerms: string;
}

interface ClientsProps {
  onViewClient?: (clientData: Client) => void;
  onCreateBooking?: (clientId: string) => void;
}

// KPI Card component (matching Bookings)
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

export function Clients({ onViewClient, onCreateBooking }: ClientsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for Add Client modal
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    defaultOrigin: "",
    defaultDestination: "",
    services: [] as Array<"Import" | "Export" | "Domestic">,
    notes: "",
  });

  // Mock clients data
  const mockClients: Client[] = [
    {
      id: "1",
      name: "Acme Trading Corp",
      contactPerson: "Maria Santos",
      phone: "+63 917 123 4567",
      email: "maria.santos@acmetrading.com",
      address: "Quezon Avenue, Quezon City",
      defaultOrigin: "Manila",
      defaultDestination: "Singapore",
      services: ["Import"],
      notes: "Preferred for Ocean LCL shipments",
      activeBookings: 3,
      totalRevenue: 125000,
      paymentTerms: "Net 30",
    },
    {
      id: "2",
      name: "Global Imports Ltd",
      contactPerson: "John Reyes",
      phone: "+63 918 234 5678",
      email: "john.reyes@globalimports.com",
      address: "Quezon Avenue, Quezon City",
      defaultOrigin: "Manila",
      defaultDestination: "Hong Kong",
      services: ["Import", "Export"],
      notes: "Large volume client",
      activeBookings: 5,
      totalRevenue: 185000,
      paymentTerms: "Net 15",
    },
    {
      id: "3",
      name: "Metro Retail Group",
      contactPerson: "Ana Cruz",
      phone: "+63 919 345 6789",
      email: "ana.cruz@metroretail.com",
      address: "Ortigas Center, Pasig City",
      defaultOrigin: "Quezon City",
      defaultDestination: "Bangkok",
      services: ["Export", "Domestic"],
      notes: "Requires temperature-controlled containers",
      activeBookings: 2,
      totalRevenue: 95000,
      paymentTerms: "Net 30",
    },
    {
      id: "4",
      name: "Pacific Distribution Co",
      contactPerson: "Carlos Mendoza",
      phone: "+63 920 456 7890",
      email: "carlos.mendoza@pacificdist.com",
      address: "Makati CBD, Makati City",
      defaultOrigin: "Cebu",
      defaultDestination: "Tokyo",
      services: ["Import"],
      notes: "Time-sensitive deliveries",
      activeBookings: 4,
      totalRevenue: 156000,
      paymentTerms: "Net 30",
    },
    {
      id: "5",
      name: "Sterling Supply Chain",
      contactPerson: "Sarah Lim",
      phone: "+63 921 567 8901",
      email: "sarah.lim@sterlingsupply.com",
      address: "BGC, Taguig City",
      defaultOrigin: "Manila",
      defaultDestination: "Seoul",
      services: ["Import", "Export", "Domestic"],
      notes: "Prefers air freight for urgent shipments",
      activeBookings: 6,
      totalRevenue: 220000,
      paymentTerms: "Net 15",
    },
  ];

  const [clients, setClients] = useState<Client[]>(mockClients);

  // Filter clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getClientInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleAddClient = () => {
    if (!formData.name || !formData.contactPerson || !formData.phone || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newClient: Client = {
      id: `${clients.length + 1}`,
      name: formData.name,
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      defaultOrigin: formData.defaultOrigin,
      defaultDestination: formData.defaultDestination,
      services: formData.services,
      notes: formData.notes,
      activeBookings: 0,
      totalRevenue: 0,
      paymentTerms: "Net 30",
    };

    setClients([...clients, newClient]);
    setShowAddModal(false);
    toast.success("Client added successfully");

    // Reset form
    setFormData({
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      defaultOrigin: "",
      defaultDestination: "",
      services: [],
      notes: "",
    });
  };

  const toggleServiceSelection = (service: "Import" | "Export" | "Domestic") => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  // Calculate stats
  const totalClients = clients.length;
  const totalActiveBookings = clients.reduce((sum, c) => sum + c.activeBookings, 0);
  const totalRevenue = clients.reduce((sum, c) => sum + c.totalRevenue, 0);

  return (
    <>
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
                Clients
              </h1>
              <p style={{ fontSize: "14px", color: "#667085" }}>
                Manage client profiles, bookings, and operational workflows
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
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
              Add Client
            </button>
          </div>

          {/* KPI Cards */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
            <KPICard
              icon={Users}
              label="Total Clients"
              value={totalClients.toString()}
              subtext="Active partnerships"
            />
            <KPICard
              icon={Package}
              label="Active Bookings"
              value={totalActiveBookings.toString()}
              subtext="Across all clients"
            />
            <KPICard
              icon={TrendingUp}
              label="Total Revenue"
              value={`₱${(totalRevenue / 1000000).toFixed(1)}M`}
              subtext="Year to date"
            />
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
                placeholder="Search clients…"
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
          </div>

          {/* Clients Table */}
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
                gridTemplateColumns: "2fr 1.5fr 2fr 1fr",
                padding: "12px 20px",
                borderBottom: "1px solid #E5E9F0",
                background: "#F9FAFB",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#667085", letterSpacing: "0.5px" }}>
                CLIENT NAME
              </div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#667085", letterSpacing: "0.5px" }}>
                CONTACT PERSON
              </div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#667085", letterSpacing: "0.5px" }}>
                CONTACT INFO
              </div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#667085", letterSpacing: "0.5px" }}>
                ACTIVE BOOKINGS
              </div>
            </div>

            {/* Table Body */}
            <div>
              {filteredClients.length === 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "80px 24px",
                  }}
                >
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "#F9FAFB",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <Building2 size={40} style={{ color: "#9CA3AF" }} />
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 500, color: "#12332B", marginBottom: "8px" }}>
                    No clients found
                  </h3>
                  <p style={{ fontSize: "13px", color: "#667085", marginBottom: "24px", textAlign: "center", maxWidth: "400px" }}>
                    Try adjusting your search or add a new client.
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    style={{
                      height: "40px",
                      padding: "0 16px",
                      borderRadius: "12px",
                      background: "#0F766E",
                      border: "none",
                      color: "#FFFFFF",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Plus size={16} />
                    Add Client
                  </button>
                </div>
              )}

              {filteredClients.map((client, index) => (
                <div
                  key={client.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1.5fr 2fr 1fr",
                    padding: "16px 20px",
                    borderBottom: index < filteredClients.length - 1 ? "1px solid #E5E9F0" : "none",
                    cursor: "pointer",
                    transition: "background 150ms ease",
                  }}
                  onClick={() => {
                    if (onViewClient) {
                      onViewClient(client);
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#F9FAFB";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {/* Client Name with Avatar */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "#0F766E",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {getClientInitials(client.name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#12332B" }}>
                        {client.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#667085" }}>
                        {client.totalRevenue} total revenue
                      </div>
                    </div>
                  </div>

                  {/* Contact Person */}
                  <div style={{ display: "flex", alignItems: "center", fontSize: "14px", color: "#12332B" }}>
                    {client.contactPerson}
                  </div>

                  {/* Contact Info */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#667085" }}>
                      <Phone size={14} style={{ flexShrink: 0 }} />
                      <span>{client.phone}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#667085" }}>
                      <Mail size={14} style={{ flexShrink: 0 }} />
                      <span>{client.email}</span>
                    </div>
                  </div>

                  {/* Active Bookings */}
                  <div style={{ display: "flex", alignItems: "center", fontSize: "14px", fontWeight: 600, color: "#0F766E" }}>
                    {client.activeBookings}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Client Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Fill in the client information below
            </DialogDescription>
          </DialogHeader>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingTop: "16px", paddingBottom: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: 500, color: "#12332B" }}>Client Name *</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter client name"
                  style={{
                    height: "40px",
                    padding: "0 12px",
                    fontSize: "14px",
                    border: "1px solid #E5E9F0",
                    borderRadius: "8px",
                    background: "#FFFFFF",
                    outline: "none",
                    color: "#12332B",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: 500, color: "#12332B" }}>Contact Person *</label>
                <input
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="Enter contact person"
                  style={{
                    height: "40px",
                    padding: "0 12px",
                    fontSize: "14px",
                    border: "1px solid #E5E9F0",
                    borderRadius: "8px",
                    background: "#FFFFFF",
                    outline: "none",
                    color: "#12332B",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: 500, color: "#12332B" }}>Phone *</label>
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+63 XXX XXX XXXX"
                  style={{
                    height: "40px",
                    padding: "0 12px",
                    fontSize: "14px",
                    border: "1px solid #E5E9F0",
                    borderRadius: "8px",
                    background: "#FFFFFF",
                    outline: "none",
                    color: "#12332B",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: 500, color: "#12332B" }}>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@company.com"
                  style={{
                    height: "40px",
                    padding: "0 12px",
                    fontSize: "14px",
                    border: "1px solid #E5E9F0",
                    borderRadius: "8px",
                    background: "#FFFFFF",
                    outline: "none",
                    color: "#12332B",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "14px", fontWeight: 500, color: "#12332B" }}>Address</label>
                <input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter address"
                  style={{
                    height: "40px",
                    padding: "0 12px",
                    fontSize: "14px",
                    border: "1px solid #E5E9F0",
                    borderRadius: "8px",
                    background: "#FFFFFF",
                    outline: "none",
                    color: "#12332B",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: 500, color: "#12332B" }}>Default Origin</label>
                <input
                  value={formData.defaultOrigin}
                  onChange={(e) => setFormData({ ...formData, defaultOrigin: e.target.value })}
                  placeholder="e.g., Manila"
                  style={{
                    height: "40px",
                    padding: "0 12px",
                    fontSize: "14px",
                    border: "1px solid #E5E9F0",
                    borderRadius: "8px",
                    background: "#FFFFFF",
                    outline: "none",
                    color: "#12332B",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: 500, color: "#12332B" }}>Default Destination</label>
                <input
                  value={formData.defaultDestination}
                  onChange={(e) => setFormData({ ...formData, defaultDestination: e.target.value })}
                  placeholder="e.g., Cebu"
                  style={{
                    height: "40px",
                    padding: "0 12px",
                    fontSize: "14px",
                    border: "1px solid #E5E9F0",
                    borderRadius: "8px",
                    background: "#FFFFFF",
                    outline: "none",
                    color: "#12332B",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "14px", fontWeight: 500, color: "#12332B" }}>Preferred Services</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {(["Import", "Export", "Domestic"] as const).map((service) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleServiceSelection(service)}
                      style={{
                        height: "36px",
                        padding: "0 16px",
                        borderRadius: "8px",
                        border: "1px solid #E5E9F0",
                        background: formData.services.includes(service) ? "#0F766E" : "#FFFFFF",
                        color: formData.services.includes(service) ? "#FFFFFF" : "#12332B",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 200ms ease",
                      }}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "14px", fontWeight: 500, color: "#12332B" }}>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about the client"
                  rows={3}
                  style={{
                    padding: "12px",
                    fontSize: "14px",
                    border: "1px solid #E5E9F0",
                    borderRadius: "8px",
                    background: "#FFFFFF",
                    outline: "none",
                    color: "#12332B",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button
              onClick={() => setShowAddModal(false)}
              style={{
                height: "40px",
                padding: "0 16px",
                borderRadius: "8px",
                border: "1px solid #E5E9F0",
                background: "#FFFFFF",
                color: "#12332B",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddClient}
              style={{
                height: "40px",
                padding: "0 16px",
                borderRadius: "8px",
                border: "none",
                background: "#0F766E",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Add Client
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}