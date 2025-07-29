import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { IoIosMenu } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { IoChevronDown } from "react-icons/io5";
import { IoLogOutOutline } from "react-icons/io5";
import { cn } from "../../utils";
import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { useDisableScroll } from "../../hooks/useDisableScroll";
import { chain1, client } from "@/utils/configs";
import { useUserChainInfo } from "@/modules/query";

const Nav_Links = [
  {
    name: "Home",
    link: "/",
  },
];

export function Nav() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const { account, wallet } = useUserChainInfo();

  useDisableScroll(isMobileNavOpen);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".wallet-dropdown")) {
        setIsWalletDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDisconnect = () => {
    wallet?.disconnect();
  };

  return (
    <nav
      className={cn(
        "flex sticky top-0 inset-x-0 z-50 py-4 h-24 w-full md:px-14 px-4 gap-4 justify-between items-center font-inter",
        isScrolled
          ? "bg-gradient-to-r from-purple-900/95 via-indigo-900/95 to-purple-900/95 backdrop-blur-md border-b border-purple-500/20 shadow-lg"
          : "bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-purple-900/80 backdrop-blur-sm"
      )}
    >
      {/* Left Section - Dashboard Title */}
      <div className="lg:w-1/3 w-1/2 flex items-center">
        <div className="text-white">
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent drop-shadow-lg">
            Staking Dashboard
          </h1>
          <p className="text-purple-200 text-sm lg:text-base mt-1 drop-shadow-sm hidden sm:block">
            Manage your staking positions and rewards
          </p>
        </div>
      </div>

      {/* Center Section - Navigation Links */}
      <div className="hidden min-[1170px]:flex items-center gap-8">
        {Nav_Links.map((item) => {
          const { name, link } = item;
          return (
            <ul key={name} className="flex">
              <li className="flex">
                <Link
                  href={link}
                  className="hover:text-purple-300 font-medium text-lg text-purple-200 transition-colors duration-300"
                >
                  {name}
                </Link>
              </li>
            </ul>
          );
        })}
      </div>

      {/* Right Section - Wallet Connection */}
      <div className="lg:w-1/3 w-1/2 flex items-center justify-end gap-4">
        {/* Connection Status */}
        <div className="hidden md:flex items-center space-x-3 text-right">
          {account ? (
            <div className="wallet-dropdown relative">
              <button
                onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                className="bg-green-500/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-green-500/30 hover:bg-green-500/30 transition-all duration-300 flex items-center gap-2 group"
              >
                <div className="text-right">
                  <p className="text-green-300 font-medium text-sm drop-shadow-sm">
                    {account.address?.slice(0, 6)}...
                    {account.address?.slice(-4)}
                  </p>
                  <p className="text-green-400 text-xs">Connected</p>
                </div>
                <IoChevronDown
                  size={16}
                  className={cn(
                    "text-green-400 transition-transform duration-300",
                    isWalletDropdownOpen ? "rotate-180" : ""
                  )}
                />
              </button>

              {/* Dropdown Menu */}
              {isWalletDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gradient-to-b from-purple-900/95 to-indigo-900/95 backdrop-blur-md rounded-lg border border-purple-500/30 shadow-xl z-50">
                  <div className="py-2">
                    <button
                      onClick={handleDisconnect}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-300 text-left"
                    >
                      <IoLogOutOutline size={18} />
                      <span className="font-medium">Disconnect Wallet</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-red-500/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-red-500/30">
              <p className="text-red-300 font-medium text-sm">Not Connected</p>
              <p className="text-red-400 text-xs">
                Connect your wallet to start
              </p>
            </div>
          )}
        </div>

        {/* Connect Button */}
        {!account && (
          <ConnectButton
            client={client}
            chain={chain1}
            wallets={[createWallet("io.metamask")]}
            connectButton={{
              label: "Connect Wallet",
              className:
                "!font-inter !rounded-xl lg:!w-36 !w-[75%] max-sm:!w-full !flex !items-center !justify-center hover:!bg-purple-600 hover:!text-white !duration-300 !ease-in-out !transition !bg-gradient-to-r !from-purple-600 !to-indigo-600 !text-white !h-10 !shadow-lg hover:!shadow-purple-500/25",
            }}
          />
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="min-[1170px]:hidden flex items-center gap-8">
        {isMobileNavOpen ? (
          <IoClose
            size={30}
            onClick={() => setIsMobileNavOpen(false)}
            className="text-purple-200 hover:text-white transition-colors duration-300"
          />
        ) : (
          <IoIosMenu
            size={30}
            className="text-purple-200 hover:text-white transition-colors duration-300"
            onClick={() => setIsMobileNavOpen(true)}
          />
        )}
      </div>
      {isMobileNavOpen && <MobileNav />}
    </nav>
  );
}

function MobileNav() {
  return (
    <div className="fixed top-[96px] left-0 w-full h-screen flex flex-col items-center bg-gradient-to-b from-purple-900/95 to-indigo-900/95 backdrop-blur-md text-white z-50">
      <div className="flex flex-col items-center justify-center gap-5 mt-10">
        {Nav_Links.map((item) => {
          const { name, link } = item;

          return (
            <ul key={name} className="flex">
              <li className="flex">
                <Link
                  href={link}
                  className="hover:text-purple-300 font-medium text-xl text-purple-200 transition-colors duration-300"
                >
                  {name}
                </Link>
              </li>
            </ul>
          );
        })}
      </div>
    </div>
  );
}
