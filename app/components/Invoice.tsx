'use client';

import React, { useRef } from 'react';
import Image from 'next/image';

// Types for the invoice data structure
interface InvoiceItem {
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

interface InvoiceData {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  placedOn: string;
  items: InvoiceItem[];
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

interface InvoiceProps {
  orderData: InvoiceData;
}

const Invoice: React.FC<InvoiceProps> = ({ orderData }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };


  return (
    <div className="invoice-container bg-white text-black max-w-3xl mx-auto" ref={invoiceRef} style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Invoice Header */}
      <div className="flex justify-between items-start mb-3 border-b-2 border-black pb-2">
        <div>
          <h1 className="text-lg font-bold text-black mb-1">NAKSHATRA GYAAN</h1>
          <p className="text-xs text-gray-600 mb-1">Your Trusted Astrology & Spiritual Guidance Platform</p>
          <div className="text-xs text-gray-600">
            <p>Email: info@nakshatragyaan.com | Phone: +91-9876543210</p>
          </div>
        </div>
        
        <div className="text-right">
          <h2 className="text-lg font-bold text-black mb-1">INVOICE</h2>
          <div className="text-xs text-gray-600">
            <p><strong>Invoice #:</strong> {orderData.orderNumber}</p>
            <p><strong>Date:</strong> {formatDate(orderData.createdAt)}</p>
            <p><strong>Status:</strong> {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}</p>
            <p><strong>Payment:</strong> {orderData.paymentStatus.charAt(0).toUpperCase() + orderData.paymentStatus.slice(1)}</p>
          </div>
        </div>
      </div>

      {/* Customer & Shipping Information */}
      <div className="grid grid-cols-2 gap-8 mb-3">
        <div>
          <h3 className="text-sm font-bold text-black mb-1 border-b border-gray-400 pb-1">
            BILL TO:
          </h3>
          <div className="text-xs text-gray-700">
            <p className="font-semibold">{orderData.customer.name}</p>
            <p>{orderData.customer.email}</p>
            <p>{orderData.customer.phone}</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-bold text-black mb-1 border-b border-gray-400 pb-1">
            SHIP TO:
          </h3>
          <div className="text-xs text-gray-700">
            <p className="font-semibold">{orderData.shippingAddress.name}</p>
            <p>{orderData.shippingAddress.address}</p>
            {orderData.shippingAddress.address2 && (
              <p>{orderData.shippingAddress.address2}</p>
            )}
            <p>{orderData.shippingAddress.city}, {orderData.shippingAddress.pincode}</p>
            <p>{orderData.shippingAddress.state}, {orderData.shippingAddress.country}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-3">
        <h3 className="text-sm font-bold text-black mb-2">ORDER ITEMS:</h3>
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black px-2 py-1 text-left font-bold text-black">Item</th>
              <th className="border border-black px-2 py-1 text-center font-bold text-black">SKU</th>
              <th className="border border-black px-2 py-1 text-center font-bold text-black">Qty</th>
              <th className="border border-black px-2 py-1 text-right font-bold text-black">Unit Price</th>
              <th className="border border-black px-2 py-1 text-right font-bold text-black">Total</th>
            </tr>
          </thead>
          <tbody>
            {orderData.items.map((item, index) => (
              <tr key={item.id}>
                <td className="border border-black px-2 py-1 text-black">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-600">{item.type.toUpperCase()}</div>
                </td>
                <td className="border border-black px-2 py-1 text-center text-black">{item.sku}</td>
                <td className="border border-black px-2 py-1 text-center text-black">{item.quantity}</td>
                <td className="border border-black px-2 py-1 text-right text-black">{formatCurrency(item.unitPrice)}</td>
                <td className="border border-black px-2 py-1 text-right font-semibold text-black">{formatCurrency(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Summary */}
      <div className="flex justify-end mb-3">
        <div className="w-64">
          <div className="border border-black">
            <div className="bg-gray-100 px-2 py-1 border-b border-black">
              <h3 className="text-sm font-bold text-black">ORDER SUMMARY</h3>
            </div>
            <div className="p-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-black">Subtotal:</span>
                <span className="text-black">{formatCurrency(orderData.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-black">Tax:</span>
                <span className="text-black">{formatCurrency(orderData.tax)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-black">Shipping:</span>
                <span className="text-black">{formatCurrency(orderData.shipping)}</span>
              </div>
              {orderData.discount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-black">Discount:</span>
                  <span className="text-black">-{formatCurrency(orderData.discount)}</span>
                </div>
              )}
              <div className="border-t border-black pt-1">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-black">TOTAL:</span>
                  <span className="text-black">{formatCurrency(orderData.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="mb-2">
        <h3 className="text-sm font-bold text-black mb-1">PAYMENT INFORMATION:</h3>
        <div className="text-xs text-black">
          <p><strong>Payment Method:</strong> {orderData.paymentMethod ? 
            orderData.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
            'Not specified'
          }</p>
          {orderData.notes && (
            <p><strong>Order Notes:</strong> {orderData.notes}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-black pt-2 text-center">
        <div className="text-xs text-black space-y-1">
          <p className="font-semibold">Thank you for choosing Nakshatra Gyaan!</p>
          <p>For queries: info@nakshatragyaan.com | Computer-generated invoice</p>
        </div>
        
        <div className="mt-2">
          <div className="text-xs text-black">
            <p>© {new Date().getFullYear()} Nakshatra Gyaan - All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .invoice-container {
            margin: 0;
            padding: 10px;
            box-shadow: none;
            max-width: none;
            font-size: 12px;
            line-height: 1.2;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            margin: 0;
            padding: 0;
          }
          
          @page {
            margin: 0.3in;
            size: A4;
          }
          
          /* Hide navigation and other elements */
          nav, .no-print, .print\\:hidden {
            display: none !important;
          }
          
          /* Ensure black text for printing */
          * {
            color: black !important;
          }
          
          /* Optimize table for printing */
          table {
            page-break-inside: avoid;
          }
          
          /* Ensure everything fits on one page */
          .invoice-container {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default Invoice;
