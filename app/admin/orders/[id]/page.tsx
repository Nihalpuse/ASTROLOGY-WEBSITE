'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer, Package, User, CreditCard, MapPin, Loader2, AlertTriangle, RefreshCw, FileText } from 'lucide-react';
import Invoice from '@/app/components/Invoice';

// Types for the order data structure
interface OrderItem {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  type: string;
  product?: {
    id: number;
    name: string;
    sku: string;
    image_url: string;
    description: string;
    price: number;
  };
  service?: {
    id: number;
    title: string;
    slug: string;
    description: string;
    price: number;
  };
}

interface OrderData {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  placedOn: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    name: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  billingAddress?: unknown;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: Array<{
    status: string;
    date: string;
    description: string;
  }>;
}

const OrderDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  const orderId = params?.id as string;

  // Fetch order data from API
  const fetchOrderData = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/orders/${orderId}?admin=true`);
      const result = await response.json();
      
      if (result.success && result.order) {
        setOrderData(result.order);
      } else {
        setError(result.error || 'Failed to fetch order data');
      }
    } catch (err) {
      setError('Network error occurred while fetching order data');
      console.error('Error fetching order data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (status: string, paymentStatus?: string) => {
    try {
      setUpdating(true);
      const updateData: Record<string, unknown> = {
        status
      };

      if (paymentStatus) {
        updateData.paymentStatus = paymentStatus;
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh the data
        await fetchOrderData();
      } else {
        setError(result.error || 'Failed to update order');
      }
    } catch (err) {
      setError('Network error occurred while updating order');
      console.error('Error updating order:', err);
    } finally {
      setUpdating(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrderData();
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            Pending
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Processing
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Shipped
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Cancelled
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            {status}
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            Pending
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Paid
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Failed
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            {paymentStatus}
          </span>
        );
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setShowInvoice(true);
    // Small delay to ensure the invoice component is rendered
    setTimeout(async () => {
      try {
        // Dynamic imports to avoid SSR issues
        const html2canvas = (await import('html2canvas')).default;
        const jsPDF = (await import('jspdf')).default;

        const invoiceElement = document.querySelector('.invoice-container') as HTMLDivElement;
        if (!invoiceElement) {
          console.error('Invoice element not found');
          return;
        }

        const canvas = await html2canvas(invoiceElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: invoiceElement.scrollWidth,
          height: invoiceElement.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        const fileName = `Invoice-${orderData?.orderNumber}-${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
        
        setShowInvoice(false);
      } catch (error) {
        console.error('Error generating PDF:', error);
        // Fallback to print if PDF generation fails
        window.print();
      }
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 p-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-purple-600" />
          <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Loading order details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium text-sm sm:text-base">Back to Orders</span>
          </button>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mr-2" />
            <p className="text-red-800 dark:text-red-200 text-sm sm:text-base">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="mt-4 flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm"
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="flex items-center justify-center h-64 p-4">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">No order data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium text-sm sm:text-base">Back to Orders</span>
          </button>
        </div>
        
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
            Order #{orderData.orderNumber}
          </h1>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm"
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setShowInvoice(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">View Invoice</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Order Details */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          {/* Order Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Order Status</h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
              {getPaymentStatusBadge(orderData.paymentStatus)}
              {getStatusBadge(orderData.status)}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
              Placed on {orderData.placedOn}
            </p>
            
            {/* Status Update Controls */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Update Status</h3>
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                <select
                  value={orderData.status}
                  onChange={(e) => updateOrderStatus(e.target.value)}
                  disabled={updating}
                  className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                
                <select
                  value={orderData.paymentStatus}
                  onChange={(e) => updateOrderStatus(orderData.status, e.target.value)}
                  disabled={updating}
                  className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                >
                  <option value="pending">Pending Payment</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
                
                {updating && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center space-x-2 mb-4 sm:mb-6">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                Order Items ({orderData.items.length})
              </h2>
            </div>
            
            <div className="space-y-4">
              {orderData.items.map((item) => (
                <div key={item.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                  <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 text-sm sm:text-base">
                        {item.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                        SKU: {item.sku}
                      </p>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Type: {item.type}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        ({item.quantity} × ₹{item.unitPrice.toFixed(2)})
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                        ₹{item.totalPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Status History</h2>
            <div className="space-y-4">
              {orderData.statusHistory.map((history, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">{history.status}</h4>
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{history.date}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{history.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Summary and Customer Info */}
        <div className="space-y-4 sm:space-y-6">
          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="text-gray-900 dark:text-gray-100">₹{orderData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                <span className="text-gray-900 dark:text-gray-100">₹{orderData.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                <span className="text-gray-900 dark:text-gray-100">₹{orderData.shipping.toFixed(2)}</span>
              </div>
              {orderData.discount > 0 && (
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Discount</span>
                  <span className="text-green-600 dark:text-green-400">-₹{orderData.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between font-semibold text-base sm:text-lg">
                  <span className="text-gray-900 dark:text-gray-100">Total</span>
                  <span className="text-gray-900 dark:text-gray-100">₹{orderData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Customer Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm sm:text-base">Customer Details</h4>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p><strong>Name:</strong> {orderData.customer.name}</p>
                  <p><strong>Email:</strong> {orderData.customer.email}</p>
                  <p><strong>Phone:</strong> {orderData.customer.phone}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm sm:text-base">Shipping Address</h4>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>{orderData.shippingAddress.name}</p>
                  <p>{orderData.shippingAddress.address}</p>
                  {orderData.shippingAddress.address2 && (
                    <p>{orderData.shippingAddress.address2}</p>
                  )}
                  <p>{orderData.shippingAddress.city}, {orderData.shippingAddress.pincode}</p>
                  <p>{orderData.shippingAddress.state}, {orderData.shippingAddress.country}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Payment Information</h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 text-sm sm:text-base">Payment Method</h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {orderData.paymentMethod ? 
                    orderData.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                    'Not specified'
                  }
                </p>
              </div>
              {orderData.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 text-sm sm:text-base">Order Notes</h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {orderData.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal/Print View */}
      {showInvoice && orderData && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Invoice - Order #{orderData.orderNumber}</h2>
            <button
              onClick={() => setShowInvoice(false)}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
          <Invoice orderData={orderData} />
        </div>
      )}
    </div>
  );
};

export default OrderDetailsPage;
