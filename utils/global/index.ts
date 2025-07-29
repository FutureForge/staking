export // Helper function to get user-friendly error messages
function getErrorMessage(error: any): string {
  const errorMessage =
    error?.message || error?.toString() || "An unknown error occurred";

  // Handle common blockchain errors
  if (errorMessage.includes("insufficient funds")) {
    return "Insufficient funds for transaction. Please check your balance.";
  }

  if (errorMessage.includes("user rejected")) {
    return "Transaction was cancelled by user.";
  }

  if (errorMessage.includes("nonce too low")) {
    return "Transaction nonce is too low. Please try again.";
  }

  if (errorMessage.includes("gas required exceeds allowance")) {
    return "Insufficient gas for transaction. Please increase gas limit.";
  }

  if (errorMessage.includes("execution reverted")) {
    return "Transaction failed. Please check your input parameters.";
  }

  if (errorMessage.includes("already processed")) {
    return "This transaction has already been processed.";
  }

  if (errorMessage.includes("position not found")) {
    return "Position not found. It may have been already unstaked.";
  }

  if (errorMessage.includes("no rewards to claim")) {
    return "No rewards available to claim at this time.";
  }

  if (errorMessage.includes("position not active")) {
    return "Position is not active. It may have expired or been unstaked.";
  }

  if (errorMessage.includes("insufficient balance")) {
    return "Insufficient token balance for this operation.";
  }

  if (errorMessage.includes("duration not allowed")) {
    return "Selected duration is not allowed for this staking type.";
  }

  if (errorMessage.includes("minimum stake not met")) {
    return "Minimum stake amount not met. Please increase your stake.";
  }

  if (errorMessage.includes("maximum stake exceeded")) {
    return "Maximum stake amount exceeded. Please reduce your stake.";
  }

  // Handle network errors
  if (errorMessage.includes("network") || errorMessage.includes("connection")) {
    return "Network connection error. Please check your internet connection.";
  }

  if (errorMessage.includes("timeout")) {
    return "Request timed out. Please try again.";
  }

  // Handle wallet errors
  if (errorMessage.includes("wallet") || errorMessage.includes("account")) {
    return "Wallet connection error. Please reconnect your wallet.";
  }

  // Default case - return the original error message
  return errorMessage;
}
