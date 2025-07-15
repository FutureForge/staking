import { createThirdwebClient, defineChain } from "thirdweb";
import { bscTestnet } from "thirdweb/chains";

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

export const chainInfo = bscTestnet;
