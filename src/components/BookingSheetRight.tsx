import { useEffect, useRef, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  X, User, MapPin, Calendar, Package, Truck, 
  DollarSign, FileText 
} from "lucide-react";

interface Booking {
  id: string;
  trackingNo: string;
  client: string;
  pickup: string;
  dropoff: string;
  deliveryDate: string;
  deliveryType?: string;
  status: "For Delivery" | "In Transit" | "Delivered" | "Closed";
  driver?: string;
}

interface StatusBadgeProps {
  status: Booking["status"];
}

function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "For Delivery":
        return "#0A1D4D";
      case "In Transit":
        return "#F25C05";
      case "Delivered":
        return "#10b981";
      case "Closed":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  return (
    <span
      className="inline-flex items-center px-2.5 h-6 rounded-full text-[11px] font-medium text-white"
      style={{ backgroundColor: getStatusColor(status) }}
    >
      {status}
    </span>
  );
}

interface BookingSheetRightProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onViewFullBooking?: (id: string) => void;
  onPrintWaybill?: () => void;
}

export function BookingSheetRight({ 
  booking,
  isOpen,
  onClose, 
  onViewFullBooking,
  onPrintWaybill,
}: BookingSheetRightProps) {
  const [overlayState, setOverlayState] = useState<'closed' | 'open'>('closed');
  const drawerRef = useRef<HTMLDivElement>(null);
  const headerTitleRef = useRef<HTMLHeadingElement>(null);
  const dragStartX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  // Sync overlay state with isOpen prop
  useEffect(() => {
    if (isOpen && booking) {
      setOverlayState('open');
      // Focus management
      setTimeout(() => {
        headerTitleRef.current?.focus();
      }, 220);
    } else {
      setOverlayState('closed');
    }
  }, [isOpen, booking]);

  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && overlayState === 'open') {
        handleClose();
      }
    };

    if (overlayState === 'open') {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when overlay is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [overlayState]);

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    dragStartX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current || !drawerRef.current) return;
    
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = currentX - dragStartX.current;
    
    // Only allow dragging to the right
    if (deltaX > 0) {
      drawerRef.current.style.transform = `translateX(${deltaX}px)`;
    }
  };

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current || !drawerRef.current) return;
    
    const currentX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const deltaX = currentX - dragStartX.current;
    
    // If dragged more than 100px to the right, close the overlay
    if (deltaX > 100) {
      handleClose();
    } else {
      // Reset position
      drawerRef.current.style.transform = '';
    }
    
    isDragging.current = false;
  };

  const handleClose = () => {
    setOverlayState('closed');
    setTimeout(() => {
      onClose();
    }, 180);
  };



  if (!booking) return null;

  // Animation timing - fixed durations
  const openDuration = 220;
  const closeDuration = 180;
  const currentDuration = overlayState === 'open' ? openDuration : closeDuration;
  const easing = overlayState === 'open' 
    ? 'cubic-bezier(0.16, 1, 0.3, 1)'  // ease-out
    : 'cubic-bezier(0.32, 0, 0.67, 0)'; // ease-in

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black transition-all"
        style={{
          opacity: overlayState === 'open' ? 0.20 : 0,
          backdropFilter: overlayState === 'open' ? 'blur(8px)' : 'blur(0px)',
          WebkitBackdropFilter: overlayState === 'open' ? 'blur(8px)' : 'blur(0px)',
          transitionDuration: `${currentDuration}ms`,
          transitionTimingFunction: easing,
          pointerEvents: overlayState === 'open' ? 'auto' : 'none',
          zIndex: 40,
        }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 bottom-0 w-[480px] bg-[#F9FAFB] border-l border-[#E5E7EB] flex flex-col transition-all overflow-hidden"
        style={{
          transform: overlayState === 'open' ? 'translateX(0)' : 'translateX(100%)',
          opacity: overlayState === 'open' ? 1 : 0,
          transitionDuration: `${currentDuration}ms`,
          transitionTimingFunction: easing,
          transitionProperty: 'transform, opacity',
          boxShadow: '-4px 0 16px rgba(0, 0, 0, 0.08)',
          zIndex: 50,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-sheet-title"
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {/* Header - Sticky */}
        <div className="bg-white p-6 flex items-start justify-between border-b border-[#E5E7EB] sticky top-0 z-30">
          <div className="flex-1">
            <h1 
              id="booking-sheet-title"
              ref={headerTitleRef}
              tabIndex={-1}
              className="text-[20px] font-semibold text-[#0A1D4D] mb-2 outline-none focus:outline-none"
            >
              {booking.trackingNo}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
              <StatusBadge status={booking.status} />
              <span className="text-[#9CA3AF]">·</span>
              <span>Updated 2 hours ago</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="hover:bg-[#F9FAFB] rounded-lg -mr-2 flex-shrink-0"
            aria-label="Close booking details"
          >
            <X className="w-5 h-5 text-[#6B7280]" />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto" style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}>
          <div className="p-6 space-y-6">
            {/* Section 1: Overview - Key Facts two-column grid */}
            <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
              <div className="p-5">
                <h3 className="text-[14px] font-medium text-[#0A1D4D] mb-4">Overview</h3>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <User className="w-4 h-4 text-[#6B7280]" />
                      <p className="text-[11px] text-[#6B7280]">Client</p>
                    </div>
                    <p className="text-[13px] text-[#0A1D4D]">{booking.client}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Package className="w-4 h-4 text-[#6B7280]" />
                      <p className="text-[11px] text-[#6B7280]">Type</p>
                    </div>
                    <p className="text-[13px] text-[#0A1D4D]">{booking.deliveryType || "Domestic"}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MapPin className="w-4 h-4 text-[#6B7280]" />
                      <p className="text-[11px] text-[#6B7280]">Pickup</p>
                    </div>
                    <p className="text-[13px] text-[#0A1D4D]">{booking.pickup}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MapPin className="w-4 h-4 text-[#6B7280]" />
                      <p className="text-[11px] text-[#6B7280]">Dropoff</p>
                    </div>
                    <p className="text-[13px] text-[#0A1D4D]">{booking.dropoff}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Calendar className="w-4 h-4 text-[#6B7280]" />
                      <p className="text-[11px] text-[#6B7280]">Delivery Date</p>
                    </div>
                    <p className="text-[13px] text-[#0A1D4D]">
                      {new Date(booking.deliveryDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Truck className="w-4 h-4 text-[#6B7280]" />
                      <p className="text-[11px] text-[#6B7280]">Driver</p>
                    </div>
                    <p className="text-[13px] text-[#0A1D4D]">{booking.driver || "—"}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Section 2: Shipment Details (Static) */}
            <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
              <div className="p-5">
                <h3 className="text-[14px] font-medium text-[#0A1D4D] mb-4">Shipment Details</h3>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <div>
                    <p className="text-[11px] text-[#6B7280] mb-1.5">Shipper</p>
                    <p className="text-[13px] text-[#0A1D4D]">Acme Trading Corp</p>
                  </div>
                  
                  <div>
                    <p className="text-[11px] text-[#6B7280] mb-1.5">Consignee</p>
                    <p className="text-[13px] text-[#0A1D4D]">Baguio Distribution Center</p>
                  </div>
                  
                  <div>
                    <p className="text-[11px] text-[#6B7280] mb-1.5">Container No.</p>
                    <p className="text-[13px] text-[#0A1D4D]">MSCU1234567</p>
                  </div>
                  
                  <div>
                    <p className="text-[11px] text-[#6B7280] mb-1.5">AWB/BL No.</p>
                    <p className="text-[13px] text-[#0A1D4D]">AWB-2025-00123</p>
                  </div>
                  
                  <div>
                    <p className="text-[11px] text-[#6B7280] mb-1.5">Warehouse</p>
                    <p className="text-[13px] text-[#0A1D4D]">Manila Warehouse A</p>
                  </div>
                  
                  <div>
                    <p className="text-[11px] text-[#6B7280] mb-1.5">Port</p>
                    <p className="text-[13px] text-[#0A1D4D]">Manila North Port</p>
                  </div>
                  
                  <div>
                    <p className="text-[11px] text-[#6B7280] mb-1.5">Weight</p>
                    <p className="text-[13px] text-[#0A1D4D]">5000 kg</p>
                  </div>
                  
                  <div>
                    <p className="text-[11px] text-[#6B7280] mb-1.5">Measurement</p>
                    <p className="text-[13px] text-[#0A1D4D]">45 cbm</p>
                  </div>
                  
                  <div className="col-span-2">
                    <p className="text-[11px] text-[#6B7280] mb-1.5">Commodity</p>
                    <p className="text-[13px] text-[#0A1D4D]">Retail Goods - Temperature Controlled</p>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Section 3: Expenses Summary */}
            <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
              <div className="p-5">
                <div className="flex items-center gap-1.5 mb-4">
                  <DollarSign className="w-4 h-4 text-[#6B7280]" />
                  <h3 className="text-[14px] font-medium text-[#0A1D4D]">Expenses</h3>
                </div>
                
                <div className="space-y-3">
                  {/* Last 3 expenses */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                    <div className="flex-1">
                      <p className="text-[13px] text-[#0A1D4D] mb-1">Fuel Costs</p>
                      <Badge className="bg-[#D1FAE5] text-[#10B981] border-0 h-5 px-2 text-[10px]">
                        Approved
                      </Badge>
                    </div>
                    <p className="text-[13px] font-medium text-[#0A1D4D]">₱3,500</p>
                  </div>
                  
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                    <div className="flex-1">
                      <p className="text-[13px] text-[#0A1D4D] mb-1">Toll Fees</p>
                      <Badge className="bg-[#FFF3E0] text-[#F25C05] border-0 h-5 px-2 text-[10px]">
                        Pending
                      </Badge>
                    </div>
                    <p className="text-[13px] font-medium text-[#0A1D4D]">₱850</p>
                  </div>
                  
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                    <div className="flex-1">
                      <p className="text-[13px] text-[#0A1D4D] mb-1">Port Charges</p>
                      <Badge className="bg-[#D1FAE5] text-[#10B981] border-0 h-5 px-2 text-[10px]">
                        Approved
                      </Badge>
                    </div>
                    <p className="text-[13px] font-medium text-[#0A1D4D]">₱1,250</p>
                  </div>
                  
                  {/* Total Summary */}
                  <div className="pt-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-medium text-[#0A1D4D]">Total Expenses</p>
                      <p className="text-[14px] font-semibold text-[#10B981]">₱5,600</p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[11px] text-[#6B7280]">2 approved • 1 pending</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Section 4: Documents */}
            <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
              <div className="p-5">
                <div className="flex items-center gap-1.5 mb-4">
                  <FileText className="w-4 h-4 text-[#6B7280]" />
                  <h3 className="text-[14px] font-medium text-[#0A1D4D]">Documents</h3>
                </div>
                
                <Button 
                  variant="outline"
                  onClick={onPrintWaybill}
                  className="w-full justify-start border-[#E5E7EB] hover:border-[#0A1D4D] hover:bg-[#0A1D4D]/5 text-[#0A1D4D] rounded-lg h-10 text-[13px]"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Print Waybill
                </Button>
              </div>
            </Card>
          </div>

          {/* Sticky Footer - View Full Booking CTA */}
          <div className="p-6 border-t border-[#E5E7EB] bg-white sticky bottom-0 z-20">
            <Button 
              onClick={() => onViewFullBooking?.(booking.id)}
              className="w-full bg-[#F25C05] hover:bg-[#D84D00] text-white shadow-sm rounded-lg h-11"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Full Booking File
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
