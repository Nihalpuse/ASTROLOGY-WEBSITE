import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type AddressRow = {
  id: number
  full_name: string
  phone: string
  address_line1: string
  address_line2: string | null
  city: string
  state: string
  pincode: string
  country: string
  address_type: string
  is_default: boolean
  is_active: boolean
}

type CreateAddressBody = {
  userId: number
  address: {
    fullName: string
    phone: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
    country?: string
    addressType?: string
  }
  setDefault?: boolean
}

type DeleteAddressBody = {
  userId: number
  addressId: number
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userIdParam = searchParams.get('userId')

    if (!userIdParam) {
      return NextResponse.json({ addresses: [] })
    }

    const userId = Number(userIdParam)
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: 'userId must be a number' }, { status: 400 })
    }

    
    const addresses = await prisma.user_addresses.findMany({
      where: { user_id: userId, is_active: true },
      orderBy: [
        { is_default: 'desc' },
        { created_at: 'desc' },
      ],
    })

    // Map DB fields to API-friendly camelCase
    const result = addresses.map((a: AddressRow) => ({
      id: a.id,
      fullName: a.full_name,
      phone: a.phone,
      addressLine1: a.address_line1,
      addressLine2: a.address_line2 ?? undefined,
      city: a.city,
      state: a.state,
      pincode: a.pincode,
      country: a.country,
      addressType: a.address_type,
      isDefault: a.is_default,
      isActive: a.is_active,
    }))

    return NextResponse.json({ addresses: result })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateAddressBody
    const { userId, address, setDefault } = body

    if (!userId || !address) {
      return NextResponse.json({ error: 'userId and address are required' }, { status: 400 })
    }

    const created = await prisma.$transaction(async (tx) => {
      if (setDefault) {
 
        await tx.user_addresses.updateMany({
          where: { user_id: userId, is_active: true, is_default: true },
          data: { is_default: false },
        })
      }

   
      const createdAddress = await tx.user_addresses.create({
        data: {
          user_id: userId,
          full_name: address.fullName,
          phone: address.phone,
          address_line1: address.addressLine1,
          address_line2: address.addressLine2 ?? null,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: address.country ?? 'India',
          address_type: address.addressType ?? 'home',
          is_default: !!setDefault,
          is_active: true,
        },
      })

      return createdAddress
    })

    return NextResponse.json({
      success: true,
      addressId: created.id,
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save address' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as DeleteAddressBody
    const { userId, addressId } = body

    if (!userId || !addressId) {
      return NextResponse.json({ error: 'userId and addressId are required' }, { status: 400 })
    }

   
    const address = await prisma.user_addresses.findFirst({ where: { id: addressId, user_id: userId } })
    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

   
    await prisma.user_addresses.update({
      where: { id: addressId },
      data: { is_active: false, is_default: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 })
  }
}


