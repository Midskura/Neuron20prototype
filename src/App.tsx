import { useState } from "react";
import { HashRouter as BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ExecutiveDashboard } from "./components/ExecutiveDashboard";
import { BusinessDevelopment } from "./components/BusinessDevelopment";
import { Pricing } from "./components/Pricing";
import { Operations } from "./components/Operations";
import { Bookings } from "./components/Bookings";
import { CreateBooking } from "./components/CreateBooking";
import { BookingFullView } from "./components/BookingFullView";
import { Accounting } from "./components/Accounting";
import { HR } from "./components/HR";
import { EmployeeProfile } from "./components/EmployeeProfile";
import { Admin } from "./components/Admin";
import { TicketTestingDashboard } from "./components/TicketTestingDashboard";
import { InboxPage } from "./components/InboxPage";
import { TicketQueuePage } from "./components/TicketQueuePage";
import { ActivityLogPage } from "./components/ActivityLogPage";
import { ProjectsList } from "./components/operations/ProjectsList";
import { ProjectsModule } from "./components/projects/ProjectsModule";
import { TruckingBookings } from "./components/operations/TruckingBookings";
import { BrokerageBookings } from "./components/operations/BrokerageBookings";
import { MarineInsuranceBookings } from "./components/operations/MarineInsuranceBookings";
import { OthersBookings } from "./components/operations/OthersBookings";
import { ForwardingBookings } from "./components/operations/forwarding/ForwardingBookings";
import { OperationsReports } from "./components/operations/OperationsReports";
import type { Customer } from "./types/bd";
import logoImage from "figma:asset/28c84ed117b026fbf800de0882eb478561f37f4f.png";
import { Toaster } from "sonner@2.0.3";
import { toast } from "sonner@2.0.3";
import { UserProvider, useUser } from "./hooks/useUser";

