import { useState, useEffect } from "react";
import { Plus, Clock, FileText, Building2, Users } from "lucide-react";
import { MyEVouchersList } from "./evouchers/MyEVouchersList";
import { AllEVouchersList } from "./evouchers/AllEVouchersList";
import { CreateEVoucherForm } from "./evouchers/CreateEVoucherForm";
import { BudgetRequestDetailPanel } from "../bd/BudgetRequestDetailPanel";
import { PendingApprovalsList } from "./evouchers/PendingApprovalsList";

type EVoucherView = "pending" | "my-evouchers" | "all";

export function EVouchersContent() {
  const [activeView, setActiveView] = useState<EVoucherView>("my-evouchers");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvoucher, setSelectedEvoucher] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get current user from localStorage
  const userData = localStorage.getItem("neuron_user");
  const currentUser = userData ? JSON.parse(userData) : null;
  
  // Check if user has approval access (Accounting Staff OR Executive OR Finance Manager)
  const hasApprovalAccess = 
    currentUser?.department === "Accounting" || 
    currentUser?.department === "Executive" ||
    currentUser?.role === "Finance Manager";

  // Auto-select "Pending Approvals" if user has approval access
  useEffect(() => {
    if (hasApprovalAccess && activeView === "my-evouchers") {
      setActiveView("pending");
    }
  }, [hasApprovalAccess]);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FFFFFF"
      }}
    >
      {/* Header */}
      <div style={{ padding: "32px 48px", borderBottom: "1px solid var(--neuron-ui-border)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px"
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: 600,
                color: "#12332B",
                marginBottom: "4px",
                letterSpacing: "-1.2px"
              }}
            >
              E-Vouchers
            </h1>
            <p style={{ fontSize: "14px", color: "#667085" }}>
              {hasApprovalAccess
                ? "Universal transaction approval system for all financial activities"
                : "Create and track your expense vouchers"}
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                backgroundColor: "#0F766E",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#0D6560";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#0F766E";
              }}
            >
              <Plus size={18} />
              New E-Voucher
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--neuron-ui-border)" }}>
          {hasApprovalAccess && (
            <button
              onClick={() => setActiveView("pending")}
              style={{
                padding: "12px 20px",
                fontSize: "14px",
                fontWeight: 500,
                color: activeView === "pending" ? "#0F766E" : "#6B7280",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: activeView === "pending" ? "2px solid #0F766E" : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <Clock size={16} />
              Pending Approvals
            </button>
          )}
          <button
            onClick={() => setActiveView("my-evouchers")}
            style={{
              padding: "12px 20px",
              fontSize: "14px",
              fontWeight: 500,
              color: activeView === "my-evouchers" ? "#0F766E" : "#6B7280",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: activeView === "my-evouchers" ? "2px solid #0F766E" : "2px solid transparent",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <FileText size={16} />
            My E-Vouchers
          </button>
          {hasApprovalAccess && (
            <button
              onClick={() => setActiveView("all")}
              style={{
                padding: "12px 20px",
                fontSize: "14px",
                fontWeight: 500,
                color: activeView === "all" ? "#0F766E" : "#6B7280",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: activeView === "all" ? "2px solid #0F766E" : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <Building2 size={16} />
              All E-Vouchers
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "32px 48px"
        }}
      >
        {/* Pending Approvals View (Accounting/Executive Staff Only) */}
        {activeView === "pending" && hasApprovalAccess && (
          <PendingApprovalsList
            onViewDetail={(evoucher) => setSelectedEvoucher(evoucher)}
            refreshTrigger={refreshTrigger}
          />
        )}

        {/* My E-Vouchers View */}
        {activeView === "my-evouchers" && currentUser && (
          <MyEVouchersList
            userId={currentUser.id}
            onViewDetail={(evoucher) => setSelectedEvoucher(evoucher)}
            onCreateNew={() => setShowCreateModal(true)}
            refreshTrigger={refreshTrigger}
          />
        )}

        {/* All E-Vouchers View (Accounting/Executive Staff Only) */}
        {activeView === "all" && hasApprovalAccess && (
          <AllEVouchersList
            onViewDetail={(evoucher) => setSelectedEvoucher(evoucher)}
            refreshTrigger={refreshTrigger}
          />
        )}

        {/* No User State */}
        {!currentUser && (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: "#6B7280"
            }}
          >
            <Users size={48} style={{ margin: "0 auto 16px", color: "#D1D5DB" }} />
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
              Please Log In
            </h3>
            <p style={{ fontSize: "14px", color: "#6B7280" }}>
              You need to be logged in to view E-Vouchers
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateEVoucherForm
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          context={hasApprovalAccess ? "accounting" : "bd"}
          defaultRequestor={currentUser?.name}
          onSuccess={() => {
            setShowCreateModal(false);
            // Trigger refresh
            setRefreshTrigger(refreshTrigger + 1);
          }}
        />
      )}

      {selectedEvoucher && (
        <BudgetRequestDetailPanel
          request={selectedEvoucher}
          isOpen={!!selectedEvoucher}
          onClose={() => setSelectedEvoucher(null)}
          currentUser={currentUser}
          onStatusChange={() => {
            setSelectedEvoucher(null);
            // Trigger refresh
            setRefreshTrigger(refreshTrigger + 1);
          }}
          showAccountingControls={hasApprovalAccess}
        />
      )}
    </div>
  );
}