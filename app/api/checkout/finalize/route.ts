import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type FinalizeBody = {
  orderId: number
  orderNumber?: string
  shippingAddress?: unknown
  billingAddress?: unknown
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FinalizeBody

    if (!body || typeof body.orderId !== 'number') {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
    }

    // Ensure order exists
    // @ts-expect-error Prisma client may be awaiting generation for new models
    const existing = await prisma.orders.findUnique({ where: { id: body.orderId } })
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Optional: persist provided addresses and link an address_id
    let addressId: number | null = null
    if (body.shippingAddress && existing.user_id) {
      // Create a saved address for the user from provided data (best-effort)
      try {
        // @ts-expect-error Prisma client may be awaiting generation for new models
        const createdAddr = await prisma.user_addresses.create({
          data: {
            user_id: existing.user_id,
            full_name: (body.shippingAddress as any).fullName ?? 'Recipient',
            phone: (body.shippingAddress as any).phone ?? '',
            address_line1: (body.shippingAddress as any).addressLine1 ?? '',
            address_line2: (body.shippingAddress as any).addressLine2 ?? null,
            city: (body.shippingAddress as any).city ?? '',
            state: (body.shippingAddress as any).state ?? '',
            pincode: (body.shippingAddress as any).pincode ?? '',
            country: (body.shippingAddress as any).country ?? 'India',
            address_type: 'home',
            is_default: false,
            is_active: true,
          },
        })
        addressId = createdAddr.id
      } catch {
        // Non-blocking if address creation fails
      }
    }

    // Mark payment as initiated/paid and attach addresses
    // @ts-expect-error Prisma client may be awaiting generation for new models
    const updated = await prisma.orders.update({
      where: { id: body.orderId },
      data: {
        payment_status: 'paid',
        status: 'confirmed',
        shipping_address: body.shippingAddress ?? existing.shipping_address,
        billing_address: body.billingAddress ?? body.shippingAddress ?? existing.billing_address,
        address_id: addressId ?? existing.address_id ?? null,
      },
    })

    return NextResponse.json({
      success: true,
      orderId: updated.id,
      orderNumber: updated.order_number,
      redirectUrl: `/order-confirmation/${updated.id}`,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to finalize checkout' }, { status: 500 })
  }
}