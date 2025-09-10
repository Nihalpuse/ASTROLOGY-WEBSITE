'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer, Package, User, CreditCard, MapPin } from 'lucide-react';

// Mock data - replace with actual API call
// Updated to use astrology-themed products (from data/products.js)
const mockOrderData = {
  id: 'ASTRO-ORD-20250909-RA-001',
  orderNumber: 'ASTRO-ORD-20250909-RA-001',
  status: 'processing',
  paymentStatus: 'paid',
  placedOn: '9/09/2025',
  items: [
    {
      id: 1,
      name: 'Astrology Reports & Kundli Services',
      sku: 'AST-REP-KUN-202509',
      quantity: 1,
      unitPrice: 499.0,
      totalPrice: 499.0
    },
    {
      id: 2,
      name: 'Rudraksha Mala & Beads (108 Mala)',
      sku: 'RUD-MALA-108-NP',
      quantity: 1,
      unitPrice: 1199.0,
      totalPrice: 1199.0
    },
    {
      id: 3,
      name: 'Energized Sri Yantra (Brass)',
      sku: 'YAN-SRI-BR-001',
      quantity: 1,
      unitPrice: 799.0,
      totalPrice: 799.0
    }
  ],
  subtotal: 2497.0,
  tax: 0.0,
  shipping: 50.0,
  total: 2547.0,
  customer: {
    name: 'Ravi Sharma',
    email: 'ravi.sharma@example.com',
    phone: '+91 98765 43210'
  },
  shippingAddress: {
    name: 'Ravi Sharma',
    address: 'Flat 103, Shanti Apartments, Near Sankat Mochan Temple',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    pincode: '221005',
    country: 'India'
  },
  paymentMethod: 'online_payment',
  statusHistory: [
    {
      status: 'Order Placed',
      date: '9/09/2025 09:12 AM',
      description: 'Order created and payment confirmed'
    },
    {
      status: 'Astrologer Review',
      date: '9/09/2025 10:00 AM',
      description: 'Astrologer assigned for report generation'
    },
    {
      status: 'Dispatched',
      date: '9/09/2025 04:30 PM',
      description: 'Physical items dispatched from warehouse'
    }
  ]
};

const OrderDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const [orderData, setOrderData] = useState(mockOrderData);
  const [loading, setLoading] = useState(false);

  const orderId = params?.id as string;

  useEffect(() => {
    // Here you would fetch the actual order data based on the orderId
    // For now, we're using mock data
    const fetchOrderData = async () => {
      setLoading(true);
      try {
        // Replace with actual API call
        // const response = await fetch(`/api/admin/orders/${orderId}`);
        // const data = await response.json();
        // setOrderData(data);
        
        // Using mock data for now
        setOrderData({ ...mockOrderData, id: orderId, orderNumber: orderId });
      } catch (error) {
        console.error('Error fetching order data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            Pending
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Processing
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Shipped
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Delivered
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            {status}
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'pending payment':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            Pending Payment
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Paid
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            {paymentStatus}
          </span>
        );
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Orders</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Order #{orderData.orderNumber}
          </h1>
          <button
            onClick={handlePrintInvoice}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Order Status</h2>
            <div className="flex items-center space-x-4 mb-4">
              {getPaymentStatusBadge(orderData.paymentStatus)}
              {getStatusBadge(orderData.status)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Placed on {orderData.placedOn}
            </p>
          </div>

          {/* Order Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Package className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Order Items ({orderData.items.length})
              </h2>
            </div>
            
            <div className="space-y-4">
              {orderData.items.map((item) => (
                <div key={item.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        SKU: {item.sku}
                      </p>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        ({item.quantity} × INR {item.unitPrice.toFixed(2)})
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        INR {item.totalPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Status History</h2>
            <div className="space-y-4">
              {orderData.statusHistory.map((history, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{history.status}</h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{history.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{history.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Summary and Customer Info */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="text-gray-900 dark:text-gray-100">INR {orderData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                <span className="text-gray-900 dark:text-gray-100">INR {orderData.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                <span className="text-gray-900 dark:text-gray-100">INR {orderData.shipping.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-gray-900 dark:text-gray-100">Total</span>
                  <span className="text-gray-900 dark:text-gray-100">INR {orderData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Customer Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Shipping Address</h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>{orderData.shippingAddress.name}</p>
                  <p>{orderData.shippingAddress.address}</p>
                  <p>{orderData.shippingAddress.city}, {orderData.shippingAddress.pincode}</p>
                  <p>{orderData.shippingAddress.state}, {orderData.shippingAddress.country}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CreditCard className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Payment Information</h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Payment Method</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {orderData.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
