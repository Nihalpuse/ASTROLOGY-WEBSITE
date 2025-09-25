import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    const { searchParams } = new URL(request.url)
    const adminParam = searchParams.get('admin')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Check if orderId is a number or order_number string
    const isNumericId = !isNaN(Number(orderId)) && Number.isInteger(Number(orderId));
    
    const order = await prisma.orders.findUnique({
      where: isNumericId 
        ? { id: parseInt(orderId) }
        : { order_number: orderId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        order_items: {
          include: {
            products: { 
              select: {
                id: true,
                name: true,
                sku: true,
                image_url: true,
                description: true,
                price: true
              }
            },
            services: { 
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                price: true
              }
            },
          },
        },
        user_addresses: {
          select: {
            full_name: true,
            phone: true,
            address_line1: true,
            address_line2: true,
            city: true,
            state: true,
            pincode: true,
            country: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if admin parameter is provided to return admin-specific format
    if (adminParam) {
      // Transform data for admin interface
      const transformedOrder = {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        placedOn: order.created_at.toLocaleDateString('en-US'),
        items: order.order_items.map(item => ({
          id: item.id,
          name: item.products?.name || item.services?.title || 'Unknown Item',
          sku: item.products?.sku || item.services?.slug || 'N/A',
          quantity: item.quantity,
          unitPrice: Number(item.unit_price),
          totalPrice: Number(item.total_price),
          type: item.item_type,
          product: item.products,
          service: item.services
        })),
        subtotal: Number(order.subtotal),
        tax: Number(order.tax_amount || 0),
        shipping: Number(order.shipping_amount || 0),
        discount: Number(order.discount_amount || 0),
        total: Number(order.total_amount),
        customer: {
          name: order.user_addresses?.full_name || order.users?.name || 'N/A',
          email: order.users?.email || 'N/A',
          phone: order.user_addresses?.phone || 'N/A'
        },
        shippingAddress: order.user_addresses ? {
          name: order.user_addresses.full_name,
          address: order.user_addresses.address_line1,
          address2: order.user_addresses.address_line2,
          city: order.user_addresses.city,
          state: order.user_addresses.state,
          pincode: order.user_addresses.pincode,
          country: order.user_addresses.country
        } : order.shipping_address,
        billingAddress: order.billing_address,
        paymentMethod: order.payment_method,
        notes: order.notes,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        // Status history (you can implement this based on your requirements)
        statusHistory: [
          {
            status: 'Order Placed',
            date: order.created_at.toLocaleString('en-US'),
            description: 'Order created and payment confirmed'
          }
        ]
      }

      return NextResponse.json({
        success: true,
        order: transformedOrder
      })
    }

    // Generate estimated delivery date (5-7 business days from order date)
    const estimatedDelivery = new Date(order.created_at)
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7)
    const estimatedDeliveryString = estimatedDelivery.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    // Generate tracking number if not exists (since tracking_number doesn't exist in schema yet)
    const trackingNumber = `NK${order.id.toString().padStart(6, '0')}${Date.now().toString().slice(-4)}`

    // Transform data for order confirmation/tracking interface
    const transformedOrder = {
      id: order.id,
      order_number: order.order_number,
      order_date: order.created_at.toISOString(),
      order_status: order.status,
      payment_method: order.payment_method || 'Card',
      payment_status: order.payment_status,
      estimated_delivery: estimatedDeliveryString,
      tracking_number: trackingNumber,
      items: order.order_items.map(item => ({
        id: item.id,
        product_name: item.products?.name || item.services?.title || 'Unknown Item',
        unit_price: Number(item.unit_price),
        quantity: item.quantity,
        is_stone: item.products?.name?.toLowerCase().includes('stone') || item.products?.name?.toLowerCase().includes('crystal') || false,
        carats: item.quantity, // For stones, quantity represents carats
        total_price: Number(item.total_price)
      })),
      subtotal: Number(order.subtotal),
      total: Number(order.total_amount),
      shipping_address: {
        fullName: order.user_addresses?.full_name || order.users?.name || 'N/A',
        addressLine1: order.user_addresses?.address_line1 || '',
        addressLine2: order.user_addresses?.address_line2 || '',
        city: order.user_addresses?.city || '',
        state: order.user_addresses?.state || '',
        pincode: order.user_addresses?.pincode || '',
        phone: order.user_addresses?.phone || ''
      }
    }

    return NextResponse.json({
      success: true,
      order: transformedOrder
    })
  } catch (error) {
    console.error('Order Details API: Error fetching order:', error)
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    const body = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Check if orderId is a number or order_number string
    const isNumericId = !isNaN(Number(orderId)) && Number.isInteger(Number(orderId));
    
    const order = await prisma.orders.findUnique({
      where: isNumericId 
        ? { id: parseInt(orderId) }
        : { order_number: orderId }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date()
    }

    if (body.status) {
      updateData.status = body.status
    }

    if (body.paymentStatus) {
      updateData.payment_status = body.paymentStatus
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes
    }

    const updated = await prisma.orders.update({
      where: { id: order.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      orderId: updated.id,
      status: updated.status,
      paymentStatus: updated.payment_status,
      message: 'Order updated successfully'
    })
  } catch (error) {
    console.error('Order Details API: Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
