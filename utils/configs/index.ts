import { createThirdwebClient, defineChain } from "thirdweb";
import { bsc, bscTestnet } from "thirdweb/chains";

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

if (!process.env.NEXT_PUBLIC_IS_TESTNET) {
  throw new Error("NEXT_PUBLIC_IS_TESTNET is not set");
}

export const IS_TESTNET = process.env.NEXT_PUBLIC_IS_TESTNET === "true";

export const testnetProviderUrlMap = [
  // "https://crossfi-testnet.g.alchemy.com/v2/LyMEMlI9ehqzPfajiDhvBXZ4MGjUQ6L-",
  "https://4157.rpc.thirdweb.com",
  "https://rpc.testnet.ms/",
  "https://rpc.xfi.ms/archive/4157",
];

export const mainnetProviderUrlMap = [
  // "https://crossfi-mainnet.g.alchemy.com/v2/LyMEMlI9ehqzPfajiDhvBXZ4MGjUQ6L-",
  "https://rpc.mainnet.ms/",
  "https://4158.rpc.thirdweb.com",
];

export const chain1Testnet = defineChain({
  id: 4157,
  name: "CrossFi Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "XFI",
    symbol: "XFI",
  },
  rpcUrls: {
    default: {
      http: testnetProviderUrlMap,
    },
  },
  testnet: true,
  blockExplorers: [
    { name: "Testnet Explorer", url: "https://test.xfiscan.com/" },
  ],
});

export const chain1Mainnet = defineChain({
  id: 4158,
  name: "CrossFi Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "XFI",
    symbol: "XFI",
  },
  rpcUrls: {
    default: {
      http: mainnetProviderUrlMap,
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://xfiscan.com/" },
  },
});

export const chain1TestnetStakingContract =
  "0x1155e6977930b8C8439413e223b743Ec714D91EA";
export const chain1MainnetStakingContract =
  "0x0CB5A8584C40B88eB3Ab132afFF7CD77fe3FC7FF";

// export const chain1TestnetStakingTokenNativeContract =
//   "0xf8fF45BCB66874F10E04834820c283d715d93a83";
// export const chain1MainnetStakingTokenNativeContract = "";

// export const chain1TestnetStakingTokenERC20Contract =
//   "0x86A6c0763f7F32500e5Dc10bFaa78Cc3300F8831";
// export const chain1MainnetStakingTokenERC20Contract = "";

export const chain1USDTContract = "0x85c197De0dA144ABd8F46842734Ff770c5E9B911";

// export const chain2TestnetBetContract =
//   "0x08B38ef85FEBd41F7c05B5dbB6C02CAEc7650E9B";
// export const chain2MainnetBetContract = "";

// export const chain2Testnet = bscTestnet;
// export const chain2Mainnet = bsc;

export const chain1 = IS_TESTNET ? chain1Testnet : chain1Mainnet;
// export const chain2 = IS_TESTNET ? chain2Testnet : chain2Mainnet;

export const chain1StakingContract = IS_TESTNET
  ? chain1TestnetStakingContract
  : chain1MainnetStakingContract;

// export const chain1StakingTokenNativeContract = IS_TESTNET
//   ? chain1TestnetStakingTokenNativeContract
//   : chain1MainnetStakingTokenNativeContract;

// export const chain1StakingTokenERC20Contract = IS_TESTNET
//   ? chain1TestnetStakingTokenERC20Contract
// : chain1MainnetStakingTokenERC20Contract;

// export const chain2Contract = IS_TESTNET
//   ? chain2TestnetBetContract
//   : chain2MainnetBetContract;
