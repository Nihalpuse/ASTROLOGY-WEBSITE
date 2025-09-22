'use client';

import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRoutePrefetch } from '../../hooks/useRoutePrefetch';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import RouteLoadingIndicator from './components/RouteLoadingIndicator';
import { 
  Home, 
  Users, 
  BookOpen,
  MessageCircle, 
  Star, 
  Settings, 
  LogOut,
  Package,
  Search,
  Moon,
  Sun,
  Bell,
  UserCircle2,
  Orbit,
  ChevronDown,
  ChevronUp,
  X,
  LucideIcon,
  Menu
} from 'lucide-react';

// Type definitions
interface NavChild {
  label: string;
  href: string;
  active: boolean;
}

interface NavItem {
  icon: LucideIcon;
  label: string;
  href?: string;
  active: boolean;
  children?: NavChild[];
  expanded?: boolean;
}

// Memoized Navigation Link Component
const NavigationLink = memo(({ item, onClick }: { item: NavItem; onClick?: () => void }) => (
  <Link 
    href={item.href!}
    prefetch={true} // Enable prefetching for better performance
  onClick={onClick}
  className={`
      flex items-center space-x-3 p-2 rounded-lg transition-colors
      ${item.active 
        ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200' 
        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
      }
    `}
  >
    <item.icon className="w-5 h-5" />
    <span className="text-sm font-medium">{item.label}</span>
  </Link>
));

NavigationLink.displayName = 'NavigationLink';

