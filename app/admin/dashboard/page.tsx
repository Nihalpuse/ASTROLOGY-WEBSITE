'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, AreaChart, Area, ComposedChart
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, Package, Star, DollarSign, 
  ShoppingCart, UserCheck, Activity, MapPin, Calendar, Eye
} from 'lucide-react';

// Import data from data files
import { products } from '../../../data/products.js';
import { services } from '../../../data/services.js';

// Types for API responses
interface DashboardMetrics {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalServices: number;
  totalAstrologers: number;
}

interface MonthlyRevenueData {
  month: string;
  revenue: number;
  orders: number;
  year: number;
}

interface WeeklyRevenueData {
  week: string;
  revenue: number;
  orders: number;
  date: string;
}

interface TopService {
  id: number;
  name: string;
  image: string;
  review: number;
  bookings: number;
  revenue: number;
}

interface TopProduct {
  id: number;
  name: string;
  image: string;
  review: number;
  sold: number;
  profit: number;
}

interface TopAstrologer {
  id: number;
  name: string;
  image: string;
  review: number;
  consultations: number;
  revenue: number;
}

interface RevenueBreakdownItem {
  name: string;
  value: number;
  color: string;
}

interface RevenueBreakdownData {
  breakdown: RevenueBreakdownItem[];
  totalRevenue: number;
  avgOrderValue: number;
  topSegment: RevenueBreakdownItem;
  breakdownShare: number;
  contributors: {
    name: string;
    image: string;
    type: string;
    revenue: number;
  }[];
}

// Currency formatting
const formatCurrency = (value: string | number) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
  return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
};

const formatNumber = (value: number) => value ? String(value) : '0';