function LoginPage() {
  const { login } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState("executive");

  const testUsers = {
    executive: {
      id: "user-executive-001",
      email: "ana.garcia@neuron.ph",
      name: "Ana Garcia",
      department: "Executive" as const,
      role: "manager" as const,
    },
    bd: {
      id: "user-bd-rep-001",
      email: "bd.rep@neuron.ph",
      name: "Maria Santos",
      department: "Business Development" as const,
      role: "rep" as const,
    },
    operations: {
      id: "user-ops-rep-001",
      email: "ops.rep@neuron.ph",
      name: "Carlos Mendoza",
      department: "Operations" as const,
      role: "rep" as const,
    },
    pricing: {
      id: "user-pricing-rep-001",
      email: "pricing.rep@neuron.ph",
      name: "Luis Rodriguez",
      department: "Pricing" as const,
      role: "rep" as const,
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // DEV MODE: Log in as selected test user
    const mockUser = {
      ...testUsers[selectedUser as keyof typeof testUsers],
      created_at: new Date().toISOString(),
      is_active: true
    };
    
    // Store user directly (bypass server call)
    localStorage.setItem('neuron_user', JSON.stringify(mockUser));
    
    // Small delay to simulate loading
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsLoading(false);
    toast.success('Welcome to Neuron OS!');
    
    // Force reload to trigger auth state update
    window.location.reload();
  };

  const isDisabled = !email || !password || isLoading;

  return (
    <div className="min-h-screen w-full bg-[rgb(255,255,255)] flex items-center justify-center p-6">
      {/* Login Card */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl px-12 py-10">
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-[180px] h-auto">
            <img 
              alt="Neuron Logo" 
              className="w-full h-full object-contain" 
              src={logoImage} 
            />
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* User Selection (Dev Mode) */}
          <div className="space-y-1.5">
            <label htmlFor="user" className="block text-[#0a1d4d] font-['Inter:Medium',sans-serif] font-medium">
              Select Test User
            </label>
            <select
              id="user"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 font-['Inter:Regular',sans-serif] text-[#0a1d4d] focus:outline-none focus:border-[#2f7f6f] focus:bg-white transition-all"
              disabled={isLoading}
            >
              <option value="executive">Ana Garcia (Executive)</option>
              <option value="bd">Maria Santos (Business Development)</option>
              <option value="operations">Carlos Mendoza (Operations)</option>
              <option value="pricing">Luis Rodriguez (Pricing)</option>
            </select>
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-[#0a1d4d] font-['Inter:Medium',sans-serif] font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 font-['Inter:Regular',sans-serif] text-[#0a1d4d] placeholder:text-gray-400 focus:outline-none focus:border-[#2f7f6f] focus:bg-white transition-all"
              disabled={isLoading}
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-[#0a1d4d] font-['Inter:Medium',sans-serif] font-medium">
                Password
              </label>
              <button 
                type="button"
                className="text-[#2f7f6f] hover:underline transition-all"
              >
                Forgot?
              </button>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 font-['Inter:Regular',sans-serif] text-[#0a1d4d] placeholder:text-gray-400 focus:outline-none focus:border-[#2f7f6f] focus:bg-white transition-all"
              disabled={isLoading}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isDisabled}
            className="w-full py-2.5 px-4 bg-[#6b9d94] text-white rounded-lg font-['Inter:Medium',sans-serif] font-medium hover:bg-[#5a8a82] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-150 mt-6 text-center"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Dev Mode Notice */}
        <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-teal-900 mb-1">🔓 Dev Mode Active</p>
              <p className="text-xs text-teal-700">
                <strong>Select a test user above</strong>, then enter any email/password to log in
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            © 2025 Neuron. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper component to convert route path to Page type for Layout
function RouteWrapper({ children, page }: { children: React.ReactNode; page: string }) {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Map current URL to Page type for Layout's active state
  const getCurrentPage = (): string => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "dashboard";
    if (path.startsWith("/bd/projects")) return "bd-projects";
    if (path.startsWith("/bd/contacts")) return "bd-contacts";
    if (path.startsWith("/bd/customers")) return "bd-customers";
    if (path.startsWith("/bd/inquiries")) return "bd-inquiries";
    if (path.startsWith("/bd/tasks")) return "bd-tasks";
    if (path.startsWith("/bd/activities")) return "bd-activities";
    if (path.startsWith("/bd/budget-requests")) return "bd-budget-requests";
    if (path.startsWith("/bd/reports")) return "bd-reports";
    if (path.startsWith("/pricing/contacts")) return "pricing-contacts";
    if (path.startsWith("/pricing/customers")) return "pricing-customers";
    if (path.startsWith("/pricing/quotations")) return "pricing-quotations";
    if (path.startsWith("/pricing/vendors")) return "pricing-vendors";
    if (path.startsWith("/pricing/reports")) return "pricing-reports";
    if (path.startsWith("/operations/projects")) return "ops-projects";
    if (path.startsWith("/operations/forwarding")) return "ops-forwarding";
    if (path.startsWith("/operations/brokerage")) return "ops-brokerage";
    if (path.startsWith("/operations/trucking")) return "ops-trucking";
    if (path.startsWith("/operations/marine-insurance")) return "ops-marine-insurance";
    if (path.startsWith("/operations/others")) return "ops-others";
    if (path.startsWith("/operations/reports")) return "ops-reports";
    if (path.startsWith("/operations")) return "operations";
    if (path.startsWith("/projects")) return "projects";
    if (path.startsWith("/accounting/evouchers")) return "acct-evouchers";
    if (path.startsWith("/accounting/billings")) return "acct-billings";
    if (path.startsWith("/accounting/collections")) return "acct-collections";
    if (path.startsWith("/accounting/expenses")) return "acct-expenses";
    if (path.startsWith("/accounting/ledger")) return "acct-ledger";
    if (path.startsWith("/accounting/reports")) return "acct-reports";
    if (path.startsWith("/hr")) return "hr";
    if (path.startsWith("/calendar")) return "calendar";
    if (path.startsWith("/inbox")) return "inbox";
    if (path.startsWith("/ticket-queue")) return "ticket-queue";
    if (path.startsWith("/activity-log")) return "activity-log";
    if (path.startsWith("/profile")) return "profile";
    if (path.startsWith("/admin")) return "admin";
    if (path.startsWith("/tickets")) return "ticket-testing";
    return "dashboard";
  };

  // Handler to navigate using router
  const handleNavigate = (page: string) => {
    const routeMap: Record<string, string> = {
      "dashboard": "/dashboard",
      "bd-contacts": "/bd/contacts",
      "bd-customers": "/bd/customers",
      "bd-inquiries": "/bd/inquiries",
      "projects": "/projects",
      "bd-projects": "/bd/projects",
      "bd-tasks": "/bd/tasks",
      "bd-activities": "/bd/activities",
      "bd-budget-requests": "/bd/budget-requests",
      "bd-reports": "/bd/reports",
      "pricing-contacts": "/pricing/contacts",
      "pricing-customers": "/pricing/customers",
      "pricing-quotations": "/pricing/quotations",
      "pricing-vendors": "/pricing/vendors",
      "pricing-reports": "/pricing/reports",
      "operations": "/operations",
      "ops-projects": "/operations/projects",
      "ops-forwarding": "/operations/forwarding",
      "ops-brokerage": "/operations/brokerage",
      "ops-trucking": "/operations/trucking",
      "ops-marine-insurance": "/operations/marine-insurance",
      "ops-others": "/operations/others",
      "ops-reports": "/operations/reports",
      "acct-evouchers": "/accounting/evouchers",
      "acct-billings": "/accounting/billings",
      "acct-collections": "/accounting/collections",
      "acct-expenses": "/accounting/expenses",
      "acct-ledger": "/accounting/ledger",
      "acct-reports": "/accounting/reports",
      "hr": "/hr",
      "calendar": "/calendar",
      "inbox": "/inbox",
      "ticket-queue": "/ticket-queue",
      "activity-log": "/activity-log",
      "profile": "/profile",
      "admin": "/admin",
      "ticket-testing": "/tickets"
    };
    
    const route = routeMap[page] || "/dashboard";
    navigate(route);
  };

  return (
    <Layout 
      currentPage={getCurrentPage() as any}
      onNavigate={handleNavigate as any}
      currentUser={user || undefined}
      onLogout={logout}
    >
      {children}
    </Layout>
  );
}

// Business Development Routes
function BDContactsPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { contactId } = useParams();
  
  const handleCreateInquiry = (customer: Customer) => {
    navigate(`/bd/inquiries?customerId=${customer.id}`);
  };
  
  const handleViewInquiry = (inquiryId: string) => {
    navigate(`/bd/inquiries/${inquiryId}`);
  };
  
  return (
    <RouteWrapper page="bd-contacts">
      <BusinessDevelopment 
        view="contacts" 
        onCreateInquiry={handleCreateInquiry}
        onViewInquiry={handleViewInquiry}
        currentUser={user}
        contactId={contactId}
      />
    </RouteWrapper>
  );
}

function BDCustomersPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const handleCreateInquiry = (customer: Customer) => {
    navigate(`/bd/inquiries?customerId=${customer.id}`);
  };
  
  const handleViewInquiry = (inquiryId: string) => {
    navigate(`/bd/inquiries/${inquiryId}`);
  };
  
  return (
    <RouteWrapper page="bd-customers">
      <BusinessDevelopment 
        view="customers" 
        onCreateInquiry={handleCreateInquiry}
        onViewInquiry={handleViewInquiry}
        currentUser={user}
      />
    </RouteWrapper>
  );
}

function BDInquiriesPage() {
  const { user } = useUser();
  const { inquiryId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const customerId = searchParams.get('customerId');
  
  // TODO: Fetch customer data if customerId is provided
  const customerData = null;
  
  const handleCreateTicket = (quotation: any) => {
    // Navigate to tickets page with pre-filled quotation context
    const params = new URLSearchParams({
      entityType: 'quotation',
      entityId: quotation.id,
      entityName: quotation.quotation_name || quotation.id,
      entityStatus: quotation.status || ''
    });
    navigate(`/tickets?${params.toString()}`);
  };
  
  return (
    <RouteWrapper page="bd-inquiries">
      <BusinessDevelopment 
        view="inquiries" 
        customerData={customerData}
        inquiryId={inquiryId}
        currentUser={user}
        onCreateTicket={handleCreateTicket}
      />
    </RouteWrapper>
  );
}

function BDTasksPage() {
  const { user } = useUser();
  return (
    <RouteWrapper page="bd-tasks">
      <BusinessDevelopment view="tasks" currentUser={user} />
    </RouteWrapper>
  );
}

function BDProjectsPage() {
  const { user } = useUser();
  return (
    <RouteWrapper page="bd-projects">
      <BusinessDevelopment view="projects" currentUser={user} />
    </RouteWrapper>
  );
}

function BDActivitiesPage() {
  const { user } = useUser();
  return (
    <RouteWrapper page="bd-activities">
      <BusinessDevelopment view="activities" currentUser={user} />
    </RouteWrapper>
  );
}

function BDBudgetRequestsPage() {
  return (
    <RouteWrapper page="bd-budget-requests">
      <BusinessDevelopment view="budget-requests" />
    </RouteWrapper>
  );
}

function BDReportsPage() {
  return (
    <RouteWrapper page="bd-reports">
      <BusinessDevelopment view="reports" />
    </RouteWrapper>
  );
}

// Unified Projects Page (Bridge Module for BD and Operations)
function ProjectsPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const handleCreateTicket = (entity: { type: string; id: string; name: string }) => {
    const params = new URLSearchParams({
      entityType: entity.type,
      entityId: entity.id,
      entityName: entity.name,
      entityStatus: ''
    });
    navigate(`/tickets?${params.toString()}`);
  };
  
  return (
    <RouteWrapper page="projects">
      <ProjectsModule 
        currentUser={user || undefined}
        onCreateTicket={handleCreateTicket}
      />
    </RouteWrapper>
  );
}

// Pricing Routes
function PricingContactsPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const handleViewInquiry = (inquiryId: string) => {
    navigate(`/pricing/quotations/${inquiryId}`);
  };
  
  return (
    <RouteWrapper page="pricing-contacts">
      <Pricing 
        view="contacts" 
        onViewInquiry={handleViewInquiry}
        currentUser={user}
      />
    </RouteWrapper>
  );
}

function PricingCustomersPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const handleViewInquiry = (inquiryId: string) => {
    navigate(`/pricing/quotations/${inquiryId}`);
  };
  
  return (
    <RouteWrapper page="pricing-customers">
      <Pricing 
        view="customers" 
        onViewInquiry={handleViewInquiry}
        currentUser={user}
      />
    </RouteWrapper>
  );
}

