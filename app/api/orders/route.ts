import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type OrderRequestBody = {
  userId: number
  shippingAddress?: unknown
  billingAddress?: unknown
  notes?: string
  paymentMethod?: string
}

function generateOrderNumber(userId: number): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `NG-${y}${m}${d}-${userId}-${rand}`
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userIdParam = searchParams.get('userId')

    console.log('Orders API: Received request with userId:', userIdParam)

    if (!userIdParam) {
      console.log('Orders API: No userId provided')
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const userId = Number(userIdParam)
    if (Number.isNaN(userId)) {
      console.log('Orders API: Invalid userId format:', userIdParam)
      return NextResponse.json({ error: 'userId must be a number' }, { status: 400 })
    }

    console.log('Orders API: Fetching orders for userId:', userId)
 
    const orders = await prisma.orders.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        order_items: {
          include: {
            products: { include: { product_media: true } },
            services: { include: { service_media: true } },
          },
        },
      },
    })

    console.log('Orders API: Found orders:', orders.length)
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Orders API: Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OrderRequestBody

    if (!body || typeof body.userId !== 'number') {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const userId = body.userId

    // Fetch active cart with items
    const cart = await prisma.cart.findFirst({
      where: { user_id: userId, status: 'active' },
      include: {
        cart_items: {
          include: {
            products: { include: { product_media: true } },
            services: { include: { service_media: true } },
          },
        },
      },
    })

    if (!cart || cart.cart_items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Compute amounts
    const subtotal = cart.cart_items.reduce((sum, item) => {
      return sum + Number(item.price) * item.quantity
    }, 0)

    const taxAmount = 0 // Adjust if you have tax rules
    const shippingAmount = 0 // Adjust if you have shipping rules
    const discountAmount = 0 // Adjust if you have discounts/coupons
    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount

    const orderNumber = generateOrderNumber(userId)

    // Create order with items in a transaction
    const created = await prisma.$transaction(async (tx) => {

      const order = await tx.orders.create({
        data: {
          user_id: userId,
          order_number: orderNumber,
          status: 'pending',
          subtotal,
          tax_amount: taxAmount,
          shipping_amount: shippingAmount,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          payment_status: 'pending',
          payment_method: body.paymentMethod ?? null,
          shipping_address: body.shippingAddress ?? null,
          billing_address: body.billingAddress ?? null,
          notes: body.notes ?? null,
        },
      })

      if (!order) {
        throw new Error('Failed to create order')
      }

      // Map cart_items -> order_items
      const itemsData = cart.cart_items.map((ci) => ({
        order_id: order.id,
        cart_item_id: ci.id,
        item_type: ci.item_type,
        product_id: ci.product_id ?? null,
        service_id: ci.service_id ?? null,
        name: ci.products?.name ?? ci.services?.title ?? 'Item',
        description: ci.products?.description ?? ci.services?.description ?? null,
        quantity: ci.quantity,
        unit_price: ci.price,
        total_price: Number(ci.price) * ci.quantity,
      }))

     
      await tx.order_items.createMany({ data: itemsData })

      // Clear the cart after ordering
      await tx.cart_items.deleteMany({ where: { cart_id: cart.id } })
      await tx.cart.update({ where: { id: cart.id }, data: { status: 'ordered' } })

      return order
    })

    return NextResponse.json(
      {
        success: true,
        orderId: created.id,
        orderNumber: created.order_number,
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as { orderId?: number; userId?: number; action?: string }

    if (!body.orderId || !body.userId) {
      return NextResponse.json({ error: 'orderId and userId are required' }, { status: 400 })
    }


    const order = await prisma.orders.findUnique({ where: { id: body.orderId } })
    if (!order || order.user_id !== body.userId) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (body.action === 'cancel') {
      if (order.status !== 'pending' && order.status !== 'processing') {
        return NextResponse.json({ error: 'Order cannot be cancelled' }, { status: 400 })
      }

   
      const updated = await prisma.orders.update({
        where: { id: body.orderId },
        data: {
          status: 'cancelled',
        },
      })

      return NextResponse.json({ success: true, orderId: updated.id, status: updated.status })
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}


