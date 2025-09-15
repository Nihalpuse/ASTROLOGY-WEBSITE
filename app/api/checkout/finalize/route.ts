import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

type AddressInput = {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  pincode: string
  country: string
}

type FinalizeBody = {
  orderId: number
  orderNumber?: string
  shippingAddress?: AddressInput
  billingAddress?: AddressInput
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FinalizeBody

    if (!body || typeof body.orderId !== 'number') {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
    }

    // Ensure order exists
  
    const existing = await prisma.orders.findUnique({ where: { id: body.orderId } })
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Optional: persist provided addresses and link an address_id
    let addressId: number | null = null
    if (body.shippingAddress && existing.user_id) {
      // Create a saved address for the user from provided data (best-effort)
      try {
        const addr = body.shippingAddress
        const createdAddr = await prisma.user_addresses.create({
          data: {
            user_id: existing.user_id,
            full_name: addr.fullName ?? 'Recipient',
            phone: addr.phone ?? '',
            address_line1: addr.addressLine1 ?? '',
            address_line2: addr.addressLine2 ?? null,
            city: addr.city ?? '',
            state: addr.state ?? '',
            pincode: addr.pincode ?? '',
            country: addr.country ?? 'India',
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
    // Prepare JSON address payloads with proper Prisma types
    const shippingAddressData: Prisma.InputJsonValue | undefined = body.shippingAddress
      ? (body.shippingAddress as unknown as Prisma.InputJsonValue)
      : (existing.shipping_address as Prisma.InputJsonValue | null) ?? undefined

    const billingAddressData: Prisma.InputJsonValue | undefined = body.billingAddress
      ? (body.billingAddress as unknown as Prisma.InputJsonValue)
      : body.shippingAddress
        ? (body.shippingAddress as unknown as Prisma.InputJsonValue)
        : (existing.billing_address as Prisma.InputJsonValue | null) ?? undefined

    const updated = await prisma.orders.update({
      where: { id: body.orderId },
      data: {
        payment_status: 'paid',
        status: 'confirmed',
        shipping_address: shippingAddressData,
        billing_address: billingAddressData,
        address_id: addressId ?? existing.address_id ?? null,
      },
    })

    return NextResponse.json({
      success: true,
      orderId: updated.id,
      orderNumber: updated.order_number,
      redirectUrl: `/order-confirmation/${updated.id}`,
    })
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to finalize checkout' }, { status: 500 })
  }
}