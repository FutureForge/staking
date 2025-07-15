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
      />
    </Portal.Root>
  );
}
