"use client";

import { FC, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserCircle2,
  Calendar,
  MessageCircle,
  Star,
  Wallet,
  Menu,
  X
} from "lucide-react";

interface AstrologerSidebarProps {
  approvalStatus?: 'verified' | 'pending' | 'rejected';
}

const AstrologerSidebar: FC<AstrologerSidebarProps> = ({ approvalStatus = 'verified' }) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const menuItems = [
    { icon: UserCircle2, label: "Manage Profile", href: "/astrologer/profile" },
    { icon: Calendar, label: "Online Status", href: "/astrologer/availability" },
    { icon: MessageCircle, label: "Start Consultations", href: "/astrologer/consultations" },
    { icon: Star, label: "View Ratings/Reviews", href: "/astrologer/reviews" },
    { icon: Wallet, label: "Withdraw Earnings", href: "/astrologer/withdraw" },
  ];

  // Filter menu items based on approval status
  const getFilteredMenuItems = () => {
    if (approvalStatus === 'verified') {
      return menuItems;
    } else {
      // Only show profile page for pending/rejected status
      return menuItems.filter(item => item.href === "/astrologer/profile");
    }
  };

  const filteredMenuItems = getFilteredMenuItems();

  // Sidebar content for reuse
  const sidebarContent = (
    <div className="h-full w-64 bg-amber-new dark:bg-black shadow-lg flex flex-col border-r border-gray-200 dark:border-gray-700">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Nakshatra Gyaan</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Astrologer Panel</p>
        </div>
        {/* Close button for mobile */}
        <button className="md:hidden p-2 ml-2" onClick={() => setOpen(false)} aria-label="Close sidebar">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-2">
          {filteredMenuItems.map((item) => {
            const isDisabled = approvalStatus !== 'verified' && item.href !== "/astrologer/profile";
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? "bg-amber-100 dark:bg-purple-900 text-amber-700 dark:text-purple-200"
                    : isDisabled
                    ? "text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
                    : "text-gray-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-purple-900"
                }`}
                onClick={() => setOpen(false)}
                style={{ pointerEvents: isDisabled ? 'none' : 'auto' }}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isDisabled && (
                  <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                    Locked
                  </span>
                )}
              </Link>
            );
          })}
        </div>
        
        {/* Status Notice for non-verified users */}
        {approvalStatus !== 'verified' && (
          <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              Complete your profile verification to access all features.
            </p>
          </div>
        )}
      </nav>
    </div>
  );

  return (
    <>
      {/* Hamburger for mobile */}
      <button
        className="fixed top-3 left-4 z-40 md:hidden p-2 bg-white dark:bg-gray-800 rounded shadow"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar for desktop */}
      <div className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:block z-30">
        {sidebarContent}
      </div>

      {/* Overlay sidebar for mobile with smooth transition */}
      <div className={`fixed inset-0 z-50 flex md:hidden pointer-events-none`} style={{ transition: 'background 0.3s' }}>
        {/* Overlay background */}
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setOpen(false)}
        />
        {/* Sidebar drawer */}
        <div
          className={`relative z-50 h-full w-64 transition-all duration-300 transform bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700
            ${open ? 'translate-x-0' : '-translate-x-full'}
          `}
          style={{ willChange: 'transform' }}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
};

export default AstrologerSidebar;