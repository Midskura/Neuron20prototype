import { Download, Upload, MapPin, Truck } from "lucide-react";
import { cn } from "./ui/utils";

interface ShipmentTypeSelectorProps {
  shipmentType: "Import" | "Export" | "Domestic" | "Trucking";
  mode?: "AIR" | "SEA";
  containerType: "FCL" | "LCL";
  onShipmentTypeChange?: (type: "Import" | "Export" | "Domestic" | "Trucking") => void;
  onModeChange?: (mode: "AIR" | "SEA") => void;
  onContainerTypeChange?: (type: "FCL" | "LCL") => void;
  disabled?: boolean;
}

export function ShipmentTypeSelector({
  shipmentType,
  mode,
  containerType,
  onShipmentTypeChange,
  onModeChange,
  onContainerTypeChange,
  disabled = false,
}: ShipmentTypeSelectorProps) {
  const shipmentTypes: Array<{
    value: "Import" | "Export" | "Domestic" | "Trucking";
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { value: "Import", label: "Import", icon: Download },
    { value: "Export", label: "Export", icon: Upload },
    { value: "Domestic", label: "Domestic", icon: MapPin },
    { value: "Trucking", label: "Trucking", icon: Truck },
  ];

  const showModeSelector = shipmentType !== "Trucking";
  const showContainerTypeForAir = mode === "AIR";
  const showContainerTypeForSea = mode === "SEA";
  const showContainerTypeForTrucking = shipmentType === "Trucking";

  return (
    <div className="space-y-4">
      {/* Level 1: Shipment Category - Centered */}
      <div className="flex justify-center">
        <div className="w-full max-w-[720px]">
          <div className="text-[11px] text-[#667085] mb-3 uppercase font-medium text-center">
            Shipment Category
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {shipmentTypes.map(({ value, label, icon: Icon }) => {
              const isSelected = shipmentType === value;
              return (
                <button
                  key={value}
                  onClick={() => !disabled && onShipmentTypeChange?.(value)}
                  disabled={disabled}
                  className={cn(
                    "h-11 px-[18px] rounded-full text-[13px] font-medium transition-all inline-flex items-center gap-2",
                    isSelected
                      ? "bg-[#0F766E] text-white"
                      : "bg-white text-[#12332B] border border-[#E5E9F0] hover:bg-[#F3F4F6]",
                    disabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      isSelected ? "text-white" : "text-[#667085]"
                    )}
                  />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Level 2: Mode & Container Type */}
      <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E9F0]">
        {/* Mode Selection (for Import/Export/Domestic) */}
        {showModeSelector && (
          <div className="mb-4">
            <div className="text-[11px] text-[#667085] mb-2 uppercase font-medium">
              Mode of Shipment
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => !disabled && onModeChange?.("AIR")}
                disabled={disabled}
                className={cn(
                  "flex-1 h-10 rounded-lg text-[13px] font-medium transition-all border",
                  "flex items-center justify-center",
                  mode === "AIR"
                    ? "bg-[#0F766E] text-white border-[#0F766E]"
                    : "bg-white text-[#667085] border-[#E5E9F0] hover:bg-[#F3F4F6]",
                  disabled && "cursor-not-allowed opacity-50"
                )}
              >
                AIR
              </button>
              <button
                onClick={() => !disabled && onModeChange?.("SEA")}
                disabled={disabled}
                className={cn(
                  "flex-1 h-10 rounded-lg text-[13px] font-medium transition-all border",
                  "flex items-center justify-center",
                  mode === "SEA"
                    ? "bg-[#0F766E] text-white border-[#0F766E]"
                    : "bg-white text-[#667085] border-[#E5E9F0] hover:bg-[#F3F4F6]",
                  disabled && "cursor-not-allowed opacity-50"
                )}
              >
                SEA
              </button>
            </div>
          </div>
        )}

        {/* Container Type Selection */}
        <div>
          <div className="text-[11px] text-[#667085] mb-2 uppercase font-medium">
            Container Type
          </div>

          {/* AIR: LCL only */}
          {showContainerTypeForAir && (
            <div className="flex gap-3">
              <button
                disabled
                className="flex-1 h-10 rounded-lg text-[13px] font-medium bg-[#B06A4F] text-white border border-[#B06A4F] flex items-center justify-center"
              >
                LCL Only
              </button>
            </div>
          )}

          {/* SEA: FCL or LCL */}
          {showContainerTypeForSea && (
            <div className="flex gap-3">
              <button
                onClick={() => !disabled && onContainerTypeChange?.("FCL")}
                disabled={disabled}
                className={cn(
                  "flex-1 h-10 rounded-lg text-[13px] font-medium transition-all border",
                  "flex items-center justify-center",
                  containerType === "FCL"
                    ? "bg-[#B06A4F] text-white border-[#B06A4F]"
                    : "bg-white text-[#667085] border-[#E5E9F0] hover:bg-[#F3F4F6]",
                  disabled && "cursor-not-allowed opacity-50"
                )}
              >
                FCL
              </button>
              <button
                onClick={() => !disabled && onContainerTypeChange?.("LCL")}
                disabled={disabled}
                className={cn(
                  "flex-1 h-10 rounded-lg text-[13px] font-medium transition-all border",
                  "flex items-center justify-center",
                  containerType === "LCL"
                    ? "bg-[#B06A4F] text-white border-[#B06A4F]"
                    : "bg-white text-[#667085] border-[#E5E9F0] hover:bg-[#F3F4F6]",
                  disabled && "cursor-not-allowed opacity-50"
                )}
              >
                LCL
              </button>
            </div>
          )}

          {/* Trucking: FCL or LCL */}
          {showContainerTypeForTrucking && (
            <div className="flex gap-3">
              <button
                onClick={() => !disabled && onContainerTypeChange?.("FCL")}
                disabled={disabled}
                className={cn(
                  "flex-1 h-10 rounded-lg text-[13px] font-medium transition-all border",
                  "flex items-center justify-center",
                  containerType === "FCL"
                    ? "bg-[#B06A4F] text-white border-[#B06A4F]"
                    : "bg-white text-[#667085] border-[#E5E9F0] hover:bg-[#F3F4F6]",
                  disabled && "cursor-not-allowed opacity-50"
                )}
              >
                FCL
              </button>
              <button
                onClick={() => !disabled && onContainerTypeChange?.("LCL")}
                disabled={disabled}
                className={cn(
                  "flex-1 h-10 rounded-lg text-[13px] font-medium transition-all border",
                  "flex items-center justify-center",
                  containerType === "LCL"
                    ? "bg-[#B06A4F] text-white border-[#B06A4F]"
                    : "bg-white text-[#667085] border-[#E5E9F0] hover:bg-[#F3F4F6]",
                  disabled && "cursor-not-allowed opacity-50"
                )}
              >
                LCL
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
