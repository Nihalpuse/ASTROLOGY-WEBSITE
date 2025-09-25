import { NextRequest, NextResponse } from 'next/server'

// Initialize Razorpay
const Razorpay = require('razorpay')
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency = 'INR', orderId, customerDetails } = body

    // Validate required fields
    if (!amount || !orderId) {
      return NextResponse.json(
        { error: 'Amount and orderId are required' },
        { status: 400 }
      )
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: currency,
      receipt: `order_${orderId}`,
      notes: {
        orderId: orderId,
        customerName: customerDetails?.name || '',
        customerEmail: customerDetails?.email || '',
        customerPhone: customerDetails?.phone || '',
      },
    })

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error('Razorpay order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    // Verify payment signature
    const crypto = require('crypto')
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id)
    const generated_signature = hmac.digest('hex')

    const isAuthentic = generated_signature === razorpay_signature

    if (isAuthentic) {
      // Payment verified successfully
      return NextResponse.json({
        success: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        message: 'Payment verified successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    )
  }
}
