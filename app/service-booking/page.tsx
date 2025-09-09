"use client"

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AnimatedStars } from '@/app/components/AnimatedStars'
import { MysticBackground } from '@/app/components/MysticBackground'
import { toast } from 'sonner'

interface ServiceDetails {
  id: number;
  title: string;
  description: string;
  price: number;
  duration: string;
  delivery_type: string;
  image_url?: string;
}

interface TimeSlot {
  id: string;
  time: string;
  date: string;
  available: boolean;
}

export default function ServiceBookingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const serviceId = searchParams?.get('serviceId')
  const orderId = searchParams?.get('orderId')
  
  const [service, setService] = useState<ServiceDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [bookingLoading, setBookingLoading] = useState(false)

  // Mock service data - replace with actual API call later
  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true)
        
        // Mock data for now
        const mockService: ServiceDetails = {
          id: Number(serviceId) || 1,
          title: "Personalized Astrology Consultation",
          description: "Get personalized insights into your life, career, relationships, and future through our expert astrologer consultation. This session includes detailed analysis of your birth chart and personalized guidance.",
          price: 1500,
          duration: "60 minutes",
          delivery_type: "video_call",
          image_url: "/images/astrology-consultation.jpg"
        }
        
        setService(mockService)
        
        // Generate mock time slots for the next 7 days
        const slots: TimeSlot[] = []
        const today = new Date()
        
        for (let i = 1; i <= 7; i++) {
          const date = new Date(today)
          date.setDate(today.getDate() + i)
          const dateStr = date.toISOString().split('T')[0]
          
          // Generate 4 time slots per day
          const times = ['09:00', '12:00', '15:00', '18:00']
          times.forEach(time => {
            slots.push({
              id: `${dateStr}-${time}`,
              time,
              date: dateStr,
              available: Math.random() > 0.3 // 70% availability
            })
          })
        }
        
        setTimeSlots(slots)
      } catch (error) {
        console.error('Error fetching service details:', error)
        toast.error('Failed to load service details')
      } finally {
        setLoading(false)
      }
    }

    if (serviceId) {
      fetchServiceDetails()
    }
  }, [serviceId])

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedTime('')
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time')
      return
    }

    try {
      setBookingLoading(true)
      
      // Mock booking process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Service booking confirmed! You will receive a Google Meet link via email.')
      
      // Redirect to confirmation page or back to orders
      router.push('/orders')
    } catch (error) {
      console.error('Booking error:', error)
      toast.error('Failed to book service. Please try again.')
    } finally {
      setBookingLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  const getAvailableSlotsForDate = (date: string) => {
    return timeSlots.filter(slot => slot.date === date && slot.available)
  }

  const getUniqueDates = () => {
    return [...new Set(timeSlots.map(slot => slot.date))].sort()
  }

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-golden-amber-dark via-sunburst-yellow to-golden-amber-dark">
        <AnimatedStars />
        <MysticBackground />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gold"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-golden-amber-dark via-sunburst-yellow to-golden-amber-dark">
        <AnimatedStars />
        <MysticBackground />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">Service Not Found</h1>
            <p className="text-lg text-neutral-700 mb-8">The requested service could not be found.</p>
            <Button onClick={() => router.push('/orders')} className="bg-green-800 hover:bg-green-900 text-white">
              Back to Orders
            </Button>
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
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-neutral-900">
            Book Your Service
          </h1>
          <p className="text-lg text-neutral-700">Schedule your consultation with our expert astrologer</p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Service Details Card */}
          <div className="bg-white/95 rounded-2xl p-8 shadow-lg">
            <div className="mb-6">
              <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl mb-6 flex items-center justify-center">
                {service.image_url ? (
                  <img 
                    src={service.image_url} 
                    alt={service.title}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="text-center">
                    <svg className="w-16 h-16 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-blue-600 font-medium">Astrology Service</p>
                  </div>
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">{service.title}</h2>
              <p className="text-neutral-600 mb-4 leading-relaxed">{service.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-neutral-200">
                  <span className="text-neutral-600">Duration:</span>
                  <span className="font-medium text-neutral-900">{service.duration}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-neutral-200">
                  <span className="text-neutral-600">Delivery:</span>
                  <span className="font-medium text-neutral-900 capitalize">{service.delivery_type.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-neutral-600">Price:</span>
                  <span className="font-bold text-2xl text-green-600">₹{service.price.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white/95 rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-neutral-900 mb-6">Select Date & Time</h3>
            
            {/* Date Selection */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-neutral-900 mb-4">Choose Date</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {getUniqueDates().map(date => (
                  <button
                    key={date}
                    onClick={() => handleDateSelect(date)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      selectedDate === date
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-neutral-200 hover:border-blue-300 text-neutral-700'
                    }`}
                  >
                    <div className="font-medium">{formatDate(date)}</div>
                    <div className="text-sm text-neutral-500">
                      {getAvailableSlotsForDate(date).length} slots available
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-neutral-900 mb-4">Choose Time</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {getAvailableSlotsForDate(selectedDate).map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => handleTimeSelect(slot.time)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        selectedTime === slot.time
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-neutral-200 hover:border-blue-300 text-neutral-700'
                      }`}
                    >
                      <div className="font-medium">{slot.time}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Summary */}
            {selectedDate && selectedTime && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Booking Summary</h4>
                <div className="space-y-1 text-sm text-green-700">
                  <div>Service: {service.title}</div>
                  <div>Date: {formatDate(selectedDate)}</div>
                  <div>Time: {selectedTime}</div>
                  <div>Duration: {service.duration}</div>
                  <div className="font-semibold">Total: ₹{service.price.toLocaleString('en-IN')}</div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleBooking}
                disabled={!selectedDate || !selectedTime || bookingLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3"
              >
                {bookingLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Booking...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Confirm Booking
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push('/orders')}
                className="flex-1 border-neutral-300 text-neutral-700 hover:bg-neutral-50 py-3"
              >
                Cancel
              </Button>
            </div>

            {/* Google Meet Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h5 className="font-medium text-blue-800">Google Meet Integration</h5>
                  <p className="text-sm text-blue-700 mt-1">
                    After booking, you&apos;ll receive a Google Meet link via email. The meeting will be automatically scheduled in your calendar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
