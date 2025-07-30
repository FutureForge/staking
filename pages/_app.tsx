import { QueryProvider } from "@/modules/provider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThirdwebProvider } from "thirdweb/react";
import { Inter } from "next/font/google";
import { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import { RootLayout } from "@/modules/app/layout";
import { ErrorBoundary } from "@/modules/components/ErrorBoundary";

type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--inter",
});

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout =
    Component.getLayout ?? ((page) => <RootLayout>{page}</RootLayout>);

  return (
    <ErrorBoundary>
      <ThirdwebProvider>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            :root {
              --font-inter: ${inter.style.fontFamily};
              --font-inter: ${inter.style.fontFamily};
              }`,
          }}
        />
        <QueryProvider>{getLayout(<Component {...pageProps} />)}</QueryProvider>
      </ThirdwebProvider>
    </ErrorBoundary>
  );
}
