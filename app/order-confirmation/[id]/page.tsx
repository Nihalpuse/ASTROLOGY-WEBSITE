// File: app/order-confirmation/[id]/page.tsx
"use client"
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { AnimatedStars } from '@/app/components/AnimatedStars'
import { MysticBackground } from '@/app/components/MysticBackground'
import { toast } from 'sonner'
import { CheckCircle, Copy, Calendar, MapPin, CreditCard, Clock, Sparkles } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface ConfirmItem {
  id: number;
  name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

interface ConfirmOrder {
  id: number;
  order_number: string;
  order_date: string;
  order_status: string;
  payment_method: string | null;
  payment_status: string;
  estimated_delivery: string;
  items: ConfirmItem[];
  subtotal: number;
  total: number;
  shipping_address?: {
    fullName?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
  };
}

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { userId, isAuthenticated } = useCurrentUser();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<ConfirmOrder | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/signin?redirect=order-confirmation');
      return;
    }

    const fetchOrderData = async () => {
      try {
        if (!isAuthenticated || !userId) {
          throw new Error('User not authenticated');
        }

        // Fetch user's orders and pick this one by id
        const res = await fetch(`/api/orders?userId=${userId}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch orders');
        }
        const data = await res.json();
        const orders = (data.orders || []) as Array<any>;
        const raw = orders.find((o: any) => String(o.id) === String(params.id));
        if (!raw) {
          throw new Error('Order not found');
        }

        const mapped: ConfirmOrder = {
          id: raw.id,
          order_number: raw.order_number,
          order_date: raw.created_at,
          order_status: raw.status,
          payment_method: raw.payment_method ?? null,
          payment_status: raw.payment_status,
          estimated_delivery: '',
          items: (raw.order_items || []).map((it: any) => ({
            id: it.id,
            name: it.name || it.products?.name || it.services?.title || 'Item',
            unit_price: Number(it.unit_price ?? 0),
            quantity: it.quantity ?? 1,
            total_price: Number(it.total_price ?? (Number(it.unit_price ?? 0) * (it.quantity ?? 1))),
          })),
          subtotal: Number(raw.subtotal ?? 0),
          total: Number(raw.total_amount ?? raw.subtotal ?? 0),
          shipping_address: raw.shipping_address ?? undefined,
        };

        setOrder(mapped);
      } catch (err) {
        console.error('Error fetching order:', err);
        toast.error(err instanceof Error ? err.message : "Failed to load order information");
      } finally {
        setLoading(false);
      }
    };
    
    if (status === 'authenticated') {
      fetchOrderData();
    }
  }, [status, router, params.id, isAuthenticated, userId]);

  const copyOrderNumber = () => {
    if (order?.order_number) {
      navigator.clipboard.writeText(order.order_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Order number copied to clipboard");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
  <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-golden-amber-dark via-sunburst-yellow to-golden-amber-dark text-black">
      <AnimatedStars />
      <MysticBackground>
        <div className="container mx-auto pt-32 px-4 py-16 relative z-10 text-black">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gold"></div>
            </div>
          ) : order ? (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex justify-center items-center p-4 bg-emerald-100 rounded-full mb-6">
                  <CheckCircle className="h-16 w-16 text-emerald-600" />
                </div>
                <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 text-black">
                  Order Confirmed!
                </h1>
                <p className="text-xl text-black">
                  Thank you for your purchase. We&apos;ve received your order and will process it shortly.
                </p>
              </div>
              
              {/* Order Summary Card */}
              <Card className="mb-8 bg-midnight-blue-light/80 border border-gold/30">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-serif font-semibold text-black">Order Details</h2>
                      <div className="flex items-center mt-2">
                        <p className="text-black mr-2">Order #{order.order_number}</p>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-lavender hover:text-celestial-blue hover:bg-celestial-blue/10"
                          onClick={copyOrderNumber}
                        >
                          {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button 
                      onClick={() => router.push('/orders')}
                      className="mt-4 md:mt-0 bg-midnight-blue text-lavender border border-gold/30 hover:bg-celestial-blue/20"
                    >
                      View All Orders
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-celestial-blue mr-3 mt-0.5" />
                      <div>
                        <p className="text-black font-medium">Order Date</p>
                        <p className="text-black">{formatDate(order.order_date)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-celestial-blue mr-3 mt-0.5" />
                      <div>
                        <p className="text-black font-medium">Estimated Delivery</p>
                        <p className="text-black">{order.estimated_delivery}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <CreditCard className="h-5 w-5 text-celestial-blue mr-3 mt-0.5" />
                      <div>
                        <p className="text-black font-medium">Payment Method</p>
                        <p className="text-black">{order.payment_method ?? 'N/A'}</p>
                        <p className="text-sm text-black/70">Status: {order.payment_status}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-celestial-blue mr-3 mt-0.5" />
                      <div>
                        <p className="text-black font-medium">Shipping Address</p>
                        {order.shipping_address ? (
                          <>
                            {order.shipping_address.fullName && (
                              <p className="text-black">{order.shipping_address.fullName}</p>
                            )}
                            {order.shipping_address.addressLine1 && (
                              <p className="text-black/70">{order.shipping_address.addressLine1}</p>
                            )}
                            {order.shipping_address.addressLine2 && (
                              <p className="text-black/70">{order.shipping_address.addressLine2}</p>
                            )}
                            {(order.shipping_address.city || order.shipping_address.state || order.shipping_address.pincode) && (
                              <p className="text-black/70">
                                {[order.shipping_address.city, order.shipping_address.state, order.shipping_address.pincode].filter(Boolean).join(', ')}
                              </p>
                            )}
                            {order.shipping_address.phone && (
                              <p className="text-black/70">Phone: {order.shipping_address.phone}</p>
                            )}
                          </>
                        ) : (
                          <p className="text-black/70">No shipping address available</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-serif font-semibold mb-4 text-black">Order Items</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-black">Product</TableHead>
                          <TableHead className="text-black text-right">Price</TableHead>
                          <TableHead className="text-black text-center">Quantity</TableHead>
                          <TableHead className="text-black text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-black font-medium">
                              {item.name}
                            </TableCell>
                            <TableCell className="text-black text-right">
                              ₹{item.unit_price.toLocaleString('en-IN')}
                            </TableCell>
                            <TableCell className="text-center text-black">
                              <span>{item.quantity}</span>
                            </TableCell>
                            <TableCell className="text-black text-right">
                              ₹{item.total_price.toLocaleString('en-IN')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-black">Subtotal</span>
                      <span className="text-black">₹{order.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">Shipping</span>
                      <span className="text-black">Free</span>
                    </div>
                    <div className="border-t border-gold/30 pt-2 mt-2 flex justify-between">
                      <span className="text-lg text-black font-bold">Total</span>
                      <span className="text-lg text-black font-bold">₹{order.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Next Steps Card */}
              <Card className="bg-midnight-blue-light/80 border border-gold/30">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Sparkles className="h-6 w-6 text-celestial-blue mr-3" />
                    <h3 className="text-xl font-serif font-semibold text-black">Preparation in Progress</h3>
                  </div>
                  
                  <p className="text-black mb-6">
                    Our expert gemologists are preparing your items with utmost care. Each item is cleansed, energized, and blessed following ancient rituals to enhance their natural healing properties before being shipped to you.
                  </p>
                  
                  <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <Button 
                      onClick={() => router.push(`/order-tracking/${order.id}`)}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      Track Order
                    </Button>
                    <Button 
                      onClick={() => router.push('/shop')}
                      variant="outline"
                      className="text-lavender border-gold/30 hover:bg-gold/10"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-xl text-black mb-8">Order not found</p>
              <Button 
                onClick={() => router.push('/orders')}
                className="bg-black text-white hover:bg-gray-800"
              >
                View Your Orders
              </Button>
            </div>
          )}
        </div>
      </MysticBackground>
    </div>
  );
}