function PricingQuotationsPage() {
  const { user } = useUser();
  const { inquiryId } = useParams();
  const navigate = useNavigate();
  
  const handleCreateTicket = (quotation: any) => {
    // Navigate to tickets page with pre-filled quotation context
    const params = new URLSearchParams({
      entityType: 'quotation',
      entityId: quotation.id,
      entityName: quotation.quotation_name || quotation.id,
      entityStatus: quotation.status || ''
    });
    navigate(`/tickets?${params.toString()}`);
  };
  
  return (
    <RouteWrapper page="pricing-quotations">
      <Pricing 
        view="quotations" 
        inquiryId={inquiryId}
        currentUser={user}
        onCreateTicket={handleCreateTicket}
      />
    </RouteWrapper>
  );
}

function PricingVendorsPage() {
  const { user } = useUser();
  return (
    <RouteWrapper page="pricing-vendors">
      <Pricing view="vendors" currentUser={user} />
    </RouteWrapper>
  );
}

function PricingReportsPage() {
  const { user } = useUser();
  return (
    <RouteWrapper page="pricing-reports">
      <Pricing view="reports" currentUser={user} />
    </RouteWrapper>
  );
}

// Operations Routes
function OperationsPage() {
  const { user } = useUser();
  
  return (
    <RouteWrapper page="operations">
      <Operations 
        view="forwarding"
        currentUser={user}
      />
    </RouteWrapper>
  );
}

function OperationsProjectsPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const handleCreateTicket = (entity: { type: string; id: string; name: string }) => {
    const params = new URLSearchParams({
      entityType: entity.type,
      entityId: entity.id,
      entityName: entity.name,
      entityStatus: ''
    });
    navigate(`/tickets?${params.toString()}`);
  };
  
  return (
    <RouteWrapper page="ops-projects">
      <ProjectsList 
        currentUser={user || undefined}
        onCreateTicket={handleCreateTicket}
      />
    </RouteWrapper>
  );
}

function ForwardingBookingsPage() {
  const { user } = useUser();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  
  return (
    <RouteWrapper page="ops-forwarding">
      <Operations 
        view="forwarding"
        currentUser={user}
        selectedBooking={selectedBooking}
        onSelectBooking={setSelectedBooking}
      />
    </RouteWrapper>
  );
}

function CreateBookingPage() {
  const navigate = useNavigate();
  
  const handleBookingBack = () => {
    navigate('/operations');
  };
  
  const handleBookingSubmit = (bookingData: any) => {
    console.log("Booking created:", bookingData);
    toast.success("Booking created successfully!");
    navigate('/operations');
  };
  
  return (
    <RouteWrapper page="operations">
      <CreateBooking onBack={handleBookingBack} onSubmit={handleBookingSubmit} />
    </RouteWrapper>
  );
}

function BookingDetailPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  // TODO: Fetch booking data based on bookingId
  const booking = null;
  
  if (!booking) {
    return (
      <RouteWrapper page="operations">
        <div className="h-full flex items-center justify-center" style={{ background: "var(--neuron-bg-page)" }}>
          <div className="text-center">
            <h2 style={{ color: "var(--neuron-ink-primary)" }} className="mb-2">Booking Not Found</h2>
            <p style={{ color: "var(--neuron-ink-muted)" }}>Booking ID: {bookingId}</p>
            <button 
              onClick={() => navigate('/operations')}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                background: 'var(--neuron-brand-green)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Back to Operations
            </button>
          </div>
        </div>
      </RouteWrapper>
    );
  }
  
  return (
    <RouteWrapper page="operations">
      <BookingFullView booking={booking} onBack={() => navigate('/operations')} />
    </RouteWrapper>
  );
}

// Accounting Routes
function AccountingEVouchersPage() {
  return (
    <RouteWrapper page="acct-evouchers">
      <Accounting view="evouchers" />
    </RouteWrapper>
  );
}

function AccountingBillingsPage() {
  return (
    <RouteWrapper page="acct-billings">
      <Accounting view="billings" />
    </RouteWrapper>
  );
}

function AccountingCollectionsPage() {
  return (
    <RouteWrapper page="acct-collections">
      <Accounting view="collections" />
    </RouteWrapper>
  );
}

function AccountingExpensesPage() {
  return (
    <RouteWrapper page="acct-expenses">
      <Accounting view="expenses" />
    </RouteWrapper>
  );
}

function AccountingLedgerPage() {
  return (
    <RouteWrapper page="acct-ledger">
      <Accounting view="ledger" />
    </RouteWrapper>
  );
}

function AccountingReportsPage() {
  return (
    <RouteWrapper page="acct-reports">
      <Accounting view="reports" />
    </RouteWrapper>
  );
}

// Other Routes
function DashboardPage() {
  const { user } = useUser();
  return (
    <RouteWrapper page="dashboard">
      <ExecutiveDashboard currentUser={user} />
    </RouteWrapper>
  );
}

function HRPage() {
  return (
    <RouteWrapper page="hr">
      <HR />
    </RouteWrapper>
  );
}

function CalendarPage() {
  return (
    <RouteWrapper page="calendar">
      <div className="h-full flex items-center justify-center" style={{ background: "var(--neuron-bg-page)" }}>
        <div className="text-center">
          <h2 style={{ color: "var(--neuron-ink-primary)" }} className="mb-2">My Calendar</h2>
          <p style={{ color: "var(--neuron-ink-muted)" }}>Coming soon...</p>
        </div>
      </div>
    </RouteWrapper>
  );
}

function InboxPageWrapper() {
  return (
    <RouteWrapper page="inbox">
      <InboxPage />
    </RouteWrapper>
  );
}

function TicketQueuePageWrapper() {
  return (
    <RouteWrapper page="ticket-queue">
      <TicketQueuePage />
    </RouteWrapper>
  );
}

function ActivityLogPageWrapper() {
  return (
    <RouteWrapper page="activity-log">
      <ActivityLogPage />
    </RouteWrapper>
  );
}

function ProfilePage() {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const handleDepartmentChange = (dept: string) => {
    if (user) {
      user.department = dept;
      navigate('/dashboard');
    }
  };
  
  return (
    <RouteWrapper page="profile">
      <EmployeeProfile 
        currentUser={user || undefined} 
        onDepartmentChange={handleDepartmentChange} 
      />
    </RouteWrapper>
  );
}

function AdminPage() {
  return (
    <RouteWrapper page="admin">
      <Admin />
    </RouteWrapper>
  );
}

