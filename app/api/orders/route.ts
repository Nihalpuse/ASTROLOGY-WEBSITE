import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type OrderRequestBody = {
  userId: number
  shippingAddress?: unknown
  billingAddress?: unknown
  notes?: string
  paymentMethod?: string
}

type AdminOrderUpdateRequest = {
  orderId: number
  status?: string
  paymentStatus?: string
  notes?: string
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
    const adminParam = searchParams.get('admin')
    const statusParam = searchParams.get('status')
    const paymentStatusParam = searchParams.get('paymentStatus')
    const searchParam = searchParams.get('search')
    const pageParam = searchParams.get('page')
    const limitParam = searchParams.get('limit')

    // Admin endpoint - fetch all orders
    if (adminParam === 'true') {
      const page = parseInt(pageParam || '1')
      const limit = parseInt(limitParam || '10')
      const skip = (page - 1) * limit

      const whereClause: Record<string, unknown> = {}

      // Add status filter
      if (statusParam && statusParam !== 'All Status') {
        whereClause.status = statusParam
      }

      // Add payment status filter
      if (paymentStatusParam && paymentStatusParam !== 'All Payment Status') {
        whereClause.payment_status = paymentStatusParam
      }

      // Add search filter
      if (searchParam) {
        whereClause.OR = [
          { order_number: { contains: searchParam, mode: 'insensitive' } },
          { notes: { contains: searchParam, mode: 'insensitive' } },
          { 
            users: {
              name: { contains: searchParam, mode: 'insensitive' }
            }
          }
        ]
      }

      const [orders, totalCount] = await Promise.all([
        prisma.orders.findMany({
          where: whereClause,
          orderBy: { created_at: 'desc' },
          skip,
          take: limit,
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
                    image_url: true
                  }
                },
                services: { 
                  select: {
                    id: true,
                    title: true,
                    slug: true
                  }
                },
              },
            },
            user_addresses: {
              select: {
                full_name: true,
                city: true,
                state: true,
                pincode: true
              }
            }
          },
        }),
        prisma.orders.count({ where: whereClause })
      ])

      // Transform data for admin interface
      const transformedOrders = orders.map(order => ({
        id: order.id,
        orderId: order.order_number,
        date: order.created_at.toLocaleDateString('en-US'),
        customer: {
          name: order.user_addresses?.full_name || order.users?.name || 'N/A',
          location: order.user_addresses ? 
            `${order.user_addresses.city}, ${order.user_addresses.state}` : 
            'N/A'
        },
        items: order.order_items.length,
        total: Number(order.total_amount),
        status: order.status,
        paymentStatus: order.payment_status,
        user: order.users,
        orderItems: order.order_items,
        shippingAddress: order.shipping_address,
        billingAddress: order.billing_address,
        notes: order.notes,
        paymentMethod: order.payment_method,
        createdAt: order.created_at,
        updatedAt: order.updated_at
      }))

      return NextResponse.json({
        success: true,
        orders: transformedOrders,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      })
    }

    // User endpoint - fetch user-specific orders
    if (!userIdParam) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const userId = Number(userIdParam)
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: 'userId must be a number' }, { status: 400 })
    }
 
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
          shipping_address: body.shippingAddress as unknown || undefined,
          billing_address: body.billingAddress as unknown || undefined,
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
    const body = await request.json().catch(() => ({})) as { 
      orderId?: number; 
      userId?: number; 
      action?: string;
      status?: string;
      paymentStatus?: string;
      notes?: string;
      admin?: boolean;
    }

    if (!body.orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
    }

    const order = await prisma.orders.findUnique({ 
      where: { id: body.orderId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Admin update
    if (body.admin === true) {
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
        where: { id: body.orderId },
        data: updateData,
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
                  image_url: true
                }
              },
              services: { 
                select: {
                  id: true,
                  title: true,
                  slug: true
                }
              },
            },
          },
          user_addresses: {
            select: {
              full_name: true,
              city: true,
              state: true,
              pincode: true
            }
          }
        }
      })

      return NextResponse.json({ 
        success: true, 
        orderId: updated.id, 
        status: updated.status,
        paymentStatus: updated.payment_status,
        message: 'Order updated successfully'
      })
    }

    // User update (existing functionality)
    if (!body.userId) {
      return NextResponse.json({ error: 'userId is required for user updates' }, { status: 400 })
    }

    if (order.user_id !== body.userId) {
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
          updated_at: new Date()
        },
      })

      return NextResponse.json({ success: true, orderId: updated.id, status: updated.status })
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
  } catch (error) {
    console.error('Orders API: Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}


