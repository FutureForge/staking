import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { useToast } from "../app/hooks/useToast";
import { getErrorMessage } from "@/utils/global";

type QueryProviderProps = {
  children: ReactNode;
};

type MutationContext = {
  loadingToastId?: string | number;
};

export function QueryProvider({ children }: QueryProviderProps) {
  const toast = useToast();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 0 } },
        mutationCache: new MutationCache({
          onMutate: (variables, mutation): MutationContext => {
            console.log("query provider onMutate called");

            const loadingMessage = mutation?.meta?.loadingMessage as {
              title?: string;
              description: string;
            };

            let loadingToastId: string | number;

            if (loadingMessage) {
              loadingToastId = toast.loading(loadingMessage.description, {
                title: loadingMessage.title || "Processing...",
                duration: Infinity,
              });
            } else {
              loadingToastId = toast.loading("Processing transaction...", {
                title: "Processing",
                duration: Infinity,
              });
            }

            // Store the loading toast ID in the mutation context
            return { loadingToastId };
          },
          onSuccess: (_data, _variables, context, mutation) => {
            console.log(
              "query provider success",
              _data,
              _variables,
              context,
              mutation
            );

            // Dismiss the loading toast
            const mutationContext = context as MutationContext;
            if (mutationContext?.loadingToastId) {
              toast.dismiss(mutationContext.loadingToastId);
            }

            const successMessage = mutation?.meta?.successMessage as {
              title?: string;
              description: string;
            };

            if (successMessage) {
              toast.success(successMessage.description, {
                title: successMessage.title || "Success",
                duration: 5000,
              });
            } else {
              toast.success("Transaction was successful", {
                title: "Success",
                duration: 5000,
              });
            }
          },
          onError: (error, _variables, context, mutation) => {
            console.log("query provider error: ", error);

            // Dismiss the loading toast
            const mutationContext = context as MutationContext;
            if (mutationContext?.loadingToastId) {
              toast.dismiss(mutationContext.loadingToastId);
            }

            const errorMessage = mutation?.meta?.errorMessage as {
              title?: string;
              description: string;
            };

            // Get dynamic error message
            const dynamicErrorMessage = getErrorMessage(error);

            let finalErrorMessage = dynamicErrorMessage;

            if (errorMessage) {
              finalErrorMessage = errorMessage.description;
              // Append dynamic error details if they provide more context
              if (
                dynamicErrorMessage !== errorMessage.description &&
                !errorMessage.description.includes(dynamicErrorMessage)
              ) {
                finalErrorMessage += `: ${dynamicErrorMessage}`;
              }
            }

            toast.error(finalErrorMessage, {
              title: errorMessage?.title || "Error",
              duration: 5000,
            });
          },
        }),
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
