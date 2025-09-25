"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedStars } from '@/app/components/AnimatedStars'
import { MysticBackground } from '@/app/components/MysticBackground'
import { toast } from 'sonner'
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react'

interface PaymentDetails {
  orderId: string
  amount: number
  currency: string
  key: string
}

interface OrderDetails {
  orderNumber: string
  total: number
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  customerName: string
  customerEmail: string
  customerPhone: string
}

export default function RazorpayPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializePayment = async () => {
      try {
        setLoading(true)
        
        // Get order details from URL params
        const orderId = searchParams?.get('orderId')
        const orderNumber = searchParams?.get('orderNumber')
        
        if (!orderId || !orderNumber) {
          setError('Invalid payment link')
          return
        }

        // Fetch order details
        const orderRes = await fetch(`/api/orders/${orderId}`)
        if (!orderRes.ok) {
          throw new Error('Failed to fetch order details')
        }
        
        const orderData = await orderRes.json()
        setOrderDetails({
          orderNumber: orderData.order.order_number,
          total: orderData.order.total,
          items: orderData.order.items.map((item: any) => ({
            name: item.product_name,
            quantity: item.quantity,
            price: item.total_price
          })),
          customerName: orderData.order.shipping_address.fullName,
          customerEmail: '', // Add if available in order data
          customerPhone: orderData.order.shipping_address.phone
        })

        // Create Razorpay order
        const paymentRes = await fetch('/api/razorpay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: orderData.order.total,
            orderId: orderId,
            customerDetails: {
              name: orderData.order.shipping_address.fullName,
              email: '', // Add if available
              phone: orderData.order.shipping_address.phone
            }
          }),
        })

        if (!paymentRes.ok) {
          throw new Error('Failed to initialize payment')
        }

        const paymentData = await paymentRes.json()
        setPaymentDetails(paymentData)
      } catch (err) {
        console.error('Payment initialization error:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize payment')
      } finally {
        setLoading(false)
      }
    }

    initializePayment()
  }, [searchParams])

  const handlePayment = async () => {
    if (!paymentDetails) return

    setProcessing(true)
    
    try {
      const options = {
        key: paymentDetails.key,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        name: 'Nakshatra Gyaan',
        description: `Order #${orderDetails?.orderNumber}`,
        order_id: paymentDetails.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyRes = await fetch('/api/razorpay', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            const verifyData = await verifyRes.json()
            
            if (verifyData.success) {
              toast.success('Payment successful!')
              router.push(`/order-confirmation/${searchParams?.get('orderId')}`)
            } else {
              toast.error('Payment verification failed')
            }
          } catch (err) {
            console.error('Payment verification error:', err)
            toast.error('Payment verification failed')
          }
        },
        prefill: {
          name: orderDetails?.customerName || '',
          email: orderDetails?.customerEmail || '',
          contact: orderDetails?.customerPhone || '',
        },
        theme: {
          color: '#059669', // Green color matching your theme
        },
        modal: {
          ondismiss: () => {
            setProcessing(false)
          },
        },
      }

      const razorpay = (window as any).Razorpay
      if (razorpay) {
        const rzp = new razorpay(options)
        rzp.open()
      } else {
        throw new Error('Razorpay SDK not loaded')
      }
    } catch (err) {
      console.error('Payment error:', err)
      toast.error('Failed to process payment')
      setProcessing(false)
    }
  }

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-golden-amber-dark via-sunburst-yellow to-golden-amber-dark">
        <AnimatedStars />
        <MysticBackground />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-golden-amber-dark via-sunburst-yellow to-golden-amber-dark">
        <AnimatedStars />
        <MysticBackground />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-md mx-auto">
            <Card className="bg-white/95 shadow-2xl">
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Error</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button 
                  onClick={() => router.push('/checkout')}
                  className="bg-green-800 hover:bg-green-900 text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-golden-amber-dark via-sunburst-yellow to-golden-amber-dark">
      <AnimatedStars />
      <MysticBackground />
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-green-600 hover:bg-green-50 mb-4"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-gray-800">
              Complete Your Payment
            </h1>
            <p className="text-lg text-gray-600">
              Secure payment powered by Razorpay
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card className="bg-white/95 shadow-2xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-serif text-gray-800 flex items-center">
                  <div className="w-1 h-6 bg-green-600 rounded mr-3"></div>
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number</span>
                    <span className="text-gray-800 font-semibold">{orderDetails?.orderNumber}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-gray-600 font-medium">Items:</h4>
                    {orderDetails?.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.name} x {item.quantity}</span>
                        <span className="text-gray-800">₹{item.price.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-gray-300 pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span className="text-gray-600">Total</span>
                      <span className="text-green-600">₹{orderDetails?.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Options */}
            <Card className="bg-white/95 shadow-2xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-serif text-gray-800 flex items-center">
                  <CreditCard className="h-6 w-6 mr-3" />
                  Payment Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center mb-4">
                      <Shield className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-gray-700 font-medium">Secure Payment</span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Your payment is secured with 256-bit SSL encryption. We never store your card details.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Credit/Debit Cards</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>UPI Payments</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Net Banking</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Wallets (Paytm, PhonePe, etc.)</span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={processing || !paymentDetails}
                    className="w-full bg-green-800 hover:bg-green-900 text-white text-lg font-semibold py-4 rounded-xl shadow-lg"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Pay ₹{orderDetails?.total.toLocaleString('en-IN')}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
