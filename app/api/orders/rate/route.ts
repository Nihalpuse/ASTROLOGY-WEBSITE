import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId, rating, review, userId } = body

    if (!orderId || !rating || !userId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const dataDir = path.resolve(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

    const filePath = path.join(dataDir, 'order_ratings.json')
    let ratings: any[] = []
    try {
      const raw = fs.readFileSync(filePath, 'utf-8')
      ratings = JSON.parse(raw)
    } catch (e) {
      ratings = []
    }

    // Prevent duplicate rating for same order by same user
    const existingIndex = ratings.findIndex(r => r.orderId === orderId && r.userId === userId)
    if (existingIndex !== -1) {
      // update existing
      ratings[existingIndex] = { ...ratings[existingIndex], rating, review, updated_at: new Date().toISOString() }
    } else {
      ratings.push({ orderId, rating, review, userId, created_at: new Date().toISOString() })
    }

    fs.writeFileSync(filePath, JSON.stringify(ratings, null, 2), 'utf-8')

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message || 'Server error' }, { status: 500 })
  }
}