// Memoized Products Dropdown Component
const ProductsDropdown = memo(({ 
  item, 
  isOpen, 
  onToggle,
  childOnClick,
}: { 
  item: NavItem; 
  isOpen: boolean; 
  onToggle: () => void; 
  childOnClick?: () => void;
}) => {
  const isAnyChildActive = item.children?.some((child: NavChild) => child.active);
  
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center justify-between w-full space-x-3 p-2 rounded-lg transition-colors cursor-pointer focus:outline-none
          ${isAnyChildActive
            ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
        `}
      >
        <span className="flex items-center space-x-3">
          <item.icon className="w-5 h-5" />
          <span className="text-sm font-medium">{item.label}</span>
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      {isOpen && (
        <div className="ml-8 mt-1 space-y-1">
          {item.children?.map((child: NavChild) => (
            <Link
              key={child.href}
              href={child.href}
              prefetch={true} // Enable prefetching
              onClick={childOnClick}
              className={`flex items-center space-x-2 p-2 rounded-lg transition-colors
                ${child.active
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
              `}
            >
              <span className="text-sm font-medium">{child.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
});

ProductsDropdown.displayName = 'ProductsDropdown';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  // When true, sidebar opens and focuses the search input
  const [mobileSearchFocusRequested, setMobileSearchFocusRequested] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { prefetchAdminRoutes } = useRoutePrefetch();
  const { measureRender } = usePerformanceMonitor();
  
  // Check if current path is login page
  const isLoginPage = pathname === '/admin/login';

  // Effect to apply dark mode and persist preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    
    // Check for saved theme preference or system preference
    if (savedTheme === 'dark' || 
        (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    // Prefetch admin routes for better performance
    if (!isLoginPage) {
      prefetchAdminRoutes();
    }
  }, [isLoginPage, prefetchAdminRoutes]);

  // Toggle dark mode with memoization
  const toggleDarkMode = useCallback(() => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Optimized DOM manipulation using requestAnimationFrame
    requestAnimationFrame(() => {
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    });
  }, [isDarkMode]);

  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);
  const toggleMobileSidebar = useCallback(() => setMobileSidebarOpen(v => !v), []);

  // Focus search input when sidebar opens due to search button
  useEffect(() => {
    if (mobileSidebarOpen && mobileSearchFocusRequested) {
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
      setMobileSearchFocusRequested(false);
    }
  }, [mobileSidebarOpen, mobileSearchFocusRequested]);

  // Logout function with performance optimization
  const handleLogout = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Use router.replace for better performance
        router.replace('/admin/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [router]);

  // Optimized dropdown toggle with useCallback
  const toggleProductsDropdown = useCallback(() => {
    setProductsDropdownOpen(prev => !prev);
  }, []);

  // Memoized navigation items for better performance
  const navItems = useMemo(() => [
    { 
      icon: Home, 
      label: 'Dashboard', 
      href: '/admin/dashboard',
      active: pathname === '/admin/dashboard'
    },
    { 
      icon: Users, 
      label: 'Clients', 
      href: '/admin/clients',
      active: pathname === '/admin/clients'
    },
    { 
      icon: Orbit, 
      label: 'Astrologers', 
      href: '/admin/astrologers',
      active: pathname === '/admin/astrologers'
    },
    { 
      icon: BookOpen, 
      label: 'Courses', 
      href: '/admin/courses',
      active: pathname === '/admin/courses'
    },
      {
        icon: Package,
        label: 'Inventory',
        href: '/admin/inventory',
        active: pathname === '/admin/inventory'
      },
      {
        icon: Package,
        label: 'Orders',
        href: '/admin/orders',
        active: pathname === '/admin/orders'
      },
    {
      icon: Package,
      label: 'Products',
      // No href for parent
      children: [
        {
          label: 'Zodiac Sign',
          href: '/admin/products/zodiac-sign',
          active: pathname === '/admin/products/zodiac-sign',
        },
        {
          label: 'Categories',
          href: '/admin/products/categories',
          active: pathname === '/admin/products/categories',
        },
        {
          label: 'Attributes',
          href: '/admin/products/attributes',
          active: pathname === '/admin/products/attributes',
        },
        {
          label: 'Product Creation',
          href: '/admin/products/create',
          active: pathname === '/admin/products/create',
        },
      ],
      // Expanded if any child is active
      expanded: ['/admin/products/zodiac-sign', '/admin/products/categories', '/admin/products/attributes', '/admin/products/create'].includes(pathname || ''),
      active: ['/admin/products/zodiac-sign', '/admin/products/categories', '/admin/products/attributes', '/admin/products/create'].includes(pathname || ''),
    },
    
    { 
      icon: MessageCircle, 
      label: 'Services', 
      href: '/admin/services',
      active: pathname === '/admin/services'
    },
    { 
      icon: Star, 
      label: 'Reviews', 
      href: '/admin/reviews',
      active: pathname === '/admin/reviews'
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      href: '/admin/settings',
      active: pathname === '/admin/settings'
    }
  ], [pathname]);

  // If login page, only render children without layout
  if (isLoginPage) {
    return (
      <div className="h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {children}
      </div>
    );
  }

  // Regular admin layout for all other admin pages
  return (
    <div>
      <RouteLoadingIndicator />
      <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Sidebar */}
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nakshatra Gyaan</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Admin Portal</p>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            // Products dropdown
            if (item.label === 'Products' && item.children) {
              const isOpen = productsDropdownOpen || item.expanded;
              return (
                <ProductsDropdown
                  key="products-dropdown"
                  item={item}
                  isOpen={isOpen}
                  onToggle={toggleProductsDropdown}
                />
              );
            }
            // Regular nav item
            return item.href ? (
              <NavigationLink key={item.href} item={item} />
            ) : (
              <div
                key={item.label}
                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors cursor-default
                  ${item.active
                    ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            );
          })}
        </nav>
        </div>

        {/* Mobile sidebar - overlay + slide-in panel */}
        <div aria-hidden={!mobileSidebarOpen} className={`lg:hidden`}> 
          {/* Overlay */}
          <div
            onClick={closeMobileSidebar}
            className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity ${mobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} z-40`}
          />

          {/* Panel */}
          <aside className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg transform transition-transform ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} z-50`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nakshatra Gyaan</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Admin Portal</p>
                </div>
                <button onClick={closeMobileSidebar} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close sidebar">
                  <X className="text-gray-600 dark:text-gray-300" size={18} />
                </button>
              </div>

              {/* Mobile search inside sidebar */}
              <div className="flex items-center space-x-2 px-1">
                <Search className="text-gray-400 dark:text-gray-500" size={18} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  className="w-full text-sm focus:outline-none bg-transparent text-gray-900 dark:text-gray-100"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setMobileSidebarOpen(false);
                    }
                  }}
                />
              </div>
            </div>

            <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
              {navItems.map((item) => {
                // Products dropdown for mobile with childOnClick to close panel
                if (item.label === 'Products' && item.children) {
                  const isOpen = productsDropdownOpen || item.expanded;
                  return (
                    <ProductsDropdown
                      key="products-dropdown-mobile"
                      item={item}
                      isOpen={isOpen}
                      onToggle={toggleProductsDropdown}
                      childOnClick={closeMobileSidebar}
                    />
                  );
                }

                return item.href ? (
                  <NavigationLink key={item.href} item={item} onClick={closeMobileSidebar} />
                ) : (
                  <div
                    key={item.label}
                    className={`flex items-center space-x-3 p-2 rounded-lg transition-colors cursor-default
                      ${item.active
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                );
              })}
            </nav>
          </aside>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
  {/* Bagisto-style Header */}
  <header className="relative bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 py-2 flex items-center justify-between">
          {/* Left side - Mega Search */}
    <div className="flex items-center gap-2 flex-1 lg:w-1/3">
            {/* Mobile menu toggle - visible on small screens */}
            <button
        onClick={toggleMobileSidebar}
        className="lg:hidden mr-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle sidebar"
            >
              <Menu className="text-gray-600 dark:text-gray-300" size={20} />
            </button>
                  {/* Search: show icon on mobile (toggles overlay), full input on lg+ */}
                  {/* mobile search icon removed — search now lives inside the sidebar */}

                  <Search className="hidden lg:inline-block text-gray-400 dark:text-gray-500 mr-2" size={20} />
                  <input 
                    type="text" 
                    placeholder="Mega Search" 
                    className="hidden lg:block lg:max-w-xs w-full text-sm focus:outline-none bg-transparent text-gray-900 dark:text-gray-100"
                  />

                  {/* Mobile search now lives inside the sidebar (opens sidebar and focuses input) */}
          </div>

          {/* Right side - Icons and User */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full"
            >
              {isDarkMode ? (
                <Sun className="text-gray-600 dark:text-gray-300" size={20} />
              ) : (
                <Moon className="text-gray-600" size={20} />
              )}
            </button>

            {/* Notifications */}
            <button className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full relative">
              <Bell className="text-gray-600 dark:text-gray-300" size={20} />
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1 text-xs">
                2
              </span>
            </button>

            {/* Grid/Apps */}
            {/* Grid/Apps button removed (no behavior implemented) */}

            {/* User Profile and Logout */}
            <div className="flex items-center space-x-2">
              <UserCircle2 className="text-gray-600 dark:text-gray-300" size={30} />
              <div className="mr-1 lg:mr-2">
                <p className="text-sm font-medium">Hi | Example</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
              </div>
              
              {/* Updated Logout Button */}
              <button
                onClick={handleLogout}
                aria-label="Logout"
                className="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors flex items-center justify-center"
              >
                <LogOut className="w-4 h-4 lg:mr-1" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
  <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          {children}
        </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;