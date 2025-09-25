"use client"
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AnimatedStars } from '@/app/components/AnimatedStars'
import { MysticBackground } from '@/app/components/MysticBackground'
import { toast } from 'sonner'
import { CheckCircle, Copy, Calendar, MapPin, CreditCard, Clock, Sparkles } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface OrderItem {
  id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  is_stone: boolean;
  carats?: number;
  total_price: number;
}

interface Order {
  id: number;
  order_number: string;
  order_date: string;
  order_status: string;
  payment_method: string;
  payment_status: string;
  estimated_delivery: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  shipping_address: {
    fullName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
}

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: _session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/signin?redirect=order-confirmation');
      return;
    }

    const fetchOrderData = async () => {
      try {
        // Fetch from the API endpoint
        const res = await fetch(`/api/orders/${params.id}`);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch order');
        }
        
        const data = await res.json();
        setOrder(data.order);
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
  }, [status, router, params.id]);

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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-golden-amber-dark via-sunburst-yellow to-golden-amber-dark">
      <AnimatedStars />
      <MysticBackground>
        <div className="container mx-auto pt-24 sm:pt-32 px-3 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gold"></div>
            </div>
          ) : order ? (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8 sm:mb-12">
                <div className="inline-flex justify-center items-center p-3 sm:p-4 bg-emerald-100 rounded-full mb-4 sm:mb-6">
                  <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-emerald-600" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-3 sm:mb-4 text-mystic-brown">
                  Order Confirmed!
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-mystic-brown px-4">
                  Thank you for your purchase. We&apos;ve received your order and will process it shortly.
                </p>
              </div>
              
              {/* Order Summary Card */}
              <Card className="mb-6 sm:mb-8 bg-midnight-blue-light/80 shadow-2xl backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 sm:mb-6">
                    <div className="mb-4 lg:mb-0">
                      <h2 className="text-xl sm:text-2xl font-serif font-semibold text-gold flex items-center">
                        <div className="w-1 h-4 sm:h-6 bg-green-600 rounded mr-2 sm:mr-3"></div>
                        Order Details
                      </h2>
                      <div className="flex items-center mt-2">
                        <p className="text-lavender mr-2 text-sm sm:text-base">Order #{order.order_number}</p>
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
                      className="bg-green-800 hover:bg-green-900 text-white shadow-lg hover:shadow-xl transition-all duration-200 w-full lg:w-auto"
                    >
                      View All Orders
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="flex items-start">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-celestial-blue mr-2 sm:mr-3 mt-0.5" />
                      <div>
                        <p className="text-lavender font-medium text-sm sm:text-base">Order Date</p>
                        <p className="text-gold text-sm sm:text-base">{formatDate(order.order_date)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-celestial-blue mr-2 sm:mr-3 mt-0.5" />
                      <div>
                        <p className="text-lavender font-medium text-sm sm:text-base">Estimated Delivery</p>
                        <p className="text-gold text-sm sm:text-base">{order.estimated_delivery}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-celestial-blue mr-2 sm:mr-3 mt-0.5" />
                      <div>
                        <p className="text-lavender font-medium text-sm sm:text-base">Payment Method</p>
                        <p className="text-gold text-sm sm:text-base">{order.payment_method}</p>
                        <p className="text-xs sm:text-sm text-lavender/70">Status: {order.payment_status}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-celestial-blue mr-2 sm:mr-3 mt-0.5" />
                      <div>
                        <p className="text-lavender font-medium text-sm sm:text-base">Shipping Address</p>
                        <p className="text-gold text-sm sm:text-base">{order.shipping_address.fullName}</p>
                        <p className="text-lavender/70 text-xs sm:text-sm">{order.shipping_address.addressLine1}</p>
                        {order.shipping_address.addressLine2 && (
                          <p className="text-lavender/70 text-xs sm:text-sm">{order.shipping_address.addressLine2}</p>
                        )}
                        <p className="text-lavender/70 text-xs sm:text-sm">
                          {order.shipping_address.city}, {order.shipping_address.state}, {order.shipping_address.pincode}
                        </p>
                        <p className="text-lavender/70 text-xs sm:text-sm">Phone: {order.shipping_address.phone}</p>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-serif font-semibold mb-3 sm:mb-4 text-gold flex items-center">
                    <div className="w-1 h-4 sm:h-5 bg-green-600 rounded mr-2 sm:mr-3"></div>
                    Order Items
                  </h3>
                  <div className="overflow-x-auto bg-midnight-blue/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-gold/20">
                          <TableHead className="text-lavender font-semibold text-xs sm:text-sm">Product</TableHead>
                          <TableHead className="text-lavender text-right font-semibold text-xs sm:text-sm">Price</TableHead>
                          <TableHead className="text-lavender text-center font-semibold text-xs sm:text-sm">Quantity/Carats</TableHead>
                          <TableHead className="text-lavender text-right font-semibold text-xs sm:text-sm">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item) => (
                          <TableRow key={item.id} className="border-b border-gold/10 hover:bg-midnight-blue/20 transition-colors">
                            <TableCell className="text-lavender font-medium py-3 sm:py-4 text-xs sm:text-sm">
                              {item.product_name}
                            </TableCell>
                            <TableCell className="text-lavender text-right py-3 sm:py-4 text-xs sm:text-sm">
                              ₹{item.unit_price.toLocaleString('en-IN')}
                              {item.is_stone && <span className="text-xs">/carat</span>}
                            </TableCell>
                            <TableCell className="text-center text-lavender py-3 sm:py-4 text-xs sm:text-sm">
                              {item.is_stone ? (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{item.carats} carats</span>
                              ) : (
                                <span className="px-2 py-1 rounded text-xs">{item.quantity}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-gold text-right font-semibold py-3 sm:py-4 text-xs sm:text-sm">
                              ₹{item.total_price.toLocaleString('en-IN')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="mt-4 sm:mt-6 bg-midnight-blue/20 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between text-base sm:text-lg">
                        <span className="text-lavender">Subtotal</span>
                        <span className="text-gold font-semibold">₹{order.subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-base sm:text-lg">
                        <span className="text-lavender">Shipping</span>
                        <span className="text-green-600 font-semibold">Free</span>
                      </div>
                      <div className="border-t border-gold/30 pt-2 sm:pt-3 mt-2 sm:mt-3 flex justify-between">
                        <span className="text-lg sm:text-xl text-lavender font-bold">Total</span>
                        <span className="text-lg sm:text-xl text-gold font-bold">₹{order.total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Next Steps Card */}
              <Card className="bg-midnight-blue-light/80 shadow-2xl backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="w-1 h-4 sm:h-6 bg-green-600 rounded mr-2 sm:mr-3"></div>
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-celestial-blue mr-2 sm:mr-3" />
                    <h3 className="text-lg sm:text-xl font-serif font-semibold text-gold">Preparation in Progress</h3>
                  </div>
                  
                  <p className="text-lavender mb-4 sm:mb-6 text-sm sm:text-base">
                    Our expert gemologists are preparing your items with utmost care. Each item is cleansed, energized, and blessed following ancient rituals to enhance their natural healing properties before being shipped to you.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <Button 
                      onClick={() => router.push(`/order-tracking/${order.id}`)}
                      className="bg-green-800 hover:bg-green-900 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base py-2 sm:py-3"
                    >
                      Track Order
                    </Button>
                    <Button 
                      onClick={() => router.push('/shop')}
                      variant="outline"
                      className="text-lavender border-gold/30 hover:bg-gold/10 shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base py-2 sm:py-3"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center p-6 sm:p-8">
              <p className="text-lg sm:text-xl text-mystic-brown mb-6 sm:mb-8">Order not found</p>
              <Button 
                onClick={() => router.push('/orders')}
                className="bg-green-800 hover:bg-green-900 text-white shadow-lg hover:shadow-xl transition-all duration-200"
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