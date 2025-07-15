import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { IoIosMenu } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { cn } from "../../utils";
import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { useDisableScroll } from "../../hooks/useDisableScroll";
import { chainInfo, client } from "@/utils/configs";

const Nav_Links = [
  {
    name: "Home",
    link: "/",
  },
];

export function Nav() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

  return (
    <nav
      className={cn(
        "flex sticky top-0 inset-x-0 z-50 py-3 h-20 w-full md:px-14 px-4 gap-4 justify-between items-center font-inter",
        isScrolled ? "bg-[#0F0F0F] border-b border-sec-bg" : "bg-transparent"
      )}
    >
      <div className="lg:w-1/5 w-1/2 flex lg:items-center justify-end lg:gap-6 gap-2 ">
        <ConnectButton
          client={client}
          chain={chainInfo}
          wallets={[createWallet("io.metamask")]}
          connectButton={{
            label: "Connect Wallet",
            className:
              "!font-inter !rounded-xl lg:!w-36 !w-[75%] max-sm:!w-full !flex !items-center !justify-center hover:!bg-primary/65 hover:!text-foreground !duration-300 !ease-in-out !transition !bg-primary !text-muted-foreground !h-10",
          }}
        />
      </div>
      <div className="min-[1170px]:hidden flex items-center gap-8">
        {isMobileNavOpen ? (
          <IoClose
            size={30}
            onClick={() => setIsMobileNavOpen(false)}
            className="text-muted-foreground"
          />
        ) : (
          <IoIosMenu
            size={30}
            className="text-muted-foreground"
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
    <div className="fixed top-[64px] left-0 w-full h-screen flex flex-col items-center bg-sec-bg text-primary-foreground z-50">
      <div className="flex flex-col items-center justify-center gap-5 mt-10">
        {Nav_Links.map((item) => {
          const { name, link } = item;

          return (
            <ul key={name} className="flex">
              <li className="flex">
                <Link
                  href={link}
                  className="hover:text-button-hover font-medium text-xl text-muted-foreground"
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
