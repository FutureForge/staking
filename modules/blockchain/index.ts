import { chainInfo, client } from "@/utils/configs";
import { ethers } from "ethers";
import {
  Hex,
  waitForReceipt,
  getContract as getContractThirdweb,
} from "thirdweb";

export const provider = new ethers.providers.JsonRpcProvider(chainInfo.rpc);

export function getContractEthers({
  contractAddress,
  abi,
}: {
  contractAddress: string;
  abi: any;
}) {
  const contract = new ethers.Contract(contractAddress, abi, provider);
  return contract;
}

export function getContractCustom({
  contractAddress,
}: {
  contractAddress: string;
}) {
  const contract = getContractThirdweb({
    client,
    chain: chainInfo,
    address: contractAddress!,
  });

  return contract;
}

export function decimalOffChain(number: bigint | string | number) {
  if (!number) return;
  const value = ethers.utils.formatEther(number);

  return value;
}

export function decimalOnChain(number: bigint | string | number) {
  if (!number) return;
  const value = ethers.utils.parseEther(number.toString());

  return value;
}

export async function waitForTransaction(txHash: string) {
  const receipt = await waitForReceipt({
    client,
    chain: chainInfo,
    transactionHash: txHash as Hex,
  });

  return receipt;
}