function TicketsPage() {
  const [searchParams] = useSearchParams();
  
  // Extract pre-filled entity data from URL params
  const entityType = searchParams.get('entityType');
  const entityId = searchParams.get('entityId');
  const entityName = searchParams.get('entityName');
  const entityStatus = searchParams.get('entityStatus');
  
  const prefilledEntity = (entityType && entityId) ? {
    entityType,
    entityId,
    entityName: entityName || '',
    entityStatus: entityStatus || ''
  } : null;
  
  return (
    <RouteWrapper page="ticket-testing">
      <TicketTestingDashboard prefilledEntity={prefilledEntity} />
    </RouteWrapper>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useUser();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[rgb(255,255,255)] flex items-center justify-center">
        <div className="text-center">
          <p style={{ color: "var(--neuron-ink-muted)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="bottom-right" richColors />
        <LoginPage />
      </>
    );
  }

  return (
    <>
      <Toaster position="bottom-right" richColors />
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Business Development */}
        <Route path="/bd/contacts" element={<BDContactsPage />} />
        <Route path="/bd/contacts/:contactId" element={<BDContactsPage />} />
        <Route path="/bd/customers" element={<BDCustomersPage />} />
        <Route path="/bd/inquiries" element={<BDInquiriesPage />} />
        <Route path="/bd/inquiries/:inquiryId" element={<BDInquiriesPage />} />
        <Route path="/bd/tasks" element={<BDTasksPage />} />
        <Route path="/bd/projects" element={<BDProjectsPage />} />
        <Route path="/bd/activities" element={<BDActivitiesPage />} />
        <Route path="/bd/budget-requests" element={<BDBudgetRequestsPage />} />
        <Route path="/bd/reports" element={<BDReportsPage />} />
        
        {/* Unified Projects Page */}
        <Route path="/projects" element={<ProjectsPage />} />
        
        {/* Pricing */}
        <Route path="/pricing/contacts" element={<PricingContactsPage />} />
        <Route path="/pricing/customers" element={<PricingCustomersPage />} />
        <Route path="/pricing/quotations" element={<PricingQuotationsPage />} />
        <Route path="/pricing/quotations/:inquiryId" element={<PricingQuotationsPage />} />
        <Route path="/pricing/vendors" element={<PricingVendorsPage />} />
        <Route path="/pricing/reports" element={<PricingReportsPage />} />
        
        {/* Operations */}
        <Route path="/operations" element={<OperationsPage />} />
        <Route path="/operations/create" element={<CreateBookingPage />} />
        <Route path="/operations/:bookingId" element={<BookingDetailPage />} />
        <Route path="/operations/projects" element={<OperationsProjectsPage />} />
        <Route path="/operations/forwarding" element={<ForwardingBookingsPage />} />
        <Route path="/operations/trucking" element={<RouteWrapper page="ops-trucking"><TruckingBookings /></RouteWrapper>} />
        <Route path="/operations/brokerage" element={<RouteWrapper page="ops-brokerage"><BrokerageBookings /></RouteWrapper>} />
        <Route path="/operations/marine-insurance" element={<RouteWrapper page="ops-marine-insurance"><MarineInsuranceBookings /></RouteWrapper>} />
        <Route path="/operations/others" element={<RouteWrapper page="ops-others"><OthersBookings /></RouteWrapper>} />
        <Route path="/operations/reports" element={<RouteWrapper page="ops-reports"><OperationsReports /></RouteWrapper>} />
        
        {/* Accounting */}
        <Route path="/accounting/evouchers" element={<AccountingEVouchersPage />} />
        <Route path="/accounting/billings" element={<AccountingBillingsPage />} />
        <Route path="/accounting/collections" element={<AccountingCollectionsPage />} />
        <Route path="/accounting/expenses" element={<AccountingExpensesPage />} />
        <Route path="/accounting/ledger" element={<AccountingLedgerPage />} />
        <Route path="/accounting/reports" element={<AccountingReportsPage />} />
        
        {/* Other */}
        <Route path="/hr" element={<HRPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/inbox" element={<InboxPageWrapper />} />
        <Route path="/ticket-queue" element={<TicketQueuePageWrapper />} />
        <Route path="/activity-log" element={<ActivityLogPageWrapper />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        
        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </UserProvider>
  );
}