import { useState, useEffect } from "react";
import { Plus, Search, Truck, Briefcase, UserCheck, FileEdit, Clock, CheckCircle } from "lucide-react";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { CreateTruckingBookingPanel } from "./CreateTruckingBookingPanel";
import { TruckingBookingDetails } from "./TruckingBookingDetails";
import { NeuronStatusPill } from "../NeuronStatusPill";
import { toast } from "../ui/toast-utils";

interface TruckingBooking {
  bookingId: string;
  customerName: string;
  status: string;
  truckType?: string;
  deliveryAddress?: string;
  preferredDeliveryDate?: string;
  projectNumber?: string;
  accountOwner?: string;
  accountHandler?: string;
  createdAt: string;
  updatedAt: string;
}

interface TruckingBookingsProps {
  currentUser?: { name: string; email: string; department: string } | null;
}

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

export function TruckingBookings({ currentUser }: TruckingBookingsProps = {}) {
  const [bookings, setBookings] = useState<TruckingBooking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"all" | "my" | "draft" | "in-progress" | "completed">("all");
  const [timePeriodFilter, setTimePeriodFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [truckTypeFilter, setTruckTypeFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<TruckingBooking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/trucking-bookings`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setBookings(result.data);
      } else {
        console.error('Error fetching bookings:', result.error);
        toast.error('Error loading bookings: ' + result.error);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Unable to connect to server');
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingCreated = () => {
    setShowCreateModal(false);
    fetchBookings();
  };

  // Get unique values for filters
  const uniqueOwners = Array.from(new Set(bookings.map(b => b.accountOwner).filter(Boolean)));
  const uniqueTruckTypes = Array.from(new Set(bookings.map(b => b.truckType).filter(Boolean)));

  // Filter bookings by tab first
  const getFilteredByTab = () => {
    let filtered = bookings;

    if (activeTab === "my") {
      filtered = bookings.filter(b => 
        b.accountOwner === currentUser?.name || 
        b.accountHandler === currentUser?.name
      );
    } else if (activeTab === "draft") {
      filtered = bookings.filter(b => b.status === "Draft");
    } else if (activeTab === "in-progress") {
      filtered = bookings.filter(b => b.status === "In Progress");
    } else if (activeTab === "completed") {
      filtered = bookings.filter(b => b.status === "Completed");
    }

    return filtered;
  };

  // Apply all filters
  const filteredBookings = getFilteredByTab().filter(booking => {
    // Search filter
    const matchesSearch = 
      booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.deliveryAddress && booking.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.projectNumber && booking.projectNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;

    // Time period filter
    if (timePeriodFilter !== "all") {
      const bookingDate = new Date(booking.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (timePeriodFilter === "7days" && daysDiff > 7) return false;
      if (timePeriodFilter === "30days" && daysDiff > 30) return false;
      if (timePeriodFilter === "90days" && daysDiff > 90) return false;
    }

    // Status filter
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    if (!matchesStatus) return false;

    // Owner filter
    if (ownerFilter !== "all" && booking.accountOwner !== ownerFilter) return false;

    // Truck Type filter
    if (truckTypeFilter !== "all" && booking.truckType !== truckTypeFilter) return false;

    return true;
  });

  // Calculate counts for tabs
  const allCount = bookings.length;
  const myCount = bookings.filter(b => 
    b.accountOwner === currentUser?.name || b.accountHandler === currentUser?.name
  ).length;
  const draftCount = bookings.filter(b => b.status === "Draft").length;
  const inProgressCount = bookings.filter(b => b.status === "In Progress").length;
  const completedCount = bookings.filter(b => b.status === "Completed").length;

  if (selectedBooking) {
    return (
      <TruckingBookingDetails 
        booking={selectedBooking} 
        onBack={() => { 
          setSelectedBooking(null); 
          fetchBookings(); 
        }} 
        onUpdate={fetchBookings} 
      />
    );
  }

  return (
    <>
      <div style={{ minHeight: "100vh", background: "#FFFFFF" }}>
        {/* Header */}
        <div style={{ padding: "32px 48px 24px 48px" }}>
          <div style={{ 
            display: "flex", 
            alignItems: "start", 
            justifyContent: "space-between", 
            marginBottom: "24px" 
          }}>
            <div>
              <h1 style={{ 
                fontSize: "32px", 
                fontWeight: 600, 
                color: "#12332B", 
                marginBottom: "4px",
                letterSpacing: "-1.2px"
              }}>
                Trucking
              </h1>
              <p style={{ 
                fontSize: "14px", 
                color: "#667085"
              }}>
                Manage trucking and inland transportation bookings
              </p>
            </div>
            
            {/* Action Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 600,
                border: "none",
                borderRadius: "8px",
                background: "#0F766E",
                color: "white",
                cursor: "pointer",
              }}
            >
              <Plus size={16} />
              New Booking
            </button>
          </div>

          {/* Search Bar */}
          <div style={{ position: "relative", marginBottom: "24px" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#667085",
              }}
            />
            <input
              type="text"
              placeholder="Search by Booking ID, Customer, Delivery Address, or Project Number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 40px",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                color: "#12332B",
                backgroundColor: "#FFFFFF",
              }}
            />
          </div>

          {/* Filter Row */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
            gap: "12px",
            marginBottom: "24px"
          }}>
            {/* Time Period Filter */}
            <select
              value={timePeriodFilter}
              onChange={(e) => setTimePeriodFilter(e.target.value)}
              style={{
                padding: "10px 12px",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                fontSize: "14px",
                color: "#12332B",
                backgroundColor: "#FFFFFF",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "10px 12px",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                fontSize: "14px",
                color: "#12332B",
                backgroundColor: "#FFFFFF",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="all">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Confirmed">Confirmed</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Account Owner Filter */}
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              style={{
                padding: "10px 12px",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                fontSize: "14px",
                color: "#12332B",
                backgroundColor: "#FFFFFF",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="all">All Owners</option>
              {uniqueOwners.map(owner => (
                <option key={owner} value={owner}>{owner}</option>
              ))}
            </select>

            {/* Truck Type Filter */}
            <select
              value={truckTypeFilter}
              onChange={(e) => setTruckTypeFilter(e.target.value)}
              style={{
                padding: "10px 12px",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                fontSize: "14px",
                color: "#12332B",
                backgroundColor: "#FFFFFF",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="all">All Truck Types</option>
              {uniqueTruckTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Tabs */}
          <div style={{ 
            display: "flex", 
            gap: "8px", 
            borderBottom: "1px solid #E5E7EB",
            marginBottom: "24px"
          }}>
            <TabButton
              icon={<Briefcase size={18} />}
              label="All Bookings"
              count={allCount}
              isActive={activeTab === "all"}
              color="#0F766E"
              onClick={() => setActiveTab("all")}
            />
            <TabButton
              icon={<UserCheck size={18} />}
              label="Assigned to Me"
              count={myCount}
              isActive={activeTab === "my"}
              color="#8B5CF6"
              onClick={() => setActiveTab("my")}
            />
            <TabButton
              icon={<FileEdit size={18} />}
              label="Draft"
              count={draftCount}
              isActive={activeTab === "draft"}
              color="#6B7280"
              onClick={() => setActiveTab("draft")}
            />
            <TabButton
              icon={<Clock size={18} />}
              label="In Progress"
              count={inProgressCount}
              isActive={activeTab === "in-progress"}
              color="#0F766E"
              onClick={() => setActiveTab("in-progress")}
            />
            <TabButton
              icon={<CheckCircle size={18} />}
              label="Completed"
              count={completedCount}
              isActive={activeTab === "completed"}
              color="#10B981"
              onClick={() => setActiveTab("completed")}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ padding: "0 48px 48px 48px" }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-[#12332B]/60">Loading bookings...</div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-[#12332B]/60 mb-2">
                {searchTerm || statusFilter !== "all" 
                  ? "No bookings match your filters" 
                  : "No trucking bookings yet"}
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-[#0F766E] hover:underline"
              >
                Create your first booking
              </button>
            </div>
          ) : (
            <div style={{
              border: "1px solid #E5E7EB",
              borderRadius: "12px",
              overflow: "hidden",
              backgroundColor: "#FFFFFF"
            }}>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#12332B]/10">
                    <th className="text-left py-3 px-4 text-[#667085] font-semibold text-xs uppercase tracking-wide">
                      Booking Details
                    </th>
                    <th className="text-left py-3 px-4 text-[#667085] font-semibold text-xs uppercase tracking-wide">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 text-[#667085] font-semibold text-xs uppercase tracking-wide">
                      Delivery Address
                    </th>
                    <th className="text-left py-3 px-4 text-[#667085] font-semibold text-xs uppercase tracking-wide">
                      Truck Type
                    </th>
                    <th className="text-left py-3 px-4 text-[#667085] font-semibold text-xs uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-[#667085] font-semibold text-xs uppercase tracking-wide">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking.bookingId}
                      className="border-b border-[#12332B]/5 hover:bg-[#0F766E]/5 transition-colors cursor-pointer"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <td className="py-4 px-4">
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <Truck size={20} color="#0F766E" style={{ flexShrink: 0 }} />
                          <div>
                            <div style={{ 
                              fontSize: "14px", 
                              fontWeight: 600, 
                              color: "#12332B",
                              marginBottom: "2px"
                            }}>
                              {booking.bookingId}
                            </div>
                            {booking.projectNumber && (
                              <div style={{ 
                                fontSize: "13px", 
                                color: "#667085"
                              }}>
                                Project: {booking.projectNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div style={{ fontSize: "14px", color: "#12332B" }}>
                          {booking.customerName}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div style={{ fontSize: "13px", color: "#12332B" }}>
                          {booking.deliveryAddress || <span style={{ color: "#667085" }}>—</span>}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div style={{ 
                          fontSize: "13px", 
                          fontWeight: 500,
                          color: "#12332B" 
                        }}>
                          {booking.truckType || "—"}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <NeuronStatusPill status={booking.status} />
                      </td>
                      <td className="py-4 px-4">
                        <div style={{ fontSize: "13px", color: "#667085" }}>
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateTruckingBookingPanel
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onBookingCreated={handleBookingCreated}
          currentUser={currentUser}
        />
      )}
    </>
  );
}

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  isActive: boolean;
  color: string;
  onClick: () => void;
}

function TabButton({ icon, label, count, isActive, color, onClick }: TabButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 20px",
        background: "transparent",
        border: "none",
        borderBottom: isActive ? `2px solid ${color}` : "2px solid transparent",
        color: isActive ? color : (isHovered ? "#12332B" : "#667085"),
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
        marginBottom: "-1px"
      }}
    >
      {icon}
      {label}
      <span
        style={{
          padding: "2px 8px",
          borderRadius: "12px",
          fontSize: "11px",
          fontWeight: 700,
          background: isActive ? color : `${color}15`,
          color: isActive ? "#FFFFFF" : color,
          minWidth: "20px",
          textAlign: "center"
        }}
      >
        {count}
      </span>
    </button>
  );
}