// --- DASHBOARD DATA WITH REAL PRODUCT/SERVICE INTEGRATION ---
const initialDashboardData = {
  // Main Metrics - will be updated from API
  totalRevenue: 0,
  totalProducts: 0,
  totalServices: 0,
  totalOrders: 0,
  totalUsers: 0,
  totalAstrologers: 0,
  
  // Revenue breakdown - now calculated from real data
  productRevenue: 0,
  serviceRevenue: 0,
  astrologerRevenue: 0,
  
  // Growth percentages
  revenueGrowth: 12.5,
  productGrowth: 8.3,
  serviceGrowth: 15.2,
  orderGrowth: -3.5,
  userGrowth: 7.2,
  astrologerGrowth: 6.7,
  
  // Monthly Revenue Data - will be updated from API
  monthlyRevenue: [] as MonthlyRevenueData[],
  
  // Weekly Revenue Data - will be updated from API
  weeklyRevenue: [] as WeeklyRevenueData[],
  
  // Top Products - will be updated from API
  topProducts: [] as TopProduct[],
  
  // Top Services - will be updated from API
  topServices: [] as TopService[],
  
  // Top Astrologers - will be updated from API
  topAstrologers: [] as TopAstrologer[],
  
  // Revenue Breakdown - will be updated from API
  revenueBreakdown: {
    breakdown: [] as RevenueBreakdownItem[],
    totalRevenue: 0,
    avgOrderValue: 0,
    topSegment: { name: 'Products', value: 0, color: '#3b82f6' },
    breakdownShare: 0,
    contributors: [] as { name: string; image: string; type: string; revenue: number; }[]
  },
  
  // User Statistics
  userStats: {
    male: 942,
    female: 2452,
    totalActive: 2890,
    newUsers: 25,
    returningUsers: 75
  },
  
  // Astrologer Statistics
  astrologerStats: {
    active: 12,
    inactive: 3,
    totalConsultations: 1240,
    averageRating: 4.7
  },
  
  // Geographic Distribution with coordinates
  geographicData: [
    { 
      region: 'Asia', 
      percentage: 45, 
      color: '#3B82F6',
      coordinates: [77.2090, 28.6139], // Delhi, India
      users: 1527
    },
    { 
      region: 'America', 
      percentage: 30, 
      color: '#10B981',
      coordinates: [-95.7129, 37.0902], // USA center
      users: 1018
    },
    { 
      region: 'Europe', 
      percentage: 15, 
      color: '#8B5CF6',
      coordinates: [10.4515, 51.1657], // Germany center
      users: 509
    },
    { 
      region: 'Others', 
      percentage: 10, 
      color: '#F59E0B',
      coordinates: [133.7751, -25.2744], // Australia center
      users: 340
    }
  ]
};

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly'>('monthly');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [monthRange, setMonthRange] = useState<number>(12); // months shown when monthly selected (1,3,6,12)
  const [dashboardData, setDashboardData] = useState(initialDashboardData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salesLoading, setSalesLoading] = useState(false);
  const [revenueGrowth, setRevenueGrowth] = useState(0);

  // Fetch sales revenue data
  const fetchSalesData = async (timeRange: 'weekly' | 'monthly', months: number = 12) => {
    try {
      setSalesLoading(true);
      
      const metric = timeRange === 'monthly' ? 'monthly-revenue' : 'weekly-revenue';
      const params = timeRange === 'monthly' ? `?metric=${metric}&months=${months}` : `?metric=${metric}&weeks=8`;
      
      const response = await fetch(`/api/dashboard${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sales data');
      }
      
      const result = await response.json();
      
      if (result.success) {
        if (timeRange === 'monthly') {
          setDashboardData(prevData => ({
            ...prevData,
            monthlyRevenue: result.monthlyRevenue || []
          }));
        } else {
          setDashboardData(prevData => ({
            ...prevData,
            weeklyRevenue: result.weeklyRevenue || []
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching sales data:', err);
    } finally {
      setSalesLoading(false);
    }
  };

  // Fetch revenue growth
  const fetchRevenueGrowth = async () => {
    try {
      const response = await fetch('/api/dashboard?metric=revenue-growth');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setRevenueGrowth(result.revenueGrowth);
        }
      }
    } catch (err) {
      console.error('Error fetching revenue growth:', err);
    }
  };

  // Fetch top services
  const fetchTopServices = async () => {
    try {
      const response = await fetch('/api/dashboard?metric=top-services&limit=5');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDashboardData(prevData => ({
            ...prevData,
            topServices: result.topServices || []
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching top services:', err);
    }
  };

  // Fetch top products
  const fetchTopProducts = async () => {
    try {
      const response = await fetch('/api/dashboard?metric=top-products&limit=5');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDashboardData(prevData => ({
            ...prevData,
            topProducts: result.topProducts || []
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching top products:', err);
    }
  };

  // Fetch top astrologers
  const fetchTopAstrologers = async () => {
    try {
      const response = await fetch('/api/dashboard?metric=top-astrologers&limit=5');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDashboardData(prevData => ({
            ...prevData,
            topAstrologers: result.topAstrologers || []
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching top astrologers:', err);
    }
  };

  // Fetch revenue breakdown
  const fetchRevenueBreakdown = async () => {
    try {
      const response = await fetch('/api/dashboard?metric=revenue-breakdown');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDashboardData(prevData => ({
            ...prevData,
            revenueBreakdown: result.revenueBreakdown || {
              breakdown: [],
              totalRevenue: 0,
              avgOrderValue: 0,
              topSegment: { name: 'Products', value: 0, color: '#3b82f6' },
              breakdownShare: 0,
              contributors: []
            }
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching revenue breakdown:', err);
    }
  };

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setDashboardData(prevData => ({
            ...prevData,
            totalUsers: result.data.totalUsers,
            totalOrders: result.data.totalOrders,
            totalRevenue: result.data.totalRevenue,
            totalProducts: result.data.totalProducts,
            totalServices: result.data.totalServices,
            totalAstrologers: result.data.totalAstrologers
          }));
        } else {
          throw new Error(result.error || 'Failed to fetch data');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    fetchRevenueGrowth();
    fetchSalesData('monthly', 12);
    fetchTopServices();
    fetchTopProducts();
    fetchTopAstrologers();
    fetchRevenueBreakdown();
  }, []);

  const getMonthlySlice = (months: number) => {
    const data = dashboardData.monthlyRevenue.slice(-months);
    return data;
  };
  
  const currentRevenueData = timeRange === 'monthly' ? getMonthlySlice(monthRange) : dashboardData.weeklyRevenue;

  // Use real revenue breakdown data from API
  const revenueBreakdown = dashboardData.revenueBreakdown.breakdown;
  const totalBreakdown = dashboardData.revenueBreakdown.totalRevenue;
  const topSegment = dashboardData.revenueBreakdown.topSegment;
  const avgOrderValue = dashboardData.revenueBreakdown.avgOrderValue;
  const breakdownShare = dashboardData.revenueBreakdown.breakdownShare;
  const contributors = dashboardData.revenueBreakdown.contributors;

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
          </div>
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
          </div>
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-6">
                <p className="text-red-600 dark:text-red-400 font-medium mb-2">Error loading dashboard</p>
                <p className="text-red-500 dark:text-red-300 text-sm">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Customers (Total Users) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mr-2" />
                <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Customers</span>
              </div>
              {dashboardData.userGrowth > 0 ? (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
              )}
            </div>
            <div className="mb-2">
              <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.totalUsers.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className={`text-xs sm:text-sm font-medium ${dashboardData.userGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dashboardData.userGrowth > 0 ? '+' : ''}{dashboardData.userGrowth}%
              </span>
              <span className="text-xs sm:text-sm text-gray-500 sm:ml-1">vs. previous month</span>
            </div>
          </div>

          {/* Total Sales (Revenue) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2" />
                <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Sales</span>
              </div>
              {dashboardData.revenueGrowth > 0 ? (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
              )}
            </div>
            <div className="mb-2">
              <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                ₹{dashboardData.totalRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className={`text-xs sm:text-sm font-medium ${dashboardData.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dashboardData.revenueGrowth > 0 ? '+' : ''}{dashboardData.revenueGrowth}%
              </span>
              <span className="text-xs sm:text-sm text-gray-500 sm:ml-1">vs. previous month</span>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 mr-2" />
                <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Order</span>
              </div>
              {dashboardData.orderGrowth > 0 ? (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
              )}
            </div>
            <div className="mb-2">
              <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.totalOrders.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className={`text-xs sm:text-sm font-medium ${dashboardData.orderGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dashboardData.orderGrowth > 0 ? '+' : ''}{dashboardData.orderGrowth}%
              </span>
              <span className="text-xs sm:text-sm text-gray-500 sm:ml-1">vs. previous month</span>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Products */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mr-2" />
                <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</span>
              </div>
            </div>
            <div className="mb-2">
              <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.totalProducts}
              </span>
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              Revenue: ₹{dashboardData.productRevenue.toLocaleString()}
            </div>
          </div>

          {/* Total Services */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 mr-2" />
                <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Services</span>
              </div>
            </div>
            <div className="mb-2">
              <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.totalServices}
              </span>
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              Revenue: ₹{dashboardData.serviceRevenue.toLocaleString()}
            </div>
          </div>

          {/* Total Astrologers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center">
                <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 mr-2" />
                <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Astrologers</span>
              </div>
            </div>
            <div className="mb-2">
              <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.totalAstrologers}
              </span>
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              Revenue: ₹{dashboardData.astrologerRevenue.toLocaleString()}
            </div>
          </div>
        </div>

  {/* Charts and Statistics Grid */}
  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 items-stretch">
          {/* Sales Revenue (redesigned) */}
          <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm flex flex-col min-h-0">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Sales Revenue</h2>
                <p className="text-xs sm:text-sm text-gray-500">Visualize revenue over selectable ranges with quick metrics.</p>
              </div>

              <div className="mt-3 lg:mt-0 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 w-full sm:w-auto">
                  <button
                    onClick={() => { 
                      setTimeRange('weekly'); 
                      fetchSalesData('weekly', 8);
                    }}
                    className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-colors ${timeRange === 'weekly' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
                  >
                    1W
                  </button>
                  <button
                    onClick={() => { 
                      setTimeRange('monthly'); 
                      setMonthRange(1);
                      fetchSalesData('monthly', 1);
                    }}
                    className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-colors ${timeRange === 'monthly' && monthRange === 1 ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
                  >
                    1M
                  </button>
                  <button
                    onClick={() => { 
                      setTimeRange('monthly'); 
                      setMonthRange(3);
                      fetchSalesData('monthly', 3);
                    }}
                    className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-colors ${timeRange === 'monthly' && monthRange === 3 ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
                  >
                    3M
                  </button>
                  <button
                    onClick={() => { 
                      setTimeRange('monthly'); 
                      setMonthRange(12);
                      fetchSalesData('monthly', 12);
                    }}
                    className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-colors ${timeRange === 'monthly' && monthRange === 12 ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
                  >
                    1Y
                  </button>
                </div>

                <button
                  onClick={() => {
                    // export current data as CSV
                    const rows = (timeRange === 'monthly' ? getMonthlySlice(monthRange) : dashboardData.weeklyRevenue).map(r => ({ label: 'month' in r ? r.month : r.week, revenue: r.revenue }));
                    const csv = ['label,revenue', ...rows.map(r => `${r.label},${r.revenue}`)].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'revenue.csv';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200 w-full sm:w-auto"
                >
                  Export CSV
                </button>
              </div>
            </div>

            {/* Slider control */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <div>Range: {timeRange === 'monthly' ? `${monthRange} month${monthRange > 1 ? 's' : ''}` : 'Weekly'}</div>
                <div className="text-xs text-gray-400 hidden sm:block">Drag to adjust months</div>
              </div>
              <input
                type="range"
                min={1}
                max={12}
                step={1}
                value={monthRange}
                onChange={(e) => { 
                  setTimeRange('monthly'); 
                  const newMonthRange = Number(e.target.value);
                  setMonthRange(newMonthRange);
                  fetchSalesData('monthly', newMonthRange);
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Summary metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
              <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="text-xs text-gray-500">Total Revenue</div>
                <div className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">₹{(timeRange === 'monthly' ? getMonthlySlice(monthRange) : dashboardData.weeklyRevenue).reduce((s, r) => s + r.revenue, 0).toLocaleString()}</div>
              </div>
              <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="text-xs text-gray-500">Average / period</div>
                <div className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">₹{Math.round((timeRange === 'monthly' ? getMonthlySlice(monthRange) : dashboardData.weeklyRevenue).reduce((s, r) => s + r.revenue, 0) / (timeRange === 'monthly' ? monthRange : (dashboardData.weeklyRevenue.length || 1))).toLocaleString()}</div>
              </div>
              <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="text-xs text-gray-500">Growth (vs prev)</div>
                <div className={`text-sm sm:text-lg font-semibold ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth}%
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0">
              {/* Main combined chart - extended */}
              <div className="w-full h-full min-h-0" style={{ minHeight: '250px' }}>
                {salesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Loading sales data...</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={currentRevenueData}>
                      <CartesianGrid stroke="#f1f5f9" />
                      <XAxis dataKey={timeRange === 'monthly' ? 'month' : 'week'} stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" fill="#bfdbfe" stroke="#3b82f6" fillOpacity={0.35} />
                      <Bar dataKey="revenue" barSize={18} fill="#3b82f6" />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Revenue Breakdown</h3>

            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4">
              <div className="w-full lg:w-32 h-32 mb-4 lg:mb-0 flex items-center justify-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={28}
                        outerRadius={42}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {revenueBreakdown.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex-1">
                <div className="text-xs sm:text-sm text-gray-500 mb-2">Total Revenue</div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">₹{totalBreakdown.toLocaleString()}</div>

                <div className="mt-4 space-y-2">
                  {revenueBreakdown.map((r) => (
                    <div key={r.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: r.color }}></div>
                        <div className="text-xs sm:text-sm text-gray-900 dark:text-white">{r.name}</div>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">₹{r.value.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom half: small KPIs + Top Contributors */}
            <div className="mt-4 sm:mt-6 border-t border-gray-100 dark:border-gray-700 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
                <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="text-xs text-gray-500">Top Segment</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{topSegment.name}</div>
                  <div className="text-xs text-gray-400">₹{topSegment.value.toLocaleString()}</div>
                </div>
                <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="text-xs text-gray-500">Avg. Order Value</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">₹{avgOrderValue.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Across {dashboardData.totalOrders} orders</div>
                </div>
                <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="text-xs text-gray-500">Breakdown Share</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{breakdownShare}%</div>
                  <div className="text-xs text-gray-400">of total revenue</div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Top Contributors</div>
                  <div className="text-xs text-gray-500">Showing top 5</div>
                </div>
                <div className="space-y-2">
                  {contributors.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex items-center min-w-0 flex-1">
                        <Image src={c.image} alt={c.name} width={32} height={32} className="w-6 h-6 sm:w-8 sm:h-8 rounded mr-2 sm:mr-3 object-cover bg-gray-200 dark:bg-gray-600 flex-shrink-0" onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }} />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{c.name}</div>
                          <div className="text-xs text-gray-500">{c.type}</div>
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white ml-2">₹{c.revenue.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Top Astrologers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Top Astrologers</h3>
              <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-800">See All</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">No</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Name</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 hidden sm:table-cell">Review</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 hidden md:table-cell">Consultations</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Revenue</th>
                  </tr>
                </thead>
                <tbody className="space-y-3">
                  {dashboardData.topAstrologers.map((astrologer, index) => (
                    <tr key={astrologer.id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-3 text-xs sm:text-sm text-gray-900 dark:text-white">{index + 1}</td>
                      <td className="py-3">
                        <div className="flex items-center">
                          <Image 
                            src={astrologer.image} 
                            alt={astrologer.name}
                            width={32}
                            height={32}
                            className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 dark:bg-gray-600 rounded-full mr-2 sm:mr-3 object-cover flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.jpg';
                            }}
                          />
                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate block">{astrologer.name}</span>
                            <div className="sm:hidden flex items-center mt-1">
                              <Star className="w-3 h-3 text-yellow-400 mr-1" />
                              <span className="text-xs text-gray-900 dark:text-white">{astrologer.review}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 hidden sm:table-cell">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-900 dark:text-white">{astrologer.review}</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-gray-900 dark:text-white hidden md:table-cell">{astrologer.consultations}</td>
                      <td className="py-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-white">₹{astrologer.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Distribution Maps */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Geographic Distribution</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 hidden sm:block">
                  {selectedRegion ? `Selected: ${selectedRegion}` : 'Click regions for details'}
                </span>
              </div>
            </div>
            
            {/* Interactive Geographic Distribution */}
            <div className="space-y-3 sm:space-y-4">
              {dashboardData.geographicData.map((region, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedRegion === region.region 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedRegion(
                    selectedRegion === region.region ? null : region.region
                  )}
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <div 
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-2 sm:mr-3 transition-transform duration-200 flex-shrink-0" 
                      style={{ backgroundColor: region.color }}
                    ></div>
                    <div className="min-w-0 flex-1">
                      <span className={`text-xs sm:text-sm font-medium transition-colors duration-200 block truncate ${
                        selectedRegion === region.region 
                          ? 'text-blue-700 dark:text-blue-300' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {region.region}
                      </span>
                      {selectedRegion === region.region && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {region.users} users • {region.percentage}% of total traffic
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                    <div className="w-16 sm:w-20 h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${region.percentage}%`, 
                          backgroundColor: region.color 
                        }}
                      ></div>
                    </div>
                    <span className={`text-xs sm:text-sm font-medium min-w-[30px] sm:min-w-[40px] transition-colors duration-200 ${
                      selectedRegion === region.region 
                        ? 'text-blue-700 dark:text-blue-300' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {region.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Services & Products */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Top Services */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Top Services</h3>
              <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-800">See All</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">No</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Name</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 hidden sm:table-cell">Review</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 hidden md:table-cell">Bookings</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Revenue</th>
                  </tr>
                </thead>
                <tbody className="space-y-3">
                  {dashboardData.topServices.map((service, index) => (
                    <tr key={service.id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-3 text-xs sm:text-sm text-gray-900 dark:text-white">{index + 1}</td>
                      <td className="py-3">
                        <div className="flex items-center">
                          <Image 
                            src={service.image} 
                            alt={service.name}
                            width={32}
                            height={32}
                            className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 dark:bg-gray-600 rounded mr-2 sm:mr-3 object-cover flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.jpg';
                            }}
                          />
                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-words whitespace-normal block">{service.name}</span>
                            <div className="sm:hidden flex items-center mt-1">
                              <Star className="w-3 h-3 text-yellow-400 mr-1" />
                              <span className="text-xs text-gray-900 dark:text-white">{service.review}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 hidden sm:table-cell">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-900 dark:text-white">{service.review}</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-gray-900 dark:text-white hidden md:table-cell">{service.bookings}</td>
                      <td className="py-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-white">₹{service.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Top Products</h3>
              <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-800">See All</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">No</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Name</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 hidden sm:table-cell">Review</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 hidden md:table-cell">Sold</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Profit</th>
                  </tr>
                </thead>
                <tbody className="space-y-3">
                  {dashboardData.topProducts.map((product, index) => (
                    <tr key={product.id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-3 text-xs sm:text-sm text-gray-900 dark:text-white">{index + 1}</td>
                      <td className="py-3">
                        <div className="flex items-center">
                          <Image 
                            src={product.image} 
                            alt={product.name}
                            width={32}
                            height={32}
                            className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 dark:bg-gray-600 rounded mr-2 sm:mr-3 object-cover flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.jpg';
                            }}
                          />
                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate block">{product.name}</span>
                            <div className="sm:hidden flex items-center mt-1">
                              <Star className="w-3 h-3 text-yellow-400 mr-1" />
                              <span className="text-xs text-gray-900 dark:text-white">{product.review}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 hidden sm:table-cell">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-900 dark:text-white">{product.review}</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-gray-900 dark:text-white hidden md:table-cell">{product.sold}</td>
                      <td className="py-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-white">₹{product.profit.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
