"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AnimatedStars } from '@/app/components/AnimatedStars'
import { MysticBackground } from '@/app/components/MysticBackground'
import { toast } from 'sonner'
import { Search, Package, ArrowLeft } from 'lucide-react'

export default function OrderTrackingPage() {
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState('')
  const [loading, setLoading] = useState(false)

  const handleTrackOrder = async () => {
    if (!orderNumber.trim()) {
      toast.error('Please enter an order number')
      return
    }

    setLoading(true)
    
    try {
      // First, try to find the order by order number
      const res = await fetch(`/api/orders/${orderNumber}`)
      
      if (res.ok) {
        const data = await res.json()
        if (data.order && data.order.id) {
          router.push(`/order-tracking/${data.order.id}`)
          return
        }
      }
      
      // If not found by order number, try treating it as order ID
      if (!isNaN(Number(orderNumber))) {
        const idRes = await fetch(`/api/orders/${orderNumber}`)
        if (idRes.ok) {
          router.push(`/order-tracking/${orderNumber}`)
          return
        }
      }
      
      toast.error('Order not found. Please check your order number and try again.')
    } catch (error) {
      console.error('Error tracking order:', error)
      toast.error('Failed to track order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTrackOrder()
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-golden-amber-dark via-sunburst-yellow to-golden-amber-dark">
      <AnimatedStars />
      <MysticBackground>
  <div className="container mx-auto pt-20 px-4 py-12 relative z-10">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="relative mb-12">
              <Button
                variant="ghost"
                className="text-lavender hover:text-celestial-blue hover:bg-celestial-blue/10 mb-6 absolute left-0 top-0"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="flex flex-col items-center">
                <div className="inline-flex justify-center items-center p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-full mb-6 shadow-lg">
                  <Package className="h-16 w-16 text-green-600" />
                </div>

                <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 text-mystic-brown text-center">
                  Track Your Order
                </h1>
                <p className="text-xl text-mystic-brown text-center">
                  Enter your order number to track your package and see its current status.
                </p>
              </div>
            </div>

            {/* Search Card */}
            <Card className="mb-8 bg-midnight-blue-light/80 shadow-2xl backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="orderNumber" className="block text-lg font-semibold text-gold mb-3 flex items-center">
                      <div className="w-1 h-5 bg-green-600 rounded mr-3"></div>
                      Order Number
                    </label>
                    <div className="relative">
                      <Input
                        id="orderNumber"
                        type="text"
                        placeholder="Enter your order number (e.g., NK001234 or just the order ID)"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="text-lg py-4 px-6 bg-midnight-blue text-lavender border-gold/30 focus:border-green-600 focus:ring-green-600 placeholder:text-lavender/50 shadow-inner"
                      />
                      <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-lavender/50" />
                    </div>
                    <p className="text-sm text-lavender/70 mt-3 flex items-center">
                      <div className="w-2 h-2 bg-celestial-blue rounded-full mr-2"></div>
                      You can find your order number in your order confirmation email or on your orders page.
                    </p>
                  </div>

                  <Button
                    onClick={handleTrackOrder}
                    disabled={loading || !orderNumber.trim()}
                    className="w-full bg-green-800 hover:bg-green-900 text-white text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                        Tracking Order...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Search className="h-5 w-5 mr-2" />
                        Track Order
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="bg-midnight-blue-light/80 shadow-2xl backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-serif font-semibold text-gold mb-4 flex items-center">
                  <div className="w-1 h-5 bg-green-600 rounded mr-3"></div>
                  Need Help?
                </h3>
                
                <div className="space-y-4 text-lavender">
                  <div className="bg-midnight-blue/20 rounded-lg p-4 backdrop-blur-sm">
                    <h4 className="font-semibold text-gold flex items-center">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                      Can't find your order number?
                    </h4>
                    <p className="text-sm mt-1">Check your email confirmation or visit your orders page to find all your order numbers.</p>
                  </div>
                  
                  <div className="bg-midnight-blue/20 rounded-lg p-4 backdrop-blur-sm">
                    <h4 className="font-semibold text-gold flex items-center">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                      Order not showing up?
                    </h4>
                    <p className="text-sm mt-1">It may take a few minutes for new orders to appear in our tracking system. Please try again in a few minutes.</p>
                  </div>
                  
                  <div className="bg-midnight-blue/20 rounded-lg p-4 backdrop-blur-sm">
                    <h4 className="font-semibold text-gold flex items-center">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                      Still having trouble?
                    </h4>
                    <p className="text-sm mt-1">Contact our customer support team for assistance.</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mt-6">
                  <Button 
                    onClick={() => router.push('/orders')}
                    variant="outline"
                    className="text-lavender border-gold/30 hover:bg-gold/10 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    View All Orders
                  </Button>
                  <Button 
                    onClick={() => router.push('/contact')}
                    className="bg-green-800 hover:bg-green-900 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MysticBackground>
    </div>
  )
}