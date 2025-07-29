import localFont from "next/font/local";
import { StakingDashboard } from "@/modules/components";
import Head from "next/head";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function Home() {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} font-sans dark min-h-screen bg-black`}
    >
      <Head>
        <title>Stake X - Defi Staking Platform on CrossFi</title>
        <meta
          name="description"
          content="A modern staking dashboard for managing your crypto assets."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <StakingDashboard />
    </div>
  );
}
