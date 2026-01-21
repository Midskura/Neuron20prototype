import { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit, Copy, Download, Trash2, FileText, FolderOpen, Ticket } from "lucide-react";
import type { QuotationNew } from "../../types/pricing";

interface QuotationActionMenuProps {
  quotation: QuotationNew;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onConvertToProject?: () => void;
  onCreateTicket?: () => void;
}

export function QuotationActionMenu({ 
  quotation, 
  onEdit, 
  onDuplicate, 
  onDelete,
  onConvertToProject,
  onCreateTicket
}: QuotationActionMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  const handleDownloadPDF = () => {
    console.log("Downloading PDF:", quotation.quote_number);
    alert(`📄 PDF download for ${quotation.quote_number} will be available soon!`);
    setShowMenu(false);
  };

  const handleDownloadWord = () => {
    console.log("Downloading Word document:", quotation.quote_number);
    alert(`📝 Word download for ${quotation.quote_number} will be available soon!`);
    setShowMenu(false);
  };

  const confirmDelete = () => {
    console.log("Deleting quotation:", quotation.quote_number);
    onDelete();
    setShowDeleteModal(false);
    setShowMenu(false);
  };

  return (
    <div style={{ position: "relative" }} ref={menuRef}>
      {/* Actions Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 16px",
          backgroundColor: "white",
          border: "1px solid var(--neuron-ui-border)",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: 600,
          color: "#12332B",
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#0F766E";
          e.currentTarget.style.backgroundColor = "#F8FBFB";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--neuron-ui-border)";
          e.currentTarget.style.backgroundColor = "white";
        }}
      >
        <MoreVertical size={16} />
        Actions
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          width: "240px",
          backgroundColor: "white",
          border: "1px solid var(--neuron-ui-border)",
          borderRadius: "8px",
          boxShadow: "0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)",
          zIndex: 100,
          overflow: "hidden"
        }}>
          {/* Edit */}
          <button
            onClick={() => {
              onEdit();
              setShowMenu(false);
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              color: "#12332B",
              textAlign: "left",
              transition: "background-color 0.15s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F9FAFB";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Edit size={16} style={{ color: "#667085" }} />
            <span>Edit Quotation</span>
          </button>

          {/* Duplicate */}
          <button
            onClick={() => {
              onDuplicate();
              setShowMenu(false);
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              color: "#12332B",
              textAlign: "left",
              transition: "background-color 0.15s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F9FAFB";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Copy size={16} style={{ color: "#667085" }} />
            <span>Duplicate</span>
          </button>

          {/* Convert to Project - Only visible for "Accepted by Client" */}
          {onConvertToProject && quotation.status === "Accepted by Client" && (
            <button
              onClick={() => {
                onConvertToProject();
                setShowMenu(false);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                backgroundColor: "transparent",
                border: "none",
                borderTop: "1px solid #F3F4F6",
                cursor: "pointer",
                fontSize: "14px",
                color: "#0F766E",
                textAlign: "left",
                transition: "background-color 0.15s ease",
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F0FDF4";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <FolderOpen size={16} style={{ color: "#0F766E" }} />
              <span>Convert to Project</span>
            </button>
          )}

          {/* Create Ticket */}
          {onCreateTicket && (
            <button
              onClick={() => {
                onCreateTicket();
                setShowMenu(false);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                backgroundColor: "transparent",
                border: "none",
                borderTop: "1px solid #F3F4F6",
                cursor: "pointer",
                fontSize: "14px",
                color: "#0F766E",
                textAlign: "left",
                transition: "background-color 0.15s ease",
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F0FDF4";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Ticket size={16} style={{ color: "#0F766E" }} />
              <span>Create Ticket</span>
            </button>
          )}

          {/* Download - Submenu */}
          <div style={{ position: "relative" }}>
            <button
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                color: "#12332B",
                textAlign: "left",
                transition: "background-color 0.15s ease",
                borderTop: "1px solid #F3F4F6"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F9FAFB";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Download size={16} style={{ color: "#667085" }} />
              <span>Download</span>
            </button>
            
            {/* Download Options */}
            <div style={{
              paddingLeft: "44px",
              backgroundColor: "#F9FAFB",
              borderBottom: "1px solid #F3F4F6"
            }}>
              <button
                onClick={handleDownloadPDF}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 0",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "#12332B",
                  textAlign: "left"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#0F766E";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#12332B";
                }}
              >
                <FileText size={14} style={{ color: "#DC2626" }} />
                <span>PDF</span>
              </button>
              
              <button
                onClick={handleDownloadWord}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 0 12px 0",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "#12332B",
                  textAlign: "left"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#0F766E";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#12332B";
                }}
              >
                <FileText size={14} style={{ color: "#2563EB" }} />
                <span>Word</span>
              </button>
            </div>
          </div>

          {/* Delete */}
          <button
            onClick={() => {
              setShowMenu(false);
              setShowDeleteModal(true);
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              backgroundColor: "transparent",
              border: "none",
              borderTop: "1px solid #F3F4F6",
              cursor: "pointer",
              fontSize: "14px",
              color: "#DC2626",
              textAlign: "left",
              transition: "background-color 0.15s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#FEE2E2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            width: "480px",
            boxShadow: "0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}>
            {/* Modal Header with Icon */}
            <div style={{
              padding: "24px 24px 20px 24px",
              borderBottom: "1px solid #F3F4F6",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px"
            }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "18px",
                backgroundColor: "#FEF2F2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                <Trash2 size={16} style={{ color: "#EF4444" }} />
              </div>
              
              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#12332B",
                  marginBottom: "6px",
                  lineHeight: "1.4"
                }}>
                  Delete Quotation
                </h2>
                <p style={{
                  fontSize: "13px",
                  color: "#667085",
                  lineHeight: "1.5",
                  margin: 0,
                  marginBottom: "12px"
                }}>
                  Are you sure you want to delete <strong style={{ color: "#12332B" }}>{quotation.quote_number}</strong>?
                </p>
                <p style={{
                  fontSize: "13px",
                  color: "#667085",
                  lineHeight: "1.5",
                  margin: 0
                }}>
                  This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: "16px 24px 20px 24px",
              display: "flex",
              gap: "8px",
              justifyContent: "flex-end"
            }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "white",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#374151",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F9FAFB";
                  e.currentTarget.style.borderColor = "#9CA3AF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.borderColor = "#D1D5DB";
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#EF4444",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "white",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#DC2626";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#EF4444";
                }}
              >
                Delete Quotation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}