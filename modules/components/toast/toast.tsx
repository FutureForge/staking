import { Toaster } from "sonner";
import * as Portal from "@radix-ui/react-portal";

export default function Toast() {
  return (
    <Portal.Root>
      <Toaster
        className="pointer-events-auto"
        visibleToasts={5}
        position="top-right"
        gap={14}
        toastOptions={{
          style: {
            fontSize: '14px',
            padding: '12px 16px',
            borderRadius: '8px',
            maxWidth: '90vw',
            wordBreak: 'break-word',
          },
        }}
      />
    </Portal.Root>
  );
}
