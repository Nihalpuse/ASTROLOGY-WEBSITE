import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type UsersQuery = {
  page?: number
  pageSize?: number
  search?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const pageParam = searchParams.get('page')
    const pageSizeParam = searchParams.get('pageSize')
    const search = searchParams.get('search') ?? undefined

    const page = pageParam ? Number(pageParam) : 1
    const pageSize = pageSizeParam ? Number(pageSizeParam) : 20

    if (Number.isNaN(page) || Number.isNaN(pageSize) || page < 1 || pageSize < 1) {
      return NextResponse.json({ error: 'Invalid pagination' }, { status: 400 })
    }

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : undefined

    const [total, users] = await Promise.all([
      prisma.users.count({ where }),
      prisma.users.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          created_at: true,
        },
      }),
    ])

    return NextResponse.json({
      page,
      pageSize,
      total,
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        joined: u.created_at,
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}


