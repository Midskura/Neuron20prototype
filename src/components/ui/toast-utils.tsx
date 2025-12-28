import { toast as sonnerToast } from "sonner@2.0.3";
import { Check, AlertTriangle, Info, AlertCircle } from "lucide-react";

// Custom toast with icons matching JJB Group design
export const toast = {
  success: (message: string, description?: string) => {
    return sonnerToast.success(message, {
      description,
      icon: <Check size={16} />,
    });
  },
  error: (message: string, description?: string) => {
    return sonnerToast.error(message, {
      description,
      icon: <AlertTriangle size={16} />,
    });
  },
  info: (message: string, description?: string) => {
    return sonnerToast.info(message, {
      description,
      icon: <Info size={16} />,
    });
  },
  warning: (message: string, description?: string) => {
    return sonnerToast.warning(message, {
      description,
      icon: <AlertCircle size={16} />,
    });
  },
};
