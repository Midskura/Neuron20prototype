import { useEffect, useState } from "react";
import { X, Printer } from "lucide-react";
import { Button } from "./ui/button";

interface ShipmentMonitoringFormProps {
  booking?: {
    trackingNo: string;
    client: string;
    deliveryType: string;
  };
  shipmentData?: {
    mode: string;
    containerType: string;
    shipper: string;
    consignee: string;
    etd: string;
    eta: string;
    containerNo: string;
    origin: string;
    destination: string;
    weight: string;
    weightUnit: string;
    awbBlNo: string;
    measurement: string;
    measurementUnit: string;
    commodity: string;
    shippingLine: string;
    registryNo: string;
    warehouse: string;
    port: string;
    specialInstructions: string;
  };
  currentUser?: string;
  onClose: () => void;
}

export function ShipmentMonitoringForm({
  booking = {
    trackingNo: '',
    client: '',
    deliveryType: ''
  },
  shipmentData = {
    mode: '',
    containerType: '',
    shipper: '',
    consignee: '',
    etd: '',
    eta: '',
    containerNo: '',
    origin: '',
    destination: '',
    weight: '',
    weightUnit: '',
    awbBlNo: '',
    measurement: '',
    measurementUnit: '',
    commodity: '',
    shippingLine: '',
    registryNo: '',
    warehouse: '',
    port: '',
    specialInstructions: ''
  },
  currentUser,
  onClose,
}: ShipmentMonitoringFormProps) {
  
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handlePrint();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  // Parse mode and load type
  const getTransportMode = () => {
    const mode = shipmentData.mode?.toUpperCase() || "";
    if (mode.includes("AIR")) return "AIR";
    if (mode.includes("SEA")) return "SEA";
    if (mode.includes("DOM")) return "DOM";
    if (mode.includes("TRUCK")) return "TRUCKING";
    return "";
  };

  const getLoadType = () => {
    const type = shipmentData.containerType?.toUpperCase() || "";
    if (type.includes("FCL")) return "FCL";
    if (type.includes("LCL")) return "LCL";
    return "";
  };

  const transportMode = getTransportMode();
  const loadType = getLoadType();
  const isImport = booking.deliveryType?.toLowerCase() === "import";

  // Check if a mode/load combination is selected
  const isSelected = (mode: string, load: string) => {
    return transportMode === mode && loadType === load;
  };

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <style>{`
        /* Apply Arial font to all Excel-style preview content */
        .excel-modal-overlay * {
          font-family: Arial, sans-serif !important;
        }
        
        @media print {
          @page {
            size: A4 landscape;
            margin: 15mm;
          }
          
          body {
            margin: 0;
            padding: 0;
            background: white;
            font-family: Arial, sans-serif;
          }

          .excel-modal-overlay,
          .excel-modal-container,
          .excel-controls,
          .no-print {
            display: none !important;
          }

          .excel-sheet-container {
            transform: none !important;
            width: 100% !important;
            height: auto !important;
          }
        }

        @media screen {
          .excel-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: fadeIn 0.2s ease-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(10px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
        }
      `}</style>

      {/* Excel-Style Preview Modal */}
      <div 
        className="excel-modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          className="bg-white rounded-lg shadow-2xl flex flex-col"
          style={{ width: "1220px", height: "720px", animation: "slideUp 0.3s ease-out" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header - Fixed */}
          <div className="border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between flex-shrink-0 bg-white z-20">
            <div>
              <h3 className="text-[14px] font-medium text-[#0A1D4D] mb-1">
                Shipment Monitoring Form Preview
              </h3>
              <p className="text-[11px] text-[#6B7280]">
                Excel-style spreadsheet layout for shipment tracking.
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-[#F9FAFB]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Sheet Container - Scrollable with Clipping */}
          <div className="flex-1 overflow-hidden bg-[#E8EAED] relative">
            <div className="h-full flex overflow-hidden">
              {/* Row Numbers Column - Fixed */}
              <div className="w-12 bg-[#F8FAFC] border-r border-[#D1D5DB] flex-shrink-0 overflow-hidden">
                <div className="h-[30px] border-b border-[#D1D5DB] sticky top-0 bg-[#F8FAFC] z-10"></div>
                <div className="overflow-y-auto" style={{ height: "calc(100% - 30px)" }}>
                  {Array.from({ length: 50 }, (_, i) => (
                    <div
                      key={i}
                      className="h-[36px] border-b border-[#E5E7EB] flex items-center justify-center text-[11px] text-[#64748B]"
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Sheet Area - Scrollable */}
              <div className="flex-1 overflow-auto">
                {/* Column Headers - Sticky */}
                <div className="h-[30px] bg-[#F8FAFC] border-b border-[#D1D5DB] flex sticky top-0 z-10">
                  {["A", "B", "C", "D", "E", "F", "G", "H"].map((col, idx) => (
                    <div
                      key={col}
                      className="flex items-center justify-center text-[11px] text-[#64748B] border-r border-[#E5E7EB] flex-shrink-0"
                      style={{ 
                        width: idx === 0 ? "140px" : "140px"
                      }}
                    >
                      {col}
                    </div>
                  ))}
                </div>

                {/* Sheet Grid - 8 Column Layout */}
                <div className="bg-white">
                  {/* Grid System - 8 Columns */}
                  <div className="grid grid-cols-8 border-l border-[#E5E7EB]">
                    {/* Row 1: Header - Logo and Title */}
                    <div className="col-span-2 border-r border-b border-[#E5E7EB] p-3 bg-white" style={{ minHeight: "56px" }}></div>
                    <div className="col-span-6 border-r border-b border-[#E5E7EB] p-3 flex items-center justify-center bg-white" style={{ minHeight: "56px" }}>
                      <p className="text-[16px] text-[#0A1D4D] uppercase tracking-wider" style={{ fontWeight: 700 }}>
                        SHIPMENT MONITORING FORM
                      </p>
                    </div>

                    {/* Row 2: Import/Export + Tracking No */}
                    <div className="col-span-2 border-r border-b border-[#E5E7EB] p-3 bg-[#F9FAFB] flex items-center justify-center" style={{ height: "40px" }}>
                      <p className="text-[12px] text-[#0A1D4D] uppercase tracking-wide" style={{ fontWeight: 700 }}>
                        {isImport ? 'IMPORT' : 'EXPORT'}
                      </p>
                    </div>
                    <div className="col-span-4 border-r border-b border-[#E5E7EB]" style={{ height: "40px" }}></div>
                    <div className="col-span-2 border-r border-b border-[#E5E7EB] p-3 flex items-center justify-end" style={{ height: "40px" }}>
                      <p className="text-[11px] text-[#64748B]" style={{ fontWeight: 500 }}>
                        Tracking No: <span className="text-[#0A1D4D]" style={{ fontWeight: 700 }}>{booking.trackingNo}</span>
                      </p>
                    </div>

                    {/* Row 3: Mode Headers */}
                    <div className="border-r border-b border-[#E5E7EB] bg-[#F9FAFB]" style={{ height: "36px" }}></div>
                    <div className="border-r border-b border-[#E5E7EB] p-2 bg-[#F9FAFB] flex items-center justify-center" style={{ height: "36px" }}>
                      <p className="text-[11px] text-[#0A1D4D] uppercase tracking-wide" style={{ fontWeight: 700 }}>AIR</p>
                    </div>
                    <div className="border-r border-b border-[#E5E7EB] p-2 bg-[#F9FAFB] flex items-center justify-center" style={{ height: "36px" }}>
                      <p className="text-[11px] text-[#0A1D4D] uppercase tracking-wide" style={{ fontWeight: 700 }}>SEA</p>
                    </div>
                    <div className="border-r border-b border-[#E5E7EB] p-2 bg-[#F9FAFB] flex items-center justify-center" style={{ height: "36px" }}>
                      <p className="text-[11px] text-[#0A1D4D] uppercase tracking-wide" style={{ fontWeight: 700 }}>DOM</p>
                    </div>
                    <div className="col-span-4 border-r border-b border-[#E5E7EB] p-2 bg-[#F9FAFB] flex items-center justify-center" style={{ height: "36px" }}>
                      <p className="text-[11px] text-[#0A1D4D] uppercase tracking-wide" style={{ fontWeight: 700 }}>TRUCKING</p>
                    </div>

                    {/* Row 4: FCL Checkboxes */}
                    <div className="border-r border-b border-[#E5E7EB] p-2 flex items-center justify-center" style={{ height: "36px" }}>
                      <p className="text-[11px] text-[#64748B]" style={{ fontWeight: 600 }}>FCL</p>
                    </div>
                    <div className="border-r border-b border-[#E5E7EB] flex items-center justify-center" style={{ height: "36px" }}>
                      {isSelected('AIR', 'FCL') && <span className="text-[16px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>✓</span>}
                    </div>
                    <div className="border-r border-b border-[#E5E7EB] flex items-center justify-center" style={{ height: "36px" }}>
                      {isSelected('SEA', 'FCL') && <span className="text-[16px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>✓</span>}
                    </div>
                    <div className="border-r border-b border-[#E5E7EB] flex items-center justify-center" style={{ height: "36px" }}>
                      {isSelected('DOM', 'FCL') && <span className="text-[16px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>✓</span>}
                    </div>
                    <div className="col-span-4 border-r border-b border-[#E5E7EB] flex items-center justify-center" style={{ height: "36px" }}>
                      {isSelected('TRUCKING', 'FCL') && <span className="text-[16px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>✓</span>}
                    </div>

                    {/* Row 5: LCL Checkboxes */}
                    <div className="border-r border-b border-[#E5E7EB] p-2 flex items-center justify-center" style={{ height: "36px" }}>
                      <p className="text-[11px] text-[#64748B]" style={{ fontWeight: 600 }}>LCL</p>
                    </div>
                    <div className="border-r border-b border-[#E5E7EB] flex items-center justify-center" style={{ height: "36px" }}>
                      {isSelected('AIR', 'LCL') && <span className="text-[16px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>✓</span>}
                    </div>
                    <div className="border-r border-b border-[#E5E7EB] flex items-center justify-center" style={{ height: "36px" }}>
                      {isSelected('SEA', 'LCL') && <span className="text-[16px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>✓</span>}
                    </div>
                    <div className="border-r border-b border-[#E5E7EB] flex items-center justify-center" style={{ height: "36px" }}>
                      {isSelected('DOM', 'LCL') && <span className="text-[16px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>✓</span>}
                    </div>
                    <div className="col-span-4 border-r border-b border-[#E5E7EB] flex items-center justify-center" style={{ height: "36px" }}>
                      {isSelected('TRUCKING', 'LCL') && <span className="text-[16px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>✓</span>}
                    </div>

                    {/* Row 6: Empty Divider */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={`div1-${i}`} className="border-r border-b border-[#E5E7EB]" style={{ height: "12px" }}></div>
                    ))}

                    {/* Row 7: SHIPPER */}
                    <div className="col-span-3 border-r border-b border-[#E5E7EB] p-3 bg-[#F9FAFB] flex items-center" style={{ height: "40px" }}>
                      <p className="text-[11px] text-[#0A1D4D] uppercase tracking-wide" style={{ fontWeight: 700 }}>SHIPPER:</p>
                    </div>
                    <div className="col-span-5 border-r border-b border-[#E5E7EB] p-3 flex items-center" style={{ height: "40px" }}>
                      <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>{shipmentData.shipper}</p>
                    </div>

                    {/* Row 8: CONSIGNEE */}
                    <div className="col-span-3 border-r border-b border-[#E5E7EB] p-3 bg-[#F9FAFB] flex items-center" style={{ height: "40px" }}>
                      <p className="text-[11px] text-[#0A1D4D] uppercase tracking-wide" style={{ fontWeight: 700 }}>CONSIGNEE:</p>
                    </div>
                    <div className="col-span-5 border-r border-b border-[#E5E7EB] p-3 flex items-center" style={{ height: "40px" }}>
                      <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>{shipmentData.consignee}</p>
                    </div>

                    {/* Row 9: ETD / ETA */}
                    <div className="col-span-1 border-r border-b border-[#E5E7EB] p-3 bg-[#F9FAFB] flex items-center" style={{ height: "40px" }}>
                      <p className="text-[11px] text-[#0A1D4D] uppercase tracking-wide" style={{ fontWeight: 700 }}>ETD:</p>
                    </div>
                    <div className="col-span-2 border-r border-b border-[#E5E7EB] p-3 flex items-center" style={{ height: "40px" }}>
                      <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>{formatDate(shipmentData.etd)}</p>
                    </div>
                    <div className="col-span-2 border-r border-b border-[#E5E7EB] p-3 bg-[#F9FAFB] flex items-center" style={{ height: "40px" }}>
                      <p className="text-[11px] text-[#0A1D4D] uppercase tracking-wide" style={{ fontWeight: 700 }}>ETA:</p>
                    </div>
                    <div className="col-span-3 border-r border-b border-[#E5E7EB] p-3 flex items-center" style={{ height: "40px" }}>
                      <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>{formatDate(shipmentData.eta)}</p>
                    </div>

                    {/* Row 10: CONTAINER NO. */}
                    <div className="col-span-3 border-r border-b border-[#E5E7EB] p-3 bg-[#F9FAFB] flex items-center" style={{ height: "40px" }}>
                      <p className="text-[11px] text-[#0A1D4D] uppercase tracking-wide" style={{ fontWeight: 700 }}>CONTAINER NO.:</p>
                    </div>
                    <div className="col-span-5 border-r border-b border-[#E5E7EB] p-3 flex items-center" style={{ height: "40px" }}>
                      <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>{shipmentData.containerNo}</p>
                    </div>

                    {/* Row 11: ORIGIN / DESTINATION */}
                    <div className="col-span-1 border-r border-b border-[#E5E7EB] p-3 bg-[#F9FAFB] flex items-center" style={{ height: "40px" }}>
                      <p className="text-[11px] text-[#0A1D4D] uppercase tracking-wide" style={{ fontWeight: 700 }}>ORIGIN:</p>
                    </div>
                    <div className="col-span-2 border-r border-b border-[#E5E7EB] p-3 flex items-center" style={{ height: "40px" }}>
                      <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>{shipmentData.origin}</p>
                    </div>
                    <div className="col-span-2 border-r border-b border-[#E5E7EB] p-3 bg-[#F9FAFB] flex items-center" style={{ height: "40px" }}>
                      <p className="text-[11px] text-[#0A1D4D] uppercase tracking-wide" style={{ fontWeight: 700 }}>DESTINATION:</p>
                    </div>
                    <div className="col-span-3 border-r border-b border-[#E5E7EB] p-3 flex items-center" style={{ height: "40px" }}>
                      <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>{shipmentData.destination}</p>
                    </div>

                    {/* Row 12: WEIGHT */}
                    <div className="col-span-3 border-r border-b border-[#E5E7EB] p-3 bg-[#F9FAFB] flex items-center" style={{ height: "40px" }}>
                      <p className="text-[11px] text-[#0A1D4D] uppercase tracking-wide" style={{ fontWeight: 700 }}>WEIGHT:</p>
                    </div>
                    <div className="col-span-5 border-r border-b border-[#E5E7EB] p-3 flex items-center" style={{ height: "40px" }}>
                      <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>{shipmentData.weight} {shipmentData.weightUnit}</p>
                    </div>

                    {/* Row 13: AWB/BL NO. */}
                    <div className="col-span-3 border-r border-b border-[#E5E7EB] p-3 bg-[#F9FAFB] flex items-center" style={{ height: "40px" }}>
                      <p className="text-[11px] text-[#0A1D4D] uppercase tracking-wide" style={{ fontWeight: 700 }}>AWB/BL NO.:</p>
                    </div>
                    <div className="col-span-5 border-r border-b border-[#E5E7EB] p-3 flex items-center" style={{ height: "40px" }}>
                      <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>{shipmentData.awbBlNo}</p>
                    </div>

                    {/* Row 14: MEASUREMENT */}
                    <div className="col-span-3 border-r border-b border-[#E5E7EB] p-3 bg-[#F9FAFB] flex items-center" style={{ height: "40px" }}>
                      <p className="text-[11px] text-[#0A1D4D] uppercase tracking-wide" style={{ fontWeight: 700 }}>MEASUREMENT:</p>
                    </div>
                    <div className="col-span-5 border-r border-b border-[#E5E7EB] p-3 flex items-center" style={{ height: "40px" }}>
                      <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>{shipmentData.measurement} {shipmentData.measurementUnit}</p>
                    </div>

                    {/* Row 15: COMMODITY */}
                    <div className="col-span-3 border-r border-b border-[#E5E7EB] p-3 bg-[#F9FAFB] flex items-center" style={{ height: "40px" }}>
                      <p className="text-[11px] text-[#0A1D4D] uppercase tracking-wide" style={{ fontWeight: 700 }}>COMMODITY:</p>
                    </div>
                    <div className="col-span-5 border-r border-b border-[#E5E7EB] p-3 flex items-center" style={{ height: "40px" }}>
                      <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>{shipmentData.commodity}</p>
                    </div>

                    {/* Row 16: SHIPPING LINE */}
                    <div className="col-span-3 border-r border-b border-[#E5E7EB] p-3 bg-[#F9FAFB] flex items-center" style={{ height: "40px" }}>
                      <p className="text-[11px] text-[#0A1D4D] uppercase tracking-wide" style={{ fontWeight: 700 }}>SHIPPING LINE:</p>
                    </div>
                    <div className="col-span-5 border-r border-b border-[#E5E7EB] p-3 flex items-center" style={{ height: "40px" }}>
                      <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>{shipmentData.shippingLine}</p>
                    </div>

                    {/* Row 17: REGISTRY NO. */}
                    <div className="col-span-3 border-r border-b border-[#E5E7EB] p-3 bg-[#F9FAFB] flex items-center" style={{ height: "40px" }}>
                      <p className="text-[11px] text-[#0A1D4D] uppercase tracking-wide" style={{ fontWeight: 700 }}>REGISTRY NO.:</p>
                    </div>
                    <div className="col-span-5 border-r border-b border-[#E5E7EB] p-3 flex items-center" style={{ height: "40px" }}>
                      <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>{shipmentData.registryNo}</p>
                    </div>

                    {/* Row 18: WAREHOUSE */}
                    <div className="col-span-3 border-r border-b border-[#E5E7EB] p-3 bg-[#F9FAFB] flex items-center" style={{ height: "40px" }}>
                      <p className="text-[11px] text-[#0A1D4D] uppercase tracking-wide" style={{ fontWeight: 700 }}>WAREHOUSE:</p>
                    </div>
                    <div className="col-span-5 border-r border-b border-[#E5E7EB] p-3 flex items-center" style={{ height: "40px" }}>
                      <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>{shipmentData.warehouse}</p>
                    </div>

                    {/* Row 19: PORT */}
                    <div className="col-span-3 border-r border-b border-[#E5E7EB] p-3 bg-[#F9FAFB] flex items-center" style={{ height: "40px" }}>
                      <p className="text-[11px] text-[#0A1D4D] uppercase tracking-wide" style={{ fontWeight: 700 }}>PORT:</p>
                    </div>
                    <div className="col-span-5 border-r border-b border-[#E5E7EB] p-3 flex items-center" style={{ height: "40px" }}>
                      <p className="text-[13px] text-[#0A1D4D]" style={{ fontWeight: 700 }}>{shipmentData.port}</p>
                    </div>

                    {/* Row 20: Empty Divider */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={`div2-${i}`} className="border-r border-b border-[#E5E7EB]" style={{ height: "12px" }}></div>
                    ))}

                    {/* Row 21-23: SPECIAL INSTRUCTION */}
                    <div className="col-span-3 border-r border-b border-[#E5E7EB] p-3 bg-[#F9FAFB] flex items-start pt-3" style={{ minHeight: "120px" }}>
                      <p className="text-[11px] text-[#0A1D4D] uppercase tracking-wide" style={{ fontWeight: 700 }}>SPECIAL INSTRUCTION:</p>
                    </div>
                    <div className="col-span-5 border-r border-b border-[#E5E7EB] p-3" style={{ minHeight: "120px" }}>
                      <p className="text-[13px] text-[#0A1D4D] whitespace-pre-wrap" style={{ fontWeight: 700 }}>{shipmentData.specialInstructions}</p>
                    </div>

                    {/* Extra empty rows for scrolling */}
                    {Array.from({ length: 20 }).map((_, rowIdx) => (
                      Array.from({ length: 8 }).map((_, colIdx) => (
                        <div key={`extra-${rowIdx}-${colIdx}`} className="border-r border-b border-[#E5E7EB]" style={{ height: "36px" }}></div>
                      ))
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Controls Footer */}
          <div className="excel-controls border-t border-[#E5E7EB] px-6 py-4 flex items-center justify-end gap-3 bg-white flex-shrink-0">
            <Button
              onClick={handlePrint}
              className="bg-[#F25C05] hover:bg-[#D84D00] text-white rounded-lg h-10 px-4"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Form
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-[#E5E7EB] hover:border-[#0A1D4D] hover:bg-[#0A1D4D]/5 rounded-lg h-10 px-4"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
