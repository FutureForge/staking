import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { Nav } from "../component/nav";

type RootLayoutProps = {
  children: ReactNode;
  scrollToTop?: boolean;
};

const Toast = dynamic(() => import("@/modules/components/toast/toast"), {
  ssr: false,
});
export const RootLayout = ({ children, scrollToTop }: RootLayoutProps) => {
  return (
    <div className="flex isolate flex-col h-screen relative bg-background max-w-[1440px] mx-auto">
      <Nav />
      <div
        className="w-full z-10 font-inter flex-1"
        ref={(node) => {
          if (node && scrollToTop) {
            node.scroll(0, 0);
          }
        }}
      >
        {children}
        <Toast />
      </div>
    </div>
  );
};
