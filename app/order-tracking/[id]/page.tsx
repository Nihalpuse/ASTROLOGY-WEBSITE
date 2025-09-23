"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedStars } from '@/app/components/AnimatedStars'
import { MysticBackground } from '@/app/components/MysticBackground'
import { toast } from 'sonner'
import { 
  CheckCircle, 
  Clock, 
  Truck, 
  Package, 
  MapPin, 
  Calendar,
  CreditCard,
  ArrowLeft,
  RefreshCw,
  Copy,
  Phone,
  Sparkles
} from 'lucide-react'
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
  tracking_number?: string;
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

interface TrackingEvent {
  date: string;
  status: string;
  description: string;
  location?: string;
}

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: _session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([])
  const [copied, setCopied] = useState(false)

  const fetchOrderData = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`)
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to fetch order')
      }
      
      const data = await res.json()
      setOrder(data.order)
      
      // Generate tracking events based on order status
      generateTrackingEvents(data.order)
    } catch (err) {
      console.error('Error fetching order:', err)
      toast.error(err instanceof Error ? err.message : "Failed to load order information")
    }
  }

  const generateTrackingEvents = (orderData: Order) => {
    const events: TrackingEvent[] = []
    const orderDate = new Date(orderData.order_date)
    
    // Order placed
    events.push({
      date: orderData.order_date,
      status: 'placed',
      description: 'Order placed successfully',
      location: 'Online'
    })

    // Add subsequent events based on order status
    if (['processing', 'shipped', 'delivered'].includes(orderData.order_status.toLowerCase())) {
      const processingDate = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000) // +1 day
      events.push({
        date: processingDate.toISOString(),
        status: 'processing',
        description: 'Order is being prepared and blessed by our expert gemologists',
        location: 'Nakshatra Gyaan Processing Center'
      })
    }

    if (['shipped', 'delivered'].includes(orderData.order_status.toLowerCase())) {
      const shippedDate = new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000) // +2 days
      events.push({
        date: shippedDate.toISOString(),
        status: 'shipped',
        description: 'Package shipped and on the way to you',
        location: 'In Transit'
      })
    }

    if (orderData.order_status.toLowerCase() === 'delivered') {
      const deliveredDate = new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000) // +5 days
      events.push({
        date: deliveredDate.toISOString(),
        status: 'delivered',
        description: 'Package delivered successfully',
        location: orderData.shipping_address.city
      })
    }

    setTrackingEvents(events)
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?redirect=order-tracking')
      return
    }

    if (status === 'authenticated') {
      fetchOrderData().finally(() => setLoading(false))
    }
  }, [status, router, params.id])

  const refreshTracking = async () => {
    setRefreshing(true)
    await fetchOrderData()
    setRefreshing(false)
    toast.success("Tracking information updated")
  }

  const copyTrackingNumber = () => {
    if (order?.tracking_number) {
      navigator.clipboard.writeText(order.tracking_number)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("Tracking number copied to clipboard")
    }
  }

  const copyOrderNumber = () => {
    if (order?.order_number) {
      navigator.clipboard.writeText(order.order_number)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("Order number copied to clipboard")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // (Removed simple getStatusIcon) - using enhanced helper below that accepts active/size

  // Enhanced status icon helper that can render active/inactive states and accept size classes
  const getStatusIcon = (status: string, active = false, sizeClass = 'h-3 w-3') => {
    const baseClass = `${sizeClass} ${active ? 'text-white' : 'text-lavender/80'}`
    switch (status.toLowerCase()) {
      case 'placed':
        return <CheckCircle className={baseClass} />
      case 'processing':
        return <Package className={baseClass} />
      case 'shipped':
        return <Truck className={baseClass} />
      case 'delivered':
        return <CheckCircle className={baseClass} />
      default:
        return <Clock className={baseClass} />
    }
  }

  // Normalize current status and compute stage index for safe checks
  const currentStatus = (order?.order_status || '').toLowerCase()
  const stages = ['placed', 'processing', 'shipped', 'delivered']
  const effectiveIndex = currentStatus ? stages.indexOf(currentStatus) : 0

  const getProgressWidth = () => {
    switch (currentStatus) {
      case 'placed':
        return '25%'
      case 'processing':
        return '50%'
      case 'shipped':
        return '75%'
      case 'delivered':
        return '100%'
      default:
        return '25%'
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-golden-amber-dark via-sunburst-yellow to-golden-amber-dark">
      <AnimatedStars />
    <MysticBackground>
  <div className="container mx-auto pt-12 px-4 py-8 relative z-10">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gold"></div>
            </div>
          ) : order ? (
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                  <Button
                    variant="ghost"
                    className="text-lavender hover:text-celestial-blue hover:bg-celestial-blue/10 mb-4"
                    onClick={() => router.back()}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2 text-mystic-brown">
                    Track Your Order
                  </h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <p className="text-lavender mr-2">Order #{order.order_number}</p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-lavender hover:text-celestial-blue hover:bg-celestial-blue/10"
                        onClick={copyOrderNumber}
                      >
                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    {order.tracking_number && (
                      <div className="flex items-center">
                        <p className="text-lavender mr-2">Tracking: {order.tracking_number}</p>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-lavender hover:text-celestial-blue hover:bg-celestial-blue/10"
                          onClick={copyTrackingNumber}
                        >
                          {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  onClick={refreshTracking}
                  disabled={refreshing}
                  className="bg-green-800 hover:bg-green-900 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  {refreshing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </Button>
              </div>

              {/* Progress Bar */}
              <Card className="mb-8 bg-midnight-blue-light/80 shadow-2xl backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="relative">
                    <div className="flex justify-between mb-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-lg transition-all duration-300 ${effectiveIndex >= 0 ? (effectiveIndex >= stages.indexOf('placed') ? 'bg-green-600' : 'bg-lavender/30') : 'bg-green-600'}`}>
                            {getStatusIcon('placed', effectiveIndex >= stages.indexOf('placed'), 'h-6 w-6')}
                          </div>
                          <span className="text-sm text-lavender font-medium">Placed</span>
                        </div>
                      <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-lg transition-all duration-300 ${effectiveIndex >= stages.indexOf('processing') ? 'bg-green-600 scale-110' : 'bg-lavender/30'}`}>
                          {getStatusIcon('processing', effectiveIndex >= stages.indexOf('processing'), 'h-6 w-6')}
                        </div>
                        <span className="text-sm text-lavender font-medium">Processing</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-lg transition-all duration-300 ${effectiveIndex >= stages.indexOf('shipped') ? 'bg-green-600 scale-110' : 'bg-lavender/30'}`}>
                          {getStatusIcon('shipped', effectiveIndex >= stages.indexOf('shipped'), 'h-6 w-6')}
                        </div>
                        <span className="text-sm text-lavender font-medium">Shipped</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-lg transition-all duration-300 ${effectiveIndex >= stages.indexOf('delivered') ? 'bg-green-600 scale-110' : 'bg-lavender/30'}`}>
                          {getStatusIcon('delivered', effectiveIndex >= stages.indexOf('delivered'), 'h-6 w-6')}
                        </div>
                        <span className="text-sm text-lavender font-medium">Delivered</span>
                      </div>
                    </div>
                    <div className="absolute top-6 left-6 right-6 h-2 bg-lavender/20 rounded-full -z-10">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: getProgressWidth() }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tracking Timeline */}
              <Card className="mb-8 bg-midnight-blue-light/80 shadow-2xl backdrop-blur-sm">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-serif font-semibold text-gold mb-6 flex items-center">
                    <div className="w-1 h-6 bg-green-600 rounded mr-3"></div>
                    Tracking History
                  </h2>
                  <div className="space-y-6">
                    {trackingEvents.map((event, index) => (
                      <div key={index} className="flex items-start space-x-4 relative">
                        {index !== trackingEvents.length - 1 && (
                          <div className="absolute left-2.5 top-8 w-0.5 h-16 bg-gradient-to-b from-green-600 to-green-300"></div>
                        )}
                        <div className="flex-shrink-0 mt-1 relative z-10">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shadow-md ${effectiveIndex >= stages.indexOf(event.status) ? 'bg-green-600' : 'bg-lavender/30'}`}>
                {getStatusIcon(event.status, effectiveIndex >= stages.indexOf(event.status), 'h-3 w-3')}
                            </div>
                        </div>
                        <div className="flex-1 bg-midnight-blue/20 rounded-lg p-4 backdrop-blur-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-lavender font-medium text-lg">{event.description}</p>
                              {event.location && (
                                <div className="flex items-center mt-1">
                                  <MapPin className="h-3 w-3 text-celestial-blue mr-1" />
                                  <p className="text-lavender/70 text-sm">{event.location}</p>
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-gold text-sm font-medium">{formatDate(event.date)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Details */}
              <Card className="mb-8 bg-midnight-blue-light/80 shadow-2xl backdrop-blur-sm">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-serif font-semibold text-gold mb-6 flex items-center">
                    <div className="w-1 h-6 bg-green-600 rounded mr-3"></div>
                    Order Details
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-celestial-blue mr-3 mt-0.5" />
                      <div>
                        <p className="text-lavender font-medium">Order Date</p>
                        <p className="text-gold">{formatDate(order.order_date)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-celestial-blue mr-3 mt-0.5" />
                      <div>
                        <p className="text-lavender font-medium">Estimated Delivery</p>
                        <p className="text-gold">{order.estimated_delivery}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <CreditCard className="h-5 w-5 text-celestial-blue mr-3 mt-0.5" />
                      <div>
                        <p className="text-lavender font-medium">Payment Method</p>
                        <p className="text-gold">{order.payment_method}</p>
                        <p className="text-sm text-lavender/70">Status: {order.payment_status}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-celestial-blue mr-3 mt-0.5" />
                      <div>
                        <p className="text-lavender font-medium">Shipping Address</p>
                        <p className="text-gold">{order.shipping_address.fullName}</p>
                        <p className="text-lavender/70">{order.shipping_address.addressLine1}</p>
                        {order.shipping_address.addressLine2 && (
                          <p className="text-lavender/70">{order.shipping_address.addressLine2}</p>
                        )}
                        <p className="text-lavender/70">
                          {order.shipping_address.city}, {order.shipping_address.state}, {order.shipping_address.pincode}
                        </p>
                        <div className="flex items-center mt-1">
                          <Phone className="h-3 w-3 text-lavender/70 mr-1" />
                          <p className="text-lavender/70 text-sm">{order.shipping_address.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-serif font-semibold mb-4 text-gold flex items-center">
                    <div className="w-1 h-5 bg-green-600 rounded mr-3"></div>
                    Order Items
                  </h3>
                  <div className="overflow-x-auto bg-midnight-blue/10 rounded-lg p-4 backdrop-blur-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-gold/20">
                          <TableHead className="text-lavender font-semibold">Product</TableHead>
                          <TableHead className="text-lavender text-right font-semibold">Price</TableHead>
                          <TableHead className="text-lavender text-center font-semibold">Quantity/Carats</TableHead>
                          <TableHead className="text-lavender text-right font-semibold">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item) => (
                          <TableRow key={item.id} className="border-b border-gold/10 hover:bg-midnight-blue/20 transition-colors">
                            <TableCell className="text-lavender font-medium py-4">
                              {item.product_name}
                            </TableCell>
                            <TableCell className="text-lavender text-right py-4">
                              ₹{item.unit_price.toLocaleString('en-IN')}
                              {item.is_stone && <span className="text-sm">/carat</span>}
                            </TableCell>
                            <TableCell className="text-center text-lavender py-4">
                              {item.is_stone ? (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">{item.carats} carats</span>
                              ) : (
                                <span className=" px-2 py-1 rounded text-sm">{item.quantity}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-gold text-right font-semibold py-4">
                              ₹{item.total_price.toLocaleString('en-IN')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="mt-6 bg-midnight-blue/20 rounded-lg p-4 backdrop-blur-sm">
                    <div className="space-y-3">
                      <div className="flex justify-between text-lg">
                        <span className="text-lavender">Subtotal</span>
                        <span className="text-gold font-semibold">₹{order.subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span className="text-lavender">Shipping</span>
                        <span className="text-green-600 font-semibold">Free</span>
                      </div>
                      <div className="border-t border-gold/30 pt-3 mt-3 flex justify-between">
                        <span className="text-xl text-lavender font-bold">Total</span>
                        <span className="text-xl text-gold font-bold">₹{order.total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Card */}
              {/* <Card className="bg-midnight-blue-light/80 shadow-2xl backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-serif font-semibold text-gold">Need Help?</h3>
                  </div>
                  
                  <p className="text-lavender mb-6">
                    Our customer support team is here to help you with any questions about your order.
                  </p>
                  
                  <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <Button 
                      onClick={() => router.push('/contact')}
                      className="bg-green-800 hover:bg-green-900 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    >
                      Contact Support
                    </Button>
                    <Button 
                      onClick={() => router.push('/orders')}
                      variant="outline"
                      className="text-lavender border-gold/30 hover:bg-gold/10 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      View All Orders
                    </Button>
                    <Button 
                      onClick={() => router.push('/shop')}
                      variant="outline"
                      className="text-lavender border-gold/30 hover:bg-gold/10 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </CardContent>
              </Card> */}
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-xl text-mystic-brown mb-8">Order not found</p>
              <Button 
                onClick={() => router.push('/orders')}
                className="bg-green-800 hover:bg-green-900 text-white"
              >
                View Your Orders
              </Button>
            </div>
          )}
        </div>
      </MysticBackground>
    </div>
  )
}