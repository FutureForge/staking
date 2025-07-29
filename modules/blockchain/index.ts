import { chain1, chain1StakingContract, client } from "@/utils/configs";
import { ethers } from "ethers";
import {
  Hex,
  waitForReceipt,
  getContract as getContractThirdweb,
  Chain,
} from "thirdweb";
import StakingContract from "./abi/staking.json";
import StakingTokenContract from "./abi/staking-token.json";

export enum Chains {
  CROSSFI = "crossfi",
}

export const chains: {
  id: number;
  chain: Chains;
}[] = [{ id: 4157, chain: Chains.CROSSFI }];

export const providerChain1 = new ethers.JsonRpcProvider(chain1.rpc);

export function getChain(chainId: number) {
  return chains.find((chain) => chain.id === chainId);
}

export function getChainInfoById(chainId: number) {
  const chainEntry = chains.find((chain) => chain.id === chainId);

  if (!chainEntry) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  if (chainEntry.chain === Chains.CROSSFI) {
    return chain1;
  }

  throw new Error(`Unsupported chain: ${chainEntry.chain}`);
}

export function getContract({ type }: { type: "staking" | "staking-token" }) {
  const contractAddress =
    type === "staking"
      ? chain1StakingContract
      : type === "staking-token"
      ? chain1StakingContract
      : null;

  if (!contractAddress) {
    throw new Error(`Unsupported contract type: ${type}`);
  }

  const chainABI =
    type === "staking"
      ? StakingContract
      : type === "staking-token"
      ? StakingTokenContract
      : null;

  if (!chainABI) {
    throw new Error(`Unsupported contract ABI for type: ${type}`);
  }

  const contract = getContractCustom({
    contractAddress,
    chain: chain1,
    abi: chainABI,
  });

  return contract;
}

export function getContractEthers({
  contractAddress,
  abi,
}: {
  contractAddress: string;
  abi: any;
}) {
  const contract = new ethers.Contract(contractAddress, abi, providerChain1);
  return contract;
}

export function getContractCustom({
  contractAddress,
  chain,
  abi,
}: {
  contractAddress: string;
  chain: Chain;
  abi: any;
}) {
  if (abi) {
    return getContractThirdweb({
      client,
      chain,
      address: contractAddress,
      abi: abi,
    });
  }

  return getContractThirdweb({
    client,
    chain,
    address: contractAddress,
    abi: abi,
  });
}

export function decimalOffChain(number: bigint | string | number) {
  if (!number) return;
  const value = ethers.formatEther(number);

  return value;
}

export function decimalOnChain(number: bigint | string | number) {
  if (!number) return;
  const value = ethers.parseEther(number.toString());

  return value;
}

export async function waitForTransaction(txHash: string, chain: Chain) {
  const receipt = await waitForReceipt({
    client,
    chain,
    transactionHash: txHash as Hex,
  });

  return receipt;
}
