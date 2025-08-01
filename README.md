# STAKEX - DeFi Staking Platform

A modern, feature-rich DeFi staking platform built on CrossFi blockchain that allows users to stake both native XFI tokens and ERC20 tokens (USDT) to earn rewards.

## 🚀 Key Features

### **Dual Token Staking**
- **Native XFI Staking**: Stake your XFI tokens to earn native rewards
- **ERC20 USDT Staking**: Stake USDT tokens to earn USDT rewards
- **Flexible Staking Options**: Choose between different staking periods and reward structures

### **Real-time Dashboard**
- **Live Statistics**: View total staked amounts, reward rates, and epoch information
- **User Portfolio**: Track your staking positions, pending rewards, and performance
- **Epoch Management**: Monitor current epoch status and reward distribution cycles

### **Advanced Features**
- **Reward Claiming**: Claim earned rewards for both token types
- **Position Management**: View and manage your active staking positions
- **Fee Tracking**: Monitor accrued fees and platform statistics
- **Emergency Withdraw**: Access emergency withdrawal functionality when needed

### **User Experience**
- **Modern UI**: Beautiful, responsive interface with dark theme
- **Real-time Updates**: Live data updates using React Query
- **Wallet Integration**: Seamless wallet connection with thirdweb
- **Toast Notifications**: User-friendly feedback for all transactions

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Blockchain**: CrossFi Network (Testnet/Mainnet)
- **Web3**: thirdweb SDK, ethers.js
- **State Management**: Zustand, React Query
- **UI Components**: Radix UI, Lucide React icons
- **Notifications**: Sonner toast system

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- MetaMask or compatible Web3 wallet

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd defi-staking-v2
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with the following variables:
   ```env
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
   NEXT_PUBLIC_IS_TESTNET=true
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Network Configuration
The app supports both CrossFi Testnet and Mainnet:

- **Testnet**: Chain ID 4157 (default for development)
- **Mainnet**: Chain ID 4158 (for production)

### Environment Variables
- `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`: Your thirdweb client ID
- `NEXT_PUBLIC_IS_TESTNET`: Set to "true" for testnet, "false" for mainnet

## 📱 Usage Guide

### Getting Started
1. **Connect Wallet**: Click "Connect Wallet" to link your Web3 wallet
2. **Switch Network**: Ensure you're connected to CrossFi network
3. **View Dashboard**: Explore the main dashboard with platform statistics

### Staking Process
1. **Choose Token Type**: Select between XFI (native) or USDT (ERC20) staking
2. **Enter Amount**: Specify the amount you want to stake
3. **Review Terms**: Check staking period and reward rates
4. **Confirm Transaction**: Approve the transaction in your wallet
5. **Monitor Position**: Track your staking position in the user profile

### Claiming Rewards
1. **Check Pending Rewards**: View available rewards in your profile
2. **Select Token Type**: Choose which rewards to claim (XFI or USDT)
3. **Confirm Claim**: Approve the claim transaction
4. **Receive Rewards**: Rewards will be sent to your wallet

### Managing Positions
- **View Active Stakes**: See all your current staking positions
- **Unstake Tokens**: Withdraw your staked tokens (subject to lock periods)
- **Track Performance**: Monitor your staking performance over time

## 🏗️ Project Structure

```
defi-staking-v2/
├── modules/
│   ├── app/           # App-level components and hooks
│   ├── blockchain/    # Smart contract ABIs and configurations
│   ├── components/    # Reusable UI components
│   ├── mutation/      # React Query mutations for transactions
│   ├── provider/      # Context providers
│   ├── query/         # React Query hooks for data fetching
│   └── utils/         # Utility functions and configurations
├── pages/             # Next.js pages
├── public/            # Static assets
└── styles/            # Global styles
```

## 🔒 Security Features

- **Smart Contract Integration**: Secure interaction with audited smart contracts
- **Transaction Validation**: Comprehensive input validation and error handling
- **Wallet Security**: No private key storage, all transactions signed by user wallet
- **Network Validation**: Automatic network detection and switching

## 🚀 Deployment

### Build for Production
```bash
pnpm build
pnpm start
```

### Environment Setup for Production
1. Set `NEXT_PUBLIC_IS_TESTNET=false` for mainnet
2. Ensure all environment variables are properly configured
3. Deploy to your preferred hosting platform (Vercel, Netlify, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation in the codebase
- Review the component structure for implementation details
- Ensure your wallet is connected to the correct CrossFi network

---

**Note**: This is a DeFi application. Always verify transaction details before confirming, and never share your private keys or seed phrases.
