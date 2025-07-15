import React, { ReactNode } from "react";
import { ExternalToast, toast } from "sonner";
import { CustomToast } from "../component/toast/toast";

type ToastOptions = ExternalToast & {
  title?: string;
};

type PromiseFunc<T = unknown> = Promise<T> | (() => Promise<T>);

type PromiseOpts<ToastData = any> = ExternalToast & {
  loading: string | React.ReactNode;
  success:
    | string
    | React.ReactNode
    | ((data: ToastData) => React.ReactNode | string);
  error: string | React.ReactNode | ((error: any) => React.ReactNode | string);
};

export function useToast() {
  function success(message: ReactNode, opts?: ToastOptions) {
    const { title = "Success", ...data } = opts || {};

    return toast.custom(
      (t) => (
        <CustomToast
          title={title}
          description={message}
          status="success"
          close={() => toast.dismiss(t)}
        />
      ),
      data
    );
  }

  function error(message: ReactNode, opts?: ToastOptions) {
    const { title = "Error", ...data } = opts || {};
    return toast.custom(
      (t) => (
        <CustomToast
          title={title}
          description={message}
          status="error"
          close={() => toast.dismiss(t)}
        />
      ),
      data
    );
  }

  function warning(message: string, opts?: ToastOptions) {
    return toast.custom((t) => (
      <CustomToast
        title={opts?.title || "Warning"}
        description={message}
        status="warning"
        close={() => toast.dismiss(t)}
      />
    ));
  }

  function loading(message: ReactNode, opts?: ToastOptions) {
    const { title = "Loading...", ...data } = opts || {};
    return toast.custom(
      (t) => (
        <CustomToast
          title={title}
          description={message}
          status="loading"
          close={() => toast.dismiss(t)}
        />
      ),
      data
    );
  }

  function dismiss(id?: string | number) {
    return toast.dismiss(id);
  }

  function info(message: string, opts?: ToastOptions) {
    return toast.custom((t) => (
      <CustomToast
        title={opts?.title || "Info"}
        description={message}
        status="info"
        close={() => toast.dismiss(t)}
      />
    ));
  }

  function promise(promise: PromiseFunc, opts: PromiseOpts) {
    const p = promise instanceof Promise ? promise : promise();
    const id = loading(opts.loading, { duration: Infinity });
    p.then((data) => {
      const message =
        typeof opts.success === "function" ? opts.success(data) : opts.success;
      toast.custom(
        (t) => (
          <CustomToast
            title="Success"
            description={message}
            status="success"
            close={() => toast.dismiss(t)}
          />
        ),
        { id, duration: 4000 }
      );
    }).catch((error) => {
      const message =
        typeof opts.error === "function" ? opts.error(error) : opts.error;

      toast.custom(
        (t) => (
          <CustomToast
            title="Error"
            description={message}
            status="error"
            close={() => toast.dismiss(t)}
          />
        ),
        { id, duration: 4000 }
      );
    });
    return id;
  }

  return Object.assign(info, {
    success,
    error,
    warning,
    loading,
    dismiss,
    promise,
  });
}
