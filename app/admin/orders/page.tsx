'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Download, Eye, MoreHorizontal, ChevronDown, Package, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock data for orders - this would come from your API
const ordersData = [
  {
    id: 1,
    orderId: 'SHOP4-ORD-20250820065542-F582B7',
    date: '8/20/2025',
    customer: {
      name: '103 ews building sagar pearl',
      location: 'Bhopal'
    },
    items: 1,
    total: 400.00,
    status: 'pending payment',
    paymentStatus: 'pending'
  },
  {
    id: 2,
    orderId: 'SHOP2-ORD-20250820065300-757AF6',
    date: '8/20/2025',
    customer: {
      name: '103 ews building sagar pearl',
      location: 'Bhopal'
    },
    items: 1,
    total: 1000.00,
    status: 'processing',
    paymentStatus: 'pending'
  },
  {
    id: 3,
    orderId: 'SHOP2-ORD-20250820064503-3ABE30',
    date: '8/20/2025',
    customer: {
      name: '103 ews building sagar pearl',
      location: 'Bhopal'
    },
    items: 1,
    total: 1000.00,
    status: 'shipped',
    paymentStatus: 'pending'
  },
  {
    id: 4,
    orderId: 'SHOP2-ORD-20250820064413-1E18C3',
    date: '8/20/2025',
    customer: {
      name: '103 ews building sagar pearl',
      location: 'Bhopal'
    },
    items: 2,
    total: 1799.00,
    status: 'delivered',
    paymentStatus: 'pending'
  },
  {
    id: 5,
    orderId: 'SHOP2-ORD-20250820064220-EDD4F6',
    date: '8/20/2025',
    customer: {
      name: '103 ews building sagar pearl',
      location: 'Bhopal'
    },
    items: 1,
    total: 799.00,
    status: 'cancelled by customer',
    paymentStatus: 'refunded'
  }
];

const OrdersPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('All Payment Status');
  const [currentPage, setCurrentPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);

  // Calculate summary statistics
  const totalOrders = ordersData.length;
  const pendingOrders = ordersData.filter(order => order.status === 'pending payment' || order.status === 'processing').length;
  const completedOrders = ordersData.filter(order => order.status === 'delivered').length;
  const totalRevenue = ordersData.filter(order => order.paymentStatus !== 'refunded').reduce((sum, order) => sum + order.total, 0);

  // Filter orders data
  const filteredData = useMemo(() => {
    return ordersData.filter(order => {
      const matchesSearch = order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.customer.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'All Status' || order.status === selectedStatus;
      const matchesPaymentStatus = selectedPaymentStatus === 'All Payment Status' || order.paymentStatus === selectedPaymentStatus;
      
      return matchesSearch && matchesStatus && matchesPaymentStatus;
    });
  }, [searchTerm, selectedStatus, selectedPaymentStatus]);

  // Export handlers
  const downloadCSV = (rows: typeof ordersData) => {
    if (!rows || rows.length === 0) return;
    const headers = ['Order ID','Date','Customer','Location','Items','Total','Status','Payment Status'];
    const csvRows = [headers.join(',')];

    for (const r of rows) {
      const vals = [
        r.orderId,
        r.date,
        r.customer.name,
        r.customer.location,
        String(r.items),
        String(r.total),
        r.status,
        r.paymentStatus || ''
      ].map((v: string) => {
        // escape quotes
        const s = v == null ? '' : String(v);
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      });
      csvRows.push(vals.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const downloadExcel = async (rows: typeof ordersData) => {
    if (!rows || rows.length === 0) return;
    try {
      const XLSX = (await import('xlsx')).default || (await import('xlsx'));
      const dataForExcel = rows.map(r => ({
        'Order ID': r.orderId,
        'Date': r.date,
        'Customer': r.customer.name,
        'Location': r.customer.location,
        'Items': r.items,
        'Total': r.total,
        'Status': r.status,
        'Payment Status': r.paymentStatus || ''
      }));
      const ws = XLSX.utils.json_to_sheet(dataForExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Orders');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'orders.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export Excel (xlsx). Falling back to CSV.', err);
      downloadCSV(rows);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending payment':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            Pending Payment
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Processing
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Shipped
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Delivered
          </span>
        );
      case 'cancelled by customer':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Cancelled by Customer
          </span>
        );
      case 'cancelled by merchant':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Cancelled by Merchant
          </span>
        );
      case 'cancelled by admin':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Cancelled by Admin
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            {status}
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            Pending
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Paid
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Failed
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            {paymentStatus}
          </span>
        );
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Orders Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage and track all customer orders</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalOrders}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
            </div>
            <Package className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{pendingOrders}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Orders</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedOrders}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed Orders</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{totalRevenue.toLocaleString('en-IN')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option>All Status</option>
                <option>pending payment</option>
                <option>processing</option>
                <option>shipped</option>
                <option>delivered</option>
                <option>cancelled by customer</option>
                <option>cancelled by merchant</option>
                <option>cancelled by admin</option>
                <option>refunded</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <div className="relative">
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option>All Payment Status</option>
                <option>pending</option>
                <option>paid</option>
                <option>failed</option>
                <option>refunded</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <div className="relative inline-block text-left">
              <button onClick={() => setExportOpen(v => !v)} className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              {exportOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                  <div className="py-1">
                    <button onClick={() => { setExportOpen(false); downloadCSV(filteredData); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Export CSV</button>
                    <button onClick={() => { setExportOpen(false); downloadExcel(filteredData); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Export Excel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredData.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 font-mono">
                      {order.orderId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {order.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      <div className="font-medium">{order.customer.name}</div>
                      <div className="text-gray-500 dark:text-gray-400">{order.customer.location}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {order.items}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
                      INR {order.total.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="break-words">
                      {getStatusBadge(order.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="break-words">
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => router.push(`/admin/orders/${order.orderId}`)}
                        className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                        title="View Order Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredData.length}</span> of{' '}
                <span className="font-medium">{filteredData.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600">
                  Previous
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-purple-600 text-sm font-medium text-white">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
