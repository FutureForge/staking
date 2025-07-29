import React, { ReactNode } from "react";
import { cn } from "../../utils";

type CustomToastProps = {
  title: string;
  description: ReactNode;
  actions?: React.ReactNode;
  close: () => void;
  status: "success" | "error" | "warning" | "info" | "loading";
  isSucess?: boolean;
  isError?: boolean;
};

export const CustomToast = ({
  title,
  description,
  actions,
  status,
  close,
}: CustomToastProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return (
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case "warning":
        return (
          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case "info":
        return (
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case "loading":
        return (
          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusColors = () => {
    switch (status) {
      case "success":
        return "border-green-500/20 bg-green-500/10";
      case "error":
        return "border-red-500/20 bg-red-500/10";
      case "warning":
        return "border-yellow-500/20 bg-yellow-500/10";
      case "info":
        return "border-blue-500/20 bg-blue-500/10";
      case "loading":
        return "border-purple-500/20 bg-purple-500/10";
      default:
        return "border-white/10 bg-white/5";
    }
  };

  return (
    <div className={cn(
      "relative backdrop-blur-sm rounded-xl flex p-4 border max-w-[400px] shadow-lg",
      getStatusColors()
    )}>
      <div className="flex items-start space-x-3 flex-1">
        {getStatusIcon()}
        
        <div className="flex-1 min-w-0">
          <h3 className={cn("text-sm font-semibold text-white mb-1", {
            "text-green-400": status === "success",
            "text-red-400": status === "error",
            "text-yellow-400": status === "warning",
            "text-blue-400": status === "info",
            "text-purple-400": status === "loading",
          })}>
            {title}
          </h3>
          {description && (
            <p className="text-sm text-white/80 leading-relaxed">
              {description}
            </p>
          )}
          {actions && (
            <div className="mt-3">
              {actions}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={close}
        className="ml-3 p-1 hover:bg-white/10 rounded-md transition-colors duration-150 text-white/60 hover:text-white"
        aria-label="Close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
};
