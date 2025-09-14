'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Download, Edit3, MoreHorizontal, ChevronDown, AlertTriangle, Package, Loader2, RefreshCw } from 'lucide-react';
import { InventoryStock, InventoryWithStockLevel, InventoryUpdateRequest } from '@/types/inventory';

const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [selectedStatus, setSelectedStatus] = useState('All Stock Status');
  const [currentPage, setCurrentPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  
  // API state management
  const [inventoryData, setInventoryData] = useState<InventoryWithStockLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editingStock, setEditingStock] = useState<number | null>(null);
  const [stockUpdateData, setStockUpdateData] = useState<Partial<InventoryUpdateRequest>>({});

  // Fetch inventory data from API
  const fetchInventoryData = async () => {
    try {
      setError(null);
      const response = await fetch('/api/inventory?includeProduct=true&includeStockLevel=true');
      const result = await response.json();
      
      if (result.success) {
        setInventoryData(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch inventory data');
      }
    } catch (err) {
      setError('Network error occurred while fetching inventory data');
      console.error('Error fetching inventory data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Update stock data
  const updateStock = async (productId: number, updateData: InventoryUpdateRequest) => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh the data
        await fetchInventoryData();
        setEditingStock(null);
        setStockUpdateData({});
      } else {
        setError(result.error || 'Failed to update stock');
      }
    } catch (err) {
      setError('Network error occurred while updating stock');
      console.error('Error updating stock:', err);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchInventoryData();
  }, []);

  // Calculate summary statistics
  const totalProducts = inventoryData.length;
  const lowStockAlerts = inventoryData.filter(item => item.stockLevel?.status === 'low_stock').length;
  const outOfStockItems = inventoryData.filter(item => item.stockLevel?.status === 'out_of_stock').length;
  const totalStock = inventoryData.reduce((sum, item) => sum + item.quantity, 0);

  // Filter inventory data
  const filteredData = useMemo(() => {
    return inventoryData.filter(item => {
      const productName = item.products?.name || '';
      const sku = item.sku || '';
      const category = item.products?.category?.name || '';
      const stockStatus = item.stockLevel?.status || 'in_stock';
      
      const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All Categories' || category === selectedCategory;
      const matchesBrand = selectedBrand === 'All Brands'; // We can add brand logic later if needed
      const matchesStatus = selectedStatus === 'All Stock Status' || 
                           (selectedStatus === 'in stock' && stockStatus === 'in_stock') ||
                           (selectedStatus === 'low stock' && stockStatus === 'low_stock') ||
                           (selectedStatus === 'out of stock' && stockStatus === 'out_of_stock');
      
      return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
    });
  }, [searchTerm, selectedCategory, selectedBrand, selectedStatus, inventoryData]);

  // Export handlers
  const downloadCSV = (rows: InventoryWithStockLevel[]) => {
    if (!rows || rows.length === 0) return;
    const headers = ['Product Name','SKU','Category','Stock Qty','Available','Reserved','Status','Location'];
    const csvRows = [headers.join(',')];

    for (const r of rows) {
      const vals = [
        r.products?.name || '',
        r.sku || '',
        r.products?.category?.name || '',
        String(r.quantity),
        String(r.quantity - r.reserved),
        String(r.reserved),
        r.stockLevel?.status || '',
        r.location || ''
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
    a.download = 'inventory.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const downloadExcel = async (rows: InventoryWithStockLevel[]) => {
    if (!rows || rows.length === 0) return;
    try {
      const XLSX = (await import('xlsx')).default || (await import('xlsx'));
      const dataForExcel = rows.map(r => ({
        'Product Name': r.products?.name || '',
        'SKU': r.sku || '',
        'Category': r.products?.category?.name || '',
        'Stock Qty': r.quantity,
        'Available': r.quantity - r.reserved,
        'Reserved': r.reserved,
        'Status': r.stockLevel?.status || '',
        'Location': r.location || ''
      }));
      const ws = XLSX.utils.json_to_sheet(dataForExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'inventory.xlsx';
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
      case 'low_stock':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Low Stock
          </span>
        );
      case 'in_stock':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            In Stock
          </span>
        );
      case 'out_of_stock':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Out of Stock
          </span>
        );
      case 'overstocked':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Overstocked
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

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInventoryData();
  };

  // Handle stock edit
  const handleEditStock = (item: InventoryWithStockLevel) => {
    setEditingStock(item.id);
    setStockUpdateData({
      productId: item.product_id,
      sku: item.sku || undefined,
      quantity: item.quantity,
      reserved: item.reserved,
      minStock: item.min_stock,
      maxStock: item.max_stock || undefined,
      location: item.location || undefined,
      batchNumber: item.batch_number || undefined,
      expiryDate: item.expiry_date ? item.expiry_date.toISOString().split('T')[0] : undefined,
      costPrice: item.cost_price ? Number(item.cost_price) : undefined
    });
  };

  // Handle stock update
  const handleUpdateStock = async () => {
    if (stockUpdateData.productId) {
      await updateStock(stockUpdateData.productId, stockUpdateData as InventoryUpdateRequest);
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Inventory Management</h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Manage your product inventory and stock levels</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base w-full sm:w-auto"
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 md:mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm md:text-base text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8 md:py-12">
          <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-purple-600" />
          <span className="ml-2 text-sm md:text-base text-gray-600 dark:text-gray-400">Loading inventory data...</span>
        </div>
      )}

      {/* Statistics Cards */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-lg md:text-2xl font-bold text-purple-600 dark:text-purple-400">{totalProducts}</p>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Total Products</p>
              </div>
              <Package className="w-6 h-6 md:w-8 md:h-8 text-purple-600 dark:text-purple-400 self-end sm:self-auto" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-lg md:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{lowStockAlerts}</p>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Low Stock Alerts</p>
              </div>
              <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-yellow-600 dark:text-yellow-400 self-end sm:self-auto" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-lg md:text-2xl font-bold text-red-600 dark:text-red-400">{outOfStockItems}</p>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Out of Stock Items</p>
              </div>
              <Package className="w-6 h-6 md:w-8 md:h-8 text-red-600 dark:text-red-400 self-end sm:self-auto" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-lg md:text-2xl font-bold text-green-600 dark:text-green-400">{totalStock}</p>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Total Stock</p>
              </div>
              <Package className="w-6 h-6 md:w-8 md:h-8 text-green-600 dark:text-green-400 self-end sm:self-auto" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      {!loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by product name or SKU"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <div className="relative flex-1">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 md:px-4 py-2 pr-8 text-sm md:text-base text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option>All Categories</option>
                  {Array.from(new Set(inventoryData.map(item => item.products?.category?.name).filter(Boolean))).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative flex-1">
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 md:px-4 py-2 pr-8 text-sm md:text-base text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option>All Brands</option>
                  <option>Nakshatra Gyaan</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative flex-1">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 md:px-4 py-2 pr-8 text-sm md:text-base text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option>All Stock Status</option>
                  <option>in stock</option>
                  <option>low stock</option>
                  <option>out of stock</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative inline-block text-left">
                <button 
                  onClick={() => setExportOpen(v => !v)} 
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base"
                >
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
      )}

      {/* Inventory Table - Desktop */}
      {!loading && (
        <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stock Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Reserved
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No inventory data found
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.products?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                          {item.sku || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {item.products?.category?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {editingStock === item.id ? (
                            <input
                              type="number"
                              value={stockUpdateData.quantity || item.quantity}
                              onChange={(e) => setStockUpdateData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                              className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                          ) : (
                            item.quantity
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {item.quantity - item.reserved}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {editingStock === item.id ? (
                            <input
                              type="number"
                              value={stockUpdateData.reserved || item.reserved}
                              onChange={(e) => setStockUpdateData(prev => ({ ...prev, reserved: parseInt(e.target.value) || 0 }))}
                              className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                          ) : (
                            item.reserved
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {editingStock === item.id ? (
                            <input
                              type="text"
                              value={stockUpdateData.location || item.location || ''}
                              onChange={(e) => setStockUpdateData(prev => ({ ...prev, location: e.target.value }))}
                              className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              placeholder="Location"
                            />
                          ) : (
                            item.location || 'N/A'
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(item.stockLevel?.status || 'in_stock')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {editingStock === item.id ? (
                            <>
                              <button
                                onClick={handleUpdateStock}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                title="Save"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => {
                                  setEditingStock(null);
                                  setStockUpdateData({});
                                }}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Cancel"
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleEditStock(item)}
                              className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                              title="Edit Stock"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory Cards - Mobile and Tablet */}
      {!loading && (
        <div className="lg:hidden space-y-3">
          {filteredData.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No inventory data found</p>
            </div>
          ) : (
            filteredData.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                          {item.products?.name || 'N/A'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mb-2">
                          SKU: {item.sku || 'N/A'}
                        </p>
                        {getStatusBadge(item.stockLevel?.status || 'in_stock')}
                      </div>
                      <div className="flex items-center space-x-2">
                        {editingStock === item.id ? (
                          <>
                            <button
                              onClick={handleUpdateStock}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1"
                              title="Save"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => {
                                setEditingStock(null);
                                setStockUpdateData({});
                              }}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleEditStock(item)}
                            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-1"
                            title="Edit Stock"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block">Category</span>
                    <span className="text-gray-900 dark:text-gray-100">{item.products?.category?.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block">Location</span>
                    {editingStock === item.id ? (
                      <input
                        type="text"
                        value={stockUpdateData.location || item.location || ''}
                        onChange={(e) => setStockUpdateData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Location"
                      />
                    ) : (
                      <span className="text-gray-900 dark:text-gray-100">{item.location || 'N/A'}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block">Stock Qty</span>
                    {editingStock === item.id ? (
                      <input
                        type="number"
                        value={stockUpdateData.quantity || item.quantity}
                        onChange={(e) => setStockUpdateData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    ) : (
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{item.quantity}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block">Available</span>
                    <span className="text-gray-900 dark:text-gray-100">{item.quantity - item.reserved}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block">Reserved</span>
                    {editingStock === item.id ? (
                      <input
                        type="number"
                        value={stockUpdateData.reserved || item.reserved}
                        onChange={(e) => setStockUpdateData(prev => ({ ...prev, reserved: parseInt(e.target.value) || 0 }))}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    ) : (
                      <span className="text-gray-900 dark:text-gray-100">{item.reserved}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6 mt-4 rounded-b-lg">
          <div className="flex-1 flex justify-between sm:hidden">
              <button 
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Previous
              </button>
              <button 
                disabled={filteredData.length === 0}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{filteredData.length > 0 ? 1 : 0}</span> to <span className="font-medium">{filteredData.length}</span> of{' '}
                  <span className="font-medium">{filteredData.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button 
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    Previous
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-purple-600 text-sm font-medium text-white">
                    {currentPage}
                  </button>
                  <button 
                    disabled={filteredData.length === 0}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default InventoryPage;