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
  return (
    <div className="relative bg-background shadow-elements rounded-xl flex p-4 border border-dialog-border max-w-[356px]">
      <div className="flex flex-col gap-0.5 items-start justify-center">
        <h1
          className={cn("sub-heading select-none font-medium font-sans", {
            "text-red-500": status === "error",
            "text-green-500": status === "success",
            "text-yellow-500": status === "warning",
            "text-foreground": status === "info",
            "text-muted-foreground": status === "loading",
          })}
        >
          {title}
        </h1>
        {description && (
          <p className="text-new-muted-foreground text-sm font-sans select-none">
            {description}
          </p>
        )}
        {actions}
      </div>

      <button
        onClick={close}
        className="absolute size-6 p-1 hover:bg-new-elements hover:text-new-foreground duration-150 ease-out text-new-muted-foreground right-3 top-3"
        aria-label="Close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          viewBox="0 0 18 18"
        >
          <g
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <line x1="14" y1="4" x2="4" y2="14"></line>
            <line x1="4" y1="4" x2="14" y2="14"></line>
          </g>
        </svg>
      </button>
    </div>
  );
};
