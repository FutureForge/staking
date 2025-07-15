import { useEffect } from "react";

export function useDisableScroll(condition: boolean) {
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;

    if (condition) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalStyle;
    }

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [condition]);
